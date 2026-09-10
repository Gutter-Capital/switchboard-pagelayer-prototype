# Design QA

## Evidence

- Source visual truth: `/var/folders/61/6ht017j94d7cf4078cn6qyzc0000gn/T/codex-clipboard-600a0121-a82a-44e1-a2e3-3abc8c4ac6bd.png`
- Implementation screenshot: Codex CUA in-app browser capture for browser `1`, tab `3`, attached to this task's tool output. The CUA API exposed the rendered capture to the review but did not expose a filesystem path.
- Implementation URL: `http://127.0.0.1:5178/accounts/acct-bob-smith-construction`
- Viewport: implementation reviewed at `1761 x 1324` CSS pixels in the in-app browser.
- Pixel dimensions and density: source is `2828 x 1654` pixels and was displayed at `2048 x 1198` for inspection; implementation capture is `1761 x 1324` browser pixels at the matching CSS viewport. The comparison was normalized around the table region and hierarchy because the user requested structural adaptation, not a pixel clone or copy match.
- State: Bob Smith Construction account, default `Overview` tab and selected `Opportunities` tab. The opportunities state includes the Commercial Property opportunity group, seven carrier rows, returned quote-option rows, and the remaining current-work groups.

## Full-View Comparison

The implementation carries over the reference's three-level scan pattern: a strong group band, a primary carrier row, and subordinate quote-option rows. It keeps Switchboard's existing monochrome tokens, compact type scale, sidebar, PageLayer header, and account context instead of copying the source's product-specific color and action treatment. The account summary and the dense market table are now separated into proper tabs, so neither view competes vertically with the other.

## Focused Comparison

The quote-outcome region was inspected at readable scale. Carrier names, statuses, response details, premium ranges, updated dates, and next actions align to stable columns. Returned options indent below the carrier, use native radio controls, expose a selected state, and preserve parent-child association. Opportunity bands visually separate lines of work without card nesting or excess controls.

## Findings

- No actionable P0, P1, or P2 differences remain for the requested table-structure adaptation.
- Typography: Geist, compact weights, line heights, and zero letter spacing remain consistent with the prototype; hierarchy is clear across tab, section, group, parent, and child rows.
- Spacing and layout: the full-width tab rule and fixed table tracks create stable horizontal rhythm; row density remains suitable for repeated broker scanning.
- Colors and tokens: neutral account and table surfaces are preserved; red is reserved for declined status and selected rows use a muted neutral background.
- Image and asset fidelity: the source contains no required product imagery. Existing Lucide icons and native controls are used; no fake visual assets were introduced.
- Copy and content: the reference language was intentionally not copied. Switchboard account, opportunity, carrier, task, and quote data remain realistic and internally consistent.
- Residual test gap: narrow/mobile table overflow was not visually compared because the supplied reference and requested workflow are desktop-first.

## Comparison History

1. Initial grouped-table pass
   - Finding: current-work rows placed non-quote information under quote-specific columns, weakening column meaning.
   - Fix: changed the shared columns to `Status`, `Details`, `Premium`, `Owner / updated`, and `Next action`; current-work rows now use stage, progress, a blank premium, owner, and task action.
   - Post-fix evidence: final CUA opportunities capture shows consistent column semantics across quote and non-quote rows.
2. Account composition pass
   - Finding: the account metadata strip was redundant, the tab controls read like small inline links, and Next steps plus the activity preview competed with the opportunities table in one tab.
   - Fix: removed the metadata strip, added a full-width four-tab bar, made `Overview` the default, and moved the grouped table into the second `Opportunities` tab.
   - Post-fix evidence: final CUA captures show a focused Overview with Next steps and Recent activity, then an uninterrupted Opportunities workspace under the selected second tab.

## Interaction Checks

- Overview is the default account tab after reload.
- Overview, Opportunities, Intake, and Activity can all be selected.
- Opportunity names remain links to opportunity detail.
- Carrier rows remain keyboard-accessible links to quote-request detail.
- Returned quote options remain selectable with native radio controls.

final result: passed
