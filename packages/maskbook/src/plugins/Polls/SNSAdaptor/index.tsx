import type { Plugin } from '@masknet/plugin-infra'
import { base } from '../base'
import { POLL_META_KEY_1 } from '../constants'
import type { PollMetaData } from '../types'
import { PollMetadataReader } from '../helpers'
import PollsDialog from './PollsDialog'
import PollsInPost from './PollsInPost'

const sns: Plugin.SNSAdaptor.Definition = {
    ...base,
    init(signal) {},
    DecryptedInspector: function Comp(props) {
        const metadata = PollMetadataReader(props.message.meta)
        if (!metadata.ok) return null
        return <PollsInPost {...props} />
    },
    CompositionDialogMetadataBadgeRender: new Map([
        [POLL_META_KEY_1, (meta: PollMetaData) => `a poll of '${meta.question}' from ${meta.sender}`],
    ]),
    CompositionDialogEntry: { label: '🗳️ Poll', dialog: PollsDialog },
}

export default sns
