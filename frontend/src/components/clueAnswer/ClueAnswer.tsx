import './ClueAnswer.scss';
import * as React from 'react';

import { SquareType, } from "../crosswordGrid/CrosswordGridTypes";
import { ClueAnswerSquare, } from "./ClueAnswerTypes";

interface ClueAnswerProps {
    /**
     * The `ClueAnswerSquare`s to display. An empty list indicates not to display anything.
     */
    squares: ClueAnswerSquare[],
}

function ClueAnswer({ squares }: ClueAnswerProps) {
    if (squares.length === 0) {
        return null;
    }
    return (
        <div className={'clue-answer'}>
            {squares.map((square, idx) => (
                <div
                    key={idx}
                    className={[
                        'clue-answer-square',
                        square.isFocused ? 'focused' : '',
                        square.squareType === SquareType.VERIFIED ? 'verified' : '',
                    ].join(' ')}
                >
                    {square.fill}
                </div>
            ))}
        </div>
    );
}

export default ClueAnswer;
