import * as jwt from 'jsonwebtoken'
import type { AbiItem } from 'web3-utils'
import { BigNumber } from 'bignumber.js'
import { EthereumAddress } from 'wallet.ts'
import { web3 } from './web3'
import { onClaimResult, onCreationResult, onExpired, onRefundResult } from './red-packet-fsm'
import HappyRedPacketABI from './contracts/happy-red-packet/HappyRedPacket.json'
import ERC20ABI from './contracts/splitter/ERC20.json'
import BulkCheckoutABI from './contracts/bulk-checkout/BulkCheckout.json'
import BalanceCheckerABI from './contracts/balance-checker/BalanceChecker.json'
import type { Erc20 as ERC20 } from './contracts/splitter/ERC20'
import type { BulkCheckout } from './contracts/bulk-checkout/BulkCheckout'
import type { HappyRedPacket } from './contracts/happy-red-packet/HappyRedPacket'
import type { BalanceChecker } from './contracts/balance-checker/BalanceChecker'
import type { CheckRedPacketAvailabilityResult, CreateRedPacketResult, DonateResult } from './types'
import { EthereumTokenType, EthereumNetwork, RedPacketJSONPayload } from './database/types'
import { asyncTimes, pollingTask } from '../../utils/utils'
import { sendTx, sendTxConfigForTxHash } from './tx'
import { getNetworkSettings, getNetworkERC20Tokens } from './UI/Developer/EthereumNetworkSettings'
import { GITCOIN_ETH_ADDRESS, isUSDT, ETH_ADDRESS, ERC20Token } from './token'
import { createRedPacketTransaction } from './createRedPacketTransaction'
import { onWalletBalancesUpdated, BalanceMetadata } from './wallet'

function createRedPacketContract(address: string) {
    return (new web3.eth.Contract(HappyRedPacketABI as AbiItem[], address) as unknown) as HappyRedPacket
}

function createERC20Contract(address: string) {
    return (new web3.eth.Contract(ERC20ABI as AbiItem[], address) as unknown) as ERC20
}

function createBulkCheckoutContract(address: string) {
    return (new web3.eth.Contract(BulkCheckoutABI as AbiItem[], address) as unknown) as BulkCheckout
}

function createBalanceCheckerContract(address: string) {
    return (new web3.eth.Contract(BalanceCheckerABI as AbiItem[], address) as unknown) as BalanceChecker
}

