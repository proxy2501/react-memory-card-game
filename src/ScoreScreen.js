import React, { useContext, useEffect, useState } from "react"
import { ThemeContext } from "./ThemeContext";
import './stylesheets/scorescreen.css'

function ScoreScreen(props) {
    const theme = useContext(ThemeContext);
    const playerStats = props.endGameStats.playerStats;
    const opponentStats = props.endGameStats.opponentStats;

    return (
        <>
            {opponentStats && <div
                className="multiplayer-verdict"
                style={{ backgroundColor: theme.backgroundBoxColor }}>
                <MultiplayerVerdict playerStats={playerStats} opponentStats={opponentStats} />
            </div>}
            <div className="score-components">
                <Score stats={playerStats} multiplayer={opponentStats !== undefined} />
                {opponentStats && <Score stats={opponentStats} multiplayer={true} />}
            </div>
            <div className="score-buttons">
                <button
                    onClick={() => props.onClickExit()}
                    style={{ backgroundColor: theme.buttonColor, color: theme.buttonTextColor, textShadow: theme.textShadow }}>
                    Exit Score Screen
            </button>
            </div>
        </>
    );
}

// Component that breaks down stats of a player, and provides a total score.
function Score(props) {
    const { stats, multiplayer } = props;
    const theme = useContext(ThemeContext);

    let gameOverMessage;

    if (stats.lives === 0) {
        gameOverMessage = "Game over: Ran out of lives!";
    }
    else if (stats.timer <= 0) {
        gameOverMessage = "Game over: Ran out of time!";
    }
    else {
        gameOverMessage = "All cards cleared!";
    }

    let timePoints = stats.timer * 10;
    let matchPoints = stats.score;
    let rawTotal = timePoints + matchPoints;
    let lifeBonus = rawTotal * stats.lives;
    let totalScore = rawTotal + lifeBonus;

    return (
        <div className="score" style={{ backgroundColor: theme.backgroundBoxColor }}>
            {!multiplayer && <h1>{gameOverMessage}</h1>}
            <h2 style={{ marginBottom: "10px" }}>
                Time remaining: {stats.timer} seconds
            </h2>
            <h4 style={{ marginTop: 0, marginLeft: "10px" }}>
                {stats.timer} x 10 = {timePoints} points
            </h4>
            <h2 style={{ marginBottom: "10px" }}>
                Card matches: {matchPoints / 100}
            </h2>
            <h4 style={{ marginTop: 0, marginLeft: "10px" }}>
                {matchPoints / 100} x 100 = {matchPoints} points
            </h4>
            <h2 style={{ marginBottom: "10px" }}>
                Lives remaining: {stats.lives}
            </h2>
            <h4 style={{ marginTop: 0, marginLeft: "10px" }}>
                + {stats.lives}x multiplier
            </h4>
            <hr />
            <h1>
                Total score: {totalScore}
            </h1>
        </div>
    );
}

// Component that informs player of the winner after a multiplayer match.
function MultiplayerVerdict(props) {
    const { playerStats, opponentStats } = props;
    const [winner, setWinner] = useState("");

    // Determines which player won, by calculating score totals.
    useEffect(() => {
        const playerRaw = (playerStats.timer * 10) + playerStats.score;
        const playerTotal = playerRaw + (playerStats.lives * playerRaw);

        const opponentRaw = (opponentStats.timer * 10) + opponentStats.score;
        const opponentTotal = opponentRaw + (opponentStats.lives * opponentRaw);

        setWinner(prevState => {
            let newState = prevState;

            if (opponentStats.timer === 0 || opponentStats.lives === 0) {
                newState = "You";
            }
            else if (playerStats.timer === 0 || playerStats.lives === 0) {
                newState = "Opponent";
            }
            else if (playerTotal > opponentTotal) {
                newState = "You";
            }
            else if (playerTotal < opponentTotal) {
                newState = "Opponent";
            }
            else if (playerTotal === opponentTotal) {
                newState = "Nobody";
            }

            return newState;
        });

    }, [playerStats, opponentStats]);

    return (
        <>
            <h1>{winner} won!</h1>
        </>
    );
}

export default ScoreScreen;