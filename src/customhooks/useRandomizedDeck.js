import { useCallback, useEffect, useState } from "react";

function useRandomizedDeck(numberCards) {
    const [deck, setDeck] = useState([]);

    // Returns a randomized deck of card pairs.
    const getNewDeck = useCallback(numberCards => {
        let sourceIds = [];
    
            for (let i = 0; i < 52 ; i++) {
                sourceIds.push(i);
            }
    
            sourceIds = shuffleArray(sourceIds);
    
            let selection = [];
    
            for (let i = 0; i < numberCards; i=i+2) {
                let sourceId = sourceIds.shift();
                selection.push({id: i, sourceId, flipped: false, hidden: false});
                selection.push({id: i+1, sourceId, flipped: false, hidden: false});
            }
    
            selection = shuffleArray(selection);
    
            return selection;
    }, [])

    // Sets the deck state to a new randomized deck when the hook is used with a numberCards parameter.
    useEffect(() => {
        setDeck(getNewDeck(numberCards));
    }, [getNewDeck, numberCards]);

    return {deck, setDeck, getNewDeck};
}

// Shuffle algorithm credit: https://stackoverflow.com/questions/2450954/how-to-randomize-shuffle-a-javascript-array
function shuffleArray(array) {
    var currentIndex = array.length, temporaryValue, randomIndex;
      
        // While there remain elements to shuffle...
        while (0 !== currentIndex) {
      
          // Pick a remaining element...
          randomIndex = Math.floor(Math.random() * currentIndex);
          currentIndex -= 1;
      
          // And swap it with the current element.
          temporaryValue = array[currentIndex];
          array[currentIndex] = array[randomIndex];
          array[randomIndex] = temporaryValue;
        }
      
    return array;
}

export default useRandomizedDeck;