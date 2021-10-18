import { useMemo } from 'react'
import BigNumber from 'bignumber.js'
import type { NonPayableTx } from '@masknet/web3-contracts/types/types'
import { EthereumTokenType, FungibleTokenDetailed, useAccount } from '@masknet/web3-shared-evm'
import { useMaskBoxContract } from './useMaskBoxContract'

export function useOpenBoxTransaction(
    boxId: string,
    amount: number,
    paymentTokenIndex: number,
    paymentTokenPrice: string,
    paymentTokenDetailed: FungibleTokenDetailed | null,
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
                    paymentTokenDetailed?.type === EthereumTokenType.Native
                        ? new BigNumber(paymentTokenPrice).multipliedBy(amount).toFixed()
                        : undefined,
            },
            method: maskBoxContract.methods.openBox(boxId, amount, paymentTokenIndex, '0x0'),
        }
    }, [account, amount, boxId, maskBoxContract, paymentTokenIndex, paymentTokenPrice, paymentTokenDetailed, overrides])
}
