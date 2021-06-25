import React, { useCallback, useEffect, useState } from 'react';
import MultiGame from './MultiGame';
import Lobby from './Lobby';
import { ServerContext } from './ServerContext';
import useGameServer from './customhooks/useGameServer';
import useRandomizedDeck from './customhooks/useRandomizedDeck';
import ScoreScreen from './ScoreScreen';
import './stylesheets/multiplayer.css'
import ErrorScreen from './ErrorScreen';

function Multiplayer(props) {
    const server = useGameServer("http://mikk03d42.web.dania-studerende.dk/reactgameserver", 10);
    const [multiplayerState, setMultiplayerState] = useState("lobby"); // States: lobby, playing, showing-score, error
    const [activeMatch, setActiveMatch] = useState(null); // Format: { opponent: string, numberCards: int, firstMove: bool }
    const { deck, setDeck, getNewDeck } = useRandomizedDeck(0);
    const [endGameStats, setEndGameStats] = useState(null); // Format: { playerStats: { score, lives, timer }, opponentStats: { score, lives, timer } }
    const [errorMessage, setErrorMessage] = useState("");

    // Called by MultiGame component when the game ends.
    const onGameEndCallback = useCallback((playerStats, opponentStats) => {
        setEndGameStats({ playerStats, opponentStats });
        setMultiplayerState("showing-score");
    }, []);

    // Called by MuitGame when an error occurs.
    const onError = useCallback(error => {
        setErrorMessage(error);
        setMultiplayerState("error");
    }, []);

    // Called when return button is pressed.
    const onClickReturn = useCallback(() => {
        setMultiplayerState("lobby");
    }, []);

    // Handle incoming invitations while not in lobby.
    useEffect(() => {
        if (multiplayerState === "lobby") return;
        if (!server.eventMessage) return;

        let event = server.eventMessage;

        if (event.type === "Invite") {
            server.sendMessage(event.sender, { type: "Abort", reason: "In Game" });
            server.setEventMessage(null);
        }

    }, [multiplayerState, server]);

    return (
        <div className="multiplayer">
            <ServerContext.Provider value={server}>
                {multiplayerState === "lobby" && <Lobby
                    multiplayerState={multiplayerState}
                    setMultiplayerState={setMultiplayerState}
                    setActiveMatch={setActiveMatch}
                    deck={deck}
                    setDeck={setDeck}
                    getNewDeck={getNewDeck}
                />}

                {multiplayerState === "playing" && <MultiGame
                    opponent={activeMatch.opponent}
                    numberCards={activeMatch.numberCards}
                    deck={deck}
                    setDeck={setDeck}
                    firstMove={activeMatch.firstMove}
                    onGameEnd={onGameEndCallback}
                    onError={onError}
                />}

                {multiplayerState === "showing-score" && <ScoreScreen 
                    endGameStats={endGameStats}
                    onClickExit={onClickReturn}
                />}

                {multiplayerState === "error" && <ErrorScreen 
                    errorMessage={errorMessage}
                    onClickReturn={onClickReturn}
                />}
            </ServerContext.Provider>
        </div>
    );
}

export default Multiplayer;