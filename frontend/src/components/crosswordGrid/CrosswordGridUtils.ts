import { ClueDirection, } from "../crosswordGrid/CrosswordGridTypes";

export function invertDirection(clueDirection: ClueDirection) {
  return clueDirection === ClueDirection.ACROSS
    ? ClueDirection.DOWN
    : ClueDirection.ACROSS;
}

