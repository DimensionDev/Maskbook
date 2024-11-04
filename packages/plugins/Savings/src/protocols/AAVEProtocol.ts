import type { AbiItem } from 'web3-utils'
import { BigNumber } from 'bignumber.js'
import AaveLendingPoolABI from '@masknet/web3-contracts/abis/AaveLendingPool.json' with { type: 'json' }
import AaveLendingPoolAddressProviderABI from '@masknet/web3-contracts/abis/AaveLendingPoolAddressProvider.json' with { type: 'json' }
import ERC20ABI from '@masknet/web3-contracts/abis/ERC20.json' with { type: 'json' }
import type { AaveLendingPool } from '@masknet/web3-contracts/types/AaveLendingPool.js'
import type { AaveLendingPoolAddressProvider } from '@masknet/web3-contracts/types/AaveLendingPoolAddressProvider.js'
import type { ERC20 } from '@masknet/web3-contracts/types/ERC20.js'
import { fetchJSON } from '@masknet/web3-providers/helpers'
import { ZERO, pow10, type FungibleToken } from '@masknet/web3-shared-base'
import {
    type Web3,
    type ChainId,
    type SchemaType,
    TransactionEventType,
    createContract,
    getAaveConstant,
} from '@masknet/web3-shared-evm'
import { ProtocolType, type SavingsProtocol } from '../types.js'

export class AAVEProtocol implements SavingsProtocol {
    static DEFAULT_APR = '0.17'

    private _balance = ZERO

    constructor(readonly pair: [FungibleToken<ChainId, SchemaType>, FungibleToken<ChainId, SchemaType>]) {}

    get type() {
        return ProtocolType.AAVE
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

    public async getApr(chainId: ChainId, web3: Web3) {
        try {
            const subgraphUrl = getAaveConstant(chainId, 'AAVE_SUBGRAPHS')
            if (!subgraphUrl) {
                return '0.00'
            }

            const body = JSON.stringify({
                query: /* GraphQL */ `
                    query GET_APR($address: String, $pool: String) {
                        reserves(where: { underlyingAsset: $address, pool: $pool }) {
                            id
                            name
                            underlyingAsset
                            liquidityRate
                        }
                    }
                `,
                variables: {
                    address: this.bareToken.address,
                    pool: '0xb53c1a33016b2dc2ff3653530bff1848a515c8c5',
                },
            })
            const response = await fetchJSON<{
                data: {
                    reserves: Array<{
                        id: string
                        name: string
                        decimals: number
                        underlyingAsset: string
                        liquidityRate: number
                    }>
                }
            }>(subgraphUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body,
            })

            const liquidityRate = +response.data.reserves[0].liquidityRate

            const RAY = pow10(27) // 10 to the power 27

            // APY and APR are returned here as decimals, multiply by 100 to get the percents
            return new BigNumber(liquidityRate).times(100).div(RAY).toFixed(2)
        } catch (error) {
            console.error('AAVE: Apr Error:', error)
            return AAVEProtocol.DEFAULT_APR
        }
    }

    public async getBalance(chainId: ChainId, web3: Web3, account: string) {
        try {
            const subgraphUrl = getAaveConstant(chainId, 'AAVE_SUBGRAPHS')

            if (!subgraphUrl) {
                return ZERO
            }

            const body = JSON.stringify({
                query: /* GraphQL */ `
                    query GET_BALANCE($address: String, $pool: String) {
                        reserves(where: { underlyingAsset: $address, pool: $pool }) {
                            id
                            aToken {
                                id
                            }
                        }
                    }
                `,
                variables: {
                    address: this.bareToken.address,
                    pool: '0xb53c1a33016b2dc2ff3653530bff1848a515c8c5',
                },
            })

            const response = await fetchJSON<{
                data: {
                    reserves: Array<{
                        aToken: {
                            id: string
                        }
                    }>
                }
            }>(subgraphUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body,
            })

            const aTokenId = response.data.reserves[0].aToken.id
            const contract = createContract<ERC20>(web3, aTokenId, ERC20ABI as AbiItem[])
            return new BigNumber((await contract?.methods.balanceOf(account).call()) ?? '0')
        } catch (error) {
            console.error('AAVE BALANCE ERROR:', error)
            return ZERO
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
            console.error('AAVE deposit estimate ERROR:', error)
            return ZERO
        }
    }

    private async createDepositTokenOperation(account: string, chainId: ChainId, web3: Web3, value: BigNumber.Value) {
        const aaveLPoolAddress = getAaveConstant(chainId, 'AAVE_LENDING_POOL_ADDRESSES_PROVIDER_CONTRACT_ADDRESS')
        const lPoolAddressProviderContract = createContract<AaveLendingPoolAddressProvider>(
            web3,
            aaveLPoolAddress,
            AaveLendingPoolAddressProviderABI as AbiItem[],
        )

        const poolAddress = await lPoolAddressProviderContract?.methods.getLendingPool().call()

        const contract = createContract<AaveLendingPool>(web3, poolAddress, AaveLendingPoolABI as AbiItem[])
        return contract?.methods.deposit(this.bareToken.address, new BigNumber(value).toFixed(), account, '0')
    }

    public async deposit(account: string, chainId: ChainId, web3: Web3, value: BigNumber.Value) {
        const gasEstimate = await this.depositEstimate(account, chainId, web3, value)
        const operation = await this.createDepositTokenOperation(account, chainId, web3, value)
        if (!operation) {
            throw new Error("Can't create deposit operation")
        }
        return new Promise<string>((resolve, reject) => {
            operation
                .send({
                    from: account,
                    gas: gasEstimate.toNumber(),
                })
                .once(TransactionEventType.ERROR, reject)
                .once(TransactionEventType.CONFIRMATION, (_, receipt) => {
                    resolve(receipt.transactionHash)
                })
        })
    }

    public async withdrawEstimate(account: string, chainId: ChainId, web3: Web3, value: BigNumber.Value) {
        try {
            const lPoolAddressProviderContract = createContract<AaveLendingPoolAddressProvider>(
                web3,
                getAaveConstant(chainId, 'AAVE_LENDING_POOL_ADDRESSES_PROVIDER_CONTRACT_ADDRESS'),
                AaveLendingPoolAddressProviderABI as AbiItem[],
            )

            const poolAddress = await lPoolAddressProviderContract?.methods.getLendingPool().call()

            const contract = createContract<AaveLendingPool>(web3, poolAddress, AaveLendingPoolABI as AbiItem[])
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
        const lPoolAddressProviderContract = createContract<AaveLendingPoolAddressProvider>(
            web3,
            getAaveConstant(chainId, 'AAVE_LENDING_POOL_ADDRESSES_PROVIDER_CONTRACT_ADDRESS'),
            AaveLendingPoolAddressProviderABI as AbiItem[],
        )

        const poolAddress = await lPoolAddressProviderContract?.methods.getLendingPool().call()

        const gasEstimate = await this.withdrawEstimate(account, chainId, web3, value)
        const contract = createContract<AaveLendingPool>(web3, poolAddress, AaveLendingPoolABI as AbiItem[])
        return new Promise<string>((resolve, reject) => {
            contract?.methods
                .withdraw(this.bareToken.address, new BigNumber(value).toFixed(), account)
                .send({
                    from: account,
                    gas: gasEstimate.toNumber(),
                })
                .once(TransactionEventType.ERROR, reject)
                .once(TransactionEventType.CONFIRMATION, (_, receipt) => {
                    resolve(receipt.transactionHash)
                })
        })
    }
}
