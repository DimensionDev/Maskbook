import { registerPlugin } from '@masknet/plugin-infra'
import { base } from './base.js'
import { languages } from './locales/languages.js'

registerPlugin({
    ...base,
    SNSAdaptor: {
        load: () => import('./SNSAdaptor/index.js'),
        hotModuleReload: (hot) =>
            import.meta.webpackHot &&
            import.meta.webpackHot.accept('./SNSAdaptor', () => hot(import('./SNSAdaptor/index.js'))),
    },
    Worker: {
        load: () => import('./Worker/index.js'),
        hotModuleReload: (hot) =>
            import.meta.webpackHot && import.meta.webpackHot.accept('./Worker', () => hot(import('./Worker/index.js'))),
    },
    i18n: languages,
})
