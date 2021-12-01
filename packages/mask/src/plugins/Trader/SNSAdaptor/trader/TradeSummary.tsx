import { useContext, useState } from 'react'
import BigNumber from 'bignumber.js'
import { IconButton, List, ListItem, ListItemSecondaryAction, ListItemText, Paper, Typography } from '@mui/material'
import { makeStyles, useStylesExtends } from '@masknet/theme'
import { TradeProvider } from '@masknet/public-api'
import LoopIcon from '@mui/icons-material/Loop'
import { formatBalance, formatPercentage, isGreaterThan, pow10, FungibleTokenDetailed } from '@masknet/web3-shared-evm'
import { ONE_BIPS } from '../../constants'
import { SwapQuoteResponse, TradeComputed, TradeStrategy } from '../../types'
import { resolveUniswapWarningLevel, resolveUniswapWarningLevelColor, resolveZrxTradePoolName } from '../../pipes'
import { TradeContext } from '../../trader/useTradeContext'

type SummaryRecord = {
    title: string
    tip?: string
    children?: React.ReactNode
} | null

const useStyles = makeStyles()((theme) => ({
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

export interface TradeSummaryProps extends withClasses<'root'> {
    trade: TradeComputed
    provider: TradeProvider
    inputToken: FungibleTokenDetailed
    outputToken: FungibleTokenDetailed
}

export function TradeSummary(props: TradeSummaryProps) {
    const { trade, provider, inputToken, outputToken } = props

    const classes = useStylesExtends(useStyles(), props)
    const [priceReversed, setPriceReversed] = useState(false)
    const context = useContext(TradeContext)

    const { strategy, inputAmount, outputAmount, maximumSold, minimumReceived, priceImpact, fee } = trade

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
                                              .multipliedBy(pow10(inputToken.decimals - outputToken.decimals))
                                              .multipliedBy(pow10(outputToken.decimals))
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
                                              .multipliedBy(pow10(outputToken.decimals - inputToken.decimals))
                                              .multipliedBy(pow10(inputToken.decimals))
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
                        color: resolveUniswapWarningLevelColor(resolveUniswapWarningLevel(priceImpact)),
                    }}>
                    {priceImpact?.isLessThan(ONE_BIPS) ? '<0.01%' : `${formatPercentage(priceImpact)}`}
                </Typography>
            ),
        },
        {
            title: 'Liquidity Provider Fee',
            children: (
                <Typography className={classes.title}>
                    <strong className={classes.emphasis}>{formatBalance(fee, inputToken.decimals, 6)}</strong>{' '}
                    {inputToken.symbol}
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
                    {priceImpact?.isLessThan(ONE_BIPS) ? '<0.01%' : `${formatPercentage(priceImpact)}`}
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
                        .sort((a, z) => (isGreaterThan(a.proportion, z.proportion) ? -1 : 1))
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
                    ...(context?.IS_UNISWAP_V2_LIKE || context?.IS_UNISWAP_V3_LIKE ? uniswapRecords : []),
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
