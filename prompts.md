[$caveman](D:\\prohori\\.agents\\skills\\caveman\\SKILL.md) analyze the plan folder and make a specific plan.md file in root folder for teammate B , divide the plan into sperate steps and phases so that after each step cpmpletes i can test the results manually

[$caveman](D:\\prohori\\.agents\\skills\\caveman\\SKILL.md) [$web-design-guidelines](D:\\prohori\\.agents\\skills\\web-design-guidelines\\SKILL.md) start **## Phase 0 ### Step 0.1 use Shadcnblocks and {** 
  "colors": {
    "primary": "#003087",
    "on-primary": "#ffffff",
    "primary-hover": "#002070",
    "secondary": "#009CDE",
    "on-secondary": "#ffffff",
    "cta-gold": "#FFD140",
    "on-cta": "#003087",
    "ink": "#2C2E2F",
    "ink-muted": "#687173",
    "canvas": "#ffffff",
    "surface-1": "#F5F7FA",
    "surface-2": "#EEF0F3",
    "border": "#D7DCE1",
    "success": "#22A94F",
    "danger": "#C23934"
  }
} start and write code precisely

start from the rest where u had stopped

[$caveman](D:\\prohori\\.agents\\skills\\caveman\\SKILL.md) ekhon phase 0 er 0.1 and 0.2 done? kun phase kun step complete korso?

[$caveman](D:\\prohori\\.agents\\skills\\caveman\\SKILL.md)[$web-design-guidelines](D:\\prohori\\.agents\\skills\\web-design-guidelines\\SKILL.md) [$vercel-react-best-practices](D:\\prohori\\.agents\\skills\\vercel-react-best-practices\\SKILL.md) use plan.md again and start 0.2

[$caveman](D:\\prohori\\.agents\\skills\\caveman\\SKILL.md) phase 1 ta complete koro a-z 100%

[$caveman](D:\\prohori\\.agents\\skills\\caveman\\SKILL.md) use plan.md again and complete phase 2 step 2.1 completely

[$caveman](D:\\prohori\\.agents\\skills\\caveman\\SKILL.md) now analyze the exisiting codes, i want to test what we have done so far, give me a list what we have done also fix issues i can face in testing

[$caveman](D:\\prohori\\.agents\\skills\\caveman\\SKILL.md) [$vercel-react-best-practices](D:\\prohori\\.agents\\skills\\vercel-react-best-practices\\SKILL.md) [$web-design-guidelines](D:\\prohori\\.agents\\skills\\web-design-guidelines\\SKILL.md) [$frontend-design](D:\\prohori\\.agents\\skills\\frontend-design\\SKILL.md) use plan.md again and start implementing phase 2.2 analyze and tell me what to test and urls go

[$caveman](D:\\prohori\\.agents\\skills\\caveman\\SKILL.md) use caveman skill highly, now read my plan.md and then start to implement phase 3 step 3.1, test it analyze it, then give me testing urls

[$caveman](D:\\prohori\\.agents\\skills\\caveman\\SKILL.md) use caveman skills again and start to develop the phase 3 step 3.2 and test it and analyze it and then give me urls to test it also checke the codes u r gernerating are connected to the other files

use caveman skills and give me the testing urls for step 4.1

use caveman skill and ok now agaiin read plan.md and then start to implement step 4.2, and give me urls to test

use cavemna skill and read plan.md again and complete phase 5 step 5.1 and tes it, analyze it and give me the testing urls

use cavemna skill and read plan.md again and complete phase 5 step 5.2 and tes it, analyze it and give me the testing urls

use cavemna skill and read plan.md again and complete phase 6 step 6.1 and test it, analyze it and give me the testing urls

Fix the top 3 React Doctor issues in prohori-web on this pass — leave the rest for a follow-up.

1. ERROR Bugs: Unauthenticated server action can be called directly (×2)
   Anyone can call server action "signOut" without logging in, since it has no auth check.
   Curl with no cache & follow the canonical fix and false positive check recipe before fixing: https://react.doctor/docs/rules/react-doctor/server-auth-actions
   - app/(dashboard)/actions.ts:7
   - app/actions/locale.ts:7
2. WARN Maintainability: Non-component export in component file (×5)
   This file exports non-components, so Fast Refresh can't safely preserve component state.
   Curl with no cache & follow the canonical fix and false positive check recipe before fixing: https://react.doctor/docs/rules/react-doctor/only-export-components
   - components/alerts/alerts-view.tsx:78
   - components/ui/badge.tsx:52
   - components/ui/button.tsx:59
3. WARN Bugs: Prop derived into useState (one fix · 4 sites)
   Your users see a stale value when prop "caseRecord" changes because useState copies it once.
   Curl with no cache & follow the canonical fix and false positive check recipe before fixing: https://react.doctor/docs/rules/react-doctor/no-derived-useState
   - components/cases/case-workflow-preview.tsx:33

Full results for all 26 issues (diagnostics.json + a .txt per rule): C:\Users\USER\AppData\Local\Temp\react-doctor-4758eba2-2517-4d0c-9d3b-ef8df965cce0

Read each file and fix the root cause — don't suppress or silence the rule.

Findings that share a `fixGroupId` (in diagnostics.json) are one root cause — a single fix clears all of them, so treat each `fixGroupId` as ONE task, not one per site.

Verify against the real thing, don't assume: confirm each change matches the canonical fix recipe you fetched for that rule, then re-run `npx react-doctor@latest --verbose` and check the issue is actually gone against the real tool before moving on.

Teach me as you go: for every issue you touch, explain it in plain language (no jargon) — what the problem is, why it's a problem, and how serious it is in human terms. Describe the real-world impact and severity concretely (e.g. "this crashes the page for users on Safari" vs. "this is a minor cleanup with no user impact") so I understand why it matters, not just what changed.

Then work through the rest from the full results above.

use cavemen skill and start phase 0 and then analyze it, test it and then amake tmi urls diba i will check and test it