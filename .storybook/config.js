import { addParameters, configure, addDecorator } from '@storybook/react'
import { withKnobs } from '@storybook/addon-knobs'
import { muiTheme } from 'storybook-addon-material-ui'
import { MaskbookDarkTheme, MaskbookLightTheme } from '../src/utils/theme'
import { create } from '@storybook/theming'
function loadStories() {
    require('../src/stories/index')
}
configure(loadStories, module)

addParameters({
    options: {
        theme: create({
            base: 'dark',
            brandTitle: 'Maskbook',
            brandUrl: 'https://maskbook.io/',
            brandImage: 'https://maskbook.io/img/maskbook--logotype-white.png',
        }),
        isFullscreen: false,
        panelPosition: 'right',
        isToolshown: true,
    },
})
// Addons
addDecorator(withKnobs)
// Theme for MUI
addDecorator(muiTheme([MaskbookLightTheme, MaskbookDarkTheme]))
