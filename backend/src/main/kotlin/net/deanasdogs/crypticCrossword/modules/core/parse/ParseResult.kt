package net.deanasdogs.crypticCrossword.modules.core.parse

/**
 * Class representing the result of a parse operation (either a success or failure). Reusable across modules in parsers.
 */
sealed class ParseResult<out T, out E> {
    data class Success<T>(
        val value: T,
    ) : ParseResult<T, Nothing>()

    data class Failure<E>(
        val errors: List<E>,
    ) : ParseResult<Nothing, E>()
}
