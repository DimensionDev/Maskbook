import { registerPlugin } from '@masknet/plugin-infra'
import { base } from '@masknet/plugin-wallet'

registerPlugin({
    ...base,
    Worker: {
        load: () => import('./Worker/index.js'),
        hotModuleReload: (hot) =>
            // eslint-disable-next-line @typescript-eslint/prefer-optional-chain
            import.meta.webpackHot && import.meta.webpackHot.accept('./Worker', () => hot(import('./Worker/index.js'))),
    },
})
