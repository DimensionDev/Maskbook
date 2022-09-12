import type { Plugin } from '@masknet/plugin-infra'
import { Icons } from '@masknet/icons'
import { base } from '../base.js'
import { pluginMetaKey, pluginName } from '../constants.js'
import type { UnlockLockInMetadata } from '../types.js'
import { UnlockProtocolMetadataReader } from '../helpers.js'
import UnlockProtocolDialog from './UnlockProtocolDialog.js'
import UnlockProtocolInPost from './UnlockProtocolInPost.js'

const sns: Plugin.SNSAdaptor.Definition = {
    ...base,
    init(signal) {},
    DecryptedInspector(props) {
        const metadata = UnlockProtocolMetadataReader(props.message.meta)
        if (!metadata.ok) return null
        return <UnlockProtocolInPost {...props} />
    },
    CompositionDialogMetadataBadgeRender: new Map([
        [pluginMetaKey, (meta: UnlockLockInMetadata) => 'An Unlock Protocol post has been added'],
    ]),
    CompositionDialogEntry: {
        label: (
            <>
                <Icons.Unlock size={16} />
                {pluginName}
            </>
        ),
        dialog: UnlockProtocolDialog,
    },
}

export default sns
