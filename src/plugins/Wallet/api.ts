import type { AbiItem } from 'web3-utils'
import { BigNumber } from 'bignumber.js'
import { web3 } from './web3'
import ERC20ABI from '../../contracts/splitter/ERC20.json'
import BulkCheckoutABI from '../../contracts/bulk-checkout/BulkCheckout.json'
import type { Erc20 as ERC20 } from '../../contracts/splitter/ERC20'
import type { BulkCheckout } from '../../contracts/bulk-checkout/BulkCheckout'
import { sendTx } from './transaction'
import { isUSDT } from '../../web3/helpers'

function createERC20Contract(address: string) {
    return (new web3.eth.Contract(ERC20ABI as AbiItem[], address) as unknown) as ERC20
}

export function createBulkCheckoutContract(address: string) {
    return (new web3.eth.Contract(BulkCheckoutABI as AbiItem[], address) as unknown) as BulkCheckout
}

export const erc20API = {
    async balanceOf(address: string, erc20TokenAddress: string) {
        const erc20Contract = createERC20Contract(erc20TokenAddress)
        const value = await erc20Contract.methods.balanceOf(address).call()
        return new BigNumber(value)
    },

    async allowance(ownerAddress: string, spenderAddress: string, erc20TokenAddress: string) {
        const erc20Contract = createERC20Contract(erc20TokenAddress)
        const value = await erc20Contract.methods.allowance(ownerAddress, spenderAddress).call()
        return new BigNumber(value)
    },

    async approve(
        ownerAddress: string,
        spenderAddress: string,
        erc20TokenAddress: string,
        amount: BigNumber,
        receipt = false,
    ) {
        const erc20Contract = createERC20Contract(erc20TokenAddress)

        // check balance
        const balance = await erc20Contract.methods.balanceOf(ownerAddress).call()
        if (new BigNumber(balance).lt(amount)) throw new Error('You do not have enough tokens to complete donation.')

        // check allowance
        if (amount.gt(0)) {
            const allowance_ = await erc20Contract.methods.allowance(ownerAddress, spenderAddress).call()
            const allowance = new BigNumber(allowance_)

            // allowance is enough
            if (allowance.gte(amount)) {
                return Promise.resolve({
                    erc20_approve_transaction_hash: '',
                    erc20_approve_value: amount,
                })
            }
            // reset allowance to 0 for USDT
            if (allowance.gt(0) && isUSDT(erc20TokenAddress)) {
                await this.approve(ownerAddress, spenderAddress, erc20TokenAddress, new BigNumber(0), receipt)
            }
        }
        return new Promise<{ erc20_approve_transaction_hash: string; erc20_approve_value: BigNumber }>(
            (resolve, reject) => {
                let txHash = ''
                sendTx(
                    erc20Contract.methods.approve(spenderAddress, amount.toFixed()),
                    { from: ownerAddress, to: erc20Contract.options.address },
                    {
                        onTransactionHash(hash) {
                            txHash = hash
                        },
                        onReceipt() {
                            if (receipt) {
                                resolve({
                                    erc20_approve_transaction_hash: txHash,
                                    erc20_approve_value: amount,
                                })
                            }
                        },
                        onConfirmation() {
                            resolve({
                                erc20_approve_transaction_hash: txHash,
                                erc20_approve_value: amount,
                            })
                        },
                        onTransactionError: reject,
                        onEstimateError: reject,
                    },
                )
            },
        )
    },

    async transfer(
        ownerAddress: string,
        recipientAddress: string,
        erc20TokenAddress: string,
        amount: BigNumber,
        receipt = false,
    ) {
        const erc20Contract = createERC20Contract(erc20TokenAddress)

        // check balance
        const balance = await erc20Contract.methods.balanceOf(ownerAddress).call()
        if (new BigNumber(balance).lt(amount)) throw new Error('You do not have enough tokens to complete donation.')

        return new Promise<{ erc20_transfer_transaction_hash: string; erc20_transfer_value: BigNumber }>(
            (resolve, reject) => {
                let txHash = ''
                sendTx(
                    erc20Contract.methods.transfer(recipientAddress, amount.toFixed()),
                    {
                        from: ownerAddress,
                        to: erc20Contract.options.address,
                    },
                    {
                        onTransactionHash(hash) {
                            txHash = hash
                        },
                        onReceipt() {
                            if (receipt) {
                                resolve({
                                    erc20_transfer_transaction_hash: txHash,
                                    erc20_transfer_value: amount,
                                })
                            }
                        },
                        onConfirmation() {
                            resolve({
                                erc20_transfer_transaction_hash: txHash,
                                erc20_transfer_value: amount,
                            })
                        },
                        onTransactionError: reject,
                        onEstimateError: reject,
                    },
                )
            },
        )
    },
}

export type TxHashID = { transactionHash: string }
export type DatabaseID = { databaseID: string }
