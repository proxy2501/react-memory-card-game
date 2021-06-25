import React, { useContext } from "react"
import { ThemeContext } from "./ThemeContext"
import './stylesheets/card.css'

function Card(props) {
    const theme = useContext(ThemeContext);

    function handleClick() {
        props.handleClick(props.id);
    }

    return (
        <div className={"card" + (props.flipped ? " flip" : "") + (props.hidden ? " hide" : "")} onClick={handleClick}>
            <div className="card-front">
                <img
                    alt=""
                    src={theme.cardSource + props.sourceId + ".png"}
                />
            </div>
            <div className="card-back clickable">
                <img
                    alt=""
                    src={theme.cardSource + "B.png"}
                />
            </div>
        </div>
    );
}
export default Card