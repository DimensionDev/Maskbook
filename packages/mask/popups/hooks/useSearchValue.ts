import { useAsyncRetry } from 'react-use'
import type { AsyncStateRetry } from 'react-use/lib/useAsyncRetry.js'
import { ECKeyIdentifier, NextIDPlatform } from '@masknet/shared-base'
import { ENS, Lens } from '@masknet/web3-providers'

export function useSearchValue(value: string, type?: NextIDPlatform): AsyncStateRetry<string> {
    return useAsyncRetry(async () => {
        if (!type) return ''
        if (value.length === 44) return new ECKeyIdentifier('secp256k1', value).publicKeyAsHex ?? value
        if (type === NextIDPlatform.Twitter) return value.replace(/^@/, '').toLowerCase()

        if (value.endsWith('.eth')) return (await ENS.lookup(value))?.toLowerCase()

        if (value.endsWith('.lens')) return (await Lens.getProfileByHandle(value)).ownedBy.address?.toLowerCase()

        return value.toLowerCase()
    }, [value])
}
