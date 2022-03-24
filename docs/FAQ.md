# FAQ

## How to resolve merge conflicts in `pnpm-lock.yaml`?

Do not try to pick either side of the lockfile.

Drop both "ours" and "theirs" version (then the file will be in the base version).

Then run `pnpm install` to up the lockfile to date.

## My Git hooks don't work.

```bash
npx husky install # on project root directory
```

## How to fix cspell errors?

## How to close react strict mode?

## How to download CI builds?
