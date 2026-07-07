import './InteractablePuzzle.scss';
import * as React from 'react';

const { useRef, useEffect } = React;

import CrosswordGrid from '../crosswordGrid/CrosswordGrid';
import { PuzzleSquare, SquareType } from "../crosswordGrid/CrosswordGridTypes";
import CluePanel from "../cluePanel/CluePanel";
import { CluePanelClue } from "../cluePanel/CluePanelTypes";

import { getHighlightablePuzzleSquares, getSquareCluesArray, getStatefulCluePanelClues } from "./InteractablePuzzleUtils";
import { useInteractablePuzzleNavigation } from "./InteractablePuzzleNavigation";
import { useInteractablePuzzleKeyboard } from "./InteractablePuzzleKeyboard";
import { useInteractablePuzzleMouse } from "./InteractablePuzzleMouse";

/**
 * An interactable puzzle on the site, including a grid, clues, and hint section.
 */
function InteractablePuzzle() {
    const ref = useRef<HTMLDivElement>(null);

    const { puzzleSquares, acrossCluePanelClues, downCluePanelClues, } = fakeData();
    const puzzleSquareWithCluesArray = getSquareCluesArray(puzzleSquares);

    const { focus, actions } = useInteractablePuzzleNavigation(puzzleSquareWithCluesArray);
    const { onKeyDown, onFocusInteractivePuzzle, onBlurInteractivePuzzle } = useInteractablePuzzleKeyboard(actions, focus);
    const mouseActions = useInteractablePuzzleMouse(actions, focus);

    // Autofocus interactable puzzle on page load
    useEffect(() => {
        ref.current?.focus();
    }, []);

    const highlightablePuzzleSquares = getHighlightablePuzzleSquares(puzzleSquareWithCluesArray, focus);
    const { acrossStatefulClues, downStatefulClues, } = getStatefulCluePanelClues(acrossCluePanelClues, downCluePanelClues, focus);

    return (
        <div className={'interactable-puzzle'}
            ref={ref}
            tabIndex={0}
            onKeyDown={onKeyDown}
            onFocus={onFocusInteractivePuzzle}
            onBlur={onBlurInteractivePuzzle} >
            <div className={'grid-container'}>
                <CrosswordGrid puzzleSquares={highlightablePuzzleSquares} mouseActions={mouseActions} />
            </div>
            <div className={'clue-panel-container'}>
                <CluePanel acrossCluePanelClues={acrossStatefulClues} downCluePanelClues={downStatefulClues} />
            </div>
        </div>
    );
}

/**
 * Get fake data for testing, delete this later.
 */
function fakeData() {
    const puzzleSquares: PuzzleSquare[][] = [
        [
            { squareType: SquareType.FILLABLE, fill: '', number: 1 },
            { squareType: SquareType.FILLABLE, fill: '', },
            { squareType: SquareType.FILLABLE, fill: '', number: 2 },
            SquareType.BLOCK,
            { squareType: SquareType.FILLABLE, fill: '', number: 3 },
        ],
        [
            { squareType: SquareType.FILLABLE, fill: '', },
            SquareType.BLOCK,
            { squareType: SquareType.FILLABLE, fill: '', number: 4 },
            { squareType: SquareType.FILLABLE, fill: '', },
            { squareType: SquareType.FILLABLE, fill: '', },
        ],
        [
            { squareType: SquareType.FILLABLE, fill: '', number: 5 },
            { squareType: SquareType.FILLABLE, fill: '', number: 6 },
            { squareType: SquareType.FILLABLE, fill: '', },
            SquareType.BLOCK,
            SquareType.BLOCK,
        ],
        [
            SquareType.BLOCK,
            { squareType: SquareType.FILLABLE, fill: '', },
            SquareType.BLOCK,
            { squareType: SquareType.FILLABLE, fill: '', number: 7 },
            { squareType: SquareType.FILLABLE, fill: '', },
        ],
        [
            { squareType: SquareType.FILLABLE, fill: '', number: 8 },
            { squareType: SquareType.FILLABLE, fill: '', },
            { squareType: SquareType.FILLABLE, fill: '', },
            SquareType.BLOCK,
            SquareType.BLOCK,
        ],
    ];

    const acrossCluePanelClues: CluePanelClue[] = [
        { clueText: 'DOG', number: 1, },
        { clueText: 'OWE', number: 4, },
        { clueText: 'MID', number: 5, },
        { clueText: 'IS', number: 7, },
        { clueText: 'ACE', number: 8, },
    ];

    const downCluePanelClues: CluePanelClue[] = [
        { clueText: 'DIM', number: 1, },
        { clueText: 'GOD', number: 2, },
        { clueText: 'ME', number: 3, },
        { clueText: 'INC', number: 6, },
    ];
    return {
        puzzleSquares,
        acrossCluePanelClues,
        downCluePanelClues,
    };
}

export default InteractablePuzzle;
