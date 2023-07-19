import { registerPlugin } from '@masknet/plugin-infra'
import { base } from './base.js'

registerPlugin({
    ...base,
    Worker: {
        load: () => import('./Worker/index.js'),
        hotModuleReload: (hot) => import.meta.webpackHot?.accept('./Worker', () => hot(import('./Worker/index.js'))),
    },
    Dashboard: {
        load: () => import('./UI/Dashboard/index.js'),
        hotModuleReload: (hot) =>
            import.meta.webpackHot?.accept('./UI/Dashboard', () => import('./UI/Dashboard/index.js')),
    },
})
