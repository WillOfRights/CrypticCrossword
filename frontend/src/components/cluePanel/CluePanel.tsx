import './CluePanel.scss';
import * as React from 'react';

import { HighlightableCluePanelClue, } from "./CluePanelTypes";
import { PuzzleKeyboardActions } from '../interactablePuzzle/InteractablePuzzleKeyboard';
import { ClueDirection } from '../crosswordGrid/CrosswordGridTypes';

interface CluePanelProps {
    acrossCluePanelClues: HighlightableCluePanelClue[],
    downCluePanelClues: HighlightableCluePanelClue[],
    keyboardActions: PuzzleKeyboardActions,
}

/**
 * The panel to view across and down clues for a puzzle.
 */
function CluePanel({ acrossCluePanelClues, downCluePanelClues, keyboardActions }: CluePanelProps) {
    return <div className={'clue-panel'}>
        <div className={'across-clues'}>
            <ol className={'clue-list'}>
                {
                    acrossCluePanelClues.map(cluePanelClue => _renderClue(cluePanelClue, ClueDirection.ACROSS, keyboardActions))
                }
            </ol>
        </div>
        <div className={'down-clues'}>
            <ol className={'clue-list'}>
                {
                    downCluePanelClues.map(cluePanelClue => _renderClue(cluePanelClue, ClueDirection.DOWN, keyboardActions))
                }
            </ol>
        </div>
    </div>;
}

/**
 * Render a clue as a list item.
 */
function _renderClue(
    cluePanelClue: HighlightableCluePanelClue,
    clueDirection: ClueDirection,
    keyboardActions: PuzzleKeyboardActions) {
    const { isHighlighted, } = cluePanelClue;
    const className = isHighlighted ? 'highlighted' : '';
    const onClick = keyboardActions.onClickClue(clueDirection, cluePanelClue.number);

    return (
        <li
            key={cluePanelClue.number}
            value={cluePanelClue.number}
            className={className}
            onClick={onClick}
        >
            {cluePanelClue.number}. {cluePanelClue.clueText}
        </li>
    );
}

export default CluePanel;
