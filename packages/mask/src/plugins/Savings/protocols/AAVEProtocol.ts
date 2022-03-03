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
import { ProtocolCategory, SavingsNetwork, SavingsProtocol, ProtocolType, ProtocolToken } from '../types'
import { pow10, ZERO } from '@masknet/web3-shared-base'
import type Savings from '@masknet/web3-constants/evm/savings.json'
import { AAVE_PAIRS } from '../constants'

export interface ContractListArray {
    [index: string]: {
        address: string
    }
}

export interface AaveContract {
    type: EthereumTokenType
    chainName: string
    subgraphUrl: string
    aaveLendingPoolAddressProviderContract: string
    aaveContract: string
    stEthContract: string
    assetContractAddresses: ContractListArray
}

export function getAaveContract(chainId: ChainId): AaveContract {
    const constants = getSavingsConstants(chainId)

    return {
        type: EthereumTokenType.ERC20,
        chainName: ChainId[chainId],
        subgraphUrl: constants.AAVE_SUBGRAPHS ?? '',
        aaveLendingPoolAddressProviderContract:
            constants.AAVE_LENDING_POOL_ADDRESSES_PROVIDER_CONTRACT_ADDRESS ?? ZERO_ADDRESS,
        aaveContract: constants.AAVE ?? ZERO_ADDRESS,
        stEthContract: constants.AAVE ?? ZERO_ADDRESS,
        assetContractAddresses: {
            AAVE: { address: constants.AAVE ?? ZERO_ADDRESS },
        },
    }
}

export class AAVEProtocol implements SavingsProtocol {
    public apr = '0.00'
    public balance = ZERO
    public readonly DEFAULT_APR = '0.17'

    public availableNetworks: SavingsNetwork[] = []

    public constructor(
        public category = ProtocolCategory.ETH,
        public type = ProtocolType.AAVE,
        public name = 'AAVE',
        public symbol = 'AAVE',
        public image = 'aave',
        public base: keyof typeof AAVE_PAIRS = 'AAVE',
        public pair = 'aAAVE',
        public decimals = 18,
        public underLyingAssetName = 'AAVE Interest Bearing AAVE',
        public logoURI: string[] = ['https://tokens.1inch.io/0xffc97d72e13e01096502cb8eb52dee56f74dad7b.png'],
    ) {
        this.availableNetworks = [
            {
                chainId: ChainId.Mainnet,
                chainName: 'Ethereum',
                contractAddress: getSavingsConstants(ChainId.Mainnet)[this.base] || ZERO_ADDRESS,
            },
            {
                chainId: ChainId.Kovan,
                chainName: 'Kovan',
                contractAddress: getSavingsConstants(ChainId.Kovan)[this.base] || ZERO_ADDRESS,
            },
        ]
    }
    token: ProtocolToken

    public bareTokenDetailed(chainId: ChainId): FungibleTokenDetailed {
        return {
            type: EthereumTokenType.ERC20,
            chainId: chainId,
            address: getSavingsConstants(chainId)[this.base],
            symbol: this.symbol,
            decimals: this.decimals,
            name: this.underLyingAssetName,
            logoURI: this.logoURI,
        }
    }

    public stakeTokenDetailed(chainId: ChainId): FungibleTokenDetailed {
        return {
            type: EthereumTokenType.ERC20,
            chainId: chainId,
            address: getSavingsConstants(chainId)[this.base],
            symbol: this.symbol,
            decimals: this.decimals,
            name: this.underLyingAssetName,
            logoURI: this.logoURI,
        }
    }

