import { registerPlugin } from '@masknet/plugin-infra'
import { base } from './base.js'

registerPlugin({
    ...base,
    SiteAdaptor: {
        load: () => import('./SiteAdaptor/index.js'),
        hotModuleReload: (hot) =>
            import.meta.webpackHot?.accept('./SiteAdaptor', () => hot(import('./SiteAdaptor/index.js'))),
    },
    Worker: {
        load: () => import('./Worker/index.js'),
        hotModuleReload: (hot) =>
            import.meta.webpackHot?.accept('./SiteAdaptor', () => hot(import('./Worker/index.js'))),
    },
})
