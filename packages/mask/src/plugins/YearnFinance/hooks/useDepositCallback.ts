import { useCallback } from 'react'
import {
    useAccount,
    useTransactionState,
    TransactionStateType,
    useChainId,
    useWeb3Provider,
} from '@masknet/web3-shared-evm'

import { VaultInterface, Vault, Yearn } from '@yfi/sdk'
import { JsonRpcProvider, TransactionReceipt } from '@ethersproject/providers'

/**
 * A callback for deposit into vault
 * @param vault Vault
 * @param amount
 */
export function useDepositCallback(vault: Vault, amount: string) {
    const chainId = useChainId()
    const account = useAccount()
    const wProvider = useWeb3Provider()
    //@ts-ignore
    const yearn = new Yearn(chainId, { provider: new JsonRpcProvider(wProvider.host) })
    //@ts-ignore
    const vaultInterface = new VaultInterface(yearn, chainId, yearn.context)

    const [depositState, setDepositState] = useTransactionState()

    const depositCallback = useCallback(async () => {
        const tx = await vaultInterface.deposit(vault.address, vault.token, amount, account)
        // pre-step: start waiting for provider to confirm tx
        setDepositState({
            type: TransactionStateType.WAIT_FOR_CONFIRMING,
        })
        const txReceipt: TransactionReceipt = await tx.wait(4)

        if (txReceipt?.blockNumber) {
            setDepositState({
                type: TransactionStateType.HASH,
                hash: txReceipt.transactionHash,
            })
        } else {
            setDepositState({
                type: TransactionStateType.FAILED,
                error: new Error('Deposit Tx failed'),
            })
        }
    }, [vault, amount])

    const resetCallback = useCallback(() => {
        setDepositState({
            type: TransactionStateType.UNKNOWN,
        })
    }, [])

    return [depositState, depositCallback, resetCallback] as const
}
