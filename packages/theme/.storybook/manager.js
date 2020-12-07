import { addons } from '@storybook/addons'
import { themes } from '@storybook/theming'

addons.setConfig({
    panelPosition: 'right',
    theme: themes.dark,
    selectedPanel: undefined,
    initialActive: 'sidebar',
    showRoots: true,
})
