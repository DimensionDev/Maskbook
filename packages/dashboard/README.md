# Dashboard

The developing new dashboard.

Expected to work in three mode:

## Storybook

Most of the components should be expected to work in the Storybook.
This means you should split logic and UI components.

## Isolated website

Only works in Chrome.

1. Install Mask Network extension in the development mode (`./dist/`) or Beta/Nightly build.
2. Make sure the extension ID is `jkoeaghipilijlahjplgbfiocjhldnap`.
3. Open chrome-extension://jkoeaghipilijlahjplgbfiocjhldnap/index.html#/settings
4. Make sure the Advanced settings: `Experimental: Allow isolated dashboard to connect` is enabled.
5. Run `pnpm start` in this folder.

If you got error "Error: Attempting to use a disconnected port object", it means you didn't set up correctly.

## Embedded mode

Not enabled in build version yet.

Entry 1: Open the old dashboard, go to the settings page, click "Open new dashboard (intergated) (dev-only)".

Entry 2: Click the Mask icon beside the address bar, ctrl+click "Enter dashboard".

Entry 3: Open chrome-extension://jkoeaghipilijlahjplgbfiocjhldnap/next.html directly
