import { formatPercentage, useAccount } from '@masknet/web3-shared'
import BigNumber from 'bignumber.js'
import { useAsyncRetry } from 'react-use'
import { DUST_POSITION_AMOUNT_ON_CHAIN } from '../constants'
import { useAmmFactory } from '../contracts/useAmmFactory'
import type { AmmExchange, LiquidityBreakdown, Market, LpAoumnt } from '../types'

export function useEstimateAddLiquidityPool(market: Market, amm: AmmExchange | undefined, cashAmount: string) {
    const ammFactoryContract = useAmmFactory(amm?.address ?? '')
    const marketFactoryAddress = market.address
    const marketId = market.id
    const account = useAccount()
    const amount = new BigNumber(cashAmount)
    console.log(amount)
    return useAsyncRetry(async () => {
        if (!market || !amm || !amount.isGreaterThan(0) || !ammFactoryContract) return

        let results = null
        let tokenAmount = '0'
        let minAmounts: LpAoumnt[] = []
        let poolPct = '0'

        const pool = await ammFactoryContract.methods.getPool(marketFactoryAddress, marketId).call()
        console.log(pool)

        if (!pool) {
            results = await ammFactoryContract.methods
                .createPool(marketFactoryAddress, marketId, cashAmount.toString(), account)
                .call()
            tokenAmount = results ?? '0'
        } else {
            results = await ammFactoryContract.methods
                .addLiquidity(marketFactoryAddress, marketId, cashAmount.toString(), 0, account)
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
        }

        if (!results) return
        return {
            amount: tokenAmount,
            minAmounts,
            poolPct,
        } as LiquidityBreakdown
    }, [market, amm, cashAmount])
}
