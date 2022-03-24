# FAQ

## How to resolve merge conflicts in `pnpm-lock.yaml`?

Merge the target branch into yours and never mind those conflicts in `pnpm-lock.yaml`. And checkout the file to be the one on the target branch to revert changes your branch took in. Then run `pnpm install` to up the lockfile to date.

E.g., your `feat/fantasy` branch conflicts with `develop` branch.

```bash
> git branch --show-current
feat/fantasy

# merge the develop branch and never mind conflicts in lockfile
> git merge develop

# revoke lockfile to the one on the develop branch
> git checkout develop -- pnpm-lock.yaml

# up the lockfile to date
> pnpm install
```

## Why my Git hooks don't work?

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

All components should working in [Strict Mode](https://reactjs.org/docs/strict-mode.html) and React 18 new [Strict Effects](https://github.com/reactwg/react-18/discussions/19).

If you found your code not working correctly, please read the documentation above. In addition, you can comment out `<StrictMode />` temporarily to verify if it is a problem with your component not supporting Strict Mode.

DO NOT remove `<StrictMode />`.

## How to download CI builds?


| Name | Description |
| ---- | ----------- |
| MaskNetwork.base.zip | The default build, currently is the same as the Chromium build. |
| MaskNetwork.chromium-beta.zip | Build for Chromium based browsers with some insider features turned on. |
| MaskNetwork.chromium.zip | Build for Chromium based browsers |
| MaskNetwork.firefox.zip | Build for Firefox |
| MaskNetwork.gecko.zip | Build for Android native Mask app |
| MaskNetwork.iOS.zip | Build for iOS native Mask app |

You can download these builds in two places.

+ Github: Open the pull request page, and click the **Actions** tab. Then on the opened page, click the **build** sub-item on the **Compile** item. On the action detailed page, click the **Summary** tab. Now you can download builds on the **Artifacts** section.

  E.g., https://github.com/DimensionDev/Maskbook/actions/runs/2026749204

+ CircleCI: Open the pull request page, and scroll down to the review status card. Click **Show all checks** to find the **
ci/circleci: build** item, and click the **details** link. On the opended CircleCI page, click the **ARTIFACTS** tab.

  E.g., https://app.circleci.com/pipelines/github/DimensionDev/Maskbook/24886/workflows/eeabcc93-6152-437f-a65d-24f0acee34a9/jobs/52795/artifacts
