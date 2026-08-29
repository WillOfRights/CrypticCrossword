import * as z from 'zod';

const CrypticClueExplanationPart = z.object({
  type: z.string(),
  text: z.string(),
})

const CrypticClueExplanationStep = z.object({
  text: z.string(),
  baseExplanationParts: z.array(CrypticClueExplanationPart),
  yieldedExplanationParts: z.array(CrypticClueExplanationPart),
  isResetStep: z.boolean(),
})

export const CrypticClueExplanation = z.object({
  clueText: z.string(),
  answer: z.string(),
  explanationSteps: z.array(CrypticClueExplanationStep),
})

export type CrypticClueExplanationType = z.infer<typeof CrypticClueExplanation>

