import {
    ComputedPayload,
    EthereumMethodType,
    EthereumRpcType,
    EthereumTransactionConfig,
    isSameAddress,
    isZeroAddress,
} from '@masknet/web3-shared-evm'
import { PayloadComputer } from '../payload'
import type { Context, Middleware } from '../types'
import { Web3StateSettings } from '../../../settings'

export class AddressBook implements Middleware<Context> {
    private getFrom(computedPayload?: ComputedPayload) {
        if (!computedPayload) return
        return (computedPayload as { _tx?: EthereumTransactionConfig })?._tx?.from as string | undefined
    }

    private getTo(computedPayload?: ComputedPayload) {
        if (!computedPayload) return
        switch (computedPayload.type) {
            case EthereumRpcType.SEND_ETHER:
                return computedPayload._tx.to
            case EthereumRpcType.CONTRACT_INTERACTION:
                if (['transfer', 'transferFrom'].includes(computedPayload.name ?? ''))
                    return computedPayload.parameters?.to as string | undefined
        }
        return
    }

    async fn(context: Context, next: () => Promise<void>) {
        const { AddressBook } = Web3StateSettings.value

        await next()

        if (context.method !== EthereumMethodType.ETH_SEND_TRANSACTION) return

        try {
            const computer = new PayloadComputer(context.connection)
            const computedPayload = await computer.getSendTransactionComputedPayload(context.config)
            const from = this.getFrom(computedPayload)
            const to = this.getTo(computedPayload)

            if (!isSameAddress(from, to) && !isZeroAddress(to) && to) await AddressBook?.addAddress(context.chainId, to)
        } catch {
            // to scan the context for available recipient address, allow to fail silently.
        }
    }
}
