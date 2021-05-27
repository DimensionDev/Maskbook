import { useState } from 'react'
import BigNumber from 'bignumber.js'
import {
    makeStyles,
    Paper,
    List,
    ListItem,
    ListItemText,
    ListItemSecondaryAction,
    Typography,
    IconButton,
} from '@material-ui/core'
import LoopIcon from '@material-ui/icons/Loop'
import { ONE_BIPS } from '../../constants'
import { useStylesExtends } from '../../../../components/custom-ui-helper'
import { SwapQuoteResponse, TradeComputed, TradeProvider, TradeStrategy } from '../../types'
import { formatBalance, formatPercentage } from '@dimensiondev/maskbook-shared'
import type { FungibleTokenDetailed } from '../../../../web3/types'
import { resolveUniswapWarningLevel, resolveUniswapWarningLevelColor, resolveZrxTradePoolName } from '../../pipes'

type SummaryRecord = {
    title: string
    tip?: string
    children?: React.ReactNode
} | null

const useStyles = makeStyles((theme) => ({
    root: {
        width: '100%',
        boxSizing: 'border-box',
        margin: theme.spacing(0, 'auto', 2),
    },
    iconButton: {
        marginLeft: theme.spacing(0.5),
    },
    icon: {
        fontSize: '0.75em !important',
    },
    list: {},
    item: {
        paddingTop: 0,
        paddingBottom: 0,
    },
    title: {
        fontSize: 12,
        color: theme.palette.text.secondary,
        display: 'flex',
        alignItems: 'center',
    },
    content: {
        fontSize: 12,
        color: theme.palette.text.secondary,
        paddingLeft: theme.spacing(15),
        textAlign: 'right',
    },
    emphasis: {
        color: theme.palette.text.primary,
        fontWeight: 300,
        margin: `0 ${theme.spacing(0.5)}`,
    },
}))

export interface TradeSummaryProps extends withClasses<never> {
    trade: TradeComputed
    provider: TradeProvider
    inputToken: FungibleTokenDetailed
    outputToken: FungibleTokenDetailed
}

