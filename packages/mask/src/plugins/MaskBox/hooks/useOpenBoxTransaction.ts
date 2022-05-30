import { useMemo } from 'react'
import type { NonPayableTx } from '@masknet/web3-contracts/types/types'
import { FungibleToken, multipliedBy, NetworkPluginID } from '@masknet/web3-shared-base'
import { useAccount, useChainId } from '@masknet/plugin-infra/web3'
import { ChainId, SchemaType } from '@masknet/web3-shared-evm'
import { useMaskBoxContract } from './useMaskBoxContract'

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
    const chainId = useChainId(NetworkPluginID.PLUGIN_EVM)
    const maskBoxContract = useMaskBoxContract(chainId)
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