export const redPacketAPI = {
    dataSource: 'real' as const,
    async claimByServer(
        requestSenderAddress: string,
        privateKey: Buffer,
        payload: RedPacketJSONPayload,
    ): Promise<{ claim_transaction_hash: string }> {
        const host = 'https://redpacket.gives'
        const x = 'a3323cd1-fa42-44cd-b053-e474365ab3da'

        let network
        if (getNetworkSettings().networkType === EthereumNetwork.Rinkeby) network = 'rinkeby'
        else if (getNetworkSettings().networkType === EthereumNetwork.Mainnet) network = 'mainnet'
        else if (getNetworkSettings().networkType === EthereumNetwork.Ropsten) network = 'ropsten'

        const auth = await fetch(`${host}/hi?id=${requestSenderAddress}&network=${network}`)
        if (!auth.ok) throw new Error('Auth failed')
        const verify = await auth.text()

        const jwt_encoded: {
            password: string
            recipient: string
            redpacket_id: string
            validation: string
            signature: string
        } = {
            password: payload.password,
            recipient: requestSenderAddress,
            redpacket_id: payload.rpid,
            validation: web3.utils.sha3(requestSenderAddress)!,
            signature: web3.eth.accounts.sign(verify, `0x${privateKey.toString('hex')}`).signature,
        }
        const pay = await fetch(
            `${host}/please?payload=${jwt.sign(jwt_encoded, x, { algorithm: 'HS256' })}&network=${network}`,
        )
        if (!pay.ok) throw new Error('Pay failed')
        return { claim_transaction_hash: await pay.text() }
    },
    /**
     *
     * @param hash_of_password Password
     * @param quantity Quantity of red packets
     * @param is_random Is the random valid
     * @param duration Red packet valid duration (default(0): 24h), unit: second
     * @param seed Random seed 32bit byte
     * @param message Message in the red packet
     * @param name Name of the red packet sender
     * @param token_type 0 - ETH, 1 - ERC20
     * @param token_addr Addr of ERC20 token
     * @param total_tokens Amount of tokens
     * @returns The transaction hash
     */
    async create(
        ____sender__addr: string,
        hash_of_password: string,
        quantity: number,
        isRandom: boolean,
        duration: number,
        seed: string,
        message: string,
        name: string,
        token_type: EthereumTokenType,
        token_addr: string,
        total_tokens: BigNumber,
        receipt = false,
    ): Promise<CreateRedPacketResult> {
        const contract = createRedPacketContract(getNetworkSettings().happyRedPacketContractAddress)
        return new Promise((resolve, reject) => {
            let txHash = ''
            sendTx(
                contract.methods.create_red_packet(
                    hash_of_password,
                    quantity,
                    isRandom,
                    duration,
                    seed,
                    message,
                    name,
                    token_type,
                    token_addr,
                    total_tokens.toString(),
                ),
                {
                    from: ____sender__addr,
                    value: token_type === EthereumTokenType.ETH ? total_tokens.toString() : undefined,
                },
                {
                    onTransactionHash(hash) {
                        txHash = hash
                    },
                    async onReceipt() {
                        if (receipt) {
                            resolve({
                                create_nonce: (await web3.eth.getTransaction(txHash)).nonce,
                                create_transaction_hash: txHash,
                            })
                        }
                    },
                    async onConfirmation() {
                        resolve({
                            create_nonce: (await web3.eth.getTransaction(txHash)).nonce,
                            create_transaction_hash: txHash,
                        })
                    },
                    onTransactionError: reject,
                    onEstimateError: reject,
                },
            )
        })
    },
    /**
     * Claim a red packet
     * @param id Red packet ID
     * @param password Password, index from check_availability
     * @param recipient address of the receiver
     * @param validation hash of the request sender
     * @returns Claimed money
     */
    async claim(
        id: RedPacketID,
        password: string,
        recipient: string,
        validation: string,
        receipt = false,
    ): Promise<{ claim_transaction_hash: string }> {
        const contract = createRedPacketContract(getNetworkSettings().happyRedPacketContractAddress)
        return new Promise((resolve, reject) => {
            let txHash = ''
            sendTx(
                contract.methods.claim(id.redPacketID, password, recipient, validation),
                {
                    from: recipient,
                },
                {
                    onTransactionHash(hash) {
                        txHash = hash
                    },
                    onReceipt() {
                        if (receipt) {
                            resolve({
                                claim_transaction_hash: txHash,
                            })
                        }
                    },
                    onConfirmation() {
                        resolve({
                            claim_transaction_hash: txHash,
                        })
                    },
                    onTransactionError: reject,
                    onEstimateError: reject,
                },
            )
        })
    },
    /**
     * Refund transaction hash
     * @param red_packet_id Red packet ID
     */
    async refund(id: RedPacketID, receipt = false): Promise<{ refund_transaction_hash: string }> {
        const t = await createRedPacketTransaction('readonly')
        const packet = await t.getByIndex('red_packet_id', id.redPacketID)
        const wallets = await t.objectStore('Wallet').getAll()

        if (!packet) throw new Error(`can not find red packet with id: ${id}`)
        if (wallets.every((wallet) => wallet.address !== packet.sender_address))
            throw new Error('can not find available wallet')

        const contract = createRedPacketContract(getNetworkSettings().happyRedPacketContractAddress)
        return new Promise((resolve, reject) => {
            let txHash = ''
            sendTx(
                contract.methods.refund(id.redPacketID),
                {
                    from: packet!.sender_address,
                },
                {
                    onTransactionHash(hash: string) {
                        txHash = hash
                    },
                    onReceipt() {
                        if (receipt) {
                            resolve({
                                refund_transaction_hash: txHash,
                            })
                        }
                    },
                    onConfirmation() {
                        resolve({
                            refund_transaction_hash: txHash,
                        })
                    },
                    onTransactionError: reject,
                    onEstimateError: reject,
                },
            )
        })
    },
    /**
     * Check claimed address list
     * @param id Red packet ID
     */
    async checkClaimedList(id: RedPacketID): Promise<string[]> {
        return createRedPacketContract(getNetworkSettings().happyRedPacketContractAddress)
            .methods.check_claimed_list(id.redPacketID)
            .call()
    },
    async watchClaimResult(id: TxHashID & DatabaseID) {
        const contract = createRedPacketContract(getNetworkSettings().happyRedPacketContractAddress)
        asyncTimes(10, async () => {
            const { blockNumber } = await web3.eth.getTransaction(id.transactionHash)
            if (!blockNumber) return

            const evs = await contract.getPastEvents('ClaimSuccess', {
                fromBlock: blockNumber,
                toBlock: blockNumber,
            })
            const claimSuccessEv = evs.find((ev) => ev.transactionHash === id.transactionHash)

            if (claimSuccessEv) {
                const { id: return_id, claimer, claimed_value } = claimSuccessEv.returnValues as {
                    id: string
                    claimer: string
                    claimed_value: string
                    token_address: string
                }
                // Services.Plugin.invokePlugin('maskbook.wallet')
                onClaimResult(id, {
                    type: 'success',
                    claimed_value: new BigNumber(claimed_value),
                    claimer,
                    red_packet_id: return_id,
                })
                return true
            }
            return
        })
            .then((results) => {
                if (!results.some((r) => r)) {
                    onClaimResult(id, {
                        type: 'failed',
                        reason: 'timeout',
                    })
                }
            })
            .catch((e) => {
                onClaimResult(id, {
                    type: 'failed',
                    reason: e.message,
                })
            })
    },
    async watchCreateResult(id: TxHashID & DatabaseID) {
        const contract = createRedPacketContract(getNetworkSettings().happyRedPacketContractAddress)
        asyncTimes(10, async () => {
            const { blockNumber } = await web3.eth.getTransaction(id.transactionHash)
            if (!blockNumber) return

            const evs = await contract.getPastEvents('CreationSuccess', {
                fromBlock: blockNumber,
                toBlock: blockNumber,
            })
            const creationSuccessEv = evs.find((ev) => ev.transactionHash === id.transactionHash)

            if (creationSuccessEv) {
                const { total, id: return_id, creator, creation_time } = creationSuccessEv.returnValues as {
                    total: string
                    id: string
                    creator: string
                    creation_time: string
                    token_address: string
                }
                onCreationResult(id, {
                    type: 'success',
                    block_creation_time: new Date(parseInt(creation_time) * 1000),
                    red_packet_id: return_id,
                    creator,
                    total: new BigNumber(total),
                })
                return true
            }
            return
        })
            .then((results) => {
                if (!results.some((r) => r)) {
                    onCreationResult(id, {
                        type: 'failed',
                        reason: 'timeout',
                    })
                }
            })
            .catch((e) => {
                onCreationResult(id, {
                    type: 'failed',
                    reason: e.message,
                })
            })
    },
    async watchExpired(id: RedPacketID) {
        pollingTask(async () => {
            const { expired } = await this.checkAvailability(id)

            if (expired) {
                onExpired(id)
                return true
            }
            return false
        })
    },
    async checkAvailability(id: RedPacketID): Promise<CheckRedPacketAvailabilityResult> {
        const contract = createRedPacketContract(getNetworkSettings().happyRedPacketContractAddress)
        const {
            balance,
            claimed,
            expired,
            token_address,
            total,
            ifclaimed,
        } = await contract.methods.check_availability(id.redPacketID).call()
        return {
            balance: new BigNumber(balance),
            claimedCount: parseInt(claimed, 10),
            expired,
            token_address,
            totalCount: parseInt(total, 10),
            is_claimed: ifclaimed,
        }
    },
    async watchRefundResult(id: TxHashID & DatabaseID) {
        const contract = createRedPacketContract(getNetworkSettings().happyRedPacketContractAddress)
        asyncTimes(10, async () => {
            const { blockNumber } = await web3.eth.getTransaction(id.transactionHash)
            if (!blockNumber) return

            const evs = await contract.getPastEvents('RefundSuccess', {
                fromBlock: blockNumber,
                toBlock: blockNumber,
            })
            const refundSuccessEv = evs.find((ev) => ev.transactionHash === id.transactionHash)

            if (refundSuccessEv) {
                const { id, remaining_balance } = refundSuccessEv.returnValues as {
                    id: string
                    token_address: string
                    remaining_balance: string
                }

                onRefundResult(
                    {
                        redPacketID: id,
                    },
                    {
                        remaining_balance: new BigNumber(remaining_balance),
                    },
                )
            }
        })
    },
}