export function TradeSummary(props: TradeSummaryProps) {
    const { trade, provider, inputToken, outputToken } = props

    const classes = useStylesExtends(useStyles(), props)
    const [priceReversed, setPriceReversed] = useState(false)

    const {
        strategy,
        inputAmount,
        outputAmount,
        maximumSold,
        minimumReceived,
        priceImpact,
        priceImpactWithoutFee,
        fee,
    } = trade
    const isExactIn = strategy === TradeStrategy.ExactIn

    const records: SummaryRecord[] = [
        inputAmount.isGreaterThan('0') && outputAmount.isGreaterThan('0')
            ? {
                  title: 'Price',
                  children: (
                      <Typography className={classes.title}>
                          {priceReversed ? (
                              <span>
                                  <strong className={classes.emphasis}>
                                      {formatBalance(
                                          outputAmount
                                              .dividedBy(inputAmount)
                                              .multipliedBy(
                                                  new BigNumber(10).pow(inputToken.decimals - outputToken.decimals),
                                              )
                                              .multipliedBy(new BigNumber(10).pow(outputToken.decimals))
                                              .integerValue(),
                                          outputToken.decimals,
                                          6,
                                      )}
                                  </strong>
                                  {outputToken.symbol}
                                  {' per '}
                                  {inputToken.symbol}
                              </span>
                          ) : (
                              <span>
                                  <strong className={classes.emphasis}>
                                      {formatBalance(
                                          inputAmount
                                              .dividedBy(outputAmount)
                                              .multipliedBy(
                                                  new BigNumber(10).pow(outputToken.decimals - inputToken.decimals),
                                              )
                                              .multipliedBy(new BigNumber(10).pow(inputToken.decimals))
                                              .integerValue(),
                                          inputToken.decimals,
                                          6,
                                      )}
                                  </strong>
                                  {inputToken.symbol}
                                  {' per '}
                                  {outputToken.symbol}
                              </span>
                          )}
                          <IconButton
                              className={classes.iconButton}
                              color="inherit"
                              size="small"
                              onClick={() => setPriceReversed((x) => !x)}>
                              <LoopIcon className={classes.icon} />
                          </IconButton>
                      </Typography>
                  ),
              }
            : null,
        isExactIn
            ? {
                  title: 'Minimum Received',
                  children: (
                      <Typography className={classes.title}>
                          <strong className={classes.emphasis}>
                              {formatBalance(minimumReceived, outputToken.decimals, 6)}
                          </strong>{' '}
                          {outputToken.symbol}
                      </Typography>
                  ),
              }
            : null,
        !isExactIn
            ? {
                  title: 'Maximum Sold',
                  children: (
                      <Typography className={classes.title}>
                          <strong className={classes.emphasis}>
                              {formatBalance(maximumSold, inputToken.decimals, 6)}
                          </strong>{' '}
                          {inputToken.symbol}
                      </Typography>
                  ),
              }
            : null,
    ]

    const uniswapRecords: SummaryRecord[] = [
        {
            title: 'Price Impact',
            children: (
                <Typography
                    className={classes.title}
                    style={{
                        color: resolveUniswapWarningLevelColor(resolveUniswapWarningLevel(priceImpactWithoutFee)),
                    }}>
                    {priceImpactWithoutFee.isGreaterThan('0')
                        ? priceImpactWithoutFee?.isLessThan(ONE_BIPS)
                            ? '<0.01%'
                            : `${formatPercentage(priceImpactWithoutFee)}`
                        : '-'}
                </Typography>
            ),
        },
        {
            title: 'Liquidity Provider Fee',
            children: (
                <Typography className={classes.title}>
                    {formatBalance(fee, inputToken.decimals, 6)} {inputToken.symbol}
                </Typography>
            ),
        },
    ]

    const balancerRecords: SummaryRecord[] = [
        {
            title: 'Price Impact',
            children: (
                <Typography
                    className={classes.title}
                    style={{
                        color: resolveUniswapWarningLevelColor(resolveUniswapWarningLevel(priceImpact)),
                    }}>
                    {priceImpact.isGreaterThan('0')
                        ? priceImpact?.isLessThan(ONE_BIPS)
                            ? '<0.01%'
                            : `${formatPercentage(priceImpact)}`
                        : '-'}
                </Typography>
            ),
        },
    ]

    const trade_ = (trade as TradeComputed<SwapQuoteResponse>).trade_
    const zrxRecords: SummaryRecord[] = [
        {
            title: 'Proportion',
            children: (
                <Typography className={classes.title}>
                    {(trade_?.sources ?? [])
                        .filter((x) => {
                            const proportion = new BigNumber(x.proportion)
                            return !proportion.isZero() && proportion.isGreaterThan('1e-5')
                        })
                        .sort((a, z) => (new BigNumber(a.proportion).isGreaterThan(z.proportion) ? -1 : 1))
                        .slice(0, 3)
                        .map((y) => `${resolveZrxTradePoolName(y.name)} (${formatPercentage(y.proportion)})`)
                        .join(' + ')}
                </Typography>
            ),
        },
    ]

    return (
        <Paper className={classes.root} variant="outlined">
            <List className={classes.list} component="ul">
                {[
                    ...records,
                    ...([TradeProvider.UNISWAP, TradeProvider.SUSHISWAP, TradeProvider.SASHIMISWAP].includes(provider)
                        ? uniswapRecords
                        : []),
                    ...(provider === TradeProvider.BALANCER ? balancerRecords : []),
                    ...(provider === TradeProvider.ZRX ? zrxRecords : []),
                ].map((record) =>
                    record ? (
                        <ListItem className={classes.item} key={record.title}>
                            <ListItemText
                                primaryTypographyProps={{ className: classes.title }}
                                primary={record.title}
                            />
                            <ListItemSecondaryAction className={classes.content}>
                                {record.children}
                            </ListItemSecondaryAction>
                        </ListItem>
                    ) : null,
                )}
            </List>
        </Paper>
    )
}
