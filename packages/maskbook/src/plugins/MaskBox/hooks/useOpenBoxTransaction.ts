import { useMemo } from 'react'
import BigNumber from 'bignumber.js'
import { EthereumTokenType, useAccount, useTransactionCallback } from '@masknet/web3-shared'
import type { NonPayableTx } from '@masknet/web3-contracts/types/types'
import { useContainer } from 'unstated-next'
import { Context } from './useContext'
import { useMaskBoxContract } from './useMaskBoxContract'

export function useOpenBoxTransaction(boxId: string, amount: number, overrides?: NonPayableTx) {
    const account = useAccount()
    const maskBoxContract = useMaskBoxContract()
    const { paymentTokenIndex, paymentTokenPrice, paymentTokenDetailed } = useContainer(Context)
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
    }, [account, amount, boxId, maskBoxContract, paymentTokenIndex, paymentTokenPrice, paymentTokenDetailed])
}
