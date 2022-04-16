import type { CompositeSignatures, CurrentUserObject, MutateOptions } from '@blocto/fcl'
import type { Plugin } from '@masknet/plugin-infra'
import type { Web3Plugin } from '@masknet/plugin-infra/web3'
import { ChainId } from '@masknet/web3-shared-flow'
import { mapSubscription, StorageObject } from '@masknet/shared-base'
import { FlowRPC } from '../messages'

export interface ProtocolStorage {
    chainId: ChainId
    user: CurrentUserObject | null
}

export class Protocol
    implements Web3Plugin.ObjectCapabilities.ProtocolState<ChainId, CompositeSignatures[], MutateOptions>
{
    private storage: StorageObject<ProtocolStorage> = null!

    constructor(private context: Plugin.Shared.SharedContext) {
        const { storage } = context.createKVStorage('memory', {
            chainId: ChainId.Mainnet,
            user: null,
        })

        this.storage = storage
    }

    private createSubscriptionFromUser<T>(getter: (value: CurrentUserObject | null) => T) {
        return mapSubscription(this.storage.user.subscription, getter)
    }

    async getAccount() {
        return this.createSubscriptionFromUser((user) => user?.addr ?? '')
    }

    async getChainId() {
        return this.storage.chainId.value
    }

    async getLatestBlockNumber(chainId: ChainId) {
        const block = await FlowRPC.getBlock(chainId)
        return block.height
    }

    async getTransactionStatus(chainId: ChainId, id: string) {
        return FlowRPC.getTransactionStatus(chainId, id)
    }

    async signMessage(address: string, message: string) {
        return FlowRPC.signUserMessage(ChainId.Mainnet, message)
    }

    async verifyMessage(address: string, message: string, signature: CompositeSignatures[]) {
        return FlowRPC.verifyUserSignatures(ChainId.Mainnet, message, signature)
    }

    async sendTransaction(chainId: ChainId, options: MutateOptions) {
        return FlowRPC.sendTransaction(chainId, options)
    }

    async sendAndConfirmTransaction(chainId: ChainId, options: MutateOptions) {
        return FlowRPC.sendTransaction(chainId, options)
    }
}
