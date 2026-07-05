import * as React from 'react';

import { PuzzleMouseActions } from '../interactablePuzzle/InteractablePuzzleMouse';

import { GRID_BORDER_OUTLINE_SIZE, GRID_SQUARE_SIZE, } from './CrosswordGridConstants';
import { PuzzleSquareWithHighlight, SquareType, } from './CrosswordGridTypes';
import GridSquare from './GridSquare';
import GridBorder from './GridBorder';
import GridLines from './GridLines';

interface CrosswordGridProps {
    /**
     * 2D Array of all the puzzle squares, first stored by column and then row.
     */
    puzzleSquares: PuzzleSquareWithHighlight[][],

    /**
     * Mouse control actions relating to using the crossword grid. Undefined if this is not interactive.
     */
    mouseActions?: PuzzleMouseActions,
}

/**
 * A stylized crossword grid, for use as part of an interactive puzzle or decoratively.
 */
function CrosswordGrid({ puzzleSquares, mouseActions }: CrosswordGridProps) {
    if (!validateProps({ puzzleSquares, mouseActions })) {
        return '';
    }

    const squaresWidth = puzzleSquares.length;
    const squaresHeight = puzzleSquares[0].length;
    const realWidth = squaresWidth * GRID_SQUARE_SIZE + 2 * GRID_BORDER_OUTLINE_SIZE;
    const realHeight = squaresHeight * GRID_SQUARE_SIZE + 2 * GRID_BORDER_OUTLINE_SIZE;

    return <svg width={realWidth} height={realHeight}>
        {createGridSquares(puzzleSquares, mouseActions)}
        <GridLines squaresWidth={squaresWidth} squaresHeight={squaresHeight} />
        <GridBorder squaresWidth={squaresWidth} squaresHeight={squaresHeight} />
    </svg>;
}

/**
 * Validate props, returns true if they are successfully validated and otherwise false.
 */
function validateProps({ puzzleSquares }: CrosswordGridProps) {
    if (puzzleSquares.length === 0
        || puzzleSquares.some(puzzleSquareRow => puzzleSquareRow.length != puzzleSquares.length)) {
        // Puzzle squares have zero length or not a uniform grid
        return false;
    }
    return true;
}

/**
 * Create the list of grid square objects for the given highlightable puzzle squares.
 */
function createGridSquares(puzzleSquares: PuzzleSquareWithHighlight[][], mouseActions?: PuzzleMouseActions) {
    const gridSquares: React.ReactElement[] = [];
    const rowLength = puzzleSquares[0].length;

    for (let rowIdx = 0; rowIdx < puzzleSquares.length; rowIdx++) {
        for (let colIdx = 0; colIdx < rowLength; colIdx++) {
            const puzzleSquare = puzzleSquares[rowIdx][colIdx];
            const isBlock = puzzleSquare === SquareType.BLOCK;
            gridSquares.push(
                <GridSquare
                    isBlock={isBlock}
                    fill={isBlock ? undefined : puzzleSquare.fill}
                    number={isBlock ? undefined : puzzleSquare.number}
                    offsetDim={{ x: colIdx, y: rowIdx }}
                    key={`${rowIdx}-${colIdx}`}
                    highlightType={isBlock ? undefined : puzzleSquare.highlightType}
                    onClick={mouseActions?.onSquareClickForSquare(rowIdx, colIdx)}
                />
            );
        }
    }

    return gridSquares;
}

export default CrosswordGrid;
