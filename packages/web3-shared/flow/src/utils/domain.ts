import { getEnumAsArray } from '@dimensiondev/kit'
import { createLookupTableResolver } from '@masknet/shared-base'
import { isSameAddress } from '@masknet/web3-shared-base'
import { getTokenConstant, ZERO_ADDRESS } from '../constants'
import { ChainId, SchemaType } from '../types'

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

export function isValidDomain(domain: string) {
    return false
}

export function isZeroAddress(address?: string) {
    return isSameAddress(address, ZERO_ADDRESS)
}

export function isNativeTokenAddress(address?: string) {
    const set = new Set(getEnumAsArray(ChainId).map((x) => getTokenConstant(x.value, 'FLOW_ADDRESS')))
    return !!(address && set.has(address))
}
