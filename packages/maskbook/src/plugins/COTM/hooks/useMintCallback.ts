import { useCallback, useEffect, useState } from 'react'
import { useTransactionReceipt } from '../../../web3/hooks/useTransaction'
import { TransactionStateType, useTransactionState } from '../../../web3/hooks/useTransactionState'
import { useCOTM_TokenContract } from '../contracts/useCOTM_TokenContract'
import { PluginCOTM } from '../messages'

export function useMintCallback(from: string) {
    const [txHash, setTxHash] = useState('')
    const [mintState, setMintState] = useTransactionState()
    const COTM_TokenContract = useCOTM_TokenContract()

    const mintCallback = useCallback(async () => {
        if (!COTM_TokenContract) {
            setMintState({
                type: TransactionStateType.UNKNOWN,
            })
            return
        }

        // pre-step: start waiting for provider to confirm tx
        setMintState({
            type: TransactionStateType.WAIT_FOR_CONFIRMING,
        })

        // step 1: check remaining
        const remaining = await COTM_TokenContract.methods.check_availability().call()
        if (Number.parseInt(remaining || '0', 10) <= 0) {
            setMintState({
                type: TransactionStateType.FAILED,
                error: new Error('There is none NTF token left.'),
            })
            return
        }

        // step 2: mint by server
        try {
            const { mint_transaction_hash } = await PluginCOTM.mintCOTM_Packet(from)
            setTxHash(mint_transaction_hash)
        } catch (error) {
            setMintState({
                type: TransactionStateType.FAILED,
                error,
            })
        }
    }, [from, COTM_TokenContract])

    const resetCallback = useCallback(() => {
        setMintState({
            type: TransactionStateType.UNKNOWN,
        })
    }, [])

    //#region tracking receipt
    const receipt = useTransactionReceipt(txHash)

    useEffect(() => {
        if (!receipt) return
        if (receipt.status)
            setMintState({
                type: TransactionStateType.CONFIRMED,
                no: 0,
                receipt,
            })
        else
            setMintState({
                type: TransactionStateType.FAILED,
                error: new Error('The contract execution was not successful, check your transaction.'),
            })
    }, [receipt])
    //#endregion

    return [mintState, mintCallback, resetCallback] as const
}
