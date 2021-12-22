## Description

<!-- Please include a summary of the change and which issue is fixed. Please also include relevant motivation and context. List any dependencies that are required for this change. -->

Closes # (NO_ISSUE)

## Type of change

<!-- Please delete options that are not relevant. -->

- [ ] Documentation
- [ ] Code refactoring (Restructuring existing code w/o changing its observable behavior)
- [ ] Bug fix (non-breaking change which fixes an issue)
- [ ] New feature (non-breaking change which adds functionality)
- [ ] Breaking change (a fix or feature that would make something no longer possible to do/require old user must upgrade their Mask Network to this new version)

## Previews

<!-- Please attach screenshots if there are any visual changes. -->

## Checklist

- [ ] My code follows the style guidelines of this project.
- [ ] I have performed a self-review of my own code.
- [ ] I have commented on my code, particularly in hard-to-understand areas.
- [ ] Any dependent changes have been merged and published in downstream modules.
- [ ] I have checked my code and corrected any misspellings. (Not a spelling mistake? Add the word into `cspell.json`.)
- [ ] I've read [Internationalization Guide](https://github.com/DimensionDev/Maskbook/blob/develop/docs/i18n-guide.md) and moved text fields to the i18n JSON file.

## Questions from reviewers

### If this PR changes the dependencies of the project. What kind of change does it have?

- [ ] Add a new package as a dependency.
- [ ] Change the version of a currently using dependency.

### If this PR depends on external APIs, please do the following steps:

- [ ] Make sure those APIs have configured CORS headers to let extension requests get passed. If you don't have permission to modify the server, please let us know it.
  - firefox extension: `moz-extension://[id]`
  - chrome extension: `chrome-extension://[id]`
- [ ] Delegate all web requests to the background service via the internal RPC bridge.


