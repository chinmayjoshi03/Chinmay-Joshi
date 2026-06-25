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
