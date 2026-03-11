/**
 * A clue in the clue panel.
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
    /**
     * Whether the clue has been answered by the user or not.
     */
    isAnswered: boolean,
}

export { CluePanelClue, };