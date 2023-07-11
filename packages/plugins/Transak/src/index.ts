import { registerPlugin } from '@masknet/plugin-infra'
import { base } from './base.js'
export { PluginTransakMessages } from './messages.js'
export { useTransakAllowanceCoin } from './hooks/useTransakAllowanceCoin.js'
export { useTransakURL } from './hooks/useTransakURL.js'

registerPlugin({
    ...base,
    SNSAdaptor: {
        load: () => import('./SNSAdaptor/index.js'),
        hotModuleReload: (hot) =>
            import.meta.webpackHot?.accept('./SNSAdaptor', () => hot(import('./SNSAdaptor/index.js'))),
    },
    Dashboard: {
        load: () => import('./Dashboard/index.js'),
        hotModuleReload: (hot) =>
            import.meta.webpackHot?.accept('./Dashboard', () => hot(import('./Dashboard/index.js'))),
    },
})
