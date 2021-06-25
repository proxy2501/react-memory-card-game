import React, { useContext } from 'react';
import { ThemeContext } from './ThemeContext';
import './stylesheets/cardcontainer.css'
import Card from './Card';

function CardContainer(props) {
    const theme = useContext(ThemeContext);

    return (
        <div className="card-container" style={{ backgroundColor: theme.backgroundBoxColor }}>
            {props.deck.map((card) => {
                return (
                    <Card
                        key={card.id}
                        id={card.id}
                        sourceId={card.sourceId}
                        flipped={card.flipped}
                        hidden={card.hidden}
                        handleClick={props.handleCardClick}
                    />
                );
            })}
        </div>
    );
}

export default CardContainer;