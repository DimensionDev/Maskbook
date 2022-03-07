import type Web3 from 'web3'
import type { AbiItem } from 'web3-utils'
import BigNumber from 'bignumber.js'
import {
    ChainId,
    getSavingsConstants,
    createContract,
    FungibleTokenDetailed,
    ZERO_ADDRESS,
    getTokenConstants,
} from '@masknet/web3-shared-evm'
import { ZERO } from '@masknet/web3-shared-base'
import type { Lido } from '@masknet/web3-contracts/types/Lido'
import LidoABI from '@masknet/web3-contracts/abis/Lido.json'
import { SavingsProtocol, ProtocolType } from '../types'

export class LidoProtocol implements SavingsProtocol {
    private _apr = '0.00'
    private _balance = ZERO

    readonly type = ProtocolType.Lido

    constructor(readonly pair: [FungibleTokenDetailed, FungibleTokenDetailed]) {}

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
            const response = await fetch('https://cors.r2d2.to/?https://stake.lido.fi/api/steth-apr')
            this._apr = await response.text()
        } catch {
            // the default APR is 5.30%
            this._apr = '5.30'
        }
    }
    async updateBalance(chainId: ChainId, web3: Web3, account: string): Promise<void> {
        try {
            const contract = createContract<Lido>(
                web3,
                getTokenConstants(chainId).LDO_stETH || ZERO_ADDRESS,
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
                getSavingsConstants(chainId).LIDO_STETH || ZERO_ADDRESS,
                LidoABI as AbiItem[],
            )
            const gasEstimate = await contract?.methods
                .submit(getSavingsConstants(chainId).LIDO_REFERRAL_ADDRESS || ZERO_ADDRESS)
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
        try {
            const contract = createContract<Lido>(
                web3,
                getSavingsConstants(chainId).LIDO_STETH || ZERO_ADDRESS,
                LidoABI as AbiItem[],
            )
            await contract?.methods.submit(getSavingsConstants(chainId).LIDO_REFERRAL_ADDRESS || ZERO_ADDRESS).send({
                from: account,
                value: value.toString(),
                gas: 300000,
            })

            return true
        } catch (error) {
            console.error('LDO `deposit()` Error', error)
            return false
        }
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
        return false
    }
}
