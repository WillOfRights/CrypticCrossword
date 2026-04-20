package net.deanasdogs.crypticCrossword.modules.puzzle.model.clue.crypticCluePart

import kotlinx.serialization.Serializable
import net.deanasdogs.crypticCrossword.modules.puzzle.model.clue.crypticCluePart.common.CrypticClueStructurable
import net.deanasdogs.crypticCrossword.modules.puzzle.model.clue.crypticCluePart.common.YieldableCluePart

/**
 * Abstract class representing a top level cryptic clue part. Therefore, it must implement CrypticClueStructurable,
 * since it should be possible to determine the structure of the whole clue from this part.
 */
@Serializable
sealed class BaseCrypticCluePart : CrypticCluePart(), CrypticClueStructurable, YieldableCluePart {
}