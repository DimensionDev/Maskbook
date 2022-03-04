import BigNumber from 'bignumber.js'
import { pow10, ZERO } from '@masknet/web3-shared-base'
import type Web3 from 'web3'
import type { AbiItem } from 'web3-utils'
import {
    ChainId,
    getSavingsConstants,
    createContract,
    FungibleTokenDetailed,
    ZERO_ADDRESS,
} from '@masknet/web3-shared-evm'


// import type { CrvDepositor } from '@masknet/web3-contracts/types/CrvDepositor'
// import type { ConvexBooster } from '@masknet/web3-contracts/types/ConvexBooster'

// import CrvDepositorABI from '@masknet/web3-contracts/abis/CrvDepositor.json'
// import ConvexBoosterABI from '@masknet/web3-contracts/abis/ConvexBooster.json'

import { ProtocolType, SavingsProtocol } from '../types'

// https://github.com/convex-community/convex-subgraph

const CONVEX_POOL_SUBGRAPH = 'https://api.thegraph.com/subgraphs/name/convex-community/curve-pools'

// https://thegraph.com/hosted-service/subgraph/convex-community/convex-staking
const CONVEX_STAKING_SUBGRAPH = 'https://api.thegraph.com/subgraphs/name/convex-community/convex-staking'


export class CovexProtocol implements SavingsProtocol {
    static DEFAULT_APR = '0.12'

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
            const subgraphUrl = getSavingsConstants(chainId).AAVE_SUBGRAPHS || ''

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
            this._apr = CovexProtocol.DEFAULT_APR
        }

        public async updateBalance() web3: Web3, account: string) {
            try {
                const subgraphUrl = CONVEX_STAKING_SUBGRAPH  || ''
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
}

// export interface ConvexContract {
//     type: EthereumTokenType
//     chainName: string
//     ldoContract: string
//     stEthContract: string
// }

// export const ConvexContracts: { [key: number]: ConvexContract } = {
//     [ChainId.Mainnet]: {
//         type: EthereumTokenType.ERC20,
//         chainName: 'Ethereum',
//         ldoContract: getSavingsConstants(ChainId.Mainnet).LIDO || ZERO_ADDRESS,
//         stEthContract: getSavingsConstants(ChainId.Mainnet).LIDO_STETH || ZERO_ADDRESS,
//     },
// }

// export class ConvexProtocol implements SavingsProtocol {
//     public category = ProtocolCategory.ETH
//     public type = ProtocolType.Lido
//     public name = 'Lido'
//     public image = 'lido'
//     public base = 'ETH'
//     public pair = 'stETH'
//     public decimals = 18
//     public apr = '0.00'
//     public balance = new BigNumber('0')
//     public availableNetworks: SavingsNetwork[] = [
//         {
//             chainId: ChainId.Mainnet,
//             chainName: 'Ethereum',
//             contractAddress: getSavingsConstants(ChainId.Mainnet).LIDO_STETH || ZERO_ADDRESS,
//         },
//         {
//             chainId: ChainId.Gorli,
//             chainName: 'Gorli',
//             contractAddress: getSavingsConstants(ChainId.Gorli).LIDO_STETH || ZERO_ADDRESS,
//         },
//     ]

//     public getFungibleTokenDetails(chainId: ChainId): FungibleTokenDetailed {
//         let contractAddress = ''

//         for (const network of this.availableNetworks) {
//             if (network.chainId === chainId) {
//                 contractAddress = network.contractAddress
//             }
//         }

//         return {
//             type: 1,
//             chainId: chainId,
//             address: contractAddress,
//             symbol: 'stETH',
//             decimals: 18,
//             name: 'Liquid staked Ether 2.0',
//             logoURI: [
//                 'https://static.debank.com/image/eth_token/logo_url/0xae7ab96520de3a18e5e111b5eaab095312d7fe84/f768023f77be7a2ea23c37f25b272048.png',
//                 'https://tokens.1inch.io/0xae7ab96520de3a18e5e111b5eaab095312d7fe84.png',
//             ],
//         }
//     }

//     public async getApr() {
//         try {
//             const LidoAprUrl = 'https://cors.r2d2.to/?https://stake.lido.fi/api/steth-apr'
//             const response = await fetch(LidoAprUrl)
//             const apr = await response.text()
//             this.apr = apr
//             return apr
//         } catch (error) {
//             console.log('LDO `getApr()` error', error)
//             // Default APR is 5.30%
//             this.apr = '5.30'
//             return '5.30'
//         }
//     }

//     public async getBalance(chainId: ChainId, web3: Web3, account: string) {
//         try {
//             const contract = createContract<Lido>(
//                 web3,
//                 getSavingsConstants(chainId).LIDO_STETH || ZERO_ADDRESS,
//                 LidoABI as AbiItem[],
//             )
//             const balance = await contract?.methods.balanceOf(account).call()
//             this.balance = new BigNumber(balance || '0')
//             return this.balance
//         } catch (error) {
//             console.log('LDO `getBalance()` error', error)
//             this.balance = new BigNumber('0')
//             return this.balance
//         }
//     }

//     public async depositEstimate(account: string, chainId: ChainId, web3: Web3, value: BigNumber.Value) {
//         try {
//             const contract = createContract<Lido>(
//                 web3,
//                 getSavingsConstants(chainId).LIDO_STETH || ZERO_ADDRESS,
//                 LidoABI as AbiItem[],
//             )
//             const gasEstimate = await contract?.methods
//                 .submit(getSavingsConstants(chainId).LIDO_REFERRAL_ADDRESS || ZERO_ADDRESS)
//                 .estimateGas({
//                     from: account,
//                     value: value.toString(),
//                 })

//             return new BigNumber(gasEstimate || 0)
//         } catch (error) {
//             console.error('LDO `depositEstimate()` Error', error)
//             return new BigNumber(0)
//         }
//     }

//     public async deposit(account: string, chainId: ChainId, web3: Web3, value: BigNumber.Value) {
//         try {
//             const contract = createContract<Lido>(
//                 web3,
//                 getSavingsConstants(chainId).LIDO_STETH || ZERO_ADDRESS,
//                 LidoABI as AbiItem[],
//             )
//             await contract?.methods.submit(getSavingsConstants(chainId).LIDO_REFERRAL_ADDRESS || ZERO_ADDRESS).send({
//                 from: account,
//                 value: value.toString(),
//                 gas: 300000,
//             })

//             return true
//         } catch (error) {
//             console.error('LDO `deposit()` Error', error)
//             return false
//         }
//     }

//     public async withdrawEstimate(account: string, chainId: ChainId, web3: Web3, value: BigNumber.Value) {
//         return new BigNumber('0')
//     }

//     public async withdraw(account: string, chainId: ChainId, web3: Web3, value: BigNumber.Value) {
//         /*
//          * @TODO: Implement withdraw when stETH Beacon Chain allows for withdraws
//          *
//          * Review: https://github.com/lidofinance/lido-dao when ETH 2.0 is implemented.
//          *
//          * For now, just redirect to swap plugin
//          *
//          * await contract.methods
//          *     .withdraw(inputTokenTradeAmount, '0x0000000000000000000000000000000000000000')
//          *     .send({
//          *         from: account,
//          *         gasLimit: 2100000,
//          *     })
//          */
//         return false
//     }
// }

// export default new LidoProtocol()
