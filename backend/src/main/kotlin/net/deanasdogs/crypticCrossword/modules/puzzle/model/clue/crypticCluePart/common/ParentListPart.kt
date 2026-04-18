package net.deanasdogs.crypticCrossword.modules.puzzle.model.clue.crypticCluePart.common

import net.deanasdogs.crypticCrossword.modules.puzzle.model.clue.crypticCluePart.CrypticCluePart

/**
 * A clue part that consists of multiple children parts. This interface contains shared logic for validation and
 * manipulating child clue parts.
 */
interface ParentListPart {
    /**
     * The child clue parts of this parent part.
     */
    val children: List<CrypticCluePart>

    /**
     * A list of predicates specifying which children are allowed. It is required (at runtime) that all children
     * must match one of the predicates.
     */
    val allowedChildPredicateMap: Map<(CrypticCluePart) -> Boolean, AllowedChildPredicateType>

    /**
     * Validate that all child clue parts match the predicates specified in the map.
     */
    fun validateChildClueParts() {
        // Check that every allowedChildPredicate is fulfilled
        allowedChildPredicateMap.forEach {
            (predicate, allowedChildPredicateType) ->
            require(allowedChildPredicateType.validationMetaFunction(children, predicate))
        }
    }

    companion object {
        enum class AllowedChildPredicateType(
            val validationMetaFunction: (List<CrypticCluePart>, (CrypticCluePart) -> Boolean) -> Boolean)
        {
            /**
             * There must be exactly one child that matches this predicate.
             */
            ONE({
                crypticCluePartList: List<CrypticCluePart>, predicate: (CrypticCluePart) -> Boolean
                -> (crypticCluePartList.stream()
                    .filter(predicate)
                    .count()) == 1L
            }),
            /**
             * No children may match this predicate.
             */
            NONE({
                crypticCluePartList: List<CrypticCluePart>, predicate: (CrypticCluePart) -> Boolean
                -> crypticCluePartList.stream().noneMatch(predicate)
            }),
            ;
        }
    }
}