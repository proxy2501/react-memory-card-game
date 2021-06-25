import React, { useEffect, useState, useCallback, useContext } from "react"
import useCountdown from "./customhooks/useCountdown"
import Sidebar from "./Sidebar"
import CardContainer from "./CardContainer"
import ChatWindow from "./ChatWindow"
import { ServerContext } from "./ServerContext"
import Popup from "./Popup"

function MultiGame(props) {
    const { opponent, numberCards, deck, setDeck, firstMove, onGameEnd, onError } = props;
    const server = useContext(ServerContext);
    const [chosenCards, setChosenCards] = useState({ first: null, second: null });
    const [score, setScore] = useState(0);
    const [lives, setLives] = useState(5);
    const { timer, setRunning: setTimerRunning } = useCountdown((5 * numberCards), false, () => setGameState("game-over"));
    const [opponentStats, setOpponentStats] = useState(null);
    const [gameState, setGameState] = useState("init"); // States: init, await-card-1, await-card-2, process-choice, opponent-turn, game-over, await
    const [showPopup, setShowPopup] = useState(false);

    // Handle game state: init
    useEffect(() => {
        if (gameState !== "init") return;

        function flipAllCards() {
            setDeck(prevState => {
                let newState = [...prevState];

                newState.forEach(card => {
                    card.flipped = !card.flipped;
                });

                return newState;
            });
        }

        // After 0.5 seconds, flip all cards for 1.5 seconds.
        let timeout = setTimeout(() => {
            flipAllCards();
            clearTimeout(timeout);

            timeout = setTimeout(() => {
                flipAllCards();
                setGameState(firstMove ? "await-card-1" : "opponent-turn");
                clearTimeout(timeout);
            }, 1500);
        }, 500);

        return () => clearTimeout(timeout);

    }, [gameState, firstMove, setDeck]);

    // Handle game state: process-choice
    useEffect(() => {
        if (gameState !== "process-choice") return;

        let first = chosenCards.first;
        let second = chosenCards.second;

        let timeout = setTimeout(() => {
            if (first.sourceId === second.sourceId) { // Match.
                first.hidden = true;
                second.hidden = true;

                setScore(prevState => prevState + 100);

                // Handle win condition.
                if (deck.every(card => card.hidden)) {
                    setGameState("game-over");
                    return;
                }
            }
            else { // No match.
                first.flipped = !first.flipped;
                second.flipped = !second.flipped;

                let prevLives;
                setLives(prevState => {
                    prevLives = prevState;
                    return prevState - 1;
                });

                // Handle lose condition.
                if (prevLives === 1) {
                    setGameState("game-over");
                    return;
                }
            }

            setChosenCards({ first: null, second: null });
            server.sendMessage(opponent, { type: "EndTurn" });
            setGameState("opponent-turn");

        }, 1000);

        return () => clearTimeout(timeout);

    }, [gameState, chosenCards, deck, server, opponent]);

    // Handle turn change, by alerting player and starting/stopping the timer appropriately.
    useEffect(() => {
        if (gameState !== "opponent-turn" && gameState !== "await-card-1") return;

        setTimerRunning(false); 

        setShowPopup(true);
        let timeout = setTimeout(() => {
            setShowPopup(false);

            if (gameState === "await-card-1") {
                setTimerRunning(true);
            }
        }, 1000);

        return () => clearTimeout(timeout);
    }, [gameState, setTimerRunning]);

    // Handle game state: opponent-turn
    useEffect(() => {
        if (gameState !== "opponent-turn") return;
        if (!server.eventMessage) return;

        let event = server.eventMessage;

        switch (event.type) {
            case "CardFlip":
                let card = deck.find(card => card.id === event.cardId);
                card.flipped = !card.flipped;

                let first = chosenCards.first;
                let second = chosenCards.second;

                if (!first) {
                    first = card;
                }
                else {
                    second = card;
                }

                setChosenCards(prevState => {
                    let newState = { ...prevState };
                    newState.first = first;
                    newState.second = second;

                    return newState;
                });

                // Check match.
                if (first && second) {
                    let timeout = setTimeout(() => {

                        if (first.sourceId === second.sourceId) { // Match.
                            first.hidden = true;
                            second.hidden = true;
                        }
                        else { // No match.
                            first.flipped = !first.flipped;
                            second.flipped = !second.flipped;
                        }

                        clearTimeout(timeout);
                    }, 1000);

                    setChosenCards({ first: null, second: null });
                }

                server.setEventMessage(null);
                break;

            case "EndTurn":
                setGameState("await-card-1");
                server.setEventMessage(null);
                break;

            case "GameOver":
                setOpponentStats(event.stats);
                setGameState("game-over");
                server.setEventMessage(null);
                break;

            default:
                break;
        }
    }, [gameState, server, chosenCards, deck]);

    // Handle game state: game-over
    useEffect(() => {
        if (gameState !== "game-over") return;

        setTimerRunning(false);
        let playerStats = { score, lives, timer };
        server.sendMessage(opponent, { type: "GameOver", stats: playerStats });

        if (opponentStats) {
            onGameEnd(playerStats, opponentStats);
        }
        else {
            setGameState("await");
        }

    }, [gameState, setTimerRunning, score, lives, timer, server, opponent, opponentStats, onGameEnd]);

    // Handle game state: await
    useEffect(() => {
        if (gameState !== "await") return;
        if (!server.eventMessage) return;

        let event = server.eventMessage;

        if (event.type === "GameOver") {
            let playerStats = { score, lives, timer };
            onGameEnd(playerStats, event.stats);
        }

        server.setEventMessage(null);
    }, [gameState, server, onGameEnd, score, lives, timer]);

    // Handle opponent disconnect.
    useEffect(() => {
        let remoteUser = server.users.find(user => user === opponent);

        if (!remoteUser) {
            onError("Opponent disconnected");
        }
    }, [server.users, opponent, onError]);

    // Callback to handle card click.
    const handleCardClick = useCallback(id => {
        if (gameState !== "await-card-1" && gameState !== "await-card-2") return;
        if (chosenCards.first && chosenCards.first.id === id) return;

        let card = deck.find(card => card.id === id);

        card.flipped = !card.flipped;
        server.sendMessage(opponent, { type: "CardFlip", cardId: id });

        setChosenCards(prevState => {
            let newState = { ...prevState };

            if (!chosenCards.first) {
                newState.first = card;
                setGameState("await-card-2");
            }
            else {
                newState.second = card;
                setGameState("process-choice");
            }

            return newState;
        });

    }, [gameState, chosenCards, deck, opponent, server])

    return (
        <>
            <div className="game multiplayer">
                <CardContainer deck={deck} handleCardClick={handleCardClick} />
                <div className="multi-side">
                    <Sidebar score={score} lives={lives} timeRemaining={timer} />
                    <ChatWindow opponent={opponent} />
                </div>
            </div>
            <Popup trigger={showPopup}>
                {gameState === "await-card-1" && <h2>Your turn</h2>}
                {gameState === "opponent-turn" && <h2>Opponent's turn</h2>}
            </Popup>
        </>
    )
}

export default MultiGame;