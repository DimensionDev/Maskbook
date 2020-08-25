import React from 'react'
import type { PluginConfig } from '../plugin'
import type { PollMetaData } from './types'
import { readTypedMessageMetadata } from '../../extension/background-script/CryptoServices/utils'
import PollsInPost from './UI/PollsInPost'

export const PollsPluginDefine: PluginConfig = {
    pluginName: 'Poll',
    identifier: 'com.maskbook.poll',
    successDecryptionInspector: function Comp(props) {
        if (!readTypedMessageMetadata(props.message.meta, 'poll', {}).ok) return null
        console.log('11')
        return <PollsInPost {...props} />
    },
    postDialogMetadataBadge: new Map([
        ['poll', (meta: PollMetaData) => `a poll of '${meta.question}' from ${meta.sender}`],
    ]),
}
