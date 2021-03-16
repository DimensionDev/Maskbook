# cli

This package provides two commands: `build` and `dev`.

`dev` will start some watching process in the background and start the specified task.

`build` will run the perquisite command first then run the specified task.

## Mode 0: Interactive start

```bash
npx dev --help
```

## Mode 1: Start development

```bash
npx dev [flags1] [flags2] [...]
npx build [flags1] [flags2] [...]
```

This command will start the webpack process with specified profiles.

### Example

```bash
npx dev chromium beta
npx build firefox
```

### Available flags

- Presets, one of 'chromium' | 'e2e' | 'firefox' | 'android' | 'iOS'
- Stages, one of 'beta' | 'insider'
- Others, any of 'reproducible' | 'profile' | 'manifest-v3'

## Mode 2: Run any command

```bash
npx dev -- your command
npx build -- your command
```

## What is executed before my command, exactly?

1. i18n code generation

   generate `.js` and `.d.ts` files which is necessary for almost any build process

2. TypeScript project reference build

   Without this step, cross-package builds will fail cause they're expected to find `.js` files.

If it is `build`, now the actual command takes charge.

If the command is `dev`, now it also starts a watch mode TypeScript project reference build and watch mode i18n code generation in the background to make those files up-to-date.

---

We're using `proper-lockfile` to avoid starting multiple instance of watch mode `tsc`. But that doesn't work well sometimes. Help wanted.

A possible solution is: a port based lock.

When a new instance started, it try to connect to a port `N`. If connect failed, it will listen to that port (get the lock). When the process dies, the port will be released automatically and other instance will be notified (port connect disconnected) and they can acquire the lock (by listen the port) now.
