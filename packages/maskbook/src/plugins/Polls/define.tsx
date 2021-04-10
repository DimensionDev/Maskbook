import { PluginConfig, PluginStage, PluginScope } from '../types'
import type { PollMetaData } from './types'
import { PollMetadataReader } from './utils'
import PollsInPost from './UI/PollsInPost'
import { pluginName, identifier, POLL_META_KEY_1 } from './constants'
import { createCompositionDialog } from '../utils/createCompositionDialog'
import PollsDialog from './UI/PollsDialog'

const [PollCompositionEntry, PollCompositionUI] = createCompositionDialog('🗳️ Poll', (props) => (
    <PollsDialog
        // classes={classes}
        // DialogProps={props.DialogProps}
        open={props.open}
        onConfirm={props.onClose}
        onDecline={props.onClose}
    />
))
export const PollsPluginDefine: PluginConfig = {
    ID: identifier,
    pluginIcon: '📊',
    pluginName,
    pluginDescription: 'Easily create a Poll for reciving public votes.',
    identifier,
    stage: PluginStage.Beta,
    scope: PluginScope.Public,
    successDecryptionInspector: function Comp(props) {
        const metadata = PollMetadataReader(props.message.meta)
        if (!metadata.ok) return null
        return <PollsInPost {...props} />
    },
    postDialogMetadataBadge: new Map([
        [POLL_META_KEY_1, (meta: PollMetaData) => `a poll of '${meta.question}' from ${meta.sender}`],
    ]),
    PageComponent: PollCompositionUI,
    postDialogEntries: [PollCompositionEntry],
}
