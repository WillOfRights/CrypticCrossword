package net.deanasdogs.crypticCrossword.modules.puzzle.model.clue.crypticCluePart

import kotlinx.serialization.Serializable

@Serializable
sealed class CrypticIndicator<T: CrypticIndicable<T>>: CrypticCluePart()

interface CrypticIndicable<T: CrypticIndicable<T>>
