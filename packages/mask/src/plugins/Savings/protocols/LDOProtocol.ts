import type Web3 from 'web3'
import type { AbiItem } from 'web3-utils'
import { BigNumber } from 'bignumber.js'
import {
    type ChainId,
    createContract,
    getLidoConstants,
    type SchemaType,
    TransactionEventType,
    ZERO_ADDRESS,
} from '@masknet/web3-shared-evm'
import { type FungibleToken, ZERO } from '@masknet/web3-shared-base'
import { fetchText } from '@masknet/web3-providers/helpers'
import type { Lido } from '@masknet/web3-contracts/types/Lido.js'
import LidoABI from '@masknet/web3-contracts/abis/Lido.json'
import { ProtocolType, type SavingsProtocol } from '../types.js'

export class LidoProtocol implements SavingsProtocol {
    private _apr = '0.00'
    private _balance = ZERO

    readonly type = ProtocolType.Lido

    constructor(readonly pair: [FungibleToken<ChainId, SchemaType>, FungibleToken<ChainId, SchemaType>]) {}

    get apr() {
        return this._apr
    }

    get balance() {
        return this._balance
    }

    get bareToken() {
        return this.pair[0]
    }

    get stakeToken() {
        return this.pair[1]
    }

    async updateApr(chainId: ChainId, web3: Web3): Promise<void> {
        try {
            const text = await fetchText('https://cors.r2d2.to/?https://stake.lido.fi/api/steth-apr')
            this._apr = text.replace(/"/g, '')
        } catch {
            // the default APR is 5.30%
            this._apr = '5.30'
        }
    }
    async updateBalance(chainId: ChainId, web3: Web3, account: string): Promise<void> {
        try {
            const contract = createContract<Lido>(
                web3,
                getLidoConstants(chainId).LIDO_stETH_ADDRESS || ZERO_ADDRESS,
                LidoABI as AbiItem[],
            )
            this._balance = new BigNumber((await contract?.methods.balanceOf(account).call()) ?? '0')
        } catch (error) {
            this._balance = ZERO
        }
    }

    public async depositEstimate(account: string, chainId: ChainId, web3: Web3, value: BigNumber.Value) {
        try {
            const contract = createContract<Lido>(
                web3,
                getLidoConstants(chainId).LIDO_stETH_ADDRESS || ZERO_ADDRESS,
                LidoABI as AbiItem[],
            )
            const gasEstimate = await contract?.methods
                .submit(getLidoConstants(chainId).LIDO_REFERRAL_ADDRESS || ZERO_ADDRESS)
                .estimateGas({
                    from: account,
                    value: value.toString(),
                })

            return new BigNumber(gasEstimate || 0)
        } catch (error) {
            console.error('LDO `depositEstimate()` Error', error)
            return new BigNumber(0)
        }
    }

    public async deposit(account: string, chainId: ChainId, web3: Web3, value: BigNumber.Value) {
        const gasEstimate = await this.depositEstimate(account, chainId, web3, value)
        return new Promise<string>((resolve, reject) => {
            const contract = createContract<Lido>(
                web3,
                getLidoConstants(chainId).LIDO_stETH_ADDRESS || ZERO_ADDRESS,
                LidoABI as AbiItem[],
            )
            return contract?.methods
                .submit(getLidoConstants(chainId).LIDO_REFERRAL_ADDRESS || ZERO_ADDRESS)
                .send({
                    from: account,
                    value: value.toString(),
                    gas: gasEstimate.toNumber(),
                })
                .once(TransactionEventType.ERROR, reject)
                .once(TransactionEventType.CONFIRMATION, (_, receipt) => {
                    resolve(receipt.transactionHash)
                })
        })
    }

    public async withdrawEstimate(account: string, chainId: ChainId, web3: Web3, value: BigNumber.Value) {
        return ZERO
    }

    public async withdraw(account: string, chainId: ChainId, web3: Web3, value: BigNumber.Value) {
        /*
         * @TODO: Implement withdraw when stETH Beacon Chain allows for withdraws
         *
         * Review: https://github.com/lidofinance/lido-dao when ETH 2.0 is implemented.
         *
         * For now, just redirect to swap plugin
         *
         * await contract.methods
         *     .withdraw(inputTokenTradeAmount, '0x0000000000000000000000000000000000000000')
         *     .send({
         *         from: account,
         *         gasLimit: 2100000,
         *     })
         */
        return '0x'
    }
}
