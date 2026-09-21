import './CluePanel.scss';
import * as React from 'react';
import { useEffect, useRef, } from 'react';

import { CluePanelSolutionState, HighlightableCluePanelClue, } from "./CluePanelTypes";
import { ClueDirection } from '../crosswordGrid/CrosswordGridTypes';
import joinClass from "../util/joinClass";
import { PuzzleMouseActions } from "../interactablePuzzle/InteractablePuzzleMouse";

interface ClueListItemProps {
    cluePanelClue: HighlightableCluePanelClue,
    clueDirection: ClueDirection,
    mouseActions: PuzzleMouseActions,
}

/**
 * A single clue in the clue panel.
 */
function ClueListItem({ cluePanelClue, clueDirection, mouseActions }: ClueListItemProps) {
    const { isHighlighted, solutionState, } = cluePanelClue;
    const itemRef = useRef<HTMLLIElement>(null);
    const className = joinClass(
        isHighlighted && 'highlighted',
        solutionState === CluePanelSolutionState.VERIFIED_CORRECT && 'verified',
        solutionState === CluePanelSolutionState.VERIFIED_INCORRECT && 'verified-incorrect',
    );
    const onClick = mouseActions.onClickClue(clueDirection, cluePanelClue.number);

    useEffect(() => {
        if (isHighlighted) {
            itemRef.current?.scrollIntoView({ block: 'nearest', });
        }
    }, [isHighlighted]);

    return (
        <li
            ref={itemRef}
            value={cluePanelClue.number}
            className={className}
            onClick={onClick}
        >
            {cluePanelClue.number}. {cluePanelClue.clueText}
        </li>
    );
}

export default ClueListItem;
