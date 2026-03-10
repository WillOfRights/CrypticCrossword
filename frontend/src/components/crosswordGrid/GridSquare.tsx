import './CrosswordGrid.scss';
import React from 'react';

import {
    GRID_BORDER_OUTLINE_SIZE,
    GRID_SQUARE_SIZE,
} from './CrosswordGridConstants';

interface GridSquareProps {
    /**
     * Whether this square is a block.
     */
    isBlock: boolean,
    /**
     * The fill inside the square, or undefined for none.
     */
    fill?: String,
    /**
     * Number representing a clue number, or undefined for none.
     */
    number?: number,
    /**
     * Dimensions by which the square is offset from the top left of the puzzle measured in squares.
     */
    offsetDim: {
        x: number,
        y: number,
    },
}

/**
 * A single crossword style grid square, for use in a puzzle or stylistically on the site. This is a group rendered
 * inside a svg by CrosswordGrid.jsx.
 */
function GridSquare({ isBlock, fill, number, offsetDim }: GridSquareProps) {
    const translateX = offsetDim.x * GRID_SQUARE_SIZE + GRID_BORDER_OUTLINE_SIZE;
    const translateY = offsetDim.y * GRID_SQUARE_SIZE + GRID_BORDER_OUTLINE_SIZE;
    return <g className={'grid-square'} transform={`translate(${translateX} ${translateY})`} >
        <rect width={ GRID_SQUARE_SIZE } height={ GRID_SQUARE_SIZE } className={isBlock ? 'block' : 'fillable'}></rect>
        {fill && <text className={'grid-square-fill'} y={22} x={15} >{fill}</text>}
        {number && <text className={'grid-square-number'} y={13} x={3} >{number}</text>}
    </g>;
}

export default GridSquare;