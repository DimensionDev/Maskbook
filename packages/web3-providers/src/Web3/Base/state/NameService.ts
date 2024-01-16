import { type StorageItem, type NameServiceID } from '@masknet/shared-base'
import { attemptUntil, type NameServiceState as Web3NameServiceState } from '@masknet/web3-shared-base'
import type { NameServiceAPI } from '../../../entry-types.js'

type DomainBook = Record<string, string>
type DomainBooks = Record<NameServiceID, DomainBook>
export abstract class NameServiceState implements Web3NameServiceState {
    constructor(
        private storage: StorageItem<DomainBooks>,
        private isValidAddress: (a: string) => boolean,
        private formatAddress: (a: string) => string,
    ) {}

    private async addName(id: NameServiceID, address: string, name: string) {
        if (!this.isValidAddress(address)) return
        const all = this.storage.value
        const formattedAddress = this.formatAddress(address)
        await this.storage.setValue({
            ...all,
            [id]: {
                ...all[id],
                [formattedAddress]: name,
                [name]: formattedAddress,
            },
        })
    }

    private async addAddress(id: NameServiceID, name: string, address: string) {
        if (!this.isValidAddress(address)) return
        const all = this.storage.value
        const formattedAddress = this.formatAddress(address)
        await this.storage.setValue({
            ...all,
            [id]: {
                ...all[id],
                [name]: formattedAddress,
                [formattedAddress]: name,
            },
        })
    }

    async lookup(name: string) {
        if (!name) return
        const callbacks = this.createResolvers().map((resolver) => {
            return async () => {
                const address = this.storage.value[resolver.id][name] || (await resolver.lookup(name))
                if (address && this.isValidAddress(address)) {
                    const formattedAddress = this.formatAddress(address)
                    await this.addAddress(resolver.id, name, formattedAddress)
                    return formattedAddress
                }
                return
            }
        })
        return attemptUntil(callbacks, undefined, () => false)
    }

    async reverse(address: string, domainOnly?: boolean) {
        if (!this.isValidAddress(address)) return
        const callbacks = this.createResolvers(domainOnly).map((resolver) => {
            return async () => {
                let name: string | undefined = this.storage.value[resolver.id][this.formatAddress(address)]
                if (!name) name = await resolver.reverse(address)
                if (name) {
                    await this.addName(resolver.id, address, name)
                    return name
                }
                return
            }
        })
        return attemptUntil(callbacks, undefined, (result) => !result)
    }

    async safeReverse(address: string, domainOnly?: boolean) {
        try {
            return await this.reverse(address, domainOnly)
        } catch {}
        return
    }

    abstract createResolvers(domainOnly?: boolean): NameServiceAPI.Provider[]
}
