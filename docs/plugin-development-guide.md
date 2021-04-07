# Plugin Development Guide

## Minimum File Structure

```plaintext
packages/maskbook/src/plugins/{your-plugin-name}
├── README.md     # see `README driven development`
├── constants.ts  # Constant definition, e.g: api end-point, etc
├── define.tsx    # Plugin definition
├── types.ts      # Provide common typing definition
└── utils.ts      # Provide common utils function
```

## About `README.md` file

see [README driven development](https://tom.preston-werner.com/2010/08/23/readme-driven-development.html)

The file need to provide this information:

- Feature-set as TODOs
- Reference resource list
- Known issues / Caveats

## Using Git

- [Using git rebase on the command line](https://docs.github.com/en/github/getting-started-with-github/using-git-rebase-on-the-command-line)
- [Configuring a remote for a fork](https://docs.github.com/en/github/collaborating-with-issues-and-pull-requests/configuring-a-remote-for-a-fork)
- [Syncing a fork](https://docs.github.com/en/github/collaborating-with-issues-and-pull-requests/syncing-a-fork)
