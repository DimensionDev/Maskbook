import '../public/env'
import { addParameters, configure, addDecorator } from '@storybook/react'
import { withKnobs } from '@storybook/addon-knobs'
import { muiTheme } from 'storybook-addon-material-ui'
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
// Theme for MUI
addDecorator(muiTheme([MaskbookDarkTheme, MaskbookLightTheme]))
// i18n
import * as React from 'react'
import { geti18nContext } from '../src/utils/i18n'
const ctx = geti18nContext()
addParameters({
    i18n: {
        provider: function i18nProvider(props) {
            return React.createElement(ctx.Provider, { value: props.locale }, props.children)
        },
        supportedLocales: ['en', 'zh'],
        providerLocaleKey: 'locale',
    },
})
import { withI18n } from 'storybook-addon-i18n'
addDecorator(withI18n)
