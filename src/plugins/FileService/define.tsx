import { formatFileSize } from '@dimensiondev/kit'
import { truncate } from 'lodash-es'
import React from 'react'
import { createTypedMessageMetadataReader } from '../../protocols/typed-message/metadata'
import type { PluginConfig } from '../plugin'
import { identifier, META_KEY_1, pluginName } from './constants'
import { Preview } from './Preview'
import type { FileInfo } from './types'

export const FileInfoMetadataReader = createTypedMessageMetadataReader<FileInfo>(META_KEY_1)
export const FileServicePluginDefine: PluginConfig = {
    pluginName,
    identifier,
    successDecryptionInspector(props) {
        const metadata = FileInfoMetadataReader(props.message.meta)
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
