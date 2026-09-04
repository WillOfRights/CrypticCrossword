import * as React from 'react';

const { useRef, useState, useCallback } = React;
import type { Dispatch, SetStateAction } from 'react';

import InteractablePuzzleBoard from './InteractablePuzzleBoard';
import { PuzzleSquare, SquareType, ClueDirection, } from "../crosswordGrid/CrosswordGridTypes";
import { CluePanelClue, CluePanelSolutionState, } from "../cluePanel/CluePanelTypes";
import { ClueSolutionStates, } from "./InteractablePuzzleTypes";
import { useCheckClueGuess, useGameMessages } from "../../connections/game/GameSocket";
import { GuessResultType, } from '../../schemas/domain/game/GameServerMessage';
import { ClueDirectionType, } from '../../schemas/domain/puzzle/ClueDirection';

/**
 * An interactable puzzle on the site: owns the server connection (grading a clue's guess once
 * complete, receiving results) and renders `InteractablePuzzleBoard` with the resulting solution
 * state. The board owns interaction and fill state; this component is the sole authority on
 * correctness.
 */
function InteractablePuzzle() {
    const { initialPuzzleSquares, acrossCluePanelClues, downCluePanelClues } = _fakeRevealedState();

    const checkClueGuess = useCheckClueGuess();
    const [acrossClueStates, setAcrossClueStates] = useState<ClueSolutionStates>(new Map());
    const [downClueStates, setDownClueStates] = useState<ClueSolutionStates>(new Map());

    // Per direction, the guess each clue was last sent for grading (or is awaiting grading for),
    // so an unchanged guess never triggers a repeat request.
    const gradedGuessesRef = useRef({ across: new Map<number, string>(), down: new Map<number, string>() });

    useGameMessages(message => {
        switch (message.type) {
            case 'guessResult':
                _applyGuessResult(message, gradedGuessesRef.current, setAcrossClueStates, setDownClueStates);
                break;
            case 'clueRevealed':
                // TODO: reveal message.answer and lock the clue's squares once square-locking exists.
                break;
            default:
                message satisfies never;
        }
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
        checkClueGuess({ direction: _toWireClueDirection(direction), clueNumber, guess });
    }, [checkClueGuess]);

    return (
        <InteractablePuzzleBoard
            initialPuzzleSquares={initialPuzzleSquares}
            acrossCluePanelClues={acrossCluePanelClues}
            downCluePanelClues={downCluePanelClues}
            acrossClueStates={acrossClueStates}
            downClueStates={downClueStates}
            onClueGuessChanged={onClueGuessChanged}
        />
    );
}

/**
 * Apply a `guessResult` message to clue state, unless a newer guess has since been submitted for
 * that clue - in which case the result is stale and is dropped.
 */
function _applyGuessResult(
    message: GuessResultType,
    gradedGuessesByDirection: { across: Map<number, string>, down: Map<number, string> },
    setAcrossClueStates: Dispatch<SetStateAction<ClueSolutionStates>>,
    setDownClueStates: Dispatch<SetStateAction<ClueSolutionStates>>,
) {
    const direction = _fromWireClueDirection(message.puzzleClueKey.clueDirection);
    const { clueNumber } = message.puzzleClueKey;

    const gradedGuesses = direction === ClueDirection.ACROSS ? gradedGuessesByDirection.across : gradedGuessesByDirection.down;
    if (gradedGuesses.get(clueNumber) !== message.guess) {
        return;
    }

    const setClueStates = direction === ClueDirection.ACROSS ? setAcrossClueStates : setDownClueStates;
    const state = message.isCorrect ? CluePanelSolutionState.VERIFIED_CORRECT : CluePanelSolutionState.VERIFIED_INCORRECT;
    setClueStates(prev => new Map(prev).set(clueNumber, state));
}

function _toWireClueDirection(direction: ClueDirection): ClueDirectionType {
    return direction === ClueDirection.ACROSS ? 'ACROSS' : 'DOWN';
}

function _fromWireClueDirection(direction: ClueDirectionType): ClueDirection {
    return direction === 'ACROSS' ? ClueDirection.ACROSS : ClueDirection.DOWN;
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

export default InteractablePuzzle;
