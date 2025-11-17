# Agent Sessions Directory

This directory contains context session files used to maintain state and context between agent invocations.

## Structure

Each feature or task gets its own context session file:

```
sessions/
└── context_session_{feature_name}.md
```

## Purpose

Context session files serve to:

1. **Maintain Continuity**: Preserve context across multiple agent interactions
2. **Track Progress**: Document what has been done and what remains
3. **Share Context**: Allow different agents to understand the full picture
4. **Avoid Redundancy**: Prevent agents from repeating work or analysis

## Format

Each session file should contain:

- **Feature Name**: Clear identification of the feature/task
- **Current Status**: What stage the work is in
- **Completed Work**: What has been done so far
- **Pending Work**: What still needs to be completed
- **Important Notes**: Key decisions, blockers, or context
- **Related Documentation**: Links to generated docs in `.cursor/doc/`

## Usage by Agents

Before starting work, agents MUST:

1. Check if a context session file exists for the feature
2. Read the session file to understand current state
3. Update the session file with their contributions
4. Reference any documentation they generate

## Example Session File

```markdown
# Context Session: User Authentication

## Status

In Progress - Implementation Phase

## Completed

- ✅ Requirements analysis
- ✅ Frontend implementation plan created
- ✅ Test cases defined

## Pending

- ⏳ Implement authentication components
- ⏳ Write unit tests
- ⏳ E2E test validation

## Important Notes

- Using Supabase Auth
- Implementing magic link + OAuth
- Must support dark mode

## Documentation

- Frontend Plan: `.cursor/doc/user-authentication/frontend.md`
- Test Cases: `.cursor/doc/user-authentication/test_cases.md`
```
