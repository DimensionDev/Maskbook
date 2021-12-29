import type Web3 from 'web3'
import type { AbiItem } from 'web3-utils'
import { EthereumTokenType, ChainId } from '@masknet/web3-shared-evm'
import type { Contract } from 'web3-eth-contract'
import type BigNumber from 'bignumber.js'
import STETHABI from './steth.abi.json'
import type { SavingsNetwork, SavingsProtocol } from '../types'

/*
 *
 * Other Lido Contracts can be found at
 * https://github.com/lidofinance/lido-dao
 *
 */

export interface LidoContract {
    type: EthereumTokenType
    chainName: string
    ldoContract: string
    stEthContract: string
}

export const LidoContracts: { [key: number]: LidoContract } = {
    1: {
        type: EthereumTokenType.ERC20,
        chainName: 'Ethereum',
        ldoContract: '0x5A98FcBEA516Cf06857215779Fd812CA3beF1B32',
        stEthContract: '0xae7ab96520DE3A18E5e111B5EaAb095312D7fE84',
    },
    5: {
        type: EthereumTokenType.ERC20,
        chainName: 'Gorli',
        ldoContract: '0x56340274fB5a72af1A3C6609061c451De7961Bd4',
        stEthContract: '0x1643E812aE58766192Cf7D2Cf9567dF2C37e9B7F',
    },
}

export class LidoProtocol implements SavingsProtocol {
    public id = 0
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

    public getContract(chainId: number, web3: Web3): Contract {
        const contract = new web3.eth.Contract(STETHABI as AbiItem[], LidoContracts[chainId].stEthContract)
        return contract
    }

    public async getApr() {
        try {
            const LidoAprUrl = `https://cors.r2d2.to/?uri=https://stake.lido.fi/api/steth-apr`
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

    public async getBalance(chainId: number, web3: Web3, account: string) {
        try {
            const contract = this.getContract(chainId, web3)
            const balance = await contract.methods.balanceOf(account).call()
            const formattedBalance = (balance / Math.pow(10, 18)).toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 6,
            })

            this.balance = formattedBalance
            return formattedBalance
        } catch (error) {
            console.log('LDO `getBalance()` error', error)
            this.balance = '0.00'
            return '0.00'
        }
    }

    public async deposit(account: string, chainId: number, web3: Web3, value: BigNumber) {
        try {
            const LidoReferralAddress = '0x278D7e418a28ff763eEeDf29238CD6dfcade3A3a'
            const contract = this.getContract(chainId, web3)

            await contract.methods.submit(LidoReferralAddress).send({
                from: account,
                value,
                gasLimit: 2100000,
            })

            return true
        } catch (error) {
            console.error('LDO `deposit()` Error', error)
            return false
        }
    }

    public async withdraw(account: string, chainId: number, web3: Web3, value: BigNumber) {
        /*
         * @TODO: Implement withdraw when stETH Beacon Chain allows for withdraws
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
