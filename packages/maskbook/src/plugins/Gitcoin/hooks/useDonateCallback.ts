import { useCallback, useMemo } from 'react'
import BigNumber from 'bignumber.js'
import type { PayableTx } from '@dimensiondev/contracts/types/types'
import { NativeTokenDetailed, ERC20TokenDetailed, EthereumTokenType, TransactionEventType } from '../../../web3/types'
import { useConstant } from '../../../web3/hooks/useConstant'
import { GITCOIN_CONSTANT } from '../constants'
import { TransactionStateType, useTransactionState } from '../../../web3/hooks/useTransactionState'
import { useBulkCheckoutContract } from '../contracts/useBulkCheckoutWallet'
import { useAccount } from '../../../web3/hooks/useAccount'
import Services from '../../../extension/service'

/**
 * A callback for donate gitcoin grant
 * @param address the donor address
 * @param amount
 * @param token
 */
export function useDonateCallback(address: string, amount: string, token?: NativeTokenDetailed | ERC20TokenDetailed) {
    const GITCOIN_ETH_ADDRESS = useConstant(GITCOIN_CONSTANT, 'GITCOIN_ETH_ADDRESS')
    const GITCOIN_TIP_PERCENTAGE = useConstant(GITCOIN_CONSTANT, 'GITCOIN_TIP_PERCENTAGE')
    const bulkCheckoutContract = useBulkCheckoutContract()

    const account = useAccount()
    const [donateState, setDonateState] = useTransactionState()

    const donations = useMemo(() => {
        const tipAmount = new BigNumber(GITCOIN_TIP_PERCENTAGE / 100).multipliedBy(amount)
        const grantAmount = new BigNumber(amount).minus(tipAmount)
        if (!address || !token) return []
        return [
            [
                token.type === EthereumTokenType.Native ? GITCOIN_ETH_ADDRESS : token.address, // token
                tipAmount.toFixed(), // amount
                address, // dest
            ],
            [
                token.type === EthereumTokenType.Native ? GITCOIN_ETH_ADDRESS : token.address, // token
                grantAmount.toFixed(), // amount
                address, // dest
            ],
        ] as [string, string, string][]
    }, [address, amount, token])

    const donateCallback = useCallback(async () => {
        if (!token || !bulkCheckoutContract || !donations.length) {
            setDonateState({
                type: TransactionStateType.UNKNOWN,
            })
            return
        }

        // start waiting for provider to confirm tx
        setDonateState({
            type: TransactionStateType.WAIT_FOR_CONFIRMING,
        })

        // estimate gas and compose transaction
        const config = await Services.Ethereum.composeTransaction({
            from: account,
            to: bulkCheckoutContract.options.address,
            value: new BigNumber(token.type === EthereumTokenType.Native ? amount : 0).toFixed(),
            data: bulkCheckoutContract.methods.donate(donations).encodeABI(),
        }).catch((error) => {
            setDonateState({
                type: TransactionStateType.FAILED,
                error,
            })
            throw error
        })

        // send transaction and wait for hash
        return new Promise<string>((resolve, reject) => {
            bulkCheckoutContract.methods
                .donate(donations)
                .send(config as PayableTx)
                .on(TransactionEventType.TRANSACTION_HASH, (hash) => {
                    setDonateState({
                        type: TransactionStateType.HASH,
                        hash,
                    })
                    resolve(hash)
                })
                .on(TransactionEventType.ERROR, (error) => {
                    setDonateState({
                        type: TransactionStateType.FAILED,
                        error,
                    })
                    reject(error)
                })
        })
    }, [account, amount, token, donations])

    const resetCallback = useCallback(() => {
        setDonateState({
            type: TransactionStateType.UNKNOWN,
        })
    }, [])

    return [donateState, donateCallback, resetCallback] as const
}
