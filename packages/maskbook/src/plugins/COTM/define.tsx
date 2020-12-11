import { SnackbarContent } from '@material-ui/core'
import { Suspense } from 'react'
import MaskbookPluginWrapper from '../MaskbookPluginWrapper'
import { COTM_MetaKey, COTM_PluginID } from './constants'
import { COTM_MetadataReader } from './helpers'
import type { COTM_JSONPayload } from './types'
import { createCompositionDialog } from '../utils/createCompositionDialog'
import { TokenPacket } from './UI/TokenPacket'
import { COTM_CompositionDialog as COTM_CompositionDialog } from './UI/CompositionDialog'
import { Flags } from '../../utils/flags'
import { PluginConfig, PluginScope, PluginStage } from '../types'

const [COTM_CompositionEntry, COTM_CompositionUI] = createCompositionDialog('🇳🇱 #CreativityOnTheMove', (props) => (
    <COTM_CompositionDialog {...props} />
))

export const COTM_PluginDefine: PluginConfig = {
    pluginName: 'COTM',
    identifier: COTM_PluginID,
    stage: PluginStage.Production,
    scope: PluginScope.Public,
    successDecryptionInspector: function Comp(props) {
        const payload = COTM_MetadataReader(props.message.meta)
        if (!payload.ok) return null
        return (
            <MaskbookPluginWrapper pluginName="🇳🇱 #CreativityOnTheMove">
                <Suspense fallback={<SnackbarContent message="Maskbook is loading this plugin..." />}>
                    <TokenPacket payload={payload.val} />
                </Suspense>
            </MaskbookPluginWrapper>
        )
    },
    postDialogMetadataBadge: new Map([
        [
            COTM_MetaKey,
            (payload: COTM_JSONPayload) => {
                return '#CreativityOnTheMove - Strange Design'
            },
        ],
    ]),
    PageComponent: Flags.COTM_composition_dialog_enabled ? COTM_CompositionUI : undefined,
    postDialogEntries: Flags.COTM_composition_dialog_enabled ? [COTM_CompositionEntry] : undefined,
}
