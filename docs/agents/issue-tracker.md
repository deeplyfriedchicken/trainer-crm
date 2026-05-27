# Issue Tracker — Linear

Issues for this repo are tracked in **Linear**. Skills that create, read, or update issues use the Linear MCP server tools (`mcp__linear-server__*`).

## Reading issues

Use `mcp__linear-server__list_issues` or `mcp__linear-server__get_issue` to fetch issues. Filter by team, status, or label as needed.

## Creating issues

Use `mcp__linear-server__save_issue` to create or update an issue.

## Updating status / labels

Use `mcp__linear-server__save_issue` with the appropriate `stateId` or `labelIds`. Map canonical triage labels to Linear labels — see `docs/agents/triage-labels.md`.

## Finding the right team / project

Use `mcp__linear-server__list_teams` to discover available teams, and `mcp__linear-server__list_projects` to find projects.
