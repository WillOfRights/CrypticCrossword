import './CrosswordGrid.scss';
import React from 'react';

import {
    GRID_BORDER_OUTLINE_SIZE,
    GRID_LINE_SIZE,
    GRID_SQUARE_SIZE,
} from './CrosswordGridConstants';

interface GridLinesProps {
    /**
     * The number of squares wide in the grid.
     */
    squaresWidth: number,
    /**
     * The number of squares tall in the grid.
     */
    squaresHeight: number,
};

function GridLines({ squaresWidth, squaresHeight }: GridLinesProps) {
    if (squaresWidth === 1 && squaresHeight === 1) {
        return '';
    }

    let d = ``;
    for (let xIndex = 1; xIndex < squaresWidth; xIndex++) {
        // Equations not simplified for clarity
        d += `M ${GRID_BORDER_OUTLINE_SIZE + xIndex * GRID_SQUARE_SIZE + GRID_LINE_SIZE / 2} ${GRID_LINE_SIZE / 2} `
        d += `V ${GRID_BORDER_OUTLINE_SIZE + squaresHeight * GRID_SQUARE_SIZE + GRID_BORDER_OUTLINE_SIZE / 2}`;
    }
    for (let yIndex = 1; yIndex < squaresHeight; yIndex++) {
        // Equations not simplified for clarity
        d += `M ${GRID_LINE_SIZE / 2} ${GRID_BORDER_OUTLINE_SIZE + yIndex * GRID_SQUARE_SIZE + GRID_LINE_SIZE / 2} `
        d += `H ${GRID_BORDER_OUTLINE_SIZE + squaresHeight * GRID_SQUARE_SIZE + GRID_BORDER_OUTLINE_SIZE / 2}`;
    }
    return <path className={'grid-lines'} d={d} strokeWidth={GRID_LINE_SIZE} />;
}

export default GridLines;