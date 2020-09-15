import '../public/env'
import * as React from 'react'
import { withKnobs, radios } from '@storybook/addon-knobs'
import { getMaskbookTheme } from '../packages/maskbook/src/utils/theme'
import { I18nextProvider } from 'react-i18next'
import i18nNextInstance from '../packages/maskbook/src/utils/i18n-next'
import { withI18n } from 'storybook-addon-i18n'
import { ThemeProvider } from '@material-ui/core'
import { Appearance } from '../packages/maskbook/src/settings/settings'

export const parameters = {
    options: {
        isFullscreen: false,
        panelPosition: 'right',
        isToolshown: true,
    },
    i18n: {
        provider: function i18nProvider(props) {
            i18nNextInstance.language !== props.locale && i18nNextInstance.changeLanguage(props.locale)
            return React.createElement(I18nextProvider, { i18n: i18nNextInstance }, props.children)
        },
        supportedLocales: ['en', 'zh', 'ja'],
        providerLocaleKey: 'locale',
    },
}

const themes = { Dark: '0', Light: '1' }
// Theme for MUI
const MaskbookDarkTheme = getMaskbookTheme({ theme: Appearance.dark })
const MaskbookLightTheme = getMaskbookTheme({ theme: Appearance.light })
export const decorators = [
    withKnobs,
    (storyFn) => (
        <ThemeProvider theme={[MaskbookDarkTheme, MaskbookLightTheme][radios('Theme', themes, '0')]}>
            {storyFn()}
        </ThemeProvider>
    ),
    withI18n,
]
