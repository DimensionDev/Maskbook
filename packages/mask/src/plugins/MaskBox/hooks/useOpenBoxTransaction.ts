import { useAccount } from '@masknet/web3-hooks-base'
import type { NonPayableTx } from '@masknet/web3-contracts/types/types'
import { FungibleToken, multipliedBy } from '@masknet/web3-shared-base'
import { NetworkPluginID } from '@masknet/shared-base'
import { ChainId, SchemaType } from '@masknet/web3-shared-evm'
import { useMemo } from 'react'
import { useMaskBoxContract } from './useMaskBoxContract.js'

export function useOpenBoxTransaction(
    boxId: string,
    amount: number,
    paymentTokenIndex: number,
    paymentTokenPrice: string,
    paymentTokenDetailed: FungibleToken<ChainId, SchemaType> | null,
    proof?: string,
    overrides?: NonPayableTx | null,
) {
    const account = useAccount(NetworkPluginID.PLUGIN_EVM)
    const maskBoxContract = useMaskBoxContract()
    return useMemo(() => {
        if (!boxId || amount <= 0 || !maskBoxContract) return
        return {
            config: {
                ...overrides,
                from: account,
                value:
                    paymentTokenDetailed?.schema === SchemaType.Native
                        ? multipliedBy(paymentTokenPrice, amount).toFixed()
                        : undefined,
            },
            method: maskBoxContract.methods.openBox(boxId, amount, paymentTokenIndex, proof ?? '0x00'),
        }
    }, [
        account,
        amount,
        boxId,
        maskBoxContract,
        paymentTokenIndex,
        paymentTokenPrice,
        paymentTokenDetailed,
        proof,
        overrides,
    ])
}
