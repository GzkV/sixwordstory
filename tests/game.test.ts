import test from "node:test";
import assert from "node:assert/strict";
import { evaluateGuess, isNearMiss, validatePuzzle } from "../lib/game";
import { puzzles } from "../lib/puzzles";

test("marks exact positions green and misplaced answer words yellow", () => {
  assert.deepEqual(evaluateGuess(["KEY", "USE", "ON", "THE", "OAK", "DOOR"], ["USE", "KEY", "ON", "THE", "OAK", "DOOR"]), ["yellow", "yellow", "green", "green", "green", "green"]);
});

test("duplicate letters only earn feedback as many times as present in answer", () => {
  assert.deepEqual(evaluateGuess(["KEY", "KEY", "KEY", "THE", "THE", "THE"], ["USE", "KEY", "ON", "THE", "OAK", "DOOR"]), ["gray", "green", "gray", "green", "gray", "gray"]);
});

test("near miss threshold counts green and yellow tiles", () => {
  assert.equal(isNearMiss(["green", "yellow", "gray", "gray", "gray", "gray"]), true);
  assert.equal(isNearMiss(["green", "gray", "gray", "gray", "gray", "gray"]), false);
});

test("all thirty seeded daily puzzles pass mechanical validation", () => {
  assert.equal(puzzles.length, 30);
  for (const puzzle of puzzles) assert.deepEqual(validatePuzzle(puzzle), [], `${puzzle.id}: ${validatePuzzle(puzzle).join("; ")}`);
});

test("every daily puzzle has two decoys explicitly introduced in its opening", () => {
  const normalize = (value: string) => value.toUpperCase().replace(/[^A-Z]/g, "");
  for (const puzzle of puzzles) {
    const decoys = puzzle.bank.filter((entry) => entry.isDecoy);
    assert.equal(decoys.length, 2, `${puzzle.id} should have two authored decoys`);
    const scene = normalize(puzzle.scene);
    for (const decoy of decoys) {
      assert.ok(scene.includes(normalize(decoy.word)), `${puzzle.id}: decoy ${decoy.word} is not introduced in the scene`);
    }
  }
});

test("validator catches missing answer words and malformed bank sizes", () => {
  const invalid = { ...puzzles[0], answer: ["USE", "KEY", "ON", "THE", "OAK", "MOON"], bank: puzzles[0].bank.slice(1) };
  const errors = validatePuzzle(invalid);
  assert.ok(errors.some((error) => error.includes("exactly 10")));
  assert.ok(errors.some((error) => error.includes("Every answer word")));
});
