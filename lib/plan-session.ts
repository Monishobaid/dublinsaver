import { optimise, validate } from "./planner.ts";

export const sessionKey = "dublinsaver.plan.v1";

// Store constraints, never calculated prices. Recompute and validate after refresh.
export function restoreSession(raw: string | null) {
  if (!raw) return null;
  try {
    const saved = JSON.parse(raw);
    if (saved.version !== 1) return null;
    const applied = validate(saved.applied);
    let draft = applied;
    try {
      draft = validate(saved.draft);
    } catch {
      /* Keep the last valid plan. */
    }
    const result = optimise(applied);
    const selected = Math.max(
      0,
      result.plans.findIndex((p) => p.id === saved.selectedId),
    );
    const basket = result.plans[selected]?.basket ?? [];
    const checked = Array.isArray(saved.checked)
      ? ([
          ...new Set(
            saved.checked.filter(
              (id: unknown): id is string =>
                typeof id === "string" && basket.some((p) => p.id === id),
            ),
          ),
        ] as string[])
      : [];
    return {
      draft,
      result,
      selected,
      checked,
      hasPlan: saved.hasPlan === true,
      dirty: JSON.stringify(draft) !== JSON.stringify(applied),
    };
  } catch {
    return null;
  }
}
