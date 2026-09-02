/**
 * A clue in the clue panel, without information about the current state of answering the puzzle.
 */
type CluePanelClue = {
    /**
     * The text of the clue.
     */
    clueText: String,
    /**
     * The number of the clue.
     */
    number: number,
}

/**
 * The different solution states of a clue panel clue.
 */
enum CluePanelSolutionState {
    NOT_COMPLETED,
    COMPLETED_UNVERIFIED,
    VERIFIED_CORRECT,
    VERIFIED_INCORRECT,
};

/**
 * A clue panel clue, including information about it's solution state in the puzzle.
 */
type SolvableCluePanelClue = CluePanelClue & {
    solutionState: CluePanelSolutionState,
};

/**
 * A solvable clue panel clue, as well as information about whether it is highlighted in the puzzle.
 */
type HighlightableCluePanelClue = SolvableCluePanelClue & {
    isHighlighted: boolean,
}

export {
    CluePanelClue,
    CluePanelSolutionState,
    SolvableCluePanelClue,
    HighlightableCluePanelClue,
};

