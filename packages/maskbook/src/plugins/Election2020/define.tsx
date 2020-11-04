import { SnackbarContent } from '@material-ui/core'
import React, { Suspense } from 'react'
import MaskbookPluginWrapper from '../MaskbookPluginWrapper'
import { Election2020MetaKey, Election2020PluginID } from './constants'
import { Election2020MetadataReader } from './helpers'
import type { Election2020JSONPayload } from './types'
import { createCompositionDialog } from '../utils/createCompositionDialog'
import { ElectionPacket } from './UI/ElectionPacket'
import { ElectionCompositionDialog } from './UI/ElectionCompositionDialog'
import { resolveStateName, resolveCandidateName } from './pipes'
import { Flags } from '../../utils/flags'
import { PluginConfig, PluginScope, PluginStage } from '../types'

const [ElectionCompositionEntry, ElectionCompositionUI] = createCompositionDialog('🎫  Election', (props) => (
    <ElectionCompositionDialog {...props} />
))

export const Election2020PluginDefine: PluginConfig = {
    pluginName: 'Election 2020',
    identifier: Election2020PluginID,
    stage: PluginStage.Production,
    scope: PluginScope.Public,
    successDecryptionInspector: function Comp(props) {
        const payload = Election2020MetadataReader(props.message.meta)
        if (!payload.ok) return null
        return (
            <MaskbookPluginWrapper pluginName="NFT">
                <Suspense fallback={<SnackbarContent message="Maskbook is loading this plugin..." />}>
                    <ElectionPacket payload={payload.val} />
                </Suspense>
            </MaskbookPluginWrapper>
        )
    },
    postDialogMetadataBadge: new Map([
        [
            Election2020MetaKey,
            (payload: Election2020JSONPayload) => {
                return `A Election Packet of ${resolveStateName(payload.state)} and ${resolveCandidateName(
                    payload.winner,
                )} is the winner.`
            },
        ],
    ]),
    PageComponent: Flags.election2020_composition_dialog_enabled ? ElectionCompositionUI : undefined,
    postDialogEntries: Flags.election2020_composition_dialog_enabled ? [ElectionCompositionEntry] : undefined,
}
