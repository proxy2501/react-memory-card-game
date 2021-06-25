import React, { useContext, useEffect, useState, useCallback } from 'react';
import ChatWindow from './ChatWindow';
import { ServerContext } from './ServerContext';
import UserList from './UserList';
import './stylesheets/lobby.css';

function Lobby(props) {
    const server = useContext(ServerContext);
    const [lobbyState, setLobbyState] = useState("idle"); // States: idle, await, invited
    const [invitation, setInvitation] = useState(null); // Format: {opponent: string, numberCards: integer }

    // Invites another user to play a game.
    const handleInviteUser = useCallback((user, numberCards) => {
        server.sendMessage(user, { type: "Invite", numberCards });
        setInvitation({ opponent: user, numberCards });
        setLobbyState("await");
    }, [server]);

    // Cancels the pending invitation that was sent to another player.
    const handleCancelInvite = useCallback(() => {
        server.sendMessage(invitation.opponent, { type: "Abort", reason: "Cancelled" });
        setInvitation(null);
        setLobbyState("idle");
    }, [server, invitation]);

    // Accepts an incoming invitation from another player.
    const handleAcceptInvite = useCallback(() => {
        server.sendMessage(invitation.opponent, { type: "Response", accepted: true });
        setLobbyState("await");
    }, [server, invitation]);

    // Declines an incoming invitation from another player.
    const handleDeclineInvite = useCallback(() => {
        server.sendMessage(invitation.opponent, { type: "Response", accepted: false });
        setInvitation(null);
        setLobbyState("idle");
    }, [server, invitation]);

    // Handles server messages while state is "idle".
    useEffect(() => {
        if (lobbyState !== "idle") return;
        if (!server.eventMessage) return;

        let event = server.eventMessage;

        if (event.type === "Invite") {
            setInvitation({ opponent: event.sender, numberCards: event.numberCards });
            setLobbyState("invited");
            server.setEventMessage(null);
        }
    }, [server, lobbyState]);

    // Handles server messages while state is "await".
    useEffect(() => {
        if (lobbyState !== "await") return;
        if (!server.eventMessage) return;

        let event = server.eventMessage;

        switch (event.type) {
            case "Invite":
                server.sendMessage(event.sender, { type: "Abort", reason: "Busy" });
                server.setEventMessage(null);
                break;

            case "Response":
                if (event.accepted) {
                    // "Throw dice" for who gets the first move.
                    let firstMove = (Math.random() < 0.5);

                    // Randomize the deck that will be used in the match.
                    let deck = props.getNewDeck(invitation.numberCards);

                    server.sendMessage(invitation.opponent, { type: "Game", firstMove: !firstMove, deck });
                    props.setActiveMatch({ 
                        opponent: invitation.opponent,
                        numberCards: invitation.numberCards,
                        firstMove
                    });
                    props.setDeck(deck);
                    props.setMultiplayerState("playing");
                }
                else {
                    server.pushLocalMessage("Server", event.sender + " declined your invitation.");
                    setLobbyState("idle");
                    setInvitation(null);
                }

                server.setEventMessage(null);
                break;

            case "Abort":
                server.pushLocalMessage("Server", event.sender + " is busy.");
                setLobbyState("idle");
                setInvitation(null);
                server.setEventMessage(null);
                break;

            case "Game":
                props.setActiveMatch({
                    opponent: invitation.opponent,
                    numberCards: invitation.numberCards,
                    firstMove: event.firstMove
                });
                props.setDeck(event.deck);
                props.setMultiplayerState("playing");
                break;

            default:
                break;
        }
    }, [server, invitation, lobbyState, props]);

    // Handles server messages while state is "invited".
    useEffect(() => {
        if (lobbyState !== "invited") return;
        if (!server.eventMessage) return;

        let event = server.eventMessage;

        switch (event.type) {
            case "Invite":
                server.sendMessage(event.sender, { type: "Abort", reason: "Busy" });
                server.setEventMessage(null);
                break;

            case "Abort":
                server.pushLocalMessage("Server", event.sender + " cancelled their invitation.");
                setLobbyState("idle");
                setInvitation(null);
                server.setEventMessage(null);
                break;

            default:
                break;
        }

    }, [server, lobbyState, server.eventMessage]);

    // Handles remote user disconnect.
    useEffect(() => {
        if (!invitation) return;

        let remoteUser = server.users.find(user => user === invitation.opponent);
        if (!remoteUser) {
            setInvitation(null);
            setLobbyState("idle");
        }
    }, [invitation, server.users]);

    return (
        <div className="lobby">
            <UserList
                handleInviteUser={handleInviteUser}
                handleCancelInvite={handleCancelInvite}
                handleAcceptInvite={handleAcceptInvite}
                handleDeclineInvite={handleDeclineInvite}
                lobbyState={lobbyState}
                invitation={invitation} />
            <ChatWindow />
        </div>
    );
}

export default Lobby;