import { registerPlugin } from '@masknet/plugin-infra'
import { base } from './base.js'
import { languages } from './locales/languages.js'

registerPlugin({
    ...base,
    SiteAdaptor: {
        load: () => import('./SNSAdaptor/index.js'),
        hotModuleReload: (hot) =>
            import.meta.webpackHot?.accept('./SNSAdaptor', () => hot(import('./SNSAdaptor/index.js'))),
    },
    i18n: languages,
})
