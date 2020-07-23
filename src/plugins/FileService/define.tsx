import React from 'react'
import { truncate } from 'lodash-es'
import type { PluginConfig } from '../plugin'
import { identifier, META_KEY_1, pluginName } from './constants'
import type { FileInfo } from './hooks/Exchange'
import { readTypedMessageMetadata } from '../../extension/background-script/CryptoServices/utils'
import { formatFileSize } from './utils'
import { Preview } from './Preview'

export const FileServicePluginDefine: PluginConfig = {
    pluginName,
    identifier,
    successDecryptionInspector(props) {
        const metadata = readTypedMessageMetadata(props.message.meta, META_KEY_1)
        if (!metadata.ok) return null
        return <Preview info={metadata.val} />
    },
    postDialogMetadataBadge: new Map([
        [
            META_KEY_1,
            (payload: FileInfo) => {
                const name = truncate(payload.name, { length: 10 })
                return `Attached File: ${name} (${formatFileSize(payload.size)})`
            },
        ],
    ]),
}
