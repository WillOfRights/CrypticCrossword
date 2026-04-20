package net.deanasdogs.crypticCrossword.modules.puzzle.model.clue.crypticCluePart.common

import net.deanasdogs.crypticCrossword.modules.puzzle.model.clue.crypticCluePart.CrypticCluePart

/**
 * A clue part that consists of multiple children parts. This superclass contains shared logic for validation and
 * manipulating child clue parts.
 */
interface ParentCluePart {
    /**
     * The child clue parts of this parent part.
     */
    val children: List<CrypticCluePart>

    /**
     * For parent list parts, clue text is the combined child clue text (by default).
     */
    val defaultClueText get() = children.joinToString(separator = "") { it.clueText }

    /**
     * Validate that all child clue parts match the allowed predicate.
     */
    fun validateChildClueParts(allowedChildrenPredicate: (CrypticCluePart) -> Boolean) {
        children.forEach {
            require(allowedChildrenPredicate(it)) {
                "Child $it does not match allowed predicate."
            }
        }
    }

    companion object {
        /**
         * Verify that exactly one child matches the given reified type and predicate, then return it.
         */
        inline fun <reified T: CrypticCluePart> getOnlyChild(
            children: List<CrypticCluePart>,
            predicate: (CrypticCluePart) -> Boolean
        ): T {
           return children
               .filterIsInstance<T>()
               .single { predicate(it) }
        }

        /**
         * Verify that at most one child matches the given reified type and predicate, then return it.
         */
        inline fun <reified T: CrypticCluePart> getOptionalChild(
            children: List<CrypticCluePart>,
            predicate: (CrypticCluePart) -> Boolean
        ): T? {
            return children
                .filterIsInstance<T>()
                .firstOrNull { predicate(it) }
        }
    }
}