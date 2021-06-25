import React, { useState, useEffect, useCallback, useMemo } from "react"
import "./stylesheets/app.css"
import { ThemeContext } from "./ThemeContext"
import SingleGame from "./SingleGame"
import ScoreScreen from './ScoreScreen'
import StartScreen from "./StartScreen"
import Navigation from "./Navigation"
//import useOnlineTheme from "./customhooks/useOnlineTheme"
import Multiplayer from "./Multiplayer"

function App(props) {
    //const onlineTheme = useOnlineTheme();

    // All available themes.
    const themes = useMemo(() => {
        return (
            {
                default: {
                    name: "default",
                    textColor: "#ffffff",
                    buttonColor: "#ff8c00",
                    backgroundColor: "#00ffff",
                    menuColor: "#ff8c00",
                    backgroundBoxColor: "#ff8c00",
                    buttonTextColor: "#ffffff",
                    textShadow: "2px 2px 4px rgba(0, 0, 0, 0.8)",
                    cardSource: "./cards/default/"
                },
                vice: {
                    name: "vice",
                    textColor: "#ffffff",
                    buttonColor: "#f890e7",
                    backgroundColor: "#d0d0d0",
                    menuColor: "#f890e7",
                    backgroundBoxColor: "#0bd3d3",
                    buttonTextColor: "#ffffff",
                    textShadow: "2px 2px 4px rgba(0, 0, 0, 0.8)",
                    cardSource: "./cards/vice/"
                },
                pixel: {
                    name: "pixel",
                    textColor: "#ffffff",
                    buttonColor: "#c3f73a",
                    backgroundColor: "#1c1018",
                    menuColor: "#094d92",
                    backgroundBoxColor: "#95e06c",
                    buttonTextColor: "#1c1018",
                    textShadow: "2px 2px 4px rgba(0, 0, 0, 0.8)",
                    cardSource: "./cards/pixel/"
                }
            }
        );
    }, []);

    const [activeTheme, setActiveTheme] = useState(themes.default);
    const [activeScreen, setActiveScreen] = useState("start"); // Screens: start, single, multi, score
    const [numberCards, setNumberCards] = useState(10);
    const [endGameStats, setEndGameStats] = useState(null);  // Format: { playerStats: { score, lives, timer } }

    // Sets the background of entire app, using evil html.
    useEffect(() => {
        document.body.style.backgroundColor = activeTheme.backgroundColor;
    }, [activeTheme]);

    // Called by SingleGame component when the game ends.
    const onGameEndCallback = useCallback(playerStats => {
        setEndGameStats({playerStats});
    }, []);

    // Called by ScoreScreen when exit button is clicked.
    const onClickExit = useCallback(() => {
        setActiveScreen("start");
    }, []);

    // Called by Navigation component to set the current theme.
    const selectThemeCallback = useCallback(themeName => {
        if (activeTheme.name === themeName) return;

        setActiveTheme(() => {
            let newState;

            switch (themeName) {
                case "default":
                    newState = themes.default;
                    break;

                case "vice":
                    newState = themes.vice;
                    break;

                case "pixel":
                    newState = themes.pixel;
                    break;

                default:
                    newState = themes.default;
                    break;
            }

            return newState;
        });
    }, [themes, activeTheme]);

    return (
        <div className="app" style={{ color: activeTheme.textColor, textShadow: activeTheme.textShadow }}>
            <ThemeContext.Provider value={activeTheme}>
                <Navigation selectThemeCallback={selectThemeCallback} setActiveScreen={setActiveScreen} themes={themes}/>
                {activeScreen === "start" && <StartScreen setActiveScreen={setActiveScreen} setNumberCards={setNumberCards} />}
                {activeScreen === "single" && <SingleGame setActiveScreen={setActiveScreen} onGameEnd={onGameEndCallback} numberCards={numberCards} />}
                {activeScreen === "multi" && <Multiplayer />}
                {activeScreen === "score" && <ScoreScreen endGameStats={endGameStats} onClickExit={onClickExit}/>}
            </ThemeContext.Provider>
        </div>
    )
}

export default App