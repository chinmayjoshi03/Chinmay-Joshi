/**
 * The character slot: the only API the rest of the site uses to drive the mascot.
 * The 2D chibi Raikō implements it now; a 3D model can implement the same
 * interface later and be swapped in without touching sections or effects.
 */
export type Point = { x: number; y: number };

export type MoveName = "sleep" | "ready" | "strike" | "land" | "look" | "bow";

export interface CharacterSlot {
  /** Idle loop: sits down, closes eyes, "z z". */
  sleep(): void;
  /** Wake up into a crouch. Resolves when the pose has settled (~300ms). */
  ready(): Promise<void>;
  /** Dash to a viewport point with flash + bolt + afterimages (~240ms). */
  strike(to: Point): Promise<void>;
  /** Follow-through pose after a strike (~400ms). */
  land(): Promise<void>;
  /** The cursor is on him: turn toward it, shy and smiling. */
  look(at: Point): void;
  /** Still hovered after a moment: wave hello (optional; stays shy if missing). */
  wave?(): void;
  /** Sheathe and bow (~900ms). */
  bow(): Promise<void>;
  /** Instantly place at a viewport point (initial layout, resize). No effects. */
  place(at: Point): void;
  // ── opening-sequence extras (optional: controllers fall back to strike/ready) ──
  /** Hide/show the body (he is moving too fast to see). Reappearing gives a small burst. */
  vanish?(hidden: boolean): void;
  /** A split-second afterimage at a viewport point (feet), facing dir. */
  afterimage?(at: Point, dir: 1 | -1): void;
  /** Angry charge-up facing a point: crouch, aura, crackle, tremble. Resolves when charged. */
  rage?(toward: Point, ms?: number): Promise<void>;
  /** The huge finishing dash after rage(). */
  bigStrike?(to: Point): Promise<void>;
  // ── dragging (optional) ──
  /** Picked up by the scruff at a viewport point: he hangs below it and struggles. */
  grab?(at: Point): void;
  /** Move the grab point; he swings like a pendulum behind it. */
  drag?(at: Point): void;
  /** Let go: he falls to floor.y at floor.x and lands. Resolves when he has recovered. */
  drop?(floor: Point): Promise<void>;
  /** Skip happily to a viewport point (feet). Resolves on arrival or when another move interrupts. Optional. */
  walk?(to: Point): Promise<void>;
  /** Current pose, for controllers. */
  readonly state: MoveName;
  /** Current position (viewport px, feet centre). */
  readonly position: Point;
}

/** Timings shared by every implementation (keep 2D and 3D in sync). */
export const MOVE_MS = {
  sleepLoop: 2400,
  ready: 300,
  strike: 240,
  land: 400,
  bow: 900,
  idleBeforeSleep: 6000,
} as const;
