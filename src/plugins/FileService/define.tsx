import React from 'react'
import type { PluginConfig } from '../plugin'
import { identifier, META_KEY_1, pluginName } from './constants'
import type { FileInfo } from './hooks/Exchange'
import { readTypedMessageMetadata } from '../../extension/background-script/CryptoServices/utils'

export const FileServicePluginDefine: PluginConfig = {
    pluginName,
    identifier,
    successDecryptionInspector(props) {
        const metadata = readTypedMessageMetadata(props.message.meta, META_KEY_1)
        if (!metadata.ok) return null
        return <>{JSON.stringify(metadata.val)}</>
    },
    postDialogMetadataBadge: new Map([
        [
            META_KEY_1,
            (payload: FileInfo) => {
                return payload.name
            },
        ],
    ]),
}
