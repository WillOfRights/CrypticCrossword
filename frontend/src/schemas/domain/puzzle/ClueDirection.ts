import * as z from 'zod';

/**
 * Wire-format direction of a clue, matching the backend's `ClueDirectionDTO` enum (kotlinx
 * serialization encodes an enum as its member name). Distinct from the UI's `ClueDirection`
 * enum in `CrosswordGridTypes.ts`, which is a numeric enum unrelated to the wire protocol.
 */
export const ClueDirection = z.enum(['ACROSS', 'DOWN']);

export type ClueDirectionType = z.infer<typeof ClueDirection>;