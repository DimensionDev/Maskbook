import type { Subscription } from 'use-subscription'
import { mapSubscription, mergeSubscription, StorageItem } from '@masknet/shared-base'
import type { NameServiceState as Web3NameServiceState } from '@masknet/web3-shared-base'
import type { Plugin } from '@masknet/plugin-infra'

export interface NameServiceResolver<ChainId> {
    /** get address of domain name */
    lookup?: (chainId: ChainId, domain: string) => Promise<string | undefined>
    /** get domain name of address */
    reverse?: (chainId: ChainId, address: string) => Promise<string | undefined>
}

export class NameServiceState<
    ChainId extends number,
    DomainBook extends Record<string, string> = Record<string, string>,
    DomainBooks extends Record<ChainId, DomainBook> = Record<ChainId, DomainBook>,
> implements Web3NameServiceState<ChainId>
{
    protected storage: StorageItem<DomainBooks> = null!
    public domainBook?: Subscription<DomainBook>

    constructor(
        protected context: Plugin.Shared.SharedContext,
        protected resolver: NameServiceResolver<ChainId>,
        protected chainIds: ChainId[],
        protected subscriptions: {
            chainId?: Subscription<ChainId>
        },
        protected options: {
            isValidName(a: string): boolean
            isValidAddress(a: string): boolean
            formatAddress(a: string): string
        },
    ) {
        const defaultValue = Object.fromEntries(chainIds.map((x) => [x, {}])) as DomainBooks
        const { storage } = context.createKVStorage('memory', {}).createSubScope('NameService', {
            value: defaultValue,
        })
        this.storage = storage.value

        if (this.subscriptions.chainId) {
            this.domainBook = mapSubscription(
                mergeSubscription(this.subscriptions.chainId, this.storage.subscription),
                ([chainId, domainBook]) => domainBook[chainId],
            )
        }
    }

    private async addName(chainId: ChainId, address: string, name: string) {
        if (!this.options.isValidAddress(address)) return
        const all = this.storage.value
        const formattedAddress = this.options.formatAddress(address)
        await this.storage.setValue({
            ...all,
            [chainId]: {
                ...all[chainId],
                [formattedAddress]: name,
                [name]: formattedAddress,
            },
        })
    }

    private async addAddress(chainId: ChainId, name: string, address: string) {
        if (!this.options.isValidAddress(address)) return
        const all = this.storage.value
        const formattedAddress = this.options.formatAddress(address)
        await this.storage.setValue({
            ...all,
            [chainId]: {
                ...all[chainId],
                [name]: formattedAddress,
                [formattedAddress]: name,
            },
        })
    }

    async lookup(chainId: ChainId, name: string) {
        if (!name) return

        const address = this.storage.value[chainId][name] || (await this.resolver.lookup?.(chainId, name))

        if (address && this.options.isValidAddress(address)) {
            const formattedAddress = this.options.formatAddress(address)
            await this.addAddress(chainId, name, formattedAddress)
            return formattedAddress
        }
        return
    }

    async reverse(chainId: ChainId, address: string) {
        if (!this.options.isValidAddress(address)) return

        const name =
            this.storage.value[chainId][this.options.formatAddress(address)] ||
            (await this.resolver.reverse?.(chainId, address))

        if (name) {
            await this.addName(chainId, address, name)
            return name
        }
        return
    }
}
