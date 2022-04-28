import type { PayableTx } from '@masknet/web3-contracts/types/types'
import { toFixed } from '@masknet/web3-shared-base'
import {
    EthereumTokenType,
    FungibleTokenDetailed,
    TransactionEventType,
    useAccount,
    useGitcoinConstants,
} from '@masknet/web3-shared-evm'
import BigNumber from 'bignumber.js'
import { useCallback, useMemo, useState } from 'react'
import { useBulkCheckoutContract } from '../contracts/useBulkCheckoutWallet'

/**
 * A callback for donate gitcoin grant
 * @param address the donor address
 * @param amount
 * @param token
 */
export function useDonateCallback(address: string, amount: string, token?: FungibleTokenDetailed) {
    const { GITCOIN_ETH_ADDRESS, GITCOIN_TIP_PERCENTAGE } = useGitcoinConstants()
    const bulkCheckoutContract = useBulkCheckoutContract()

    const account = useAccount()

    const [loading, setLoading] = useState(false)
    const donations = useMemo((): [string, string, string][] => {
        if (!address || !token) return []
        if (!GITCOIN_ETH_ADDRESS || !GITCOIN_TIP_PERCENTAGE) return []
        const tipAmount = new BigNumber(GITCOIN_TIP_PERCENTAGE / 100).multipliedBy(amount)
        const grantAmount = new BigNumber(amount).minus(tipAmount)
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
        ]
    }, [address, amount, token])

    const donateCallback = useCallback(async () => {
        if (!token || !bulkCheckoutContract || !donations.length) {
            return
        }

        // estimate gas and compose transaction
        const value = toFixed(token.type === EthereumTokenType.Native ? amount : 0)
        setLoading(true)
        const config = {
            from: account,
            gas: await bulkCheckoutContract.methods
                .donate(donations)
                .estimateGas({
                    from: account,
                    value,
                })
                .catch((error) => {
                    throw error
                }),
            value,
        }

        // send transaction and wait for hash
        return new Promise<string>((resolve, reject) => {
            bulkCheckoutContract.methods
                .donate(donations)
                .send(config as PayableTx)
                .on(TransactionEventType.CONFIRMATION, (_, receipt) => {
                    resolve(receipt.transactionHash)
                })
                .on(TransactionEventType.ERROR, (error) => {
                    reject(error)
                })
        }).finally(() => setLoading(false))
    }, [account, amount, token, donations])

    return [loading, donateCallback] as const
}
