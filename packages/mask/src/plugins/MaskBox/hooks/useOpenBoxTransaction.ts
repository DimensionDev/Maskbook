import { useMemo } from 'react'
import type { NonPayableTx } from '@masknet/web3-contracts/types/types'
import { SchemaType, FungibleTokenDetailed, useAccount } from '@masknet/web3-shared-evm'
import { useMaskBoxContract } from './useMaskBoxContract'
import { multipliedBy } from '@masknet/web3-shared-base'

export function useOpenBoxTransaction(
    boxId: string,
    amount: number,
    paymentTokenIndex: number,
    paymentTokenPrice: string,
    paymentTokenDetailed: FungibleTokenDetailed | null,
    proof?: string,
    overrides?: NonPayableTx | null,
) {
    const account = useAccount()
    const maskBoxContract = useMaskBoxContract()
    return useMemo(() => {
        if (!boxId || amount <= 0 || !maskBoxContract) return
        return {
            config: {
                ...overrides,
                from: account,
                value:
                    paymentTokenDetailed?.type === SchemaType.Native
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
