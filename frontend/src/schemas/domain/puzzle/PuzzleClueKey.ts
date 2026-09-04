import * as z from 'zod';

import { ClueDirection } from './ClueDirection';

/**
 * A uniquely identifying key to a clue in a puzzle, matching the backend's `PuzzleClueKeyDTO`.
 */
export const PuzzleClueKey = z.object({
    clueDirection: ClueDirection,
    clueNumber: z.number().int(),
});

export type PuzzleClueKeyType = z.infer<typeof PuzzleClueKey>;
