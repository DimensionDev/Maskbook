import { registerPlugin } from '@masknet/plugin-infra'
import { base } from './base.js'
import { languages } from './locales/languages.js'

registerPlugin({
    ...base,
    SiteAdaptor: {
        load: () => import('./SiteAdaptor/index.js'),
        hotModuleReload: (hot) =>
            import.meta.webpackHot?.accept('./SiteAdaptor', () => hot(import('./SiteAdaptor/index.js'))),
    },
    i18n: languages,
})
