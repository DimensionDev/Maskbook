import BigNumber from 'bignumber.js'
import { pow10, ZERO } from '@masknet/web3-shared-base'
import type Web3 from 'web3'
import type { AbiItem } from 'web3-utils'
import {
    ChainId,
    getAaveConstants,
    createContract,
    FungibleTokenDetailed,
    ZERO_ADDRESS,
} from '@masknet/web3-shared-evm'
import type { AaveLendingPool } from '@masknet/web3-contracts/types/AaveLendingPool'
import type { AaveLendingPoolAddressProvider } from '@masknet/web3-contracts/types/AaveLendingPoolAddressProvider'
import AaveLendingPoolAddressProviderABI from '@masknet/web3-contracts/abis/AaveLendingPoolAddressProvider.json'
import AaveLendingPoolABI from '@masknet/web3-contracts/abis/AaveLendingPool.json'
import { ProtocolType, SavingsProtocol } from '../types'

export class AAVEProtocol implements SavingsProtocol {
    static DEFAULT_APR = '0.17'

    private _apr = '0.00'
    private _balance = ZERO

    constructor(readonly pair: [FungibleTokenDetailed, FungibleTokenDetailed]) {}

    get type() {
        return ProtocolType.AAVE
    }

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

    public async updateApr(chainId: ChainId, web3: Web3) {
        try {
            const subgraphUrl = getAaveConstants(chainId).AAVE_SUBGRAPHS || ''

            if (!subgraphUrl) {
                this._apr = AAVEProtocol.DEFAULT_APR
                return
            }

            const body = JSON.stringify({
                query: `{
                reserves (where: {
                    underlyingAsset: "${this.bareToken.address}"
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
            this._apr = new BigNumber(liquidityRate).div(RAY).toFixed(2)
        } catch (error) {
            this._apr = AAVEProtocol.DEFAULT_APR
        }
    }

    public async updateBalance(chainId: ChainId, web3: Web3, account: string) {
        try {
            const subgraphUrl = getAaveConstants(chainId).AAVE_SUBGRAPHS || ''
            const reserveBody = JSON.stringify({
                query: `{
                reserves (where: {
                    underlyingAsset: "${this.bareToken.address}"
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

            this._balance = new BigNumber(userResponse.data.userReserves[0].currentATokenBalance || '0')
        } catch (error) {
            this._balance = ZERO
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
            return ZERO
        }
    }

    private async createDepositTokenOperation(account: string, chainId: ChainId, web3: Web3, value: BigNumber.Value) {
        const aaveLPoolAddress =
            getAaveConstants(chainId).AAVE_LENDING_POOL_ADDRESSES_PROVIDER_CONTRACT_ADDRESS || ZERO_ADDRESS
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
        return contract?.methods.deposit(this.bareToken.address, new BigNumber(value).toFixed(), account, '0')
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
            return false
        }
    }

    public async withdrawEstimate(account: string, chainId: ChainId, web3: Web3, value: BigNumber.Value) {
        try {
            const lPoolAdressProviderContract = createContract<AaveLendingPoolAddressProvider>(
                web3,
                getAaveConstants(chainId).AAVE_LENDING_POOL_ADDRESSES_PROVIDER_CONTRACT_ADDRESS || ZERO_ADDRESS,
                AaveLendingPoolAddressProviderABI as AbiItem[],
            )

            const poolAddress = await lPoolAdressProviderContract?.methods.getLendingPool().call()

            const contract = createContract<AaveLendingPool>(
                web3,
                poolAddress || ZERO_ADDRESS,
                AaveLendingPoolABI as AbiItem[],
            )
            const gasEstimate = await contract?.methods
                .withdraw(this.bareToken.address, new BigNumber(value).toFixed(), account)
                .estimateGas({
                    from: account,
                })
            return new BigNumber(gasEstimate || 0)
        } catch (error) {
            return ZERO
        }
    }

    public async withdraw(account: string, chainId: ChainId, web3: Web3, value: BigNumber.Value) {
        try {
            const lPoolAdressProviderContract = createContract<AaveLendingPoolAddressProvider>(
                web3,
                getAaveConstants(chainId).AAVE_LENDING_POOL_ADDRESSES_PROVIDER_CONTRACT_ADDRESS || ZERO_ADDRESS,
                AaveLendingPoolAddressProviderABI as AbiItem[],
            )

            const poolAddress = await lPoolAdressProviderContract?.methods.getLendingPool().call()

            const gasEstimate = await this.withdrawEstimate(account, chainId, web3, value)
            const contract = createContract<AaveLendingPool>(
                web3,
                poolAddress || ZERO_ADDRESS,
                AaveLendingPoolABI as AbiItem[],
            )
            await contract?.methods.withdraw(this.bareToken.address, new BigNumber(value).toFixed(), account).send({
                from: account,
                gas: gasEstimate.toNumber(),
            })
            return true
        } catch (error) {
            return false
        }
    }
}
