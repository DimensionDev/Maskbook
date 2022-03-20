import ENS from 'ethjs-ens'
import type { Web3Plugin } from '@masknet/plugin-infra'
import { ChainId, createExternalProvider, isSameAddress, isValidAddress, isZeroAddress } from '@masknet/web3-shared-evm'
import { EVM_RPC } from '../../../messages'

export class NameServiceState implements Web3Plugin.ObjectCapabilities.NameServiceState {
    private provider = createExternalProvider(EVM_RPC.request, () => ({
        chainId: ChainId.Mainnet,
    }))
    private ens = new ENS({
        provider: this.provider,
        network: ChainId.Mainnet,
    })

    static ZERO_X_ERROR_ADDRESS = '0x'

    private async getDomainAddressBook(chainId: ChainId, addressOrDomain: string) {
        const domainAddressBook = await EVM_RPC.getStorageValue('memory', 'domainAddressBook')
        return domainAddressBook[chainId]?.[addressOrDomain]
    }

    private async setDomainAddressBook(chainId: ChainId, addressOrDomain: string, domainOrAddress: string) {
        return EVM_RPC.setStorageValue('memory', 'domainAddressBook', {
            [chainId]: {
                [addressOrDomain]: domainOrAddress,
                [domainOrAddress]: addressOrDomain,
            },
        })
    }

    async lookup(chainId: ChainId, domain: string) {
        if (chainId !== ChainId.Mainnet) return

        const cachedAddress = await this.getDomainAddressBook(chainId, domain)
        if (cachedAddress && isValidAddress(cachedAddress)) return cachedAddress

        const address = await this.ens.lookup(domain)

        if (
            isZeroAddress(address) ||
            isSameAddress(address, NameServiceState.ZERO_X_ERROR_ADDRESS) ||
            !isValidAddress(address)
        )
            return

        if (address) await this.setDomainAddressBook(chainId, domain, address)

        return address
    }

    async reverse(chainId: ChainId, address: string) {
        if (chainId !== ChainId.Mainnet) return
        if (!isValidAddress(address)) return

        const cachedDomain = await this.getDomainAddressBook(chainId, address)
        if (cachedDomain) return cachedDomain

        const domain = await this.ens.reverse(address)

        if (isZeroAddress(domain) || isSameAddress(domain, NameServiceState.ZERO_X_ERROR_ADDRESS)) return

        if (domain) await this.setDomainAddressBook(chainId, address, domain)

        return domain
    }
}
