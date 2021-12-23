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
 * A callback for withdraw from vault
 * @param vault vault
 * @param amount
 
 */
export function useWithdrawCallback(vault: Vault, amount: string) {
    const chainId = useChainId()
    const account = useAccount()
    const wProvider = useWeb3Provider()
    //@ts-ignore
    const yearn = new Yearn(chainId, { provider: new JsonRpcProvider(wProvider.host) })
    //@ts-ignore
    const vaultInterface = new VaultInterface(yearn, chainId, yearn.context)

    const [withdrawState, setWithdrawState] = useTransactionState()

    const withdrawCallback = useCallback(async () => {
        const tx = await vaultInterface.withdraw(vault.address, vault.token, amount, account)
        // pre-step: start waiting for provider to confirm tx
        setWithdrawState({
            type: TransactionStateType.WAIT_FOR_CONFIRMING,
        })
        const txReceipt: TransactionReceipt = await tx.wait(4)

        if (txReceipt && txReceipt.blockNumber) {
            setWithdrawState({
                type: TransactionStateType.HASH,
                hash: txReceipt.transactionHash,
            })
        } else {
            setWithdrawState({
                type: TransactionStateType.FAILED,
                error: new Error('Withdraw Tx failed'),
            })
        }
    }, [vault, amount])

    const resetCallback = useCallback(() => {
        setWithdrawState({
            type: TransactionStateType.UNKNOWN,
        })
    }, [])

    return [withdrawState, withdrawCallback, resetCallback] as const
}
