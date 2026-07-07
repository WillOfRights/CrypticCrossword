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
 * A clue panel clue, including information about the state of the
 * puzzle such as whether this clue hsa been answered or is currently
 * highlighted.
 */
type StatefulCluePanelClue = CluePanelClue & {
    isAnswered: boolean,
    isHighlighted: boolean,
}

export { CluePanelClue, StatefulCluePanelClue, };
