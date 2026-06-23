import { BigNumber } from 'bignumber.js'
import { AaveLendingPoolAbi } from '@masknet/web3-contracts/types/AaveLendingPool.js'
import { AaveLendingPoolAddressProviderAbi } from '@masknet/web3-contracts/types/AaveLendingPoolAddressProvider.js'
import { ERC20Abi } from '@masknet/web3-contracts/types/ERC20.js'
import { fetchJSON } from '@masknet/web3-providers/helpers'
import { EVMContract, EVMWeb3 } from '@masknet/web3-providers'
import { ZERO, pow10, type FungibleToken } from '@masknet/web3-shared-base'
import { type ChainId, type SchemaType, getAaveConstant } from '@masknet/web3-shared-evm'
import type { Address } from 'viem'
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

    public async getApr(chainId: ChainId) {
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

    public async getBalance(chainId: ChainId, account: string) {
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
            const contract = EVMContract.getContract(aTokenId, ERC20Abi)
            return new BigNumber(
                (
                    await EVMContract.readContract(contract, 'balanceOf', [account as Address], { chainId })
                )?.toString() ?? '0',
            )
        } catch (error) {
            console.error('AAVE BALANCE ERROR:', error)
            return ZERO
        }
    }

    public async depositEstimate(account: string, chainId: ChainId, value: BigNumber.Value) {
        try {
            const poolAddress = await this.getPoolAddress(chainId)
            const contract = EVMContract.getContract(poolAddress, AaveLendingPoolAbi)
            const gasEstimate = await EVMContract.estimateContractGas(
                contract,
                'deposit',
                [this.bareToken.address as Address, BigInt(new BigNumber(value).toFixed(0)), account as Address, 0],
                {
                    chainId,
                    from: account,
                },
            )

            return new BigNumber(gasEstimate || 0)
        } catch (error) {
            console.error('AAVE deposit estimate ERROR:', error)
            return ZERO
        }
    }

    private async getPoolAddress(chainId: ChainId) {
        const aaveLPoolAddress = getAaveConstant(chainId, 'AAVE_LENDING_POOL_ADDRESSES_PROVIDER_CONTRACT_ADDRESS')
        const lPoolAddressProviderContract = EVMContract.getContract(
            aaveLPoolAddress,
            AaveLendingPoolAddressProviderAbi,
        )

        return (await EVMContract.readContract(lPoolAddressProviderContract, 'getLendingPool', [], {
            chainId,
        })) as Address | undefined
    }

    public async deposit(account: string, chainId: ChainId, value: BigNumber.Value) {
        const gasEstimate = new BigNumber(await this.depositEstimate(account, chainId, value))
        const poolAddress = await this.getPoolAddress(chainId)
        const contract = EVMContract.getContract(poolAddress, AaveLendingPoolAbi)
        const tx = EVMContract.createTransactionRequest(
            contract,
            'deposit',
            [this.bareToken.address as Address, BigInt(new BigNumber(value).toFixed(0)), account as Address, 0],
            {
                from: account,
                gas: gasEstimate.toFixed(),
                chainId,
            },
        )
        if (!tx) {
            throw new Error("Can't create deposit transaction")
        }
        return EVMWeb3.sendTransaction(tx, { chainId })
    }

    public async withdrawEstimate(account: string, chainId: ChainId, value: BigNumber.Value) {
        try {
            const poolAddress = await this.getPoolAddress(chainId)
            const contract = EVMContract.getContract(poolAddress, AaveLendingPoolAbi)
            const gasEstimate = await EVMContract.estimateContractGas(
                contract,
                'withdraw',
                [this.bareToken.address as Address, BigInt(new BigNumber(value).toFixed(0)), account as Address],
                {
                    chainId,
                    from: account,
                },
            )
            return new BigNumber(gasEstimate || 0)
        } catch (error) {
            return ZERO
        }
    }

    public async withdraw(account: string, chainId: ChainId, value: BigNumber.Value) {
        const poolAddress = await this.getPoolAddress(chainId)
        const gasEstimate = new BigNumber(await this.withdrawEstimate(account, chainId, value))
        const contract = EVMContract.getContract(poolAddress, AaveLendingPoolAbi)
        const tx = EVMContract.createTransactionRequest(
            contract,
            'withdraw',
            [this.bareToken.address as Address, BigInt(new BigNumber(value).toFixed(0)), account as Address],
            {
                from: account,
                gas: gasEstimate.toFixed(),
                chainId,
            },
        )
        if (!tx) {
            throw new Error("Can't create withdraw transaction")
        }
        return EVMWeb3.sendTransaction(tx, { chainId })
    }
}
