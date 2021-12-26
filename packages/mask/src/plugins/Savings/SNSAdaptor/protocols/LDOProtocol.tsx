import type Web3 from 'web3'
import type { AbiItem } from 'web3-utils'
import STETHABI from './steth.abi.json'
import { EthereumTokenType } from '@masknet/web3-shared-evm'
import type { Contract } from 'web3-eth-contract'
import type BigNumber from 'bignumber.js'

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

export const LidoReferralAddress = `0x278D7e418a28ff763eEeDf29238CD6dfcade3A3a`

export const LidoAPR = `https://cors.r2d2.to/?uri=https://stake.lido.fi/api/steth-apr`

export function lidoContract(chainId: number, web3: Web3): Contract {
    const contract = new web3.eth.Contract(STETHABI as AbiItem[], LidoContracts[chainId].stEthContract)
    return contract
}

export async function getLidoAPR() {
    try {
        const response = await fetch(LidoAPR)
        return response.text()
    } catch (error) {
        // Default APR is 5.30%
        return '5.30'
    }
}

export async function getLidoBalance(chainId: number, web3: Web3, account: string) {
    try {
        const contract = lidoContract(chainId, web3)
        const balance = await contract.methods.balanceOf(account).call()

        return (balance / Math.pow(10, 18)).toLocaleString(undefined, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 6,
        })
    } catch (error) {
        console.log('lido balance error', error)
        return '0.00'
    }
}

export async function lidoDeposit(account: string, chainId: number, web3: Web3, value: BigNumber) {
    try {
        const contract = lidoContract(chainId, web3)

        await contract.methods.submit(LidoReferralAddress).send({
            from: account,
            value,
            gasLimit: 2100000,
        })

        return true
    } catch (error) {
        console.error('LDO Protocol Deposit Error', error)
        return false
    }
}

export async function lidoWithdraw(account: string, chainId: number, web3: Web3, value: BigNumber) {
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
