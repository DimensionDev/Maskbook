import type { AugurAmmFactory } from '@masknet/web3-contracts/types/AugurAmmFactory'
import type { AugurBalancerPool } from '@masknet/web3-contracts/types/AugurBalancerPool'
import { formatPercentage, useAccount } from '@masknet/web3-shared'
import BigNumber from 'bignumber.js'
import { useAsyncRetry } from 'react-use'
import { DUST_POSITION_AMOUNT_ON_CHAIN } from '../constants'
import { useAmmFactory } from '../contracts/useAmmFactory'
import { useBalancerPool } from '../contracts/useBalancerPool'
import { AmmExchange, LiquidityBreakdown, Market, LpAoumnt, LiquidityActionType, AmmOutcome } from '../types'

export function useEstimateLiquidityPool(
    market: Market,
    amm: AmmExchange | undefined,
    amount: string,
    ammOutcomes: AmmOutcome[],
    type: LiquidityActionType,
) {
    const ammFactoryContract = useAmmFactory(amm?.address ?? '')
    const balancerPoolContract = useBalancerPool(amm?.lpToken?.address ?? '')
    const account = useAccount()
    const amountBN = new BigNumber(amount)

    return useAsyncRetry(async () => {
        if (!market || !amm || !amountBN.isGreaterThan(0) || !ammFactoryContract || !account) return
        if (type === LiquidityActionType.Add || type === LiquidityActionType.Create) {
            return estimateAddLiquidityPool(account, market, amm, amount, ammFactoryContract)
        } else {
            if (!balancerPoolContract) return
            return estimateRemoveLiquidityPool(
                account,
                market,
                amm,
                ammOutcomes,
                amount,
                ammFactoryContract,
                balancerPoolContract,
            )
        }
    }, [market, amm, amount])
}

export async function estimateAddLiquidityPool(
    account: string,
    market: Market,
    amm: AmmExchange,
    amount: string,
    ammFactoryContract: AugurAmmFactory,
) {
    const marketId = market.id
    const marketFactoryAddress = market.address
    let results = null
    let tokenAmount = '0'
    let minAmounts: LpAoumnt[] = []
    let poolPct = '0'
    let type: LiquidityActionType

    if (!amm.lpToken) {
        type = LiquidityActionType.Create
        results = await ammFactoryContract.methods
            .createPool(marketFactoryAddress, marketId, amount, account)
            .call({ from: account })

        poolPct = formatPercentage(1)
        return {
            amount: results,
            poolPct: poolPct,
            type,
        } as LiquidityBreakdown
    } else {
        type = LiquidityActionType.Add
        results = await ammFactoryContract.methods
            .addLiquidity(marketFactoryAddress, marketId, amount, 0, account)
            .call({ from: account })

        if (results) {
            const { _balances, _poolAmountOut } = results
            minAmounts = _balances
                ? _balances.map(
                      (v, i) =>
                          ({
                              amount: v,
                              outcomeId: i,
                              hide: DUST_POSITION_AMOUNT_ON_CHAIN.isGreaterThan(v),
                          } as LpAoumnt),
                  )
                : []

            tokenAmount = _poolAmountOut
            const poolSupply = amm.totalLiquidity.plus(tokenAmount)
            poolPct = formatPercentage(new BigNumber(tokenAmount).dividedBy(poolSupply))
        }

        return {
            amount: tokenAmount,
            minAmounts,
            poolPct,
            type,
        } as LiquidityBreakdown
    }
}

export async function estimateRemoveLiquidityPool(
    account: string,
    market: Market,
    amm: AmmExchange,
    ammOutcomes: AmmOutcome[],
    lpTokenBalance: string,
    ammFactoryContract: AugurAmmFactory,
    balancerPoolContract: AugurBalancerPool,
): Promise<LiquidityBreakdown | undefined> {
    let minAmounts
    let collateralOut = '0'

    if (!market.hasWinner) {
        const results = await ammFactoryContract.methods
            .removeLiquidity(market.address, market.id, lpTokenBalance, '0', account)
            .call({ from: account })

        if (!results) return
        const { _balances, _collateralOut } = results
        collateralOut = _collateralOut
        minAmounts = _balances.map((v, i) => ({
            amount: v,
            outcomeId: i,
            hide: DUST_POSITION_AMOUNT_ON_CHAIN.isGreaterThan(v),
        }))
    } else {
        const results = await balancerPoolContract.methods
            .calcExitPool(
                lpTokenBalance,
                ammOutcomes.map((o) => '0'),
            )
            .call({ from: account })

        if (!results) return
        minAmounts = ammOutcomes.map((o, i) => ({
            amount: results[i] ?? '0',
            outcomeId: i,
            hide: DUST_POSITION_AMOUNT_ON_CHAIN.isGreaterThan(results[i]),
        }))
    }

    const totalSupply = new BigNumber(amm.totalSupply ?? '0')
    const poolPct = formatPercentage(totalSupply.isZero() ? '0' : new BigNumber(lpTokenBalance).dividedBy(totalSupply))

    return {
        minAmounts,
        amount: collateralOut,
        poolPct,
        type: LiquidityActionType.Remove,
    } as LiquidityBreakdown
}
