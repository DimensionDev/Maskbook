import type Web3 from 'web3'
import type { AbiItem } from 'web3-utils'
import {
    EthereumTokenType,
    ChainId,
    getSavingsConstants,
    createContract,
    FungibleTokenDetailed,
    ZERO_ADDRESS,
} from '@masknet/web3-shared-evm'
import type { Lido } from '@masknet/web3-contracts/types/Lido'
import LidoABI from '@masknet/web3-contracts/abis/Lido.json'
import BigNumber from 'bignumber.js'
import { ProtocolCategory, SavingsNetwork, SavingsProtocol, ProtocolType } from '../types'

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
        ldoContract: getSavingsConstants(ChainId.Mainnet).LIDO || ZERO_ADDRESS,
        stEthContract: getSavingsConstants(ChainId.Mainnet).LIDO_STETH || ZERO_ADDRESS,
    },
    [ChainId.Gorli]: {
        type: EthereumTokenType.ERC20,
        chainName: 'Gorli',
        ldoContract: getSavingsConstants(ChainId.Gorli).LIDO || ZERO_ADDRESS,
        stEthContract: getSavingsConstants(ChainId.Gorli).LIDO_STETH || ZERO_ADDRESS,
    },
}

export class LidoProtocol implements SavingsProtocol {
    public category = ProtocolCategory.ETH
    public type = ProtocolType.Lido
    public name = 'Lido'
    public image = 'lido'
    public base = 'ETH'
    public pair = 'stETH'
    public decimals = 18
    public apr = '0.00'
    public balance = new BigNumber('0')
    public availableNetworks: SavingsNetwork[] = [
        {
            chainId: ChainId.Mainnet,
            chainName: 'Ethereum',
            contractAddress: getSavingsConstants(ChainId.Mainnet).LIDO_STETH || ZERO_ADDRESS,
        },
        {
            chainId: ChainId.Gorli,
            chainName: 'Gorli',
            contractAddress: getSavingsConstants(ChainId.Gorli).LIDO_STETH || ZERO_ADDRESS,
        },
    ]

    public getFungibleTokenDetails(chainId: ChainId): FungibleTokenDetailed {
        let contractAddress = ''

        for (const network of this.availableNetworks) {
            if (network.chainId === chainId) {
                contractAddress = network.contractAddress
            }
        }

        return {
            type: 1,
            chainId: chainId,
            address: contractAddress,
            symbol: 'stETH',
            decimals: 18,
            name: 'Liquid staked Ether 2.0',
            logoURI: [
                'https://static.debank.com/image/eth_token/logo_url/0xae7ab96520de3a18e5e111b5eaab095312d7fe84/f768023f77be7a2ea23c37f25b272048.png',
                'https://tokens.1inch.io/0xae7ab96520de3a18e5e111b5eaab095312d7fe84.png',
            ],
        }
    }

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
                getSavingsConstants(chainId).LIDO_STETH || ZERO_ADDRESS,
                LidoABI as AbiItem[],
            )
            const balance = await contract?.methods.balanceOf(account).call()
            this.balance = new BigNumber(balance || '0')
            return this.balance
        } catch (error) {
            console.log('LDO `getBalance()` error', error)
            this.balance = new BigNumber('0')
            return this.balance
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
