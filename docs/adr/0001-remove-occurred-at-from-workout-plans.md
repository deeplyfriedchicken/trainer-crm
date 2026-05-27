# Remove occurredAt from workout_plans

`workout_plans.occurred_at` was added early in development but never acquired a domain meaning. It is NOT NULL in the schema, carried through every plan insert and update, and shown to no user. Attempts to define what it represents ("when the workout should be performed") collapsed — the field is a relic with no agreed semantics. We decided to drop the column via migration rather than leave a mandatory field that means nothing, which would mislead future developers into trying to use or preserve it.
