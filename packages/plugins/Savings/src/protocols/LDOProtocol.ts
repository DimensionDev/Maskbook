import type Web3 from 'web3'
import type { AbiItem } from 'web3-utils'
import { BigNumber } from 'bignumber.js'
import {
    type ChainId,
    createContract,
    TransactionEventType,
    ZERO_ADDRESS,
    getLidoConstant,
} from '@masknet/web3-shared-evm'
import { ZERO } from '@masknet/web3-shared-base'
import type { Lido } from '@masknet/web3-contracts/types/Lido.js'
import { Lido as LidoAPI } from '@masknet/web3-providers'
import LidoABI from '@masknet/web3-contracts/abis/Lido.json'
import { ProtocolType, type SavingsProtocol, type TokenPair } from '../types.js'

export class LidoProtocol implements SavingsProtocol {
    readonly type = ProtocolType.Lido

    constructor(readonly pair: TokenPair) {}

    get bareToken() {
        return this.pair[0]
    }

    get stakeToken() {
        return this.pair[1]
    }

    async getApr(chainId: ChainId, web3: Web3) {
        try {
            return LidoAPI.getStEthAPR()
        } catch {
            // the default APR is 5.30%
            return '5.30'
        }
    }
    async getBalance(chainId: ChainId, web3: Web3, account: string) {
        try {
            const contract = createContract<Lido>(
                web3,
                getLidoConstant(chainId, 'LIDO_stETH_ADDRESS'),
                LidoABI as AbiItem[],
            )
            return new BigNumber((await contract?.methods.balanceOf(account).call()) ?? 0)
        } catch {}
        return ZERO
    }

    public async depositEstimate(account: string, chainId: ChainId, web3: Web3, value: BigNumber.Value) {
        try {
            const contract = createContract<Lido>(
                web3,
                getLidoConstant(chainId, 'LIDO_stETH_ADDRESS'),
                LidoABI as AbiItem[],
            )
            const gasEstimate = await contract?.methods
                .submit(getLidoConstant(chainId, 'LIDO_REFERRAL_ADDRESS') || ZERO_ADDRESS)
                .estimateGas({
                    from: account,
                    // it's a BigNumber so it's ok
                    // eslint-disable-next-line @typescript-eslint/no-base-to-string
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
                getLidoConstant(chainId, 'LIDO_stETH_ADDRESS'),
                LidoABI as AbiItem[],
            )
            return contract?.methods
                .submit(getLidoConstant(chainId, 'LIDO_REFERRAL_ADDRESS') || ZERO_ADDRESS)
                .send({
                    from: account,
                    // it's a BigNumber so it's ok
                    // eslint-disable-next-line @typescript-eslint/no-base-to-string
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
