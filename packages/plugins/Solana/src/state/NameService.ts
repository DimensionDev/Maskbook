import type { Plugin } from '@masknet/plugin-infra'
import { NameServiceState } from '@masknet/plugin-infra/web3'
import { performReverseLookup } from '@bonfida/spl-name-service'
import { ChainId, formatAddress, isValidAddress, isZeroAddress } from '@masknet/web3-shared-solana'
import { getHashedName, getNameAccountKey, NameRegistryState } from '@solana/spl-name-service'
import { Connection, PublicKey } from '@solana/web3.js'
import { NETWORK_ENDPOINTS, SOL_TLD_AUTHORITY } from '../constants'
import { getEnumAsArray } from '@dimensiondev/kit'
import type { Subscription } from 'use-subscription'

export class NameService extends NameServiceState<ChainId> {
    constructor(
        context: Plugin.Shared.SharedContext,
        subscriptions: {
            chainId?: Subscription<ChainId>
        },
    ) {
        super(
            context,
            getEnumAsArray(ChainId).map((x) => x.value),
            subscriptions,
            {
                isValidName: (x) => x !== '0x',
                isValidAddress: (x) => isValidAddress(x) && !isZeroAddress(x),
                formatAddress,
            },
        )
    }

    private async getKey(name: string) {
        const hashedName = await getHashedName(name)
        const domainKey = await getNameAccountKey(hashedName, undefined, SOL_TLD_AUTHORITY)
        return { domainKey, hashedName }
    }
    private connection(chainId: ChainId) {
        return new Connection(NETWORK_ENDPOINTS[chainId])
    }

    override async lookup(chainId: ChainId, name: string) {
        const { domainKey } = await this.getKey(name)
        const registry = await NameRegistryState.retrieve(this.connection(chainId), domainKey)
        return registry.owner.toBase58()
    }

    override async reverse(chainId: ChainId, owner: string) {
        const accountKey = new PublicKey(owner)
        return performReverseLookup(this.connection(chainId), accountKey)
    }
}