    public async getApr(chainId: ChainId) {
        try {
            const subgraphUrl = getSavingsConstants(chainId).AAVE_SUBGRAPHS || ''
            if (!subgraphUrl) {
                this.apr = this.DEFAULT_APR
                return this.apr
            }

            const body = JSON.stringify({
                query: `{
                reserves (where: {
                    underlyingAsset: "${getSavingsConstants(chainId)[this.base] || ZERO_ADDRESS}"
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
            const fullResponse: {
                data: {
                    reserves: {
                        id: string
                        name: string
                        decimals: number
                        underlyingAsset: string
                        liquidityRate: number
                    }[]
                }
            } = await response.json()
            const liquidityRate = +fullResponse.data.reserves[0].liquidityRate

            const RAY = pow10(27) // 10 to the power 27
            const SECONDS_PER_YEAR = 31536000

            // APY and APR are returned here as decimals, multiply by 100 to get the percents
            const apr = new BigNumber(liquidityRate).div(RAY)
            this.apr = apr.toFixed(2)
            return apr.toFixed(2)
        } catch (error) {
            console.log('AAVE `getApr()` error', error)
            // Default APR
            this.apr = this.DEFAULT_APR
            return this.apr
        }
    }

    public async getBalance(chainId: ChainId, web3: Web3, account: string) {
        try {
            const subgraphUrl = getSavingsConstants(chainId).AAVE_SUBGRAPHS || ''
            const reserveBody = JSON.stringify({
                query: `{
                reserves (where: {
                    underlyingAsset: "${getSavingsConstants(chainId)[this.base] || ZERO_ADDRESS}"
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
            const fullResponse: {
                data: {
                    reserves: {
                        id: string
                        name: string
                        decimals: number
                        underlyingAsset: string
                    }[]
                }
            } = await reserveResponse.json()
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

            const userResponse: {
                data: {
                    userReserves: {
                        scaledATokenBalance: string
                        currentATokenBalance: string
                    }[]
                }
            } = await userReserveResponse.json()

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
            const operation = await this.createDepositTokenOperation(account, chainId, web3, value)
            const gasEstimate = await operation?.estimateGas({
                from: account,
            })

            return new BigNumber(gasEstimate || 0)
        } catch (error) {
            console.error('AAVE `depositEstimate()` Error', error)
            return ZERO
        }
    }

    private async createDepositTokenOperation(account: string, chainId: ChainId, web3: Web3, value: BigNumber.Value) {
        const aaveLPoolAddress =
            getSavingsConstants(chainId).AAVE_LENDING_POOL_ADDRESSES_PROVIDER_CONTRACT_ADDRESS || ZERO_ADDRESS
        const lPoolAdressProviderContract = createContract<AaveLendingPoolAddressProvider>(
            web3,
            aaveLPoolAddress,
            AaveLendingPoolAddressProviderABI as AbiItem[],
        )

        const poolAddress = await lPoolAdressProviderContract?.methods.getLendingPool().call()

        const contract = createContract<AaveLendingPool>(
            web3,
            poolAddress || ZERO_ADDRESS,
            AaveLendingPoolABI as AbiItem[],
        )
        return contract?.methods.deposit(
            getSavingsConstants(chainId)[this.base] || ZERO_ADDRESS,
            new BigNumber(value).toFixed(),
            account,
            '0',
        )
    }

    public async deposit(account: string, chainId: ChainId, web3: Web3, value: BigNumber.Value) {
        try {
            const gasEstimate = await this.depositEstimate(account, chainId, web3, value)
            const operation = await this.createDepositTokenOperation(account, chainId, web3, value)
            if (operation) {
                await operation.send({
                    from: account,
                    gas: gasEstimate.toNumber(),
                })
                return true
            }
            return false
        } catch (error) {
            console.error('AAVE `deposit()` Error', error)
            return false
        }
    }

    public async withdrawEstimate(account: string, chainId: ChainId, web3: Web3, value: BigNumber.Value) {
        try {
            const lPoolAdressProviderContract = createContract<AaveLendingPoolAddressProvider>(
                web3,
                getSavingsConstants(chainId).AAVE_LENDING_POOL_ADDRESSES_PROVIDER_CONTRACT_ADDRESS || ZERO_ADDRESS,
                AaveLendingPoolAddressProviderABI as AbiItem[],
            )

            const poolAddress = await lPoolAdressProviderContract?.methods.getLendingPool().call()

            const contract = createContract<AaveLendingPool>(
                web3,
                poolAddress || ZERO_ADDRESS,
                AaveLendingPoolABI as AbiItem[],
            )
            const gasEstimate = await contract?.methods
                .withdraw(
                    getSavingsConstants(chainId)[this.base] || ZERO_ADDRESS,
                    new BigNumber(value).toFixed(),
                    account,
                )
                .estimateGas({
                    from: account,
                })
            return new BigNumber(gasEstimate || 0)
        } catch (error) {
            console.error('AAVE `withdrawEstimate()` Error', error)
            return ZERO
        }
    }

    public async withdraw(account: string, chainId: ChainId, web3: Web3, value: BigNumber.Value) {
        try {
            const lPoolAdressProviderContract = createContract<AaveLendingPoolAddressProvider>(
                web3,
                getSavingsConstants(chainId).AAVE_LENDING_POOL_ADDRESSES_PROVIDER_CONTRACT_ADDRESS || ZERO_ADDRESS,
                AaveLendingPoolAddressProviderABI as AbiItem[],
            )

            const poolAddress = await lPoolAdressProviderContract?.methods.getLendingPool().call()

            const gasEstimate = await this.withdrawEstimate(account, chainId, web3, value)
            const contract = createContract<AaveLendingPool>(
                web3,
                poolAddress || ZERO_ADDRESS,
                AaveLendingPoolABI as AbiItem[],
            )
            await contract?.methods
                .withdraw(
                    getSavingsConstants(chainId)[this.base] || ZERO_ADDRESS,
                    new BigNumber(value).toFixed(),
                    account,
                )
                .send({
                    from: account,
                    gas: gasEstimate.toNumber(),
                })
            return true
        } catch (error) {
            console.error('AAVE `withdraw()` Error', error)
            return false
        }
    }
}

export default AAVE_PAIRS.map(
    (p) =>
        new AAVEProtocol(
            ProtocolCategory.ETH,
            ProtocolType.AAVE,
            p.name,
            p.name,
            p.name.toLowerCase(),
            p.name,
            p.pair,
            p.decimals,
            p.underLyingAssetName,
            p.logoURI,
        ),
)
