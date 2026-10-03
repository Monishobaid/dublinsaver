# Data sources

## Nutrition

`nutrients.json` is a selected extract from Public Health England, **McCance and Widdowson's Composition of Foods Integrated Dataset, 2021**, sheet `1.3 Proximates`, downloaded 3 October 2026. Food codes and names are retained with each record.

- [Source and user guide](https://www.gov.uk/government/publications/composition-of-foods-integrated-dataset-cofid)
- [Workbook](https://assets.publishing.service.gov.uk/media/60538b91e90e07527df82ae4/McCance_Widdowsons_Composition_of_Foods_Integrated_Dataset_2021..xlsx)
- Contains public sector information licensed under the [Open Government Licence v3.0](https://www.nationalarchives.gov.uk/doc/open-government-licence/version/3/). Dataset attribution is separate from the application's MIT license.

Values are per 100 g of edible food. `Tr` (trace) is approximated as zero; blank and `N` stay null. Missing fibre is displayed as unavailable, never zero. Each dinner estimate sums the nutrient values for its ingredient weights; these are estimates, not analysed recipes or branded product labels. Dry rice, pasta and lentils use dry weights; canned beans use drained weights; eggs use an assumed 50 g edible portion each; oil uses 0.92 g/ml; coconut milk uses approximately 1 g/ml. No nutrient-retention or cooking-loss adjustment. No daily targets or medical recommendations are inferred.

Recipes, pack prices and walking times are demonstration fixtures. Exclusions apply to listed ingredients only; branded ingredients and cross-contact require label checks. Spice blends must be checked for gluten, milk, eggs and fish where those exclusions are selected.

## Saving guides and news

Articles in `lib/articles.ts` were checked 3 October 2026. Publication dates are shown only when supplied by the publisher. Undated pages are marked as guides. This is a curated reading list, not a live news feed. Summaries are original and link to the publisher.
