import './CrosswordGrid.scss';
import * as React from 'react';

import { GRID_BORDER_OUTLINE_SIZE, GRID_SQUARE_SIZE, } from './CrosswordGridConstants';
import { ClueBorder, ClueDirection, } from './CrosswordGridTypes';

/**
 * Size of one repeating tile of the incorrect-clue hatch pattern.
 */
const HATCH_TILE_SIZE = 8;

interface GridClueBordersProps {
    clueBorders: ClueBorder[],
}

/**
 * Draws one dashed, hatched outline per clue verified incorrect.
 */
function GridClueBorders({ clueBorders }: GridClueBordersProps) {
    return <>
        <defs>
            <pattern
                id={'incorrect-hatch'}
                width={HATCH_TILE_SIZE}
                height={HATCH_TILE_SIZE}
                patternUnits={'userSpaceOnUse'}
                patternTransform={'rotate(45)'}
            >
                <line className={'incorrect-hatch-line'} x1={0} y1={0} x2={0} y2={HATCH_TILE_SIZE} />
            </pattern>
        </defs>
        {clueBorders.map((clueBorder, idx) => _renderClueBorder(clueBorder, idx))}
    </>;
}

/**
 * Render a single clue's border as a rectangle spanning its squares.
 */
function _renderClueBorder(clueBorder: ClueBorder, key: number) {
    const { direction, startRowIdx, startColIdx, length } = clueBorder;

    const width = direction === ClueDirection.ACROSS ? length * GRID_SQUARE_SIZE : GRID_SQUARE_SIZE;
    const height = direction === ClueDirection.ACROSS ? GRID_SQUARE_SIZE : length * GRID_SQUARE_SIZE;
    const x = startColIdx * GRID_SQUARE_SIZE + GRID_BORDER_OUTLINE_SIZE;
    const y = startRowIdx * GRID_SQUARE_SIZE + GRID_BORDER_OUTLINE_SIZE;

    return <rect key={key} className={'incorrect-clue-border'} x={x} y={y} width={width} height={height} />;
}

export default GridClueBorders;
