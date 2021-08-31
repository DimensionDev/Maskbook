import { formatPercentage, useAccount } from '@masknet/web3-shared'
import BigNumber from 'bignumber.js'
import { isZeroAddress } from 'ethereumjs-util'
import { useAsyncRetry } from 'react-use'
import { isAddress } from 'web3-utils'
import { DUST_POSITION_AMOUNT_ON_CHAIN } from '../constants'
import { useAmmFactory } from '../contracts/useAmmFactory'
import { AmmExchange, LiquidityBreakdown, Market, LpAoumnt, LiquidityActionType } from '../types'

export function useEstimateAddLiquidityPool(market: Market, amm: AmmExchange | undefined, cashAmount: string) {
    const ammFactoryContract = useAmmFactory(amm?.address ?? '')
    const marketFactoryAddress = market.address
    const marketId = market.id
    const account = useAccount()
    const amount = new BigNumber(cashAmount)

    return useAsyncRetry(async () => {
        if (!market || !amm || !amount.isGreaterThan(0) || !ammFactoryContract) return

        let results = null
        let tokenAmount = '0'
        let minAmounts: LpAoumnt[] = []
        let poolPct = '0'
        let type: LiquidityActionType

        const pool = await ammFactoryContract.methods.getPool(marketFactoryAddress, marketId).call()

        if (!pool || !isAddress(pool) || isZeroAddress(pool)) {
            type = LiquidityActionType.Create
            results = await ammFactoryContract.methods
                .createPool(marketFactoryAddress, marketId, cashAmount, account)
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
                .addLiquidity(marketFactoryAddress, marketId, cashAmount, 0, account)
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
    }, [market, amm, cashAmount])
}
