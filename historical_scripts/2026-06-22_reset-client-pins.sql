-- Reset all client PINs after changing the PIN format from 6 digits to 4 digits.
-- Stored hashes are for 6-digit strings and will not match any newly-entered 4-digit PIN,
-- so every existing trainee would otherwise be locked out with no way to log in.
-- Bumping pin_updated_at also invalidates any active client_session JWTs
-- (see src/lib/client-session.ts), so trainees with a live cookie are pushed to PinModal.
-- After this runs, every trainee will see the "Create PIN" flow on next portal visit.
-- Run against production after deploying the code change that switched the regex/UI to 4 digits.
-- Safe to run multiple times (rows with pin already NULL are skipped).

UPDATE users
SET pin = NULL,
    pin_updated_at = NOW()
WHERE pin IS NOT NULL;
