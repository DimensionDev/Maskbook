import type { Plugin } from '@masknet/plugin-infra'
import { base } from '../base.js'
import { PLUGIN_META_KEY } from '../constants.js'
import type { PollMetaData } from '../types.js'
import { PollMetadataReader } from '../helpers.js'
import PollsDialog from './PollsDialog.js'
import PollsInPost from './PollsInPost.js'

const sns: Plugin.SNSAdaptor.Definition = {
    ...base,
    init(signal) {},
    DecryptedInspector: function Comp(props) {
        const metadata = PollMetadataReader(props.message.meta)
        if (!metadata.ok) return null
        return <PollsInPost {...props} />
    },
    CompositionDialogMetadataBadgeRender: new Map([
        [PLUGIN_META_KEY, (meta: PollMetaData) => `a poll of '${meta.question}' from ${meta.sender}`],
    ]),
    CompositionDialogEntry: { label: '\uD83D\uDDF3\uFE0F Poll', dialog: PollsDialog },
}

export default sns
