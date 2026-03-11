import './CluePanel.scss';
import * as React from 'react';

import { CluePanelClue, } from "./CluePanelTypes";

interface CluePanelProps {
    acrossCluePanelClues: CluePanelClue[],
    downCluePanelClues: CluePanelClue[],
}

/**
 * The panel to view across and down clues for a puzzle.
 */
function CluePanel({ acrossCluePanelClues, downCluePanelClues }: CluePanelProps) {
    return <div className={'clue-panel'}>
        <div className={'across-clues'}>
            <ol className={'clue-list'}>
                {
                    acrossCluePanelClues.map(cluePanelClue => _renderClue(cluePanelClue))
                }
            </ol>
        </div>
        <div className={'down-clues'}>
            <ol className={'clue-list'}>
                {
                    downCluePanelClues.map(cluePanelClue => _renderClue(cluePanelClue))
                }
            </ol>
        </div>
    </div>;
}

/**
 * Render a clue as a list item.
 */
function _renderClue(cluePanelClue: CluePanelClue) {
    return (
        <li key={cluePanelClue.number} value={cluePanelClue.number}>
            {cluePanelClue.number}. {cluePanelClue.clueText}
        </li>
    );
}

export default CluePanel;
