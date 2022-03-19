import Ens from 'ethjs-ens'
import { ChainId, createExternalProvider, isSameAddress, isValidAddress, isZeroAddress } from '@masknet/web3-shared-evm'
import { getMemory } from '../../storage'
import { EVM_RPC } from '../../messages'

const provider = createExternalProvider(EVM_RPC.request, () => ({
    chainId: ChainId.Mainnet,
}))
const ens = new Ens({
    provider,
    network: ChainId.Mainnet,
})

const ZERO_X_ERROR_ADDRESS = '0x'

export async function lookup(chainId: ChainId, domain: string) {
    if (chainId !== ChainId.Mainnet) return undefined

    // read from cache
    const domainAddressBook = getMemory().domainAddressBook.value
    const cacheAddress = domainAddressBook[chainId]?.[domain]
    if (cacheAddress && isValidAddress(cacheAddress)) return cacheAddress

    const address = await ens.lookup(domain)

    if (isZeroAddress(address) || isSameAddress(address, ZERO_X_ERROR_ADDRESS) || !isValidAddress(address)) {
        return undefined
    }

    if (address)
        await getMemory().domainAddressBook.setValue({
            ...domainAddressBook,
            [chainId]: {
                ...domainAddressBook[chainId],
                ...{ [address]: domain, [domain]: address },
            },
        })

    return address
}

export async function reverse(chainId: ChainId, address: string) {
    if (!isValidAddress(address)) return undefined
    if (chainId !== ChainId.Mainnet) return undefined

    // read from cache
    const domainAddressBook = getMemory().domainAddressBook.value
    const cacheDomain = domainAddressBook[chainId]?.[address]
    if (cacheDomain) return cacheDomain

    const domain = await ens.reverse(address)

    if (isZeroAddress(domain) || isSameAddress(domain, ZERO_X_ERROR_ADDRESS)) {
        return undefined
    }

    if (domain)
        await getMemory().domainAddressBook.setValue({
            ...domainAddressBook,
            [chainId]: {
                ...domainAddressBook[chainId],
                ...{ [address]: domain, [domain]: address },
            },
        })

    return domain
}
