# GitHub Issue Workflow for Issue #$ARGUMENT$

## Setup Phase

1. Fetch latest branches: `git fetch origin`
2. Get issue details
   - Fetch issue title: `gh issue view $ARGUMENT$ --json title -q .title`

## Worktree Phase (if you are not now in a ./tree folder)

1. git worktree add ./.trees/feature-issue-$ARGUMENTS -b feature-issue-$ARGUMENTS
2. cd .trees/feature-issue-$ARGUMENTS

## Analysis Phase

1. Read the full issue content and ALL comments using: `gh issue view $ARGUMENT$ --comments`
2. Analyze the requirements and context thoroughly

## Implementation Phase

1. Execute the plan step by step, remember to build tests before the implementation and run the test suite constantly to get quick feedback.
2. Create always unit tests, component tests (Jest + React Testing Library), and E2E tests (Playwright) as appropriate
3. Ensure consistency with existing code in the branch
4. Run local builds and tests suite before git commit & push:
   - `npm run build` (Next.js production build)
   - `npm run lint` (ESLint validation)
   - `npm test` (Jest unit/component tests)
   - `npm run e2e` (Playwright E2E tests)
5. Never implement the manual tests
6. Create the PR or update the existing one
7. Report status of completeness:

<results>

# Summary of the requirements implemented:

    - req 1
        - req 2
    - ...

# Requirements pending

    - req 1
        - req 2
    - ...

# Test implemented and their run status

     PASS  src/components/__tests__/LanguageSwitcher.test.tsx
     PASS  src/components/__tests__/Navbar.i18n.test.tsx
     PASS  e2e/auth.spec.ts
     PASS  e2e/buyer-registration.spec.ts
     PASS  e2e/seller-registration.spec.ts

# Proof that all build passes

     ✓ Build completed successfully
     ✓ Linting passed
     ✓ All tests passed (Jest + Playwright)

# Overall status: [Needs More Work/All Completed]

# PR: github-pr-url

</result>

8. Stay tuned to the pr until the deploy is done successfully using `gh pr view {pr_number} --json statusCheckRollup,state,mergeable,url)`
9. If some verification fails check the problems and implement the fixes updating the PR and try again in loop until have all verifications in success

## Important Notes

- The "All Completed" is the desired status and we can only arrive if we have implemented all the requirements and all the test suite are implemented and green, otherwise we need more work until that happens
- Always use `gh` CLI for GitHub operations
- Always use `npm` as the package manager (this is a Next.js/TypeScript project)
- Keep detailed records of all actions as PR/issue comments
- Wait for explicit confirmation before proceeding with major changes
- Test types to consider:
  - **Unit tests**: Jest for utility functions and business logic
  - **Component tests**: Jest + React Testing Library for React components
  - **E2E tests**: Playwright for full user flows

## Final checks

- After create the PR review that the validations in the pipeline are success, if they are pending wait until they are success checking using `gh pr view {pr_number} --json statusCheckRollup,state,mergeable,url)`
- If the validations are failed, review the issues or ask for them to me
- After have the issues, implement the fixes and push again to the PR until all the validations are success, continue in loop until have them all in green
- Once all is green, update the issue with a comment of what is implemented and your labor is finished