export const walletAPI = {
    dataSource: 'real' as const,
    async queryBalance(address: string): Promise<BigNumber> {
        const value = await web3.eth.getBalance(address)
        return new BigNumber(value)
    },

    transfer(ownerAddress: string, recipientAddress: string, amount: BigNumber) {
        return sendTxConfigForTxHash({
            from: ownerAddress,
            to: recipientAddress,
            gas: 21000,
            value: amount.toString(),
        })
    },
}

export const erc20API = {
    dataSource: 'real' as const,
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
                    erc20Contract.methods.approve(spenderAddress, amount.toString()),
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
                    erc20Contract.methods.transfer(recipientAddress, amount.toString()),
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

export const gitcoinAPI = {
    dataSource: 'real' as const,

    /**
     * Bulk checkout donation
     * @param donorAddress The account address of donor
     * @param maintainerAddress The account address of gitcoin maintainer
     * @param donationAddress The account address of project owner
     * @param donationTotal The total amount of donation value
     * @param erc20Address An optional ERC20 contract address when donate with ERC20 token
     * @param tipPercentage For each donation of gitcoin grant, a small tip will be transferred to the gitcoin maintainer's account
     */
    donate(
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

        const contract = createBulkCheckoutContract(getNetworkSettings().bulkCheckoutContractAddress)
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
                        amount: x.amount.toString(),
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
                        .toString(),
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
            )
        })
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
            balances = await createBalanceCheckerContract(getNetworkSettings().balanceCheckerContractAddress)
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
        const tokens = [
            {
                address: ETH_ADDRESS,
                decimals: 18,
                name: 'Ether',
                symbol: 'ETH',
            },
            ...getNetworkERC20Tokens(),
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
                    network: getNetworkSettings().networkType,
                    balance: new BigNumber(balance),
                })
            return accumulate
        }, {} as BalanceMetadata)
        onWalletBalancesUpdated(metadata)
    }

    return {
        dataSource: 'real' as const,
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

type TxHashID = { transactionHash: string }
type RedPacketID = { redPacketID: string }
type DatabaseID = { databaseID: string }
