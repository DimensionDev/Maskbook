import type Web3 from 'web3'
import type { AbiItem } from 'web3-utils'
import {
    EthereumTokenType,
    ChainId,
    getSavingsConstants,
    formatBalance,
    createContract,
} from '@masknet/web3-shared-evm'
import type { Lido } from '@masknet/web3-contracts/types/Lido'
import LidoABI from '@masknet/web3-contracts/abis/Lido.json'
import BigNumber from 'bignumber.js'
import { ProtocolCategory, SavingsNetwork, SavingsProtocol } from '../types'
import { ProtocolType } from '../types'

export interface LidoContract {
    type: EthereumTokenType
    chainName: string
    ldoContract: string
    stEthContract: string
}

export const LidoContracts: { [key: number]: LidoContract } = {
    [ChainId.Mainnet]: {
        type: EthereumTokenType.ERC20,
        chainName: 'Ethereum',
        ldoContract: getSavingsConstants(ChainId.Mainnet).LIDO || '',
        stEthContract: getSavingsConstants(ChainId.Mainnet).LIDO_STETH || '',
    },
    [ChainId.Gorli]: {
        type: EthereumTokenType.ERC20,
        chainName: 'Gorli',
        ldoContract: getSavingsConstants(ChainId.Gorli).LIDO || '',
        stEthContract: getSavingsConstants(ChainId.Gorli).LIDO_STETH || '',
    },
}

export class LidoProtocol implements SavingsProtocol {
    public category = ProtocolCategory.ETH
    public type = ProtocolType.Lido
    public name = 'Lido'
    public image = 'lido'
    public base = 'ETH'
    public pair = 'stETH'
    public apr = '0.00'
    public balance = '0.00'

    public availableNetworks: SavingsNetwork[] = [
        { chainId: ChainId.Mainnet, chainName: 'Ethereum' },
        { chainId: ChainId.Gorli, chainName: 'Gorli' },
    ]

    public async getApr() {
        try {
            const LidoAprUrl = 'https://cors.r2d2.to/?https://stake.lido.fi/api/steth-apr'
            const response = await fetch(LidoAprUrl)
            const apr = await response.text()
            this.apr = apr
            return apr
        } catch (error) {
            console.log('LDO `getApr()` error', error)
            // Default APR is 5.30%
            this.apr = '5.30'
            return '5.30'
        }
    }

    public async getBalance(chainId: ChainId, web3: Web3, account: string) {
        try {
            const contract = createContract<Lido>(
                web3,
                getSavingsConstants(chainId).LIDO_STETH || '',
                LidoABI as AbiItem[],
            )
            const balance = await contract?.methods.balanceOf(account).call()
            const formattedBalance = formatBalance(balance, 18, 4)

            this.balance = formattedBalance
            return formattedBalance
        } catch (error) {
            console.log('LDO `getBalance()` error', error)
            this.balance = '0.00'
            return '0.00'
        }
    }

    public async depositEstimate(account: string, chainId: ChainId, web3: Web3, value: BigNumber.Value) {
        try {
            const contract = createContract<Lido>(
                web3,
                getSavingsConstants(chainId).LIDO_STETH || '',
                LidoABI as AbiItem[],
            )
            const gasEstimate = await contract?.methods
                .submit(
                    getSavingsConstants(chainId).LIDO_REFERRAL_ADDRESS || '0x0000000000000000000000000000000000000000',
                )
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
                getSavingsConstants(chainId).LIDO_STETH || '',
                LidoABI as AbiItem[],
            )
            await contract?.methods
                .submit(
                    getSavingsConstants(chainId).LIDO_REFERRAL_ADDRESS || '0x0000000000000000000000000000000000000000',
                )
                .send({
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
        return new BigNumber('0')
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

export default new LidoProtocol()
