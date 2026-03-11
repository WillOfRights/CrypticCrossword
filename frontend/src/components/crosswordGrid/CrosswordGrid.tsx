import * as React from 'react';

import {GRID_BORDER_OUTLINE_SIZE, GRID_SQUARE_SIZE,} from './CrosswordGridConstants';
import {PuzzleSquare, SquareType,} from './CrosswordGridTypes';
import GridSquare from './GridSquare';
import GridBorder from './GridBorder';
import GridLines from './GridLines';

interface CrosswordGridProps {
    /**
     * 2D Array of all the puzzle squares, first stored by column and then row.
     */
    puzzleSquares: PuzzleSquare[][],
}

/**
 * A stylized crossword grid, for use as part of an interactive puzzle or decoratively.
 */
function CrosswordGrid({ puzzleSquares }: CrosswordGridProps) {
    if (!validateProps({ puzzleSquares })) {
        return '';
    }

    const squaresWidth = puzzleSquares.length;
    const squaresHeight = puzzleSquares[0].length;
    const realWidth = squaresWidth * GRID_SQUARE_SIZE + 2 * GRID_BORDER_OUTLINE_SIZE;
    const realHeight = squaresHeight * GRID_SQUARE_SIZE + 2 * GRID_BORDER_OUTLINE_SIZE;

    return <svg width={realWidth} height={realHeight}>
        {createGridSquares(puzzleSquares)}
        <GridLines squaresWidth={squaresWidth} squaresHeight={squaresHeight} />
        <GridBorder squaresWidth={squaresWidth} squaresHeight={squaresHeight} />
    </svg>;
}

/**
 * Validate props, returns true if they are successfully validated and otherwise false.
 */
function validateProps({ puzzleSquares }: CrosswordGridProps) {
    if (puzzleSquares.length === 0
        || puzzleSquares.some(puzzleSquareRow => puzzleSquareRow.length != puzzleSquares.length))
    {
        // Puzzle squares have zero length or not a uniform grid
        return false;
    }
    return true;
}

/**
 * Create the list of grid square objects for the given puzzle squares.
 */
function createGridSquares(puzzleSquares: PuzzleSquare[][]) {
    const gridSquares: React.ReactElement[] = [];
    const rowLength = puzzleSquares[0].length;

    for (let rowIdx = 0; rowIdx < puzzleSquares.length; rowIdx++) {
        for(let colIdx = 0; colIdx < rowLength; colIdx++) {
            const puzzleSquare = puzzleSquares[rowIdx][colIdx];
            const isBlock = puzzleSquare === SquareType.BLOCK;
            gridSquares.push(
                <GridSquare
                    isBlock={isBlock}
                    fill={isBlock ? undefined : puzzleSquare.fill}
                    offsetDim={{x: colIdx, y: rowIdx}}
                    key={`${rowIdx}-${colIdx}`}
                />
            );
        }
    }

    return gridSquares;
}

export default CrosswordGrid;
