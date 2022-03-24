# FAQ

## How to resolve merge conflicts in `pnpm-lock.yaml`?

Do not try to pick either side of the lockfile.

Drop both "ours" and "theirs" version (then the file will be in the base version).

Then run `pnpm install` to up the lockfile to date.

## My Git hooks don't work.

```bash
npx husky install # on project root directory
```

## How to fix cspell errors in CI?

This project uses [cspell](https://github.com/streetsidesoftware/cspell) for checking typoes. You can add unlisted words into `cspell.json` to bypass cspell checking. After you update the configuration file, you could run checking locally before pushing it to make sure your patch is working.

```bash
npx cspell lint pattern_that_match_your_files

// e.g. check spell of the RSS3 plugin
npx cspell lint ./packages/plugins/RSS3/**/*
```

Learn more: [`cspell.json`](https://cspell.org/configuration/#cspelljson)

## Why were my components rendered many times?

All components are working in [Strict Mode](https://reactjs.org/docs/strict-mode.html). The strict mode helps to develop robust components in many ways. If you need to escape from it for some purpose, try to comment out those `<StrictMode />` components to turn it off. After you finish your work, remember to render your components again with it turned on. **NEVER PUSH CODE WITHOUT TESTING IN STRICT MODE**

## How to download CI builds?

There are many kinds of builds. Check the following table.

| Name | Description |
| ---- | ----------- |
| MaskNetwork.base.zip | The default build, just like the Chromium one. |
| MaskNetwork.chromium-beta.zip | Build for Chromium based browsers with some insider features turned on. |
| MaskNetwork.chromium.zip | Build for Chromium based browsers |
| MaskNetwork.firefox.zip | Build for Firefox |
| MaskNetwork.gecko.zip | Build for Gecko based browsers |
| MaskNetwork.iOS.zip | Build for iOS native Mask app |

You can download these builds in two places.

+ Github: Open the pull request page, and click the **Actions** tab. Then on the opened page, click the **build** sub-item on the **Compile** item. On the action detailed page, click the **Summary** tab. Now you can download builds on the **Artifacts** section. E.g., https://github.com/DimensionDev/Maskbook/actions/runs/2026749204
+ CircleCI: Open the pull request page, and scroll down to the review status card. Click **Show all checks** to find the **
ci/circleci: build** item, and click the **details** link. On the opended CircleCI page, click the **ARTIFACTS** tab. E.g., https://app.circleci.com/pipelines/github/DimensionDev/Maskbook/24886/workflows/eeabcc93-6152-437f-a65d-24f0acee34a9/jobs/52795/artifacts
