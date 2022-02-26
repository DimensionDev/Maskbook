import { EthereumMethodType, EthereumRpcType, isSameAddress, isZeroAddress } from '@masknet/web3-shared-evm'
import { WalletRPC } from '../../../../plugins/Wallet/messages'
import { getSendTransactionComputedPayload } from '../rpc'
import type { Context, Middleware } from '../types'

export class AddressBook implements Middleware<Context> {
    private getFrom(computedPayload: UnboxPromise<ReturnType<typeof getSendTransactionComputedPayload>>) {
        if (!computedPayload) return
        const tx = computedPayload?._tx
        return tx.from as string | undefined
    }
    private getTo(computedPayload: UnboxPromise<ReturnType<typeof getSendTransactionComputedPayload>>) {
        if (!computedPayload) return
        switch (computedPayload.type) {
            case EthereumRpcType.SEND_ETHER:
                return computedPayload._tx.to as string
            case EthereumRpcType.CONTRACT_INTERACTION:
                if (['transfer', 'transferFrom'].includes(computedPayload.name ?? ''))
                    return computedPayload.parameters?.to as string
        }
        return
    }

    async fn(context: Context, next: () => Promise<void>) {
        await next()

        if (context.method !== EthereumMethodType.ETH_SEND_TRANSACTION) return

        const computedPayload = await getSendTransactionComputedPayload(context.config)
        if (!computedPayload) return

        const from = this.getFrom(computedPayload)
        const to = this.getTo(computedPayload)

        if (!isSameAddress(from, to) && !isZeroAddress(to) && to) await WalletRPC.addAddress(context.chainId, to)
    }
}
