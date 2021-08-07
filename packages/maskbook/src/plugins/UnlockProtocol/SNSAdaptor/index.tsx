import type { Plugin } from '@masknet/plugin-infra'
import { base } from '../base'
import { pluginIcon, pluginMetaKey, pluginName } from '../constants'
import type { UnlockLockInMetadata } from '../types'
import { UnlockProtocolMetadataReader } from '../helpers'
import UnlockProtocolDialog from './UnlockProtocolDialog'
import UnlockProtocolInPost from './UnlockProtocolInPost'

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
    CompositionDialogEntry: { label: pluginIcon + ' ' + pluginName, dialog: UnlockProtocolDialog },
}

export default sns
