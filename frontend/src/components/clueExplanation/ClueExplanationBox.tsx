import * as React from 'react';
import { CrypticClueExplanationType } from '../../schemas/domain/puzzle/CrypticClueExplanation'

interface CrypticClueExplanationBoxProps {
  crypticClueExplanation: CrypticClueExplanationType,
}

/**
 * Component which is used to display an explanation for a cryptic clue, walking the
 * user through the steps of how it is constructed.
 */
function ClueExplanationBox({ crypticClueExplanation }: CrypticClueExplanationBoxProps) {
  return crypticClueExplanation.explanationSteps[0].text;
}

export {
  ClueExplanationBox,
}
