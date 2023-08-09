// Do not export JSX from this file. It might break some runtime that does not have DOM.
import { registerPlugin } from '@masknet/plugin-infra'
import { base } from './base.js'

registerPlugin({
    ...base,
    SiteAdaptor: {
        load: () => import('./SiteAdaptor/index.js'),
        hotModuleReload: (hot) =>
            import.meta.webpackHot?.accept('./SiteAdaptor', () => hot(import('./SiteAdaptor/index.js'))),
    },
    Dashboard: {
        load: () => import('./Dashboard/index.js'),
        hotModuleReload: (hot) =>
            import.meta.webpackHot?.accept('./Dashboard', () => hot(import('./Dashboard/index.js'))),
    },
})
