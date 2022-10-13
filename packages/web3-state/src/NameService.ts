import type { Subscription } from 'use-subscription'
import { getEnumAsArray } from '@dimensiondev/kit'
import { StorageItem, NameServiceID } from '@masknet/shared-base'
import type { NameServiceState as Web3NameServiceState } from '@masknet/web3-shared-base'
import type { Plugin } from '@masknet/plugin-infra'

export interface NameServiceResolver {
    /** get address of domain name */
    lookup?: (domain: string) => Promise<string | undefined>
    /** get domain name of address */
    reverse?: (address: string) => Promise<string | undefined>
}

export class NameServiceState<
    ChainId extends number,
    DomainBook extends Record<string, string> = Record<string, string>,
    DomainBooks extends Record<NameServiceID, DomainBook> = Record<NameServiceID, DomainBook>,
> implements Web3NameServiceState<ChainId>
{
    protected storage: StorageItem<DomainBooks> = null!
    public domainBook?: Subscription<DomainBook>

    constructor(
        protected context: Plugin.Shared.SharedContext,
        protected resolver: NameServiceResolver,
        protected nameServiceID: NameServiceID,
        protected options: {
            isValidName(a: string): boolean
            isValidAddress(a: string): boolean
            formatAddress(a: string): string
        },
    ) {
        const defaultValue = Object.fromEntries(getEnumAsArray(NameServiceID).map((x) => [x.value, {}])) as DomainBooks
        const { storage } = context.createKVStorage('memory', {}).createSubScope('NameServiceV2', {
            value: defaultValue,
        })
        this.storage = storage.value
    }

    private async addName(address: string, name: string) {
        if (!this.options.isValidAddress(address)) return
        const all = this.storage.value
        const formattedAddress = this.options.formatAddress(address)
        await this.storage.setValue({
            ...all,
            [this.nameServiceID]: {
                ...all[this.nameServiceID],
                [formattedAddress]: name,
                [name]: formattedAddress,
            },
        })
    }

    private async addAddress(name: string, address: string) {
        if (!this.options.isValidAddress(address)) return
        const all = this.storage.value
        const formattedAddress = this.options.formatAddress(address)
        await this.storage.setValue({
            ...all,
            [this.nameServiceID]: {
                ...all[this.nameServiceID],
                [name]: formattedAddress,
                [formattedAddress]: name,
            },
        })
    }

    async lookup(name: string) {
        if (!name) return

        const address = this.storage.value[this.nameServiceID][name] || (await this.resolver.lookup?.(name))

        if (address && this.options.isValidAddress(address)) {
            const formattedAddress = this.options.formatAddress(address)
            await this.addAddress(name, formattedAddress)
            return formattedAddress
        }
        return
    }

    async reverse(address: string) {
        if (!this.options.isValidAddress(address)) return

        const name =
            this.storage.value[this.nameServiceID][this.options.formatAddress(address)] ||
            (await this.resolver.reverse?.(address))

        if (name) {
            await this.addName(address, name)
            return name
        }
        return
    }
}
