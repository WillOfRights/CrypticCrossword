package net.deanasdogs.crypticCrossword.modules.puzzle.domain.clue.crypticCluePart

import kotlinx.serialization.Serializable

@Serializable
sealed class CrypticIndicator<T: CrypticIndicable<T>>: CrypticCluePart()

interface CrypticIndicable<T: CrypticIndicable<T>>
