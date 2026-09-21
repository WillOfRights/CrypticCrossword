import './CluePanel.scss';
import * as React from 'react';

import { CluePanelSolutionState, HighlightableCluePanelClue, } from "./CluePanelTypes";
import { ClueDirection } from '../crosswordGrid/CrosswordGridTypes';
import joinClass from "../util/joinClass";
import {PuzzleMouseActions} from "../interactablePuzzle/InteractablePuzzleMouse";

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
                    acrossCluePanelClues.map(cluePanelClue => _renderClue(cluePanelClue, ClueDirection.ACROSS, mouseActions))
                }
            </ol>
        </div>
        <div className={'down-clues'}>
            <ol className={'clue-list'}>
                {
                    downCluePanelClues.map(cluePanelClue => _renderClue(cluePanelClue, ClueDirection.DOWN, mouseActions))
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
    mouseActions: PuzzleMouseActions) {
    const { isHighlighted, solutionState, } = cluePanelClue;
    const className = joinClass(
        isHighlighted && 'highlighted',
        solutionState === CluePanelSolutionState.VERIFIED_CORRECT && 'verified',
        solutionState === CluePanelSolutionState.VERIFIED_INCORRECT && 'verified-incorrect',
    );
    const onClick= mouseActions.onClickClue(clueDirection, cluePanelClue.number);

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
