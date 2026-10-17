import { LetterSquareType, } from "../crosswordGrid/CrosswordGridTypes";

type ClueAnswerSquare = {
    fill: String,
    squareType: LetterSquareType,
    isFocused: boolean,
}

export {
    ClueAnswerSquare,
}
