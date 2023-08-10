import { registerPlugin } from '@masknet/plugin-infra'
import type {
    ChainId,
    NetworkType,
    ProviderType,
    SchemaType,
    MessageRequest,
    MessageResponse,
    Transaction,
    TransactionParameter,
} from '@masknet/web3-shared-flow'
import { base } from './base.js'

registerPlugin<
    ChainId,
    SchemaType,
    ProviderType,
    NetworkType,
    MessageRequest,
    MessageResponse,
    Transaction,
    TransactionParameter
>({
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
