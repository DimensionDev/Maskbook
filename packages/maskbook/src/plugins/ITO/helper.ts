import { createRenderWithMetadata, createTypedMessageMetadataReader } from '../../protocols/typed-message/metadata'
import { createPluginMessage } from '../utils/createPluginMessage'
import { createPluginRPC } from '../utils/createPluginRPC'
import { ITOMetaKey, ITOPluginID } from './constants'
import type { ITOJSONPayload, ITORecord } from './types'
import schema from './schema.json'

export const ITOMetaDataReader = createTypedMessageMetadataReader<ITOJSONPayload>(ITOMetaKey, schema)
export const renderWithITOMetadata = createRenderWithMetadata(ITOMetaDataReader)

export function ITOCoparer(a: ITORecord | null, b: ITORecord | null) {
    if (!a || !b) {
        return false
    }
    return a.id === b.id && a.from === b.from
}

export function ITOArrayComparer(a: ITORecord[], b: ITORecord[]) {
    if (a.length !== b.length) {
        return false
    }
    return a.every((wallet, index) => ITOCoparer(wallet, b[index]))
}

export interface ITOMessages {
    ITOUpdated: void
    rpc: unknown
}

export const ITOMessage = createPluginMessage<ITOMessages>(ITOPluginID)
export const ITOPluginRPC = createPluginRPC(ITOPluginID, () => import('./services'), ITOMessage.event.rpc)
