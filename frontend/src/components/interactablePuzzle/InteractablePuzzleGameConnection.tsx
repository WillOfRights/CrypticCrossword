import * as React from 'react';

const { useState, useRef, useCallback } = React;

import InteractablePuzzle from './InteractablePuzzle';
import { PuzzleSquare, SquareType, ClueDirection, } from '../crosswordGrid/CrosswordGridTypes';
import { CluePanelClue, CluePanelSolutionState, } from '../cluePanel/CluePanelTypes';
import { useCheckClueGuess, useGameMessages } from '../../connections/game/GameSocket';

/**
 * HOC handling InteractablePuzzle's server interactions: sends a clue's guess to be graded once
 * it's complete, and holds the resulting solution state for every clue. InteractablePuzzle only
 * reports guesses as they change; this component is the sole authority on correctness.
 */
function InteractablePuzzleGameConnection() {
    const { initialPuzzleSquares, acrossCluePanelClues, downCluePanelClues } = _fakeRevealedState();

    const checkClueGuess = useCheckClueGuess();
    const [acrossClueStates, setAcrossClueStates] = useState(new Map<number, CluePanelSolutionState>());
    const [downClueStates, setDownClueStates] = useState(new Map<number, CluePanelSolutionState>());

    // Per direction, the guess each clue was last sent for grading (or is awaiting grading for),
    // so an unchanged guess never triggers a repeat request.
    const gradedGuessesRef = useRef({ across: new Map<number, string>(), down: new Map<number, string>() });

    useGameMessages(message => {
        if (message.type !== 'guessResult') {
            return;
        }
        const { clueDirection, clueNumber } = message.puzzleClueKey;
        const gradedGuesses = clueDirection === 'ACROSS' ? gradedGuessesRef.current.across : gradedGuessesRef.current.down;
        if (gradedGuesses.get(clueNumber) !== message.guess) {
            return; // a newer guess has since been submitted for this clue; ignore the stale result
        }
        const setClueStates = clueDirection === 'ACROSS' ? setAcrossClueStates : setDownClueStates;
        const state = message.isCorrect ? CluePanelSolutionState.VERIFIED_CORRECT : CluePanelSolutionState.VERIFIED_INCORRECT;
        setClueStates(prev => new Map(prev).set(clueNumber, state));
    });

    const onClueGuessChanged = useCallback((direction: ClueDirection, clueNumber: number, guess: string, isComplete: boolean) => {
        const gradedGuesses = direction === ClueDirection.ACROSS ? gradedGuessesRef.current.across : gradedGuessesRef.current.down;
        const setClueStates = direction === ClueDirection.ACROSS ? setAcrossClueStates : setDownClueStates;

        if (!isComplete) {
            gradedGuesses.delete(clueNumber);
            setClueStates(prev => (prev.has(clueNumber) ? _withoutEntry(prev, clueNumber) : prev));
            return;
        }
        if (gradedGuesses.get(clueNumber) === guess) {
            return;
        }
        gradedGuesses.set(clueNumber, guess);
        setClueStates(prev => new Map(prev).set(clueNumber, CluePanelSolutionState.COMPLETED_UNVERIFIED));
        checkClueGuess({ direction: direction === ClueDirection.ACROSS ? 'ACROSS' : 'DOWN', clueNumber, guess });
    }, [checkClueGuess]);

    return (
        <InteractablePuzzle
            initialPuzzleSquares={initialPuzzleSquares}
            acrossCluePanelClues={acrossCluePanelClues}
            downCluePanelClues={downCluePanelClues}
            acrossClueStates={acrossClueStates}
            downClueStates={downClueStates}
            onClueGuessChanged={onClueGuessChanged}
        />
    );
}

function _withoutEntry<K, V>(map: Map<K, V>, key: K): Map<K, V> {
    const next = new Map(map);
    next.delete(key);
    return next;
}

/**
 * Stand-in for the solver's revealed-so-far state. Will become props passed to this component,
 * populated from the server on page load, once puzzle persistence exists.
 */
function _fakeRevealedState() {
    const initialPuzzleSquares: PuzzleSquare[][] = [
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
        initialPuzzleSquares,
        acrossCluePanelClues,
        downCluePanelClues,
    };
}

export default InteractablePuzzleGameConnection;