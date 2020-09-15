import type { AbiItem } from 'web3-utils'
import { BigNumber } from 'bignumber.js'
import { EthereumAddress } from 'wallet.ts'
import { web3 } from './web3'
import ERC20ABI from '../../contracts/splitter/ERC20.json'
import BulkCheckoutABI from '../../contracts/bulk-checkout/BulkCheckout.json'
import BalanceCheckerABI from '../../contracts/balance-checker/BalanceChecker.json'
import type { Erc20 as ERC20 } from '../../contracts/splitter/ERC20'
import type { BulkCheckout } from '../../contracts/bulk-checkout/BulkCheckout'
import type { BalanceChecker } from '../../contracts/balance-checker/BalanceChecker'
import { sendTx, sendTxConfigForTxHash } from './transaction'
import { onWalletBalancesUpdated, BalanceMetadata } from './wallet'
import { getERC20Tokens } from '../../web3/tokens'
import { getChainId } from '../../extension/background-script/EthereumService'
import { getConstant } from '../../web3/constants'
import { isUSDT } from '../../web3/helpers'

const ETH_ADDRESS = getConstant('ETH_ADDRESS')

function createERC20Contract(address: string) {
    return (new web3.eth.Contract(ERC20ABI as AbiItem[], address) as unknown) as ERC20
}

export function createBulkCheckoutContract(address: string) {
    return (new web3.eth.Contract(BulkCheckoutABI as AbiItem[], address) as unknown) as BulkCheckout
}

function createBalanceCheckerContract(address: string) {
    return (new web3.eth.Contract(BalanceCheckerABI as AbiItem[], address) as unknown) as BalanceChecker
}

export const walletAPI = {
    async queryBalance(address: string): Promise<BigNumber> {
        const value = await web3.eth.getBalance(address)
        return new BigNumber(value)
    },

    transfer(ownerAddress: string, recipientAddress: string, amount: BigNumber) {
        return sendTxConfigForTxHash({
            from: ownerAddress,
            to: recipientAddress,
            gas: 21000,
            value: amount.toFixed(),
        })
    },
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
                    { from: ownerAddress },
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

export const balanceCheckerAPI = (() => {
    let idle = true

    // TODO:
    // polling the balance of those accounts in the background and update it silently
    const watchedAccounts = new Set<string>()

    async function getBalances(accounts: string[], tokens: string[]) {
        let balances: string[] = []
        if (!idle) return balances
        if (!accounts.length || !tokens.length) return balances
        try {
            idle = false
            balances = await createBalanceCheckerContract(getConstant('BALANCE_CHECKER_ADDRESS', await getChainId()))
                .methods.balances(accounts, tokens)
                .call()
        } catch (e) {
            balances = []
        } finally {
            idle = true
        }
        return balances
    }
    async function updateBalances(accounts: string[] = Array.from(watchedAccounts)) {
        const validAccounts = accounts.filter(EthereumAddress.isValid)
        if (!validAccounts.length) return
        const chainId = await getChainId()
        const tokens = [
            {
                address: ETH_ADDRESS,
                decimals: 18,
                name: 'Ether',
                symbol: 'ETH',
            },
            ...getERC20Tokens(chainId),
        ]
        const balances = await getBalances(
            validAccounts,
            tokens.map((x) => x.address),
        )
        const metadata: BalanceMetadata = balances.reduce((accumulate, balance, index) => {
            const accountAddress = validAccounts[Math.floor(index / tokens.length)]
            accumulate[accountAddress] = accumulate[accountAddress] ?? []
            const token = tokens[index % tokens.length]
            if (token)
                accumulate[accountAddress].push({
                    ...token,
                    chainId,
                    balance: new BigNumber(balance),
                })
            return accumulate
        }, {} as BalanceMetadata)
        onWalletBalancesUpdated(metadata)
    }

    return {
        getBalances,
        updateBalances,
        watchAccounts(accounts: string[]) {
            accounts.forEach((address) => {
                if (EthereumAddress.isValid(address)) watchedAccounts.add(address)
            })
        },
        unwatchAccounts(accounts: string[]) {
            accounts.forEach((address) => watchedAccounts.delete(address))
        },
    }
})()

export type TxHashID = { transactionHash: string }
export type DatabaseID = { databaseID: string }
