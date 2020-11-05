# Caveats for developers

Hi, Welcome to the Mask Network. Here is some note for developing Mask Network.

## Git conventions

`master` branch is our developing branch, `released` branch points to the latest version. [Git flow](https://github.com/nvie/gitflow) is recommended but not enforced.

Please use [Conventional Commits](https://www.conventionalcommits.org/) when committing.

## Developing

### Load extension into Chrome

- Open chrome://extensions/
- Enable developer mode
- Click "Load unpacked version"
- Select `dist` folder (in development mode) or `build` folder (after a production mode build).

### Load extension into Firefox

- Open about:debugging#/runtime/this-firefox
- Click "Load Temporary Add-on"
- Select any file in the `dist` folder

## Hot Module Reload

You can use an environment variable `NO_HMR` to close HMR totally.

If you found HMR doesn't work, please open <https://localhost:8080/> and ignore the HTTPs certificate error.
