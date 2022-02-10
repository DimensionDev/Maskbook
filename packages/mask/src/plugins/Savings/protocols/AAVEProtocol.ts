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
import type { AaveLendingPool } from '@masknet/web3-contracts/types/AaveLendingPool'
import type { AaveLendingPoolAddressProvider } from '@masknet/web3-contracts/types/AaveLendingPoolAddressProvider'

import AaveLendingPoolAddressProviderABI from '@masknet/web3-contracts/abis/AaveLendingPoolAddressProvider.json'
import AaveLendingPoolABI from '@masknet/web3-contracts/abis/AaveLendingPool.json'
import BigNumber from 'bignumber.js'
import { ProtocolCategory, SavingsNetwork, SavingsProtocol, ProtocolType } from '../types'

export interface AaveContract {
    type: EthereumTokenType
    chainName: string
    subgraphUrl: string
    aaveLendingPoolAddressProviderContract: string
    aaveContract: string
    stEthContract: string
}

export const AaveContracts: { [key: number]: AaveContract } = {
    [ChainId.Mainnet]: {
        type: EthereumTokenType.ERC20,
        chainName: 'Ethereum',
        subgraphUrl: getSavingsConstants(ChainId.Mainnet).AAVE_SUBGRAPHS || '',
        aaveLendingPoolAddressProviderContract:
            getSavingsConstants(ChainId.Mainnet).AAVELendingPoolAddressProviderContract || ZERO_ADDRESS,
        aaveContract: getSavingsConstants(ChainId.Mainnet).AAVE || ZERO_ADDRESS,
        stEthContract: getSavingsConstants(ChainId.Mainnet).LIDO_STETH || ZERO_ADDRESS,
    },
    [ChainId.Gorli]: {
        type: EthereumTokenType.ERC20,
        chainName: 'Kovan',
        subgraphUrl: getSavingsConstants(ChainId.Kovan).AAVE_SUBGRAPHS || '',
        aaveLendingPoolAddressProviderContract:
            getSavingsConstants(ChainId.Kovan).AAVELendingPoolAddressProviderContract || ZERO_ADDRESS,
        aaveContract: getSavingsConstants(ChainId.Kovan).AAVE || ZERO_ADDRESS,
        stEthContract: getSavingsConstants(ChainId.Kovan).LIDO_STETH || ZERO_ADDRESS,
    },
}

export class AAVEProtocol implements SavingsProtocol {
    public category = ProtocolCategory.ETH
    public type = ProtocolType.AAVE
    public name = 'AAVE'
    public image = 'aave'
    public base = 'ETH'
    public pair = 'aAAVE'
    public decimals = 18
    public apr = '0.00'
    public balance = new BigNumber('0')
    public availableNetworks: SavingsNetwork[] = [
        {
            chainId: ChainId.Mainnet,
            chainName: 'Ethereum',
            contractAddress: getSavingsConstants(ChainId.Mainnet).AAVE || ZERO_ADDRESS,
        },
        {
            chainId: ChainId.Kovan,
            chainName: 'Kovan',
            contractAddress: getSavingsConstants(ChainId.Kovan).AAVE || ZERO_ADDRESS,
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
            symbol: 'aAAVE',
            decimals: 18,
            name: 'AAVE Interest Bearing AAVE',
            logoURI: [
                // 'https://static.debank.com/image/eth_token/logo_url/0xae7ab96520de3a18e5e111b5eaab095312d7fe84/f768023f77be7a2ea23c37f25b272048.png',
                'https://tokens.1inch.io/0xffc97d72e13e01096502cb8eb52dee56f74dad7b.png',
            ],
        }
    }

