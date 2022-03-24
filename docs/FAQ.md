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

## How to close react strict mode?

## How to download CI builds?
