# Dashboard

The developing new dashboard.

Expected to working in three mode:

## Storybook

Most of the components should be expected to work in the Storybook.
This means you should split logic and UI components.

## Isolated website

This project should be able to run under http or https instead of chrome-extension.

<!-- cspell:ignore jkoeaghipilijlahjplgbfiocjhldnap -->

Currently, you must also install the development mode (`./dist/`) Mask Network extension where the extension ID must be `jkoeaghipilijlahjplgbfiocjhldnap`.
Otherwise you will encountered error "Error: Attempting to use a disconnected port object".

It is not required to open the webpack process of the main Mask Network to develop this project (this is what "isolated" means).

Currently the isolated mode only works on Chrome.

## Embedded mode

This project should be able to run in the chrome-extension protocol (embedded in the extension).
