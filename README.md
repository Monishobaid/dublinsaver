# DublinSaver

Make your remaining money last longer. A working Dublin dinner-and-transport planning prototype using Azure GPT-4.1 for intent extraction and explanations, with deterministic cost calculations.

## Run locally

Requires Node 22.13+ and npm.

```sh
npm ci
cp .env.example .env
# Set your Azure credentials in .env. Never commit this file.
cp .env .dev.vars
npm run dev
```

Local credentials stay in ignored `.env` and `.dev.vars`. Hosted credentials are secret environment bindings; no key is sent to the browser. API calls use the exact Azure GPT-4.1 deployment and API version configured by the owner.

## How it works

1. Describe your remaining budget and needs.
2. GPT-4.1 extracts editable constraints. Review them before building.
3. The engine enumerates two sample shops and two dinner rotations. It purchases whole packs, reserves two single fares per college day, and optionally sets aside a €5 meal allowance.
4. Candidates must cover every dinner and stay within budget including the protected buffer. Feasible candidates are ranked by expenditure + walking-time penalty (8 cents/minute) + limited-variety penalty (60 cents).
5. View alternatives, tick off groceries, see dinners, download the plan, or ask GPT-4.1 to explain computed results.

The engine is a small enumerated candidate search, not a global optimiser across all Dublin shops. All recipes use vegan ingredients; users with no dietary preference can use these meals too.

## Demo assumptions and boundaries

- All prices, shops and shop walks are illustrative fixtures, not scraped or verified live data. No named retailer availability is claimed.
- The €1.50 single fare is an editable example, not a claim about current fare eligibility. Fare caps, transfers and real route planning are not implemented.
- Covers dinners only (up to 14), not all daily meals, nutritional completeness, rent or other expenses. Check labels for allergens.
- A discounted meal is an allowance, not a live offer or booking. There is no marketplace integration.
- The planner works without the LLM; AI failure is displayed explicitly and the user can edit the fields.
- The deployed Site starts owner-private. Broader public deployment would need durable rate limits and spend controls for the paid AI endpoint.

## Checks

```sh
node --experimental-strip-types --test tests/planner.test.ts
npx tsc --noEmit
npm run build
```

Uses React, TypeScript, Vinext and Cloudflare Workers. `app/api/plan/route.ts` is the server-only Azure integration; `lib/planner.ts` owns validation and arithmetic.

Reference: [OpenAI structured outputs](https://developers.openai.com/api/docs/guides/structured-outputs). Returned JSON is independently validated before use.
