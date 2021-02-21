import { SnackbarContent } from '@material-ui/core'
import { Suspense } from 'react'
import MaskbookPluginWrapper from '../MaskbookPluginWrapper'
import { AirdropMetaKey, AirdropPluginID } from './constants'
import { AirdropMetadataReader } from './helpers'
import type { AirdropJSONPayload } from './types'
import { createCompositionDialog } from '../utils/createCompositionDialog'
import { CompositionDialog } from './UI/CompositionDialog'
import { Flags } from '../../utils/flags'
import { PluginConfig, PluginScope, PluginStage } from '../types'
import { Airdrop } from './UI/Airdrop'

const [AirdropCompositionEntry, AirdropCompositionUI] = createCompositionDialog('🪂 Airdrop', (props) => (
    <CompositionDialog {...props} />
))

export const AirdropPluginDefine: PluginConfig = {
    pluginName: 'Airdrop',
    identifier: AirdropPluginID,
    stage: PluginStage.Production,
    scope: PluginScope.Public,
    successDecryptionInspector: function Comp(props) {
        const payload = AirdropMetadataReader(props.message.meta)
        if (!payload.ok) return null
        return (
            <MaskbookPluginWrapper pluginName="🪂 Airdrop">
                <Suspense fallback={<SnackbarContent message="Mask is loading this plugin..." />}>
                    <Airdrop payload={payload.val} />
                </Suspense>
            </MaskbookPluginWrapper>
        )
    },
    postDialogMetadataBadge: new Map([
        [
            AirdropMetaKey,
            (payload: AirdropJSONPayload) => {
                return 'Airdrop'
            },
        ],
    ]),
    PageComponent: Flags.airdrop_composition_dialog_enabled ? AirdropCompositionUI : undefined,
    postDialogEntries: Flags.airdrop_composition_dialog_enabled ? [AirdropCompositionEntry] : undefined,
}
