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
import type { ConvexBooster } from '@masknet/web3-contracts/types/ConvexBooster'
import type { ICurveFi } from '@masknet/web3-contracts/types/ICurveFi'

// import CrvDepositorABI from '@masknet/web3-contracts/abis/CrvDepositor.json'
import ConvexBoosterABI from '@masknet/web3-contracts/abis/ConvexBooster.json'
import CurveFiABI from '@masknet/web3-contracts/abis/ICurveFi.json'

import { ProtocolType, SavingsProtocol } from '../types'

import { CONVEX_POOLS } from './index'

// https://github.com/convex-community/convex-subgraph

const CONVEX_POOL_SUBGRAPH = 'https://api.thegraph.com/subgraphs/name/convex-community/curve-pools'

// https://thegraph.com/hosted-service/subgraph/convex-community/convex-staking
const CONVEX_STAKING_SUBGRAPH = 'https://api.thegraph.com/subgraphs/name/convex-community/convex-staking'

export class ConvexProtocol implements SavingsProtocol {
    static DEFAULT_APR = '0.0'
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

    public async updateApr(web3: Web3) {
        try {
            const subgraphUrl = CONVEX_STAKING_SUBGRAPH || ''

            if (!subgraphUrl) {
                this._apr = ConvexProtocol.DEFAULT_APR
                return
            }

            const body = JSON.stringify({
                query: `{
                    extraRewardAprs(token: "${this.bareToken.address}"
                }) {
                    id
                    apr
                }`,
            })
            const response = await fetch(subgraphUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: body,
            })
            const fullResponse: {
                data: {
                    extraRewardAprs: {
                        id: string
                        apr: string
                    }[]
                }
            } = await response.json()
            const liquidityRate = +fullResponse.data.extraRewardAprs[fullResponse.data.extraRewardAprs.length - 1].apr

            const RAY = pow10(27) // 10 to the power 27
            const SECONDS_PER_YEAR = 31536000

            // APY and APR are returned here as decimals, multiply by 100 to get the percents
            this._apr = new BigNumber(liquidityRate).div(RAY).toFixed(2)
        } catch (error) {
            this._apr = ConvexProtocol.DEFAULT_APR
        }
    }

    public async updateBalance(web3: Web3, account: string) {
        try {
            const poolId = CONVEX_POOLS.find((pool) => pool.token === this.bareToken.address)

            const boostAddress = getSavingsConstants(chainId).CONVEX_BOOSTER_ADDRESS || ZERO_ADDRESS

            const BoostContract = createContract<ConvexBooster>(web3, boostAddress, ConvexBoosterABI as AbiItem[])

            const poolInfo = await BoostContract?.methods.poolInfo(poolId).call()
            const tokenPooladdress = poolInfo.token
            const stakingToken = createContract<ICurveFi>(
                web3,
                tokenPooladdress || ZERO_ADDRESS,
                CurveFiABI as AbiItem[],
            )

            const userBalance = await stakingToken?.methods.balanceOf(account, 0).call()

            this._balance = new BigNumber(userBalance || '0')
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
        const poolId = CONVEX_POOLS.find((pool) => pool.token === this.bareToken.address)

        const boostAddress = getSavingsConstants(chainId).CONVEX_BOOSTER_ADDRESS || ZERO_ADDRESS

        const BoostContract = createContract<ConvexBooster>(web3, boostAddress, ConvexBoosterABI as AbiItem[])

        const poolInfo = await BoostContract?.methods.poolInfo(poolId).call()
        const tokenPooladdress = poolInfo?.token

        const stakingToken = createContract<ICurveFi>(web3, tokenPooladdress || ZERO_ADDRESS, CurveFiABI as AbiItem[])

        const allowance = await stakingToken?.methods.allowance(web3.defaultAccount[0], boostAddress).call()

        // check allowance
        if (allowance) {
            return stakingToken?.methods.add_liquidity([new BigNumber(value).toFixed(), , 0, 0], 0, { from: account })
        }
        return stakingToken?.methods.approve(boostAddress, account).call()
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
            const poolId = CONVEX_POOLS.find((pool) => pool.token === this.bareToken.address)

            const boostAddress = getSavingsConstants(chainId).CONVEX_BOOSTER_ADDRESS || ZERO_ADDRESS

            const BoostContract = createContract<ConvexBooster>(web3, boostAddress, ConvexBoosterABI as AbiItem[])

            const gasEstimate = await BoostContract?.methods
                .withdraw(poolId, new BigNumber(value).toFixed())
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
            const poolId = CONVEX_POOLS.find((pool) => pool.token === this.bareToken.address)

            const boostAddress = getSavingsConstants(chainId).CONVEX_BOOSTER_ADDRESS || ZERO_ADDRESS

            const BoostContract = createContract<ConvexBooster>(web3, boostAddress, ConvexBoosterABI as AbiItem[])

            await BoostContract?.methods.withdraw(poolId, new BigNumber(value).toFixed()).send({
                from: account,
            })
            return true
        } catch (error) {
            return false
        }
    }
}
