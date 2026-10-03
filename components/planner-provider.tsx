"use client";
import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import {
  defaults,
  diets,
  money,
  optimise,
  type Constraints,
} from "@/lib/planner";
import { restoreSession, sessionKey } from "@/lib/plan-session";
type Result = ReturnType<typeof optimise>;
const demo =
  "I've got €45 until Friday. I live near DCU, need college travel three days and six dinners. I'm vegetarian.";
function usePlannerState() {
  const [c, setC] = useState<Constraints>(defaults),
    [message, setMessage] = useState(demo),
    [result, setResult] = useState<Result>(() => optimise(defaults)),
    [selected, setSelected] = useState(0),
    [busy, setBusy] = useState(""),
    [notice, setNotice] = useState(""),
    [error, setError] = useState(""),
    [checked, setChecked] = useState<string[]>([]),
    [explanation, setExplanation] = useState(""),
    [dirty, setDirty] = useState(false),
    [category, setCategory] = useState("All");
  const plan = result.plans[selected] || result.plans[0];
  const [hasPlan, setHasPlan] = useState(false),
    [ready, setReady] = useState(false),
    [buildVersion, setBuildVersion] = useState(0);
  useEffect(() => {
    try {
      const saved = restoreSession(sessionStorage.getItem(sessionKey));
      if (saved) {
        setC(saved.draft);
        setResult(saved.result);
        setSelected(saved.selected);
        setChecked(saved.checked);
        setHasPlan(saved.hasPlan);
        setDirty(saved.dirty);
      }
    } catch {}
    setReady(true);
  }, []);
  useEffect(() => {
    if (!ready) return;
    try {
      sessionStorage.setItem(
        sessionKey,
        JSON.stringify({
          version: 1,
          draft: c,
          applied: result.constraints,
          hasPlan,
          selectedId: plan?.id,
          checked,
        }),
      );
    } catch {}
  }, [ready, c, result, hasPlan, plan?.id, checked]);
  const update = (key: keyof Constraints, value: unknown) => {
    setC((s) => ({ ...s, [key]: value }));
    setDirty(true);
    setNotice("");
    setError("");
  };
  async function api<T>(body: unknown) {
    const r = await fetch("/api/plan", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = (await r.json()) as T & { error?: string };
    if (!r.ok) throw Error(data.error || "Please try again.");
    return data;
  }
  async function extract() {
    setBusy("extract");
    setError("");
    try {
      const data = await api<{ constraints: Constraints; notes: string }>({
        action: "extract",
        message,
        constraints: c,
      });
      setC(data.constraints);
      setNotice(`Details updated by GPT-4.1. ${data.notes}`);
      setDirty(true);
      requestAnimationFrame(() => document.getElementById("budget")?.focus());
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy("");
    }
  }
  async function build() {
    setBusy("plan");
    setError("");
    try {
      const data = await api<Result>({ action: "plan", constraints: c });
      setResult(data);
      setSelected(0);
      setExplanation("");
      setChecked([]);
      setDirty(false);
      setHasPlan(true);
      setNotice(
        data.plans.length
          ? "Your plan is ready. Explore your meals or shopping list below."
          : "No plan fits yet. Review the result below and adjust your details.",
      );
      setBuildVersion((v) => v + 1);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy("");
    }
  }
  async function explain() {
    setBusy("explain");
    setError("");
    try {
      const data = await api<{ explanation: string }>({
        action: "explain",
        constraints: result.constraints,
        planId: plan?.id,
      });
      setExplanation(data.explanation);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy("");
    }
  }
  function download() {
    if (!plan) return;
    const text = `DublinSaver — sample dinner plan\n${result.constraints.location} · until ${result.constraints.endDate}\n${diets[result.constraints.diet]} · Exclusions: ${result.constraints.exclusions.join(", ") || "none"}\nBudget: ${money(result.constraints.budget * 100)}\nGroceries: ${money(plan.groceries)}\nTransport: ${money(plan.transport)}\nOptional meal: ${money(plan.meal)}\nRemaining: ${money(plan.remaining)} including ${money(plan.reserve)} buffer\n\nShopping list\n${plan.basket.map((p) => `${p.quantity} × ${p.name} (${p.pack}) — ${money(p.total)}`).join("\n")}\n\nDinners\n${plan.dinners.map((p) => `Day ${p.day}: ${p.name} — ${p.nutrition.kcal} kcal, ${p.nutrition.protein} g protein (estimated)`).join("\n")}\n\n${result.notice}\nNutrition estimated from CoFID 2021 ingredient data, not product labels. Ingredient exclusions do not guarantee allergy safety.`;
    const url = URL.createObjectURL(new Blob([text], { type: "text/plain" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = "dublinsaver-plan.txt";
    a.click();
    URL.revokeObjectURL(url);
  }
  return {
    c,
    message,
    result,
    selected,
    busy,
    notice,
    error,
    checked,
    explanation,
    dirty,
    category,
    plan,
    hasPlan,
    ready,
    buildVersion,
    update,
    extract,
    build,
    explain,
    download,
    setMessage,
    setSelected,
    setChecked,
    setExplanation,
    setCategory,
  };
}

const PlannerContext = createContext<ReturnType<typeof usePlannerState> | null>(
  null,
);
export function PlannerProvider({ children }: { children: ReactNode }) {
  const state = usePlannerState();
  return (
    <PlannerContext.Provider value={state}>{children}</PlannerContext.Provider>
  );
}
export function usePlanner() {
  const state = useContext(PlannerContext);
  if (!state) throw Error("PlannerProvider is required");
  return state;
}
