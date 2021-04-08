import { Suspense } from 'react'
import { SnackbarContent } from '@material-ui/core'
import MaskbookPluginWrapper from '../MaskbookPluginWrapper'
import { MarketplaceMetaKey, MarketplacePluginID } from './constants'
import { MarketplaceMetadataReader, payloadIntoMask } from './helpers'
import type { MarketplaceJSONPayloadInMask, MarketplaceJSONPayloadOutMask } from './types'
import { createCompositionDialog } from '../utils/createCompositionDialog'
import { MarketplacePacket } from './UI/Marketplace'
import { CompositionDialog } from './UI/CompositionDialog'
import { Flags } from '../../utils/flags'
import { MarketplaceSellerState, MarketplaceBuyerState } from './hooks/useMarketplaceState'
import { PluginConfig, PluginScope, PluginStage } from '../types'

const [MarketplaceCompositionEntry, MarketplaceCompositionUI] = createCompositionDialog('🛒  Marketplace', (props) => (
    <MarketplaceSellerState.Provider>
        <CompositionDialog {...props} />
    </MarketplaceSellerState.Provider>
))

export const MarketplacePluginDefine: PluginConfig = {
    pluginName: 'Marketplace',
    identifier: MarketplacePluginID,
    stage: PluginStage.Production,
    scope: PluginScope.Public,
    successDecryptionInspector: function Comp(props) {
        const payload = MarketplaceMetadataReader(props.message.meta)
        if (!payload.ok) return null
        return Renderer(payloadIntoMask(payload.val))
    },
    postDialogMetadataBadge: new Map([
        [
            MarketplaceMetaKey,
            (payload: MarketplaceJSONPayloadOutMask) => {
                return `A NFT marketplace.`
            },
        ],
    ]),
    PageComponent: Flags.marketplace_composition_dialog_enabled ? MarketplaceCompositionUI : undefined,
    postDialogEntries: Flags.marketplace_composition_dialog_enabled ? [MarketplaceCompositionEntry] : undefined,
}

function Renderer(payload: MarketplaceJSONPayloadInMask) {
    return (
        <MaskbookPluginWrapper pluginName="NFT">
            <Suspense fallback={<SnackbarContent message="Mask is loading this plugin..." />}>
                <MarketplaceBuyerState.Provider>
                    <MarketplacePacket payload={payload} />
                </MarketplaceBuyerState.Provider>
            </Suspense>
        </MaskbookPluginWrapper>
    )
}
