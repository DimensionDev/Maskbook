import { Suspense } from 'react'
import BigNumber from 'bignumber.js'
import { PostInspector } from './UI/PostInspector'
import { PluginConfig, PluginScope, PluginStage } from '../types'
import { formatBalance } from '../Wallet/formatter'
import { ITO_MetaKey, ITO_PluginID } from './constants'
import type { ITO_JSONPayload } from './types'
import { ITO_MetadataReader } from './helpers'
import MaskbookPluginWrapper from '../MaskbookPluginWrapper'
import { SnackbarContent } from '@material-ui/core'

export const ITO_PluginDefine: PluginConfig = {
    pluginName: 'ITO',
    identifier: ITO_PluginID,
    stage: PluginStage.Production,
    scope: PluginScope.Public,
    successDecryptionInspector: function Comp(props) {
        const payload = ITO_MetadataReader(props.message.meta)
        if (!payload.ok) return null
        return (
            <MaskbookPluginWrapper pluginName="NFT">
                <Suspense fallback={<SnackbarContent message="Maskbook is loading this plugin..." />}>
                    <PostInspector payload={payload.val} />
                </Suspense>
            </MaskbookPluginWrapper>
        )
    },
    postDialogMetadataBadge: new Map([
        [
            ITO_MetaKey,
            (payload: ITO_JSONPayload) => {
                return `A ITO with ${formatBalance(
                    new BigNumber(payload.total),
                    payload.token?.decimals ?? 0,
                    payload.token?.decimals ?? 0,
                )} $${payload.token?.name || 'ETH'} from ${payload.sender.name}`
            },
        ],
    ]),
}
