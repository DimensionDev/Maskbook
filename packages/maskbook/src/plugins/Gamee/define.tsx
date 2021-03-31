import { SnackbarContent } from '@material-ui/core'
import { Suspense } from 'react'
import MaskbookPluginWrapper from '../MaskbookPluginWrapper'
import { GameeMetaKey, GameePluginID } from './constants'
import { GammeMetadataReader } from './helpers'
import type { GameeJSONPayload } from './types'
import { createCompositionDialog } from '../utils/createCompositionDialog'
import { GammePacket } from './UI/GameePacket'
import { CompositionDialog } from './UI/CompositionDialog'
import { resolveStateName, resolveCandidateName } from './pipes'
import { Flags } from '../../utils/flags'
import { PluginConfig, PluginScope, PluginStage } from '../types'

const [ElectionCompositionEntry, ElectionCompositionUI] = createCompositionDialog('Gamme', (props) => (
    <CompositionDialog {...props} />
))

export const GameePluginDefine: PluginConfig = {
    pluginName: 'Gamee',
    identifier: GameePluginID,
    stage: PluginStage.Production,
    scope: PluginScope.Public,
    successDecryptionInspector: function Comp(props) {
        const payload = GammeMetadataReader(props.message.meta)
        if (!payload.ok) return null
        return (
            <MaskbookPluginWrapper pluginName="NFT">
                <Suspense fallback={<SnackbarContent message="Mask is loading this plugin..." />}>
                    <GammePacket payload={payload.val} />
                </Suspense>
            </MaskbookPluginWrapper>
        )
    },
    postDialogMetadataBadge: new Map([
        [
            GameeMetaKey,
            (payload: GameeJSONPayload) => {
                return `A Election Packet of ${resolveStateName(payload.state)} and ${resolveCandidateName(
                    payload.winner,
                )} is the winner.`
            },
        ],
    ]),
    PageComponent: Flags.election2020_composition_dialog_enabled ? ElectionCompositionUI : undefined,
    postDialogEntries: Flags.election2020_composition_dialog_enabled ? [ElectionCompositionEntry] : undefined,
}
