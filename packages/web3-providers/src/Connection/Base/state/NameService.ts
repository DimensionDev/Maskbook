import type { Subscription } from 'use-subscription'
import { getEnumAsArray } from '@masknet/kit'
import type { Plugin } from '@masknet/plugin-infra'
import { type StorageItem, NameServiceID } from '@masknet/shared-base'
import type { NameServiceAPI } from '@masknet/web3-providers/types'
import { attemptUntil, type NameServiceState as Web3NameServiceState } from '@masknet/web3-shared-base'

export class NameServiceState<
    ChainId extends number,
    DomainBook extends Record<string, string> = Record<string, string>,
    DomainBooks extends Record<NameServiceID, DomainBook> = Record<NameServiceID, DomainBook>,
> implements Web3NameServiceState<ChainId>
{
    public storage: StorageItem<DomainBooks> = null!
    public domainBook?: Subscription<DomainBook>

    constructor(
        protected context: Plugin.Shared.SharedUIContext,
        protected options: {
            isValidName(a: string): boolean
            isValidAddress(a: string): boolean
            formatAddress(a: string): string
        },
    ) {
        const { storage } = context.createKVStorage('memory', {}).createSubScope('NameServiceV2', {
            value: Object.fromEntries(getEnumAsArray(NameServiceID).map((x) => [x.value, {}])) as DomainBooks,
        })
        this.storage = storage.value
    }

    get ready() {
        return this.storage.initialized
    }

    get readyPromise() {
        return this.storage.initializedPromise
    }

    private async addName(id: NameServiceID, address: string, name: string) {
        if (!this.options.isValidAddress(address)) return
        const all = this.storage.value
        const formattedAddress = this.options.formatAddress(address)
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
        if (!this.options.isValidAddress(address)) return
        const all = this.storage.value
        const formattedAddress = this.options.formatAddress(address)
        await this.storage.setValue({
            ...all,
            [id]: {
                ...all[id],
                [name]: formattedAddress,
                [formattedAddress]: name,
            },
        })
    }

    async lookup(chainId: ChainId, name: string) {
        if (!name) return
        const callbacks = this.createResolvers(chainId).map((resolver) => {
            return async () => {
                const address = this.storage.value[resolver.id][name] || (await resolver.lookup?.(name))
                if (address && this.options.isValidAddress(address)) {
                    const formattedAddress = this.options.formatAddress(address)
                    await this.addAddress(resolver.id, name, formattedAddress)
                    return formattedAddress
                }
                return
            }
        })
        return attemptUntil(callbacks, undefined, () => false)
    }

    async reverse(chainId: ChainId, address: string) {
        if (!this.options.isValidAddress(address)) return
        const callbacks = this.createResolvers(chainId).map((resolver) => {
            return async () => {
                const name =
                    this.storage.value[resolver.id][this.options.formatAddress(address)] ||
                    (await resolver.reverse?.(address))
                if (name) {
                    await this.addName(resolver.id, address, name)
                    return name
                }
                return
            }
        })
        return attemptUntil(callbacks, undefined, () => false)
    }

    createResolvers(chainId: ChainId): NameServiceAPI.Provider[] {
        throw new Error('Method not implemented.')
    }
}