    public async getApr(chainId?: ChainId) {
        try {
            const subgraphUrl = AaveContracts[chainId ?? ChainId.Kovan].subgraphUrl
            const body = JSON.stringify({
                query: `{
                reserves (where: {
                    underlyingAsset: "${AaveContracts[chainId ?? ChainId.Kovan].aaveContract}"
                }) {
                    id
                    name
                    underlyingAsset
                    price {
                     id
                    }
                    liquidityRate
                    }
                }`,
            })
            const response = await fetch(subgraphUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: body,
            })
            const fullResponse = await response.json()
            const liquidityRate = +fullResponse.data.reserves[0].liquidityRate

            const RAY = 10 ** 27 // 10 to the power 27
            const SECONDS_PER_YEAR = 31536000
            // APY and APR are returned here as decimals, multiply by 100 to get the percents
            const apr = liquidityRate / RAY
            this.apr = apr.toFixed(2)
            return apr.toFixed(2)
        } catch (error) {
            console.log('AAVE `getApr()` error', error)
            // Default APR
            this.apr = '0.17'
            return '0.17'
        }
    }

    public async getBalance(chainId: ChainId, web3: Web3, account: string) {
        try {
            const subgraphUrl = AaveContracts[chainId ?? ChainId.Kovan].subgraphUrl
            const reserveBody = JSON.stringify({
                query: `{
                reserves (where: {
                    underlyingAsset: "${AaveContracts[chainId ?? ChainId.Kovan].aaveContract}"
                }) {
                    id
                    name
                    underlyingAsset            
                }
            }`,
            })

            const reserveResponse = await fetch(subgraphUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: reserveBody,
            })
            const fullResponse = await reserveResponse.json()
            const reserveId = fullResponse.data.reserves[0].id

            // Get User Reserve
            const userReserveBody = JSON.stringify({
                query: `{
                    userReserves(where: { 
                        user: "${account}",
                        reserve: "${reserveId}"
                        
                        }) {
                      id
                      scaledATokenBalance
                      currentATokenBalance
                      reserve{
                        id
                        symbol
                        underlyingAsset
                        decimals
                      }
                      user {
                        id
                      }
                    }
                  }`,
            })

            const userReserveResponse = await fetch(subgraphUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: userReserveBody,
            })
            const userResponse = await userReserveResponse.json()

            const balance = userResponse.data.userReserves[0].currentATokenBalance
            this.balance = new BigNumber(balance || '0')
            return this.balance
        } catch (error) {
            console.log('AAVE `getBalance()` error', error)
            this.balance = new BigNumber('0')
            return this.balance
        }
    }

    public async depositEstimate(account: string, chainId: ChainId, web3: Web3, value: BigNumber.Value) {
        try {
            const lPoolAdressProviderContract = createContract<AaveLendingPoolAddressProvider>(
                web3,
                getSavingsConstants(chainId).AAVELendingPoolAddressProviderContract || ZERO_ADDRESS,
                AaveLendingPoolAddressProviderABI as AbiItem[],
            )

            const poolAddress = await lPoolAdressProviderContract?.methods.getLendingPool().call()

            const contract = createContract<AaveLendingPool>(
                web3,
                poolAddress || ZERO_ADDRESS,
                AaveLendingPoolABI as AbiItem[],
            )
            const gasEstimate = await contract?.methods
                .deposit(getSavingsConstants(chainId).AAVE || ZERO_ADDRESS, value.toString(), account, '0')
                .estimateGas({
                    from: account,
                })

            return new BigNumber(gasEstimate || 0)
        } catch (error) {
            console.error('AAVE `depositEstimate()` Error', error)
            return new BigNumber(0)
        }
    }

    public async deposit(account: string, chainId: ChainId, web3: Web3, value: BigNumber.Value) {
        try {
            const lPoolAdressProviderContract = createContract<AaveLendingPoolAddressProvider>(
                web3,
                getSavingsConstants(chainId).AAVELendingPoolAddressProviderContract || ZERO_ADDRESS,
                AaveLendingPoolAddressProviderABI as AbiItem[],
            )

            const poolAddress = await lPoolAdressProviderContract?.methods.getLendingPool().call()

            const contract = createContract<AaveLendingPool>(
                web3,
                poolAddress || ZERO_ADDRESS,
                AaveLendingPoolABI as AbiItem[],
            )

            await contract?.methods
                .deposit(getSavingsConstants(chainId).AAVE || ZERO_ADDRESS, value.toString(), account, '0')
                .send({
                    from: account,
                    gas: 300000,
                })
            return true
        } catch (error) {
            console.error('AAVE `deposit()` Error', error)
            return false
        }
    }

    public async withdrawEstimate(account: string, chainId: ChainId, web3: Web3, value: BigNumber.Value) {
        try {
            const lPoolAdressProviderContract = createContract<AaveLendingPoolAddressProvider>(
                web3,
                getSavingsConstants(chainId).AAVELendingPoolAddressProviderContract || ZERO_ADDRESS,
                AaveLendingPoolAddressProviderABI as AbiItem[],
            )

            const poolAddress = await lPoolAdressProviderContract?.methods.getLendingPool().call()

            const contract = createContract<AaveLendingPool>(
                web3,
                poolAddress || ZERO_ADDRESS,
                AaveLendingPoolABI as AbiItem[],
            )
            const gasEstimate = await contract?.methods
                .withdraw(getSavingsConstants(chainId).AAVE || ZERO_ADDRESS, value.toString(), account)
                .estimateGas({
                    from: account,
                })
            return new BigNumber(gasEstimate || 0)
        } catch (error) {
            console.error('AAVE `withdrawEstimate()` Error', error)
            return new BigNumber(0)
        }
    }

    public async withdraw(account: string, chainId: ChainId, web3: Web3, value: BigNumber.Value) {
        try {
            const lPoolAdressProviderContract = createContract<AaveLendingPoolAddressProvider>(
                web3,
                getSavingsConstants(chainId).AAVELendingPoolAddressProviderContract || ZERO_ADDRESS,
                AaveLendingPoolAddressProviderABI as AbiItem[],
            )

            const poolAddress = await lPoolAdressProviderContract?.methods.getLendingPool().call()

            const contract = createContract<AaveLendingPool>(
                web3,
                poolAddress || ZERO_ADDRESS,
                AaveLendingPoolABI as AbiItem[],
            )
            await contract?.methods
                .withdraw(getSavingsConstants(chainId).AAVE || ZERO_ADDRESS, value.toString(), account)
                .send({
                    from: account,
                })
            return true
        } catch (error) {
            console.error('AAVE `withdraw()` Error', error)
            return false
        }
    }
}

export default new AAVEProtocol()
