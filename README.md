# DublinSaver

Make your remaining money last longer. A working Dublin dinner-and-transport planning prototype using Azure GPT-4.1 for intent extraction and explanations, with deterministic cost calculations.

## Run locally

Requires Node 22 and npm.

```sh
npm ci
cp .env.example .env
# Set your Azure credentials in .env. Never commit this file.
npm run dev
```

Local credentials stay in ignored `.env`. Hosted credentials are sensitive Vercel environment variables; no key is sent to the browser. API calls use the exact Azure GPT-4.1 deployment and API version configured by the owner.

## How it works

1. Enter your budget, end day, dinners, college days and preferences directly on the home screen, then select **Build my plan**. The form stays visible above the result.
2. Optionally expand **Prefer to type it?** and let GPT-4.1 fill the same fields. Review them before building.
3. The engine enumerates two sample shops and two dinner rotations. It purchases whole packs, reserves two single fares per college day, and optionally sets aside a €5 meal allowance.
4. Candidates must cover every dinner and stay within budget including the protected buffer. Feasible candidates are ranked by expenditure + walking-time penalty (8 cents/minute) + limited-variety penalty (60 cents).
5. Use the mobile bottom tabs to compare plans, explore meals and nutrition, tick off your basket, and read curated savings articles. Download the plan or ask GPT-4.1 to explain computed results.

The engine is a small enumerated candidate search, not a global optimiser across all Dublin shops. Seven dinner recipes support vegan, vegetarian, pescatarian and unrestricted diets. Ingredient exclusions for gluten, milk, eggs and fish filter recipes before candidate plans are generated. The engine calculates calories, protein, carbohydrates, fat and fibre from ingredient quantities using a selected CoFID 2021 extract; missing values stay unavailable. These are estimates for dinners, not a complete daily diet. See [data sources and methodology](data/SOURCES.md).

## App experience

Responsive layouts include four fixed bottom tabs on phones and a sidebar on desktop. These are actual Next.js routes: `/`, `/meals`, `/basket`, and `/tips`, supporting direct links and browser history. Shared context preserves the plan across navigation; session storage preserves the draft, applied preferences, selected alternative and grocery checkmarks on refresh within the same browser tab. Saved inputs are validated and prices recomputed on restore; free-text AI messages and credentials are not stored. Direct visits to Meals or Basket before building prompt users to create a plan. The Meals tab includes ingredient quantities, cooking steps and nutrition per dinner. Save more contains linked food, travel and money guides from Safefood, TFI/Leap and CCPC, with category filters and source/date labels. Articles are curated, not a live news feed. A web manifest enables a standalone launch when supported by the browser; offline support is not implemented.

## Demo assumptions and boundaries

- All prices, shops and shop walks are illustrative fixtures, not scraped or verified live data. No named retailer availability is claimed.
- The €1.50 single fare is an editable example, not a claim about current fare eligibility. Fare caps, transfers and real route planning are not implemented.
- Covers dinners only (up to 14), not all daily meals, nutritional completeness, rent or other expenses. Check labels for allergens.
- A discounted meal is an allowance, not a live offer or booking. There is no marketplace integration.
- The planner works without the LLM; AI failure is displayed explicitly and the user can edit the fields.
- The Vercel deployment is publicly accessible. The paid AI endpoint is a prototype; durable rate limits and account-level spend controls are recommended before wider promotion.

## Checks

```sh
npm test
npm run typecheck
npm run build
```

Uses React, TypeScript and Next.js on Vercel. Legacy Sites build helpers remain in the source but are not used by the Vercel build. `app/api/plan/route.ts` is the server-only Azure integration; `lib/planner.ts` owns validation and arithmetic.

Reference: [OpenAI structured outputs](https://developers.openai.com/api/docs/guides/structured-outputs). Returned JSON is independently validated before use.

## Deploy to Vercel

Import this public GitHub repository into Vercel with the Next.js preset, or use `vercel link` and `vercel --prod`. Configure `AZURE_OPENAI_API_KEY` and `AZURE_OPENAI_ENDPOINT` as sensitive environment variables before deploying. Never prefix them with `NEXT_PUBLIC_`. No secrets belong in `vercel.json` or the Git repository.

## License

Application code: MIT — see [LICENSE](LICENSE). The CoFID nutrition extract contains public sector information licensed under the Open Government Licence v3.0; see [data attribution](data/SOURCES.md). Third-party components retain their original licenses.
