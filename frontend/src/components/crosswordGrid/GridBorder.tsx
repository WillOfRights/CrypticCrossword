import './CrosswordGrid.scss';
import React from 'react';

import {
    GRID_BORDER_OUTLINE_SIZE,
    GRID_SQUARE_SIZE,
} from './CrosswordGridConstants';

interface GridBorderProps {
    /**
     * The number of squares wide in the grid.
     */
    squaresWidth: number,
    /**
     * The number of squares tall in the grid.
     */
    squaresHeight: number,
};


function GridBorder({ squaresWidth, squaresHeight }: CrosswordGridBorderProps) {
    // Half grid thickness
    const hgt = GRID_BORDER_OUTLINE_SIZE / 2;

    // Adjust height and width for the room occupied by the line itself
    const width= squaresWidth * GRID_SQUARE_SIZE + GRID_BORDER_OUTLINE_SIZE;
    const height = squaresHeight * GRID_SQUARE_SIZE + GRID_BORDER_OUTLINE_SIZE;

    return <rect className={'grid-border'} x={hgt} y={hgt} width={width} height={height} strokeWidth={GRID_BORDER_OUTLINE_SIZE} />;
}

export default GridBorder;