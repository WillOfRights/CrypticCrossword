import './InteractablePuzzle.scss';
import * as React from 'react';
import * as z from 'zod';

const { useRef, useEffect, useState, } = React;

import CrosswordGrid from "../crosswordGrid/CrosswordGrid";
import { PuzzleSquare, SquareType, ClueDirection, } from "../crosswordGrid/CrosswordGridTypes";
import CluePanel from "../cluePanel/CluePanel";
import { CluePanelClue, CluePanelSolutionState, } from "../cluePanel/CluePanelTypes";
import { ClueExplanationBox, } from '../clueExplanation/ClueExplanationBox';
import { CrypticClueExplanation, CrypticClueExplanationType, } from '../../schemas/domain/puzzle/CrypticClueExplanation'

import { getHighlightablePuzzleSquares, getSquareCluesArray, getSolvableCluePanelClues, getHighlightableCluePanelClues, getClueGuesses, } from "./InteractablePuzzleUtils";
import { useInteractablePuzzleNavigation } from "./InteractablePuzzleNavigation";
import { useInteractablePuzzleKeyboard } from "./InteractablePuzzleKeyboard";
import { useInteractablePuzzleMouse } from "./InteractablePuzzleMouse";
import { useInteractablePuzzleSolving } from "./InteractablePuzzleSolving";

interface InteractablePuzzleProps {
    initialPuzzleSquares: PuzzleSquare[][],
    acrossCluePanelClues: CluePanelClue[],
    downCluePanelClues: CluePanelClue[],
    acrossClueStates: Map<number, CluePanelSolutionState>,
    downClueStates: Map<number, CluePanelSolutionState>,
    onClueGuessChanged: (direction: ClueDirection, clueNumber: number, guess: string, isComplete: boolean) => void,
}

/**
 * An interactable puzzle on the site, including a grid, clues, and hint section. Puzzle content
 * and clue solution state are commanded from above; this component owns only the interaction
 * (focus, keyboard, mouse) and fill state built on top of them.
 */
function InteractablePuzzle({
    initialPuzzleSquares,
    acrossCluePanelClues,
    downCluePanelClues,
    acrossClueStates,
    downClueStates,
    onClueGuessChanged,
}: InteractablePuzzleProps) {
    const ref = useRef<HTMLDivElement>(null);
    const [puzzleSquares, setPuzzleSquares] = useState<PuzzleSquare[][]>(initialPuzzleSquares);
    const previousGuessesRef = useRef(new Map<string, string>());

    const puzzleSquareWithCluesArray = getSquareCluesArray(puzzleSquares, acrossCluePanelClues, downCluePanelClues);
    const { acrossSolvableClues, downSolvableClues } = getSolvableCluePanelClues(acrossCluePanelClues, downCluePanelClues, acrossClueStates, downClueStates);

    useEffect(() => {
        const { acrossGuesses, downGuesses } = getClueGuesses(acrossCluePanelClues, downCluePanelClues, puzzleSquareWithCluesArray);
        _reportChangedGuesses(ClueDirection.ACROSS, acrossGuesses, previousGuessesRef.current, onClueGuessChanged);
        _reportChangedGuesses(ClueDirection.DOWN, downGuesses, previousGuessesRef.current, onClueGuessChanged);
    });

    const { focus, navigationActions, } = useInteractablePuzzleNavigation(puzzleSquareWithCluesArray);
    const { solvingActions, } = useInteractablePuzzleSolving(puzzleSquareWithCluesArray, setPuzzleSquares, focus);
    const keyboardActions = useInteractablePuzzleKeyboard(navigationActions, solvingActions, focus, puzzleSquareWithCluesArray);
    const { onKeyDown, onFocusInteractivePuzzle, onBlurInteractivePuzzle, } = keyboardActions;
    const mouseActions = useInteractablePuzzleMouse(navigationActions, focus);

    // Autofocus interactable puzzle on page load
    useEffect(() => {
        ref.current?.focus();
    }, []);

    const highlightablePuzzleSquares = getHighlightablePuzzleSquares(puzzleSquareWithCluesArray, focus);
    const { acrossHighlightableClues, downHighlightableClues, } = getHighlightableCluePanelClues(acrossSolvableClues, downSolvableClues, focus);

    const [crypticClueExplanation, setCrypticClueExplanation] = useState<CrypticClueExplanationType | undefined>(undefined);

    // fetch('/explain').then(value => {
    //     value.json().then(
    //         res => setCrypticClueExplanation(z.parse(CrypticClueExplanation, res))
    //     );
    // });

    return (
        <div
            className={'interactable-puzzle'}
            ref={ref}
            tabIndex={0}
            onKeyDown={onKeyDown}
            onFocus={onFocusInteractivePuzzle}
            onBlur={onBlurInteractivePuzzle}
        >
            <div className={'grid-container'}>
                <CrosswordGrid puzzleSquares={highlightablePuzzleSquares} mouseActions={mouseActions} />
            </div>
            <div className={'clue-panel-container'}>
                <CluePanel acrossCluePanelClues={acrossHighlightableClues} downCluePanelClues={downHighlightableClues} keyboardActions={keyboardActions} />
            </div>
            <div className={'explanation-box-container'}>
                {
                    crypticClueExplanation !== undefined ?
                        <ClueExplanationBox crypticClueExplanation={crypticClueExplanation} />
                        : null
                }
            </div>
        </div>
    );
}

/**
 * Call `onClueGuessChanged` for each clue whose guess differs from what was last reported, then
 * record it as reported. Keeps InteractablePuzzle from re-reporting an unchanged guess every render.
 */
function _reportChangedGuesses(
    direction: ClueDirection,
    guesses: Map<number, { guess: string, isComplete: boolean }>,
    previousGuesses: Map<string, string>,
    onClueGuessChanged: (direction: ClueDirection, clueNumber: number, guess: string, isComplete: boolean) => void,
) {
    guesses.forEach(({ guess, isComplete }, clueNumber) => {
        const key = `${direction}-${clueNumber}`;
        if (previousGuesses.get(key) === guess) {
            return;
        }
        previousGuesses.set(key, guess);
        onClueGuessChanged(direction, clueNumber, guess, isComplete);
    });
}

export default InteractablePuzzle;
