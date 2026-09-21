import './CrosswordGrid.scss';
import * as React from 'react';

import {
    GRID_BORDER_OUTLINE_SIZE,
    GRID_SQUARE_SIZE,
} from './CrosswordGridConstants';
import { HighlightType, SquareType } from './CrosswordGridTypes';

interface GridSquareProps {
    /**
     * The type of this square, deciding whether it is drawn as a block and how its fill is styled.
     */
    squareType: SquareType,
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
     * The highlight type of this square, or undefined if this is not applicable. If this is a block square, this
     * does nothing.
     */
    highlightType?: HighlightType,
    onClick?: (e: React.MouseEvent<SVGElement>) => void,
}

/**
 * A single crossword style grid square, for use in a puzzle or stylistically on the site. This is a group rendered
 * inside a svg by CrosswordGrid.jsx.
 */
function GridSquare({ squareType, fill, number, offsetDim, highlightType, onClick }: GridSquareProps) {
    const translateX = offsetDim.x * GRID_SQUARE_SIZE + GRID_BORDER_OUTLINE_SIZE;
    const translateY = offsetDim.y * GRID_SQUARE_SIZE + GRID_BORDER_OUTLINE_SIZE;

    let fillClassName: string;
    if (squareType === SquareType.BLOCK) {
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

    const textClassName = squareType === SquareType.VERIFIED ? 'grid-square-fill verified' : 'grid-square-fill';

    return <g className={'grid-square'} transform={`translate(${translateX} ${translateY})`} onClick={onClick} >
        <rect width={GRID_SQUARE_SIZE} height={GRID_SQUARE_SIZE} className={fillClassName}></rect>
        {fill && <text className={textClassName} y={22} x={15} >{fill}</text>}
        {number && <text className={'grid-square-number'} y={13} x={3} >{number}</text>}
    </g>;
}

export default GridSquare;
