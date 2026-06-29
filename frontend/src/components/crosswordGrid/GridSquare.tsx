import './CrosswordGrid.scss';
import * as React from 'react';

import {
    GRID_BORDER_OUTLINE_SIZE,
    GRID_SQUARE_SIZE,
} from './CrosswordGridConstants';
import { HighlightType } from './CrosswordGridTypes';
import classNames from 'classnames';

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
    /**
     * The highlight type of this square, or undefined if this is not applicable. Not compatible with `isBlock`.
     */
    highlightType?: HighlightType,
}

/**
 * A single crossword style grid square, for use in a puzzle or stylistically on the site. This is a group rendered
 * inside a svg by CrosswordGrid.jsx.
 */
function GridSquare({ isBlock, fill, number, offsetDim, highlightType }: GridSquareProps) {
    const translateX = offsetDim.x * GRID_SQUARE_SIZE + GRID_BORDER_OUTLINE_SIZE;
    const translateY = offsetDim.y * GRID_SQUARE_SIZE + GRID_BORDER_OUTLINE_SIZE;

    let fillClassName: string;
    if (isBlock) {
        fillClassName = 'block';
    }
    else if (highlightType === HighlightType.CLUE_HIGHLIGHTED) {
        fillClassName = 'clue-highlighted';
    }
    else if (highlightType === HighlightType.FOCUSED_SQUARE) {
        fillClassName = 'focused-square';
    }
    else {
        fillClassName = 'fillable';
    }

    return <g className={'grid-square'} transform={`translate(${translateX} ${translateY})`} >
        <rect width={GRID_SQUARE_SIZE} height={GRID_SQUARE_SIZE} className={fillClassName}></rect>
        {fill && <text className={'grid-square-fill'} y={22} x={15} >{fill}</text>}
        {number && <text className={'grid-square-number'} y={13} x={3} >{number}</text>}
    </g>;
}

export default GridSquare;
