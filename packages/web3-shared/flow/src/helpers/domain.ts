import { createLookupTableResolver } from '@masknet/web3-shared-base'
import { SchemaType } from '../types.js'

export function formatDomainName(domain?: string, size?: number) {
    return domain ?? ''
}

export const formatSchemaType = createLookupTableResolver<SchemaType, string>(
    {
        [SchemaType.Fungible]: 'Fungible',
        [SchemaType.NonFungible]: 'NonFungible',
    },
    '',
)

export function isValidDomain(domain?: string) {
    return false
}
