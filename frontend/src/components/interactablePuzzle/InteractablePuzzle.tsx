import './InteractablePuzzle.scss';
import * as React from 'react';
import * as z from 'zod';

const { useState, } = React;

import CrosswordGrid from '../crosswordGrid/CrosswordGrid';
import { PuzzleSquare, SquareType } from "../crosswordGrid/CrosswordGridTypes";
import CluePanel from "../cluePanel/CluePanel";
import { CluePanelClue } from "../cluePanel/CluePanelTypes";
import { ClueExplanationBox, } from '../clueExplanation/ClueExplanationBox';
import { CrypticClueExplanation, CrypticClueExplanationType, } from '../../schemas/domain/puzzle/CrypticClueExplanation'

/**
 * An interactable puzzle on the site, including a grid, clues, and hint section.
 */
function InteractablePuzzle() {
    const { puzzleSquares, acrossCluePanelClues, downCluePanelClues, } = fakeData();
    const [crypticClueExplanation, setCrypticClueExplanation] = useState<CrypticClueExplanationType | undefined>(undefined);

    fetch('/explain').then(value => {
        value.json().then(
            res => setCrypticClueExplanation(z.parse(CrypticClueExplanation, res))
        );
    });

    return (
        <div className={'interactable-puzzle'}>
            <div className={'grid-container'}>
                <CrosswordGrid puzzleSquares={puzzleSquares} />
            </div>
            <div className={'clue-panel-container'}>
                <CluePanel acrossCluePanelClues={acrossCluePanelClues} downCluePanelClues={downCluePanelClues} />
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
 * Get fake data for testing, delete this later.
 */
function fakeData() {
    const puzzleSquares: PuzzleSquare[][] = [
        [SquareType.BLOCK, { squareType: SquareType.FILLABLE, fill: 'C' }],
        [{ squareType: SquareType.FILLABLE, fill: 'R' }, SquareType.BLOCK],
    ];
    const acrossCluePanelClues: CluePanelClue[] = [
        { clueText: 'What is H', number: 1, isAnswered: false },
        { clueText: 'What is H', number: 2, isAnswered: false },
        { clueText: 'What is H', number: 3, isAnswered: false },
        { clueText: 'What is H', number: 6, isAnswered: false },
        { clueText: 'What is H', number: 7, isAnswered: false },
        { clueText: 'What is H', number: 8, isAnswered: false },
        { clueText: 'What is H', number: 9, isAnswered: false },
    ];
    const downCluePanelClues: CluePanelClue[] = [
        { clueText: 'What is V', number: 1, isAnswered: false },
        { clueText: 'What is V', number: 2, isAnswered: false },
        { clueText: 'What is V', number: 3, isAnswered: false },
        { clueText: 'What is V', number: 6, isAnswered: false },
        { clueText: 'What is V', number: 7, isAnswered: false },
        { clueText: 'What is V', number: 8, isAnswered: false },
        { clueText: 'What is V', number: 9, isAnswered: false },
    ];
    return {
        puzzleSquares,
        acrossCluePanelClues,
        downCluePanelClues,
    };
}

export default InteractablePuzzle;
