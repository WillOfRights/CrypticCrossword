import * as z from 'zod';

import { ClueDirection } from './ClueDirection';

/**
 * A guess sent to the server to be checked against a clue's answer, matching the backend's
 * `ClueGuessDTO`. The server owns correctness - this is a request to check, not a claim.
 */
export const ClueGuess = z.object({
    direction: ClueDirection,
    clueNumber: z.number().int(),
    guess: z.string(),
});

export type ClueGuessType = z.infer<typeof ClueGuess>;