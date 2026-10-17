import './InteractablePuzzle.scss';
import * as React from 'react';
import * as z from 'zod';

const { useRef, useEffect, useState, } = React;

import CrosswordGrid from "../crosswordGrid/CrosswordGrid";
import { PuzzleSquareContent, ClueDirection, } from "../crosswordGrid/CrosswordGridTypes";
import CluePanel from "../cluePanel/CluePanel";
import { CluePanelClue, } from "../cluePanel/CluePanelTypes";
import ClueAnswer from "../clueAnswer/ClueAnswer";
import { ClueExplanationBox, } from '../clueExplanation/ClueExplanationBox';
import { CrypticClueExplanation, CrypticClueExplanationType, } from '../../schemas/domain/puzzle/CrypticClueExplanation'

import {
    getHighlightablePuzzleSquares,
    getSquareCluesArray,
    getClueGuesses,
    getHighlightableCluePanelClues,
    getIncorrectClueBorders,
    toSolvableCluePanelClues,
    getFocusedClueAnswerSquares,
} from "./InteractablePuzzleUtils";
import { ClueGuesses, ClueSolutionStates, CluesByDirection, } from "./InteractablePuzzleTypes";
import { useInteractablePuzzleNavigation } from "./InteractablePuzzleNavigation";
import { useInteractablePuzzleKeyboard } from "./InteractablePuzzleKeyboard";
import { useKeyboardInputFocusSync } from "./InteractablePuzzleFocusSync";
import { useInteractablePuzzleMouse } from "./InteractablePuzzleMouse";
import { useInteractablePuzzleSolving } from "./InteractablePuzzleSolving";

interface InteractablePuzzleBoardProps {
    initialPuzzleSquares: PuzzleSquareContent[][],
    acrossCluePanelClues: CluePanelClue[],
    downCluePanelClues: CluePanelClue[],
    acrossClueStates: ClueSolutionStates,
    downClueStates: ClueSolutionStates,
    onClueGuessChanged: (direction: ClueDirection, clueNumber: number, guess: string, isComplete: boolean) => void,
}

/**
 * The puzzle grid, clues, and hint section. Puzzle content and clue solution state are commanded
 * from above; this component owns only interaction (focus, keyboard, mouse) and fill state.
 */
function InteractablePuzzleBoard({
    initialPuzzleSquares,
    acrossCluePanelClues,
    downCluePanelClues,
    acrossClueStates,
    downClueStates,
    onClueGuessChanged,
}: InteractablePuzzleBoardProps) {
    const keyboardInputRef = useRef<HTMLInputElement | null>(null);
    const cluePanelContainerRef = useRef<HTMLDivElement | null>(null);
    const [puzzleSquares, setPuzzleSquares] = useState<PuzzleSquareContent[][]>(initialPuzzleSquares);
    const previousGuessesRef = useRef<CluesByDirection<string>>({ across: new Map(), down: new Map() });

    const puzzleSquareWithCluesArray = getSquareCluesArray(
        puzzleSquares, acrossCluePanelClues, downCluePanelClues, acrossClueStates, downClueStates,
    );
    const { acrossClueGuesses, downClueGuesses } = getClueGuesses(
        acrossCluePanelClues, downCluePanelClues, puzzleSquareWithCluesArray, acrossClueStates, downClueStates,
    );
    const acrossSolvableClues = toSolvableCluePanelClues(acrossCluePanelClues, acrossClueGuesses);
    const downSolvableClues = toSolvableCluePanelClues(downCluePanelClues, downClueGuesses);

    useEffect(() => {
        _reportChangedGuesses(ClueDirection.ACROSS, acrossClueGuesses, previousGuessesRef.current.across, onClueGuessChanged);
        _reportChangedGuesses(ClueDirection.DOWN, downClueGuesses, previousGuessesRef.current.down, onClueGuessChanged);
    });

    const { focus, navigationActions, } = useInteractablePuzzleNavigation(puzzleSquareWithCluesArray);
    const { solvingActions, } = useInteractablePuzzleSolving(puzzleSquareWithCluesArray, setPuzzleSquares, focus);
    const { onKeyDown, } = useInteractablePuzzleKeyboard(navigationActions, solvingActions, focus, puzzleSquareWithCluesArray);
    const mouseActions = useInteractablePuzzleMouse(navigationActions, focus);
    const keyboardInputFocusProps = useKeyboardInputFocusSync(navigationActions, focus, keyboardInputRef);

    const highlightablePuzzleSquares = getHighlightablePuzzleSquares(puzzleSquareWithCluesArray, focus);
    const { acrossHighlightableClues, downHighlightableClues, } = getHighlightableCluePanelClues(acrossSolvableClues, downSolvableClues, focus);
    const clueBorders = getIncorrectClueBorders(
        puzzleSquareWithCluesArray, acrossCluePanelClues, downCluePanelClues, acrossClueStates, downClueStates,
    );
    const clueAnswerSquares = getFocusedClueAnswerSquares(puzzleSquareWithCluesArray, focus);

    const onMouseDownInteractablePuzzle = (e: React.MouseEvent<HTMLDivElement>) => {
        // Keep DOM focus on the keyboard input, except in the clue panel so clue text stays selectable
        if (!cluePanelContainerRef.current?.contains(e.target as Node)) {
            e.preventDefault();
        }
    };

    // const [crypticClueExplanation, setCrypticClueExplanation] = useState<CrypticClueExplanationType | undefined>(undefined);
    //
    // fetch('/explain').then(value => {
    //     value.json().then(
    //         res => setCrypticClueExplanation(z.parse(CrypticClueExplanation, res))
    //     );
    // });

    return (
        <div
            className={'interactable-puzzle'}
            onMouseDown={onMouseDownInteractablePuzzle}
        >
            <input
                className={'keyboard-input'}
                ref={keyboardInputRef}
                type={'text'}
                value={''}
                onChange={() => {}}
                autoComplete={'off'}
                spellCheck={false}
                onKeyDown={onKeyDown}
                {...keyboardInputFocusProps}
            />
            <div className={'grid-container'}>
                <CrosswordGrid puzzleSquares={highlightablePuzzleSquares} clueBorders={clueBorders} mouseActions={mouseActions} />
                <ClueAnswer squares={clueAnswerSquares} />
            </div>
            <div className={'clue-panel-container'} ref={cluePanelContainerRef}>
                <CluePanel acrossCluePanelClues={acrossHighlightableClues} downCluePanelClues={downHighlightableClues} mouseActions={mouseActions} />
            </div>
            <div className={'explanation-box-container'}>
                {/*{*/}
                {/*    crypticClueExplanation !== undefined ?*/}
                {/*        <ClueExplanationBox crypticClueExplanation={crypticClueExplanation} />*/}
                {/*        : null*/}
                {/*}*/}
            </div>
        </div>
    );
}

/**
 * Call `onClueGuessChanged` for each clue whose guess differs from what was last reported, then
 * record it as reported. Keeps InteractablePuzzleBoard from re-reporting an unchanged guess every render.
 */
function _reportChangedGuesses(
    direction: ClueDirection,
    clueGuesses: ClueGuesses,
    previousGuesses: Map<number, string>,
    onClueGuessChanged: (direction: ClueDirection, clueNumber: number, guess: string, isComplete: boolean) => void,
) {
    clueGuesses.forEach(({ guess, isComplete }, clueNumber) => {
        if (previousGuesses.get(clueNumber) === guess) {
            return;
        }
        previousGuesses.set(clueNumber, guess);
        onClueGuessChanged(direction, clueNumber, guess, isComplete);
    });
}

export default InteractablePuzzleBoard;
