# Agents

This project includes specialized agents for React Native development tasks.

## Available Agents

### Coding_Agent
**File:** `agents/coding.agent.md`

Writing or refactoring React Native components, hooks, screens, and Redux slices. Enforces mobile best practices, proper hooks usage, platform-specific patterns, and TypeScript safety.

### Planning_Agent
**File:** `agents/planning.agent.md`

Breaking down features into implementation tasks before coding. Generates Mobile Technical Planning documents with focused task breakdown and platform-specific guidance.

### Review_Agent
**File:** `agents/review.agent.md`

Auditing existing code for bugs, architecture violations, performance issues, security concerns, and testing gaps. Produces structured review reports with actionable findings.

### Testing_Agent
**File:** `agents/testing.agent.md`

Generating and auditing unit, integration, and E2E tests. Follows the project testing pyramid (70% unit / 20% integration / 10% E2E) and ensures full coverage of critical paths.

---

## How to Use

1. **Agent Picker**: Click the agent icon in the chat input (or use `Ctrl+Shift+A` / `Cmd+Shift+A`)
2. **Select an agent** from the dropdown list
3. **Describe your task** in the message

Example:
- "Test this component" → Use **Testing_Agent**
- "Review this code for security" → Use **Review_Agent**
- "Plan the authentication feature" → Use **Planning_Agent**
- "Implement this screen" → Use **Coding_Agent**
