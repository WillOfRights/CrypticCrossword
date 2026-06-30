import './InteractablePuzzle.scss';
import * as React from 'react';
const { useState } = React;

import CrosswordGrid from '../crosswordGrid/CrosswordGrid';
import { ClueDirection, PuzzleSquare, SquareType } from "../crosswordGrid/CrosswordGridTypes";
import CluePanel from "../cluePanel/CluePanel";
import { CluePanelClue } from "../cluePanel/CluePanelTypes";

import { InteractablePuzzleFocusState } from "./InteractablePuzzleTypes";
import { getHighlightablePuzzleSquares, getSquareCluesArray } from "./InteractablePuzzleUtils";

const DEFAULT_FOCUS_STATE = { rowIdx: 0, colIdx: 0, direction: ClueDirection.ACROSS, clueNumber: 1 };

/**
 * An interactable puzzle on the site, including a grid, clues, and hint section.
 */
function InteractablePuzzle() {
    const [focusState, setFocusState] = useState<InteractablePuzzleFocusState>(DEFAULT_FOCUS_STATE);

    const { puzzleSquares, acrossCluePanelClues, downCluePanelClues, } = fakeData();
    const squareCluesArray = getSquareCluesArray(puzzleSquares);
    const highlightablePuzzleSquares = getHighlightablePuzzleSquares(puzzleSquares, squareCluesArray, focusState);

    return (
        <div className={'interactable-puzzle'}>
            <div className={'grid-container'}>
                <CrosswordGrid puzzleSquares={highlightablePuzzleSquares} />
            </div>
            <div className={'clue-panel-container'}>
                <CluePanel acrossCluePanelClues={acrossCluePanelClues} downCluePanelClues={downCluePanelClues} />
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
        { clueText: 'DOG', number: 1, isAnswered: false },
        { clueText: 'OWE', number: 4, isAnswered: false },
        { clueText: 'MID', number: 5, isAnswered: false },
        { clueText: 'IS', number: 7, isAnswered: false },
        { clueText: 'ACE', number: 8, isAnswered: false },
    ];

    const downCluePanelClues: CluePanelClue[] = [
        { clueText: 'DIM', number: 1, isAnswered: false },
        { clueText: 'GOD', number: 2, isAnswered: false },
        { clueText: 'ME', number: 3, isAnswered: false },
        { clueText: 'INC', number: 6, isAnswered: false },
    ];
    return {
        puzzleSquares,
        acrossCluePanelClues,
        downCluePanelClues,
    };
}

export default InteractablePuzzle;
