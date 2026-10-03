"use client";
import { useEffect, useRef } from "react";
import Link from "next/link";
import { usePlanner } from "./planner-provider";
import {
  Wallet,
  Leaf,
  MapPin,
  Sparkles,
  ArrowUpRight,
  ShoppingBasket,
  Bus,
  Utensils,
  CircleCheck,
  Clock,
  Download,
  Info,
  LayoutGrid,
  BookOpen,
  Flame,
  ChevronRight,
  Check,
  Plus,
} from "lucide-react";
import { diets, exclusionOptions, money, type Nutrition } from "@/lib/planner";
import { articles } from "@/lib/articles";
type Tab = "plan" | "meals" | "basket" | "tips";
const routes = { plan: "/", meals: "/meals", basket: "/basket", tips: "/tips" };
const navigation = [
  { id: "plan" as Tab, label: "My plan", icon: LayoutGrid },
  { id: "meals" as Tab, label: "Meals", icon: Utensils },
  { id: "basket" as Tab, label: "Basket", icon: ShoppingBasket },
  { id: "tips" as Tab, label: "Save more", icon: BookOpen },
];
const foodIcons: Record<string, string> = {
  "lentil-pasta": "🍝",
  curry: "🍛",
  "bean-rice": "🥣",
  "egg-rice": "🍳",
  "cheese-pasta": "🧀",
  "tuna-rice": "🐟",
  "chicken-rice": "🍗",
};
function Nutrients({
  n,
  average = false,
}: {
  n: Nutrition;
  average?: boolean;
}) {
  return (
    <div className={average ? "nutrients average" : "nutrients"}>
      {[
        { key: "kcal", label: "kcal", unit: "" },
        { key: "protein", label: "Protein", unit: "g" },
        { key: "carbs", label: "Carbs", unit: "g" },
        { key: "fat", label: "Fat", unit: "g" },
        { key: "fibre", label: "Fibre", unit: "g" },
      ].map((x) => (
        <div key={x.key}>
          <strong>
            {n[x.key as keyof Nutrition] === null
              ? "—"
              : `${Math.round(n[x.key as keyof Nutrition]!)}${x.unit}`}
          </strong>
          <span>{x.label}</span>
        </div>
      ))}
    </div>
  );
}
export default function PlannerScreen({ tab }: { tab: Tab }) {
  const {
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
  } = usePlanner();
  const previousBuild = useRef(buildVersion);
  useEffect(() => {
    if (buildVersion !== previousBuild.current && tab === "plan") {
      document.getElementById("plan-result")?.focus({ preventScroll: true });
      document.getElementById("plan-result")?.scrollIntoView({
        behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
          ? "instant"
          : "smooth",
        block: "start",
      });
    }
    previousBuild.current = buildVersion;
  }, [buildVersion, tab]);
  const empty = (
    <section className="card empty">
      <Wallet size={36} />
      <h2>
        {!result.eligibleCount
          ? "No meals match those preferences."
          : !result.evaluated
            ? "No shop fits your walking limit."
            : "This budget needs a rethink."}
      </h2>
      <p>
        {result.evaluated
          ? `The cheapest sample plan needs ${money(result.shortfall)} more to include your protected buffer. Adjust your budget, optional meal allowance or other details.`
          : "Review your food preferences and allow at least a 5-minute illustrative shop walk."}
      </p>
      <Link className="primary" href="/#planner">
        Adjust my details
      </Link>
    </section>
  );
  const startHere = (
    <section className="card empty">
      <Wallet size={36} />
      <h2>Start with your budget</h2>
      <p>
        Add your budget and preferences to create your meals and shopping list.
      </p>
      <Link className="primary" href="/#planner">
        Create my plan
        <ChevronRight size={17} />
      </Link>
    </section>
  );
  return (
    <div className="app-shell">
      <aside className="desktop-sidebar">
        <Link className="brand" href="/">
          <span className="brand-mark">
            <Wallet size={22} />
          </span>
          DublinSaver
        </Link>
        <p className="sidebar-caption">A little more left.</p>
        <nav aria-label="Main navigation">
          {navigation.map((n) => (
            <Link
              href={routes[n.id]}
              key={n.id}
              className={tab === n.id ? "active" : ""}
              aria-current={tab === n.id ? "page" : undefined}
            >
              <n.icon size={21} />
              {n.label}
            </Link>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <MapPin size={17} />
          <span>
            Made for Dublin
            <br />
            <small>Working prototype</small>
          </span>
        </div>
      </aside>
      <div className="app-body">
        <header className="app-header">
          <Link className="brand" href="/">
            <span className="brand-mark">
              <Wallet size={20} />
            </span>
            DublinSaver
          </Link>
          <span className="header-location">
            <MapPin size={15} />
            Dublin, Ireland
          </span>
          <span className="avatar" aria-label="Demo profile">
            A
          </span>
        </header>
        <main id="main" className="content">
          <div className="page-heading">
            <div>
              <p className="eyebrow">
                {tab === "plan"
                  ? "YOUR WEEK, WITHIN REACH"
                  : tab === "meals"
                    ? "GOOD FOOD. LESS GUESSWORK."
                    : tab === "basket"
                      ? "JUST WHAT YOU NEED"
                      : "SMALL CHANGES, MORE LEFT"}
              </p>
              <h1>
                {tab === "plan"
                  ? "Let’s make it last."
                  : tab === "meals"
                    ? "Dinner is sorted."
                    : tab === "basket"
                      ? "Your shopping list."
                      : "A little wiser with money."}
              </h1>
              <p className="page-subtitle">
                {tab === "plan"
                  ? "Add your budget and needs. We’ll do the maths."
                  : tab === "meals"
                    ? "Meals that fit your preferences and your budget."
                    : tab === "basket"
                      ? "Tick off your whole-pack grocery list as you shop."
                      : "Useful reads for everyday life in Dublin."}
              </p>
            </div>
            {tab !== "plan" && tab !== "tips" && (
              <Link className="text-link adjust-link" href="/#planner">
                Change plan
                <ChevronRight size={16} />
              </Link>
            )}
          </div>
          <div aria-live="polite">
            {error && tab === "plan" && (
              <p className="message error" role="alert">
                {error}
              </p>
            )}
            {notice && tab === "plan" && <p className="message">{notice}</p>}
            {dirty && hasPlan && tab !== "plan" && tab !== "tips" && (
              <Link className="message pending" href="/#planner">
                Your details changed. Build an updated plan.
                <ChevronRight size={17} />
              </Link>
            )}
          </div>
          {tab === "plan" && (
            <>
              <section
                id="planner"
                className="card editor home-planner"
                aria-label="Plan your budget"
              >
                <div className="planner-intro">
                  <span className="step-badge">1</span>
                  <div>
                    <h2>Start with what you have</h2>
                    <p>
                      {hasPlan
                        ? "Adjust your details and update below."
                        : "Change the example details to fit your week."}
                    </p>
                  </div>
                </div>
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    void build();
                  }}
                >
                  <fieldset
                    className="planner-fields"
                    disabled={!!busy || !ready}
                  >
                    <div className="form-grid">
                      <label className="field">
                        Budget (€)
                        <input
                          inputMode="decimal"
                          id="budget"
                          type="number"
                          min="0"
                          max="1000"
                          step=".01"
                          value={c.budget}
                          onChange={(e) =>
                            update("budget", Number(e.target.value))
                          }
                        />
                      </label>
                      <label className="field">
                        Lasts until
                        <input
                          value={c.endDate}
                          maxLength={40}
                          onChange={(e) => update("endDate", e.target.value)}
                        />
                      </label>
                      <label className="field">
                        Dinners
                        <input
                          inputMode="numeric"
                          type="number"
                          min="1"
                          max="14"
                          value={c.dinners}
                          onChange={(e) =>
                            update("dinners", Number(e.target.value))
                          }
                        />
                      </label>
                      <label className="field">
                        College days
                        <input
                          inputMode="numeric"
                          type="number"
                          min="0"
                          max="14"
                          value={c.collegeDays}
                          onChange={(e) =>
                            update("collegeDays", Number(e.target.value))
                          }
                        />
                      </label>
                      <label className="field">
                        Food preference
                        <select
                          value={c.diet}
                          onChange={(e) => update("diet", e.target.value)}
                        >
                          {Object.entries(diets).map(([value, label]) => (
                            <option key={value} value={value}>
                              {label}
                            </option>
                          ))}
                        </select>
                      </label>
                      <label className="field">
                        Your area
                        <input
                          value={c.location}
                          maxLength={80}
                          onChange={(e) => update("location", e.target.value)}
                        />
                      </label>
                    </div>
                    <details className="extra-settings">
                      <summary>
                        Ingredient exclusions & travel settings
                        <span>
                          {c.exclusions.length
                            ? `${c.exclusions.length} excluded`
                            : "Optional"}
                          <ChevronRight size={15} />
                        </span>
                      </summary>
                      <fieldset>
                        <legend>Leave out these ingredients</legend>
                        <div className="chips">
                          {exclusionOptions.map((x) => (
                            <button
                              key={x}
                              type="button"
                              aria-pressed={c.exclusions.includes(x)}
                              className={
                                c.exclusions.includes(x)
                                  ? "chip active"
                                  : "chip"
                              }
                              onClick={() =>
                                update(
                                  "exclusions",
                                  c.exclusions.includes(x)
                                    ? c.exclusions.filter((v) => v !== x)
                                    : [...c.exclusions, x],
                                )
                              }
                            >
                              {c.exclusions.includes(x) ? (
                                <Check size={15} />
                              ) : (
                                <Plus size={15} />
                              )}
                              {x === "milk"
                                ? "Dairy"
                                : x[0].toUpperCase() + x.slice(1)}
                            </button>
                          ))}
                        </div>
                        <p className="caption">
                          Filters listed ingredients. Check labels and
                          cross-contact warnings for allergies; spice blends are
                          excluded when these filters are used.
                        </p>
                      </fieldset>
                      <details className="travel-settings">
                        <summary>
                          Travel & money to keep back
                          <ChevronRight size={17} />
                        </summary>
                        <div className="form-grid">
                          <label className="field">
                            Single fare (€)
                            <input
                              inputMode="decimal"
                              type="number"
                              min="0"
                              max="20"
                              step=".1"
                              value={c.fare}
                              onChange={(e) =>
                                update("fare", Number(e.target.value))
                              }
                            />
                          </label>
                          <label className="field">
                            Protected buffer (€)
                            <input
                              inputMode="decimal"
                              type="number"
                              min="0"
                              max="1000"
                              step=".5"
                              value={c.buffer}
                              onChange={(e) =>
                                update("buffer", Number(e.target.value))
                              }
                            />
                          </label>
                          <label className="field">
                            Max shop walk (min)
                            <input
                              inputMode="numeric"
                              type="number"
                              min="0"
                              max="60"
                              value={c.maxWalk}
                              onChange={(e) =>
                                update("maxWalk", Number(e.target.value))
                              }
                            />
                          </label>
                        </div>
                        <p className="caption">
                          Two single journeys per college day. Fare and shop
                          walks are examples; enter your verified fare.
                        </p>
                        <label className="check-field">
                          <input
                            type="checkbox"
                            checked={c.optionalMeal}
                            onChange={(e) =>
                              update("optionalMeal", e.target.checked)
                            }
                          />
                          Allow €5 for an extra meal
                        </label>
                      </details>
                    </details>
                    <button type="submit" className="primary build-button">
                      <Sparkles size={18} />
                      {busy === "plan"
                        ? "Finding your plan…"
                        : hasPlan
                          ? "Update my plan"
                          : "Build my plan"}
                    </button>
                    <p className="planner-hint">
                      Dinners + return college journeys. Sample prices.
                    </p>
                  </fieldset>
                </form>
                <details className="ai-shortcut">
                  <summary>
                    <Sparkles size={16} />
                    Prefer to type it? Let AI fill the details
                    <ChevronRight size={16} />
                  </summary>
                  <label className="field full">
                    Describe your week
                    <textarea
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      maxLength={1500}
                    />
                  </label>
                  <button
                    type="button"
                    className="secondary ai-button"
                    disabled={!!busy}
                    onClick={extract}
                  >
                    <Sparkles size={17} />
                    {busy === "extract"
                      ? "Understanding…"
                      : "Fill details with AI"}
                  </button>
                  <p className="caption">
                    Your message is sent to Azure GPT-4.1. Review the details
                    before building.
                  </p>
                </details>
                <p className="caption save-caption">
                  Your details stay in this browser tab when you refresh.
                </p>
              </section>
              {hasPlan && (
                <section
                  id="plan-result"
                  className="plan-result"
                  tabIndex={-1}
                  aria-label="Your budget plan"
                >
                  <div className="section-heading">
                    <h2>
                      <span className="step-badge">2</span>Your plan
                    </h2>
                    {dirty && <span className="tag">Update needed</span>}
                  </div>
                  {dirty && (
                    <p className="message">
                      Showing your last plan. Use “Update my plan” above to
                      apply your changes.
                    </p>
                  )}
                  {plan ? (
                    <>
                      <section className="balance-card">
                        <div className="balance-top">
                          <span>
                            YOUR {money(result.constraints.budget * 100)} BUDGET
                          </span>
                          <span className="sample-label">Sample plan</span>
                        </div>
                        <span className="balance-label">
                          Left after your plan
                        </span>
                        <strong className="balance-amount">
                          {money(plan.remaining)}
                        </strong>
                        <p>Including {money(plan.reserve)} safely set aside</p>
                        <div className="allocation">
                          <span
                            style={{ flex: plan.groceries }}
                            className="food-segment"
                          />
                          <span
                            style={{ flex: plan.transport }}
                            className="travel-segment"
                          />
                          {plan.meal > 0 && (
                            <span
                              style={{ flex: plan.meal }}
                              className="meal-segment"
                            />
                          )}
                          <span
                            style={{ flex: Math.max(plan.remaining, 0) }}
                            className="remaining-segment"
                          />
                        </div>
                        <div className="balance-bottom">
                          <span>
                            <CircleCheck size={16} />
                            {result.constraints.dinners} dinners planned
                          </span>
                          <span>
                            <Bus size={16} />
                            {result.constraints.collegeDays} college days
                          </span>
                        </div>
                      </section>
                      <div className="budget-grid">
                        <Link className="card budget-tile" href="/basket">
                          <span className="tile-icon">
                            <ShoppingBasket size={20} />
                          </span>
                          <span>Groceries</span>
                          <strong>{money(plan.groceries)}</strong>
                          <small>
                            View basket
                            <ChevronRight size={13} />
                          </small>
                        </Link>
                        <div className="card budget-tile">
                          <span className="tile-icon blue">
                            <Bus size={20} />
                          </span>
                          <span>Travel reserved</span>
                          <strong>{money(plan.transport)}</strong>
                          <small>
                            {result.constraints.collegeDays * 2} journeys
                          </small>
                        </div>
                        <div className="card budget-tile">
                          <span className="tile-icon peach">
                            <Utensils size={20} />
                          </span>
                          <span>Extra meal</span>
                          <strong>{money(plan.meal)}</strong>
                          <small>
                            {plan.meal ? "Allowance only" : "Not included"}
                          </small>
                        </div>
                      </div>
                      <div className="section-heading">
                        <h2>Find your balance</h2>
                        <span className="caption">
                          {result.evaluated} options checked
                        </span>
                      </div>
                      <div className="plan-options">
                        {result.plans.map((p, i) => (
                          <button
                            key={p.id}
                            className={
                              selected === i
                                ? "plan-option selected"
                                : "plan-option"
                            }
                            aria-pressed={selected === i}
                            onClick={() => {
                              setSelected(i);
                              setChecked([]);
                              setExplanation("");
                            }}
                          >
                            <div className="option-line">
                              <span>
                                {i === 0
                                  ? "Recommended"
                                  : p.shop === "Nearby shop"
                                    ? "Closer to home"
                                    : "Another balance"}
                              </span>
                              {selected === i && <CircleCheck size={17} />}
                            </div>
                            <strong>
                              {money(p.total)}
                              <small>total spend</small>
                            </strong>
                            <span className="option-description">
                              {p.walk}-min sample walk · {p.rotationCount}{" "}
                              {p.rotationCount === 1 ? "dish" : "dishes"}
                            </span>
                            <span className="option-menu">
                              {p.rotationCount === 1
                                ? "Single-recipe plan"
                                : p.style === "simple"
                                  ? "Plant-based staples"
                                  : `${diets[result.constraints.diet]} variety`}
                            </span>
                          </button>
                        ))}
                      </div>
                      <Link className="card meal-preview" href="/meals">
                        <span className="food-emoji">
                          {foodIcons[plan.dinners[0].id]}
                        </span>
                        <span>
                          <small>FIRST ON YOUR MENU</small>
                          <strong>{plan.dinners[0].name}</strong>
                          <span>
                            {plan.dinners[0].minutes} min · ~
                            {plan.dinners[0].nutrition.kcal} kcal
                          </span>
                        </span>
                        <ChevronRight size={20} />
                      </Link>
                      <section className="insight">
                        <Sparkles size={20} />
                        <div>
                          <h3>A plan with breathing room</h3>
                          <p>
                            {explanation ||
                              `Your transport is reserved first. ${diets[result.constraints.diet]} meals and whole-pack groceries fit inside your budget, with ${money(plan.remaining)} left for your buffer and other needs.`}
                          </p>
                          <button
                            className="text-button"
                            disabled={!!busy}
                            onClick={explain}
                          >
                            {busy === "explain"
                              ? "Checking your plan…"
                              : "Explain my plan"}
                            <ArrowUpRight size={15} />
                          </button>
                        </div>
                      </section>
                      <p className="caption data-note">
                        <Info size={15} />
                        {result.notice}
                      </p>
                    </>
                  ) : (
                    empty
                  )}
                </section>
              )}
            </>
          )}
          {tab === "meals" &&
            (!ready ? (
              <p role="status">Loading your plan…</p>
            ) : !hasPlan ? (
              startHere
            ) : plan ? (
              <>
                <div className="context-chips">
                  <span>
                    <Leaf size={14} />
                    {diets[result.constraints.diet]}
                  </span>
                  <span>{result.constraints.dinners} dinners</span>
                  {result.constraints.exclusions.map((x) => (
                    <span key={x}>No {x === "milk" ? "dairy" : x}</span>
                  ))}
                </div>
                {result.eligibleCount === 1 && (
                  <p className="message">
                    Your preferences leave one recipe in this sample collection,
                    so it repeats across your dinners.
                  </p>
                )}
                <section className="nutrition-summary">
                  <div className="section-heading">
                    <h2>
                      <Flame size={18} />
                      What’s on your plate
                    </h2>
                    <span className="tag">Estimates</span>
                  </div>
                  <p>Average per planned dinner</p>
                  <Nutrients n={plan.nutrition} average />
                  <p className="caption">
                    Dinner only, not a daily nutrition target. A dash means
                    source data is incomplete.
                  </p>
                </section>
                <div className="section-heading">
                  <h2>Your dinner rotation</h2>
                  <span className="caption">Tap for ingredients</span>
                </div>
                <div className="meal-list">
                  {plan.dinners.map((d) => (
                    <details className="card meal-card" key={d.day}>
                      <summary>
                        <span className="food-emoji">{foodIcons[d.id]}</span>
                        <span className="meal-title">
                          <small>DINNER {d.day}</small>
                          <strong>{d.name}</strong>
                          <span>
                            <Clock size={13} />
                            {d.minutes} min ·{" "}
                            {d.kind === "vegan"
                              ? "Plant-based"
                              : d.kind === "vegetarian"
                                ? "Vegetarian"
                                : d.kind === "fish"
                                  ? "Contains fish"
                                  : "Contains chicken"}
                          </span>
                        </span>
                        <Plus className="expand-icon" size={18} />
                      </summary>
                      <Nutrients n={d.nutrition} />
                      <div className="recipe-body">
                        <h3>For one dinner</h3>
                        <ul>
                          {d.ingredientsList.map((i) => (
                            <li key={i.name}>
                              <span>{i.name}</span>
                              <strong>
                                {i.amount} {i.unit}
                              </strong>
                            </li>
                          ))}
                        </ul>
                        <h3>Let’s cook</h3>
                        <p>{d.method}</p>
                        <a
                          className="text-link"
                          href="https://www.safefood.net/food-safety"
                          target="_blank"
                          rel="noreferrer"
                        >
                          Food preparation and storage guidance
                          <ArrowUpRight size={14} />
                        </a>
                      </div>
                    </details>
                  ))}
                </div>
                <details className="source-note">
                  <summary>
                    <Info size={16} />
                    About these nutrition estimates
                    <ChevronRight size={16} />
                  </summary>
                  <p>
                    Calculated from ingredient amounts using Public Health
                    England’s CoFID 2021 food-composition data. Values vary with
                    brands, portions and cooking. No daily adequacy or
                    dietary-health assessment is made. Missing fibre stays
                    unavailable. Exclusions check listed ingredients, not
                    cross-contact.
                  </p>
                  <a
                    href="https://www.gov.uk/government/publications/composition-of-foods-integrated-dataset-cofid"
                    target="_blank"
                    rel="noreferrer"
                  >
                    View CoFID data and methodology
                  </a>
                  <p>
                    Contains public sector information under the Open Government
                    Licence v3.0.
                  </p>
                </details>
              </>
            ) : (
              empty
            ))}
          {tab === "basket" &&
            (!ready ? (
              <p role="status">Loading your plan…</p>
            ) : !hasPlan ? (
              startHere
            ) : plan ? (
              <>
                <section className="basket-overview">
                  <span className="tile-icon">
                    <ShoppingBasket size={24} />
                  </span>
                  <div>
                    <strong>{money(plan.groceries)}</strong>
                    <p>{plan.shop} · sample prices</p>
                  </div>
                  <button
                    className="icon-button"
                    aria-label="Download shopping list"
                    onClick={download}
                  >
                    <Download size={20} />
                  </button>
                </section>
                <div className="progress-heading">
                  <span>
                    {checked.length} of {plan.basket.length} items checked
                  </span>
                  <button
                    className="text-button"
                    disabled={!checked.length}
                    onClick={() => setChecked([])}
                  >
                    Reset
                  </button>
                </div>
                <progress
                  aria-label="Shopping progress"
                  value={checked.length}
                  max={plan.basket.length}
                />
                <section className="card shopping-list">
                  {plan.basket.map((p) => (
                    <label
                      key={p.id}
                      className={
                        checked.includes(p.id)
                          ? "shopping-row done"
                          : "shopping-row"
                      }
                    >
                      <input
                        type="checkbox"
                        checked={checked.includes(p.id)}
                        onChange={() =>
                          setChecked((s) =>
                            s.includes(p.id)
                              ? s.filter((id) => id !== p.id)
                              : [...s, p.id],
                          )
                        }
                      />
                      <span>
                        <strong>{p.name}</strong>
                        <small>
                          {p.quantity} × {p.pack}
                        </small>
                      </span>
                      <b>{money(p.total)}</b>
                    </label>
                  ))}
                  <div className="basket-total">
                    <span>Whole-pack total</span>
                    <strong>{money(plan.groceries)}</strong>
                  </div>
                </section>
                {checked.length === plan.basket.length && (
                  <p className="message">
                    <CircleCheck size={17} />
                    All checked. You’re ready to cook.
                  </p>
                )}
                <div className="tip-callout">
                  <Leaf size={20} />
                  <p>
                    <strong>Check your cupboards first.</strong>
                    <br />
                    The plan buys whole packs, so you may have some ingredients
                    left over. Check use-by dates and storage instructions.
                  </p>
                </div>
                <p className="caption data-note">
                  <Info size={15} />
                  Checking items is a shopping checklist; it does not
                  recalculate the budget. Prices are illustrative.
                </p>
              </>
            ) : (
              empty
            ))}
          {tab === "tips" && (
            <>
              <section className="tips-feature">
                <span className="feature-kicker">THE DUBLIN SAVER EDIT</span>
                <h2>
                  Keep the good stuff.
                  <br />
                  Cut the everyday costs.
                </h2>
                <p>Practical guides and articles from trusted Irish sources.</p>
                <span className="feature-symbol" aria-hidden="true">
                  €
                </span>
              </section>
              <div className="filter-row" aria-label="Article categories">
                {["All", "Food", "Travel", "Money"].map((x) => (
                  <button
                    key={x}
                    className={category === x ? "chip active" : "chip"}
                    aria-pressed={category === x}
                    onClick={() => setCategory(x)}
                  >
                    {x}
                  </button>
                ))}
              </div>
              <div className="article-grid">
                {articles
                  .filter((a) => category === "All" || a.category === category)
                  .map((a) => (
                    <article
                      className={`card article ${a.category.toLowerCase()}`}
                      key={a.id}
                    >
                      <div className="article-art">
                        <span aria-hidden="true">{a.icon}</span>
                        <span className="article-category">{a.category}</span>
                      </div>
                      <div className="article-copy">
                        <p className="article-meta">
                          {a.source} · {a.type}
                        </p>
                        <h2>{a.title}</h2>
                        <p>{a.summary}</p>
                        <div className="article-foot">
                          <span>{a.date}</span>
                          <a
                            href={a.url}
                            target="_blank"
                            rel="noreferrer"
                            aria-label={`Read ${a.title} on ${a.source}`}
                          >
                            Read
                            <ArrowUpRight size={16} />
                          </a>
                        </div>
                      </div>
                    </article>
                  ))}
              </div>
              <p className="caption data-note">
                <Info size={15} />
                Curated links checked 3 October 2026. This is a reading list,
                not a live news feed. Open the source for current details.
              </p>
            </>
          )}
          <footer>
            <span>DublinSaver</span>
            <span>Less guessing. More living.</span>
          </footer>
        </main>
      </div>
      <nav className="bottom-nav" aria-label="Mobile navigation">
        {navigation.map((n) => (
          <Link
            href={routes[n.id]}
            key={n.id}
            className={tab === n.id ? "active" : ""}
            aria-current={tab === n.id ? "page" : undefined}
          >
            <span>
              <n.icon size={21} />
            </span>
            {n.label}
          </Link>
        ))}
      </nav>
    </div>
  );
}
