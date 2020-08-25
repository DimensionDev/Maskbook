import '../public/env'
import { addParameters, addDecorator } from '@storybook/react'
import { withKnobs, radios } from '@storybook/addon-knobs'
import { MaskbookDarkTheme, MaskbookLightTheme } from '../src/utils/theme'
import { create } from '@storybook/theming'

addParameters({
    options: {
        theme: create({
            base: 'dark',
            brandTitle: 'Maskbook',
            brandUrl: 'https://maskbook.com/',
            brandImage: 'https://maskbook.com/img/maskbook--logotype-white.png',
        }),
        isFullscreen: false,
        panelPosition: 'right',
        isToolshown: true,
    },
})
// Addons
addDecorator(withKnobs)
const themes = { Dark: '0', Light: '1' }
// Theme for MUI
addDecorator((storyFn) => (
    <ThemeProvider theme={[MaskbookDarkTheme, MaskbookLightTheme][radios('Theme', themes, '0')]}>
        {storyFn()}
    </ThemeProvider>
))
// i18n
import * as React from 'react'
import { I18nextProvider } from 'react-i18next'
import i18nNextInstance from '../src/utils/i18n-next'
addParameters({
    i18n: {
        provider: function i18nProvider(props) {
            i18nNextInstance.language !== props.locale && i18nNextInstance.changeLanguage(props.locale)
            return React.createElement(I18nextProvider, { i18n: i18nNextInstance }, props.children)
        },
        supportedLocales: ['en', 'zh', 'ja'],
        providerLocaleKey: 'locale',
    },
})
import { withI18n } from 'storybook-addon-i18n'
import { ThemeProvider } from '@material-ui/core'
addDecorator(withI18n)
