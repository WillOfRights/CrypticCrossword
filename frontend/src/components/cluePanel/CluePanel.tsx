import './CluePanel.scss';
import * as React from 'react';

import { HighlightableCluePanelClue, } from "./CluePanelTypes";
import { ClueDirection } from '../crosswordGrid/CrosswordGridTypes';
import { PuzzleMouseActions } from "../interactablePuzzle/InteractablePuzzleMouse";
import ClueListItem from './ClueListItem';

interface CluePanelProps {
    acrossCluePanelClues: HighlightableCluePanelClue[],
    downCluePanelClues: HighlightableCluePanelClue[],
    mouseActions: PuzzleMouseActions,
}

/**
 * The panel to view across and down clues for a puzzle.
 */
function CluePanel({ acrossCluePanelClues, downCluePanelClues, mouseActions }: CluePanelProps) {
    return <div className={'clue-panel'}>
        <div className={'across-clues'}>
            <ol className={'clue-list'}>
                {
                    acrossCluePanelClues.map(cluePanelClue =>
                        <ClueListItem
                            key={cluePanelClue.number}
                            cluePanelClue={cluePanelClue}
                            clueDirection={ClueDirection.ACROSS}
                            mouseActions={mouseActions}
                        />)
                }
            </ol>
        </div>
        <div className={'down-clues'}>
            <ol className={'clue-list'}>
                {
                    downCluePanelClues.map(cluePanelClue =>
                        <ClueListItem
                            key={cluePanelClue.number}
                            cluePanelClue={cluePanelClue}
                            clueDirection={ClueDirection.DOWN}
                            mouseActions={mouseActions}
                        />)
                }
            </ol>
        </div>
    </div>;
}

export default CluePanel;
