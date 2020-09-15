import { BigNumber } from 'bignumber.js'
import type { DonateResult } from './types'
import { sendTx } from '../Wallet/transaction'
import { createBulkCheckoutContract } from '../Wallet/api'
import { getConstant } from '../../web3/constants'
import { getChainId } from '../../extension/background-script/EthereumService'

const GITCOIN_ETH_ADDRESS = getConstant('GITCOIN_ETH_ADDRESS')

export const gitcoinAPI = {
    /**
     * Bulk checkout donation
     * @param donorAddress The account address of donor
     * @param maintainerAddress The account address of gitcoin maintainer
     * @param donationAddress The account address of project owner
     * @param donationTotal The total amount of donation value
     * @param erc20Address An optional ERC20 contract address when donate with ERC20 token
     * @param tipPercentage For each donation of gitcoin grant, a small tip will be transferred to the gitcoin maintainer's account
     */
    async donate(
        donorAddress: string,
        maintainerAddress: string,
        donationAddress: string,
        donationTotal: BigNumber,
        erc20Address?: string,
        tipPercentage: number = 5,
        receipt = false,
    ) {
        const tipAmount = new BigNumber(tipPercentage / 100).multipliedBy(donationTotal)
        const grantAmount = donationTotal.minus(tipAmount)

        // validate tip percentage
        if (tipPercentage < 0 || tipPercentage > 99)
            throw new Error('Gitcoin contribution amount must be between 0% and 99%')

        // validate amount
        if (!grantAmount.isPositive()) throw new Error('Cannot have negative donation amounts')

        const contract = createBulkCheckoutContract(getConstant('BULK_CHECKOUT_ADDRESS', await getChainId()))
        const donations: {
            token: string
            amount: BigNumber
            dest: string
        }[] = [
            {
                token: erc20Address ?? GITCOIN_ETH_ADDRESS,
                amount: tipAmount,
                dest: maintainerAddress,
            },
            {
                token: erc20Address ?? GITCOIN_ETH_ADDRESS,
                amount: grantAmount,
                dest: donationAddress,
            },
        ]
        return new Promise<DonateResult>((resolve, reject) => {
            let txHash = ''
            sendTx(
                contract.methods.donate(
                    donations.map((x) => ({
                        ...x,
                        amount: x.amount.toFixed(),
                    })),
                ),
                {
                    from: donorAddress,
                    value: donations
                        .reduce(
                            (accumulator: BigNumber, { token, amount }) =>
                                accumulator.plus(token === GITCOIN_ETH_ADDRESS ? amount : 0),
                            new BigNumber(0),
                        )
                        .toFixed(),
                },
                {
                    onTransactionHash(hash) {
                        txHash = hash
                    },
                    onReceipt() {
                        if (receipt) {
                            resolve({
                                donation_transaction_hash: txHash,
                                donation_value: donationTotal,
                            })
                        }
                    },
                    onConfirmation() {
                        resolve({
                            donation_transaction_hash: txHash,
                            donation_value: donationTotal,
                        })
                    },
                    onTransactionError: reject,
                    onEstimateError: reject,
                },
            ).catch(reject)
        })
    },
}
