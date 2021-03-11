import { useCallback, useMemo } from 'react'
import { BigNumber, PayableOverrides } from 'ethers'
import { ERC20TokenDetailed, EthereumTokenType, EtherTokenDetailed, StageType } from '../../../web3/types'
import { useConstant } from '../../../web3/hooks/useConstant'
import { GITCOIN_CONSTANT } from '../constants'
import { TransactionStateType, useTransactionState } from '../../../web3/hooks/useTransactionState'
import { useBulkCheckoutContract } from '../contracts/useBulkCheckoutWallet'
import { useAccount } from '../../../web3/hooks/useAccount'
import { watchTransaction } from '../../../web3/helpers/transaction'

/**
 * A callback for donate gitcoin grant
 * @param address the donor address
 * @param amount
 * @param token
 */
export function useDonateCallback(address: string, amount: string, token?: EtherTokenDetailed | ERC20TokenDetailed) {
    const GITCOIN_ETH_ADDRESS = useConstant(GITCOIN_CONSTANT, 'GITCOIN_ETH_ADDRESS')
    const GITCOIN_TIP_PERCENTAGE = useConstant(GITCOIN_CONSTANT, 'GITCOIN_TIP_PERCENTAGE')
    const bulkCheckoutContract = useBulkCheckoutContract()

    const account = useAccount()
    const [donateState, setDonateState] = useTransactionState()

    const donations = useMemo(() => {
        const tipAmount = BigNumber.from(GITCOIN_TIP_PERCENTAGE).mul(amount).div(100)
        const grantAmount = BigNumber.from(amount).sub(tipAmount)
        if (!address || !token) return []
        return [
            {
                token: token.type === EthereumTokenType.Ether ? GITCOIN_ETH_ADDRESS : token.address,
                amount: tipAmount.toString(),
                dest: address,
            },
            {
                token: token.type === EthereumTokenType.Ether ? GITCOIN_ETH_ADDRESS : token.address,
                amount: grantAmount.toString(),
                dest: address,
            },
        ].filter((x) => x.amount !== '0')
    }, [address, amount, token])

    const donateCallback = useCallback(async () => {
        if (!token || !bulkCheckoutContract || donations.length === 0) {
            setDonateState({
                type: TransactionStateType.UNKNOWN,
            })
            return
        }

        // pre-step: start waiting for provider to confirm tx
        setDonateState({
            type: TransactionStateType.WAIT_FOR_CONFIRMING,
        })

        // step 1: estimate gas
        const overrides: PayableOverrides = {
            value: BigNumber.from(token.type === EthereumTokenType.Ether ? amount : 0),
        }
        const estimatedGas = await bulkCheckoutContract.estimateGas.donate(donations, overrides).catch((error) => {
            setDonateState({
                type: TransactionStateType.FAILED,
                error,
            })
            throw error
        })

        // step 2: blocking
        return new Promise<string>(async (resolve, reject) => {
            const transaction = await bulkCheckoutContract.donate(donations, {
                ...overrides,
                gasLimit: estimatedGas,
            })
            for await (const stage of watchTransaction(account, transaction)) {
                switch (stage.type) {
                    case StageType.TRANSACTION_HASH:
                        setDonateState({
                            type: TransactionStateType.HASH,
                            hash: stage.hash,
                        })
                        resolve(stage.hash)
                        return
                    case StageType.RECEIPT:
                    case StageType.CONFIRMATION:
                        setDonateState({
                            type: TransactionStateType.HASH,
                            hash: stage.receipt.transactionHash,
                        })
                        resolve(stage.receipt.transactionHash)
                        return
                    case StageType.ERROR:
                        setDonateState({
                            type: TransactionStateType.FAILED,
                            error: stage.error,
                        })
                        reject(stage.error)
                        return
                }
            }
        })
    }, [address, account, amount, token, donations])

    const resetCallback = useCallback(() => {
        setDonateState({
            type: TransactionStateType.UNKNOWN,
        })
    }, [])

    return [donateState, donateCallback, resetCallback] as const
}
