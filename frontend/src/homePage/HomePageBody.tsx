import React from 'react';
import CrosswordGrid from '../components/crosswordGrid/CrosswordGrid';
import {SquareType} from "../components/crosswordGrid/CrosswordGridTypes";

/**
 * Main body of the home page, rendered in the react root.
 */
function HomePageBody() {
    return <CrosswordGrid
        puzzleSquares={[
            [SquareType.BLOCK, { squareType: SquareType.FILLABLE, fill: 'C'}],
            [{ squareType: SquareType.FILLABLE, fill: 'R'}, SquareType.BLOCK],
        ]}
    />;
}

export default HomePageBody;
