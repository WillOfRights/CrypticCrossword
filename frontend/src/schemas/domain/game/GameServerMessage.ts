import * as z from 'zod';

import { PuzzleClueKey } from '../puzzle/PuzzleClueKey';

/**
 * Sent in direct response to a `ClueGuess`, telling the guessing client whether their guess was
 * correct. Matches the backend's `GuessResultDTO`. `guess` is a plain string on the wire because
 * the backend's `ClueAnswerFill` is a `value class` - kotlinx serialization inlines it to its
 * underlying value rather than wrapping it in an object.
 */
const GuessResult = z.object({
    type: z.literal('guessResult'),
    puzzleClueKey: PuzzleClueKey,
    guess: z.string(),
    isCorrect: z.boolean(),
});

/**
 * Broadcast to every connected client once enough solvers have independently answered a clue
 * correctly, revealing its answer. Matches the backend's `ClueRevealedDTO`. `answer` is a plain
 * string on the wire for the same reason as `GuessResult.guess` above.
 */
const ClueRevealed = z.object({
    type: z.literal('clueRevealed'),
    puzzleClueKey: PuzzleClueKey,
    answer: z.string(),
});

/**
 * A message sent from the game server to a client over the game websocket. Either a
 * guess result or a clue reveal, matching the backend's `GameServerMessageDTO` hierarchy.
 * Discriminated on `type`, kotlinx serialization's default class discriminator field for a
 * `@Serializable sealed class`.
 */
export const GameServerMessage = z.discriminatedUnion('type', [GuessResult, ClueRevealed]);

export type GameServerMessageType = z.infer<typeof GameServerMessage>;
export type GuessResultType = z.infer<typeof GuessResult>;
export type ClueRevealedType = z.infer<typeof ClueRevealed>;
