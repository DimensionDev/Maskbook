// Do not export JSX from this file. It might break some runtime that does not have DOM.
import { registerPlugin } from '@masknet/plugin-infra'
import { base } from './base.js'

registerPlugin({
    ...base,
    Worker: {
        load: () => import('./Worker/index.js'),
        hotModuleReload: (hot) =>
            import.meta.webpackHot && import.meta.webpackHot.accept('./Worker', () => hot(import('./Worker/index.js'))),
    },
})
