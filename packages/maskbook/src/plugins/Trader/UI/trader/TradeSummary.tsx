import { useState } from 'react'
import {
    makeStyles,
    createStyles,
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
import { formatBalance, formatPercentage } from '../../../Wallet/formatter'
import type { ERC20TokenDetailed, EtherTokenDetailed } from '../../../../web3/types'
import BigNumber from 'bignumber.js'
import { resolveUniswapWarningLevel, resolveUniswapWarningLevelColor, resolveZrxTradePoolName } from '../../pipes'
type SummaryRecord = {
    title: string
    tip?: string
    children?: React.ReactNode
} | null

const useStyles = makeStyles((theme) =>
    createStyles({
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
        },
    }),
)

export interface TradeSummaryProps extends withClasses<KeysInferFromUseStyles<typeof useStyles>> {
    trade: TradeComputed
    provider: TradeProvider
    inputToken: EtherTokenDetailed | ERC20TokenDetailed
    outputToken: EtherTokenDetailed | ERC20TokenDetailed
}

export function TradeSummary(props: TradeSummaryProps) {
    const { trade, provider, inputToken, outputToken } = props
    const classes = useStylesExtends(useStyles(), props)

    const [priceReversed, setPriceReversed] = useState(false)

    const { strategy, inputAmount, outputAmount, maximumSold, minimumReceived, priceImpactWithoutFee, fee } = trade

    const isExactIn = strategy === TradeStrategy.ExactIn

    const records: SummaryRecord[] = [
        inputAmount.isGreaterThan('0') && outputAmount.isGreaterThan('0')
            ? {
                  title: 'Price',
                  children: (
                      <Typography className={classes.title}>
                          {priceReversed ? (
                              <span>
                                  {formatBalance(
                                      outputAmount
                                          .dividedBy(inputAmount)
                                          .multipliedBy(
                                              new BigNumber(10).pow(
                                                  (inputToken.decimals ?? 0) - (outputToken.decimals ?? 0),
                                              ),
                                          )
                                          .multipliedBy(new BigNumber(10).pow(outputToken.decimals ?? 0)),
                                      outputToken.decimals ?? 0,
                                      6,
                                  )}{' '}
                                  {outputToken.symbol}
                                  {' per '}
                                  {inputToken.symbol}
                              </span>
                          ) : (
                              <span>
                                  {formatBalance(
                                      inputAmount
                                          .dividedBy(outputAmount)
                                          .multipliedBy(
                                              new BigNumber(10).pow(
                                                  (outputToken.decimals ?? 0) - (inputToken.decimals ?? 0),
                                              ),
                                          )
                                          .multipliedBy(new BigNumber(10).pow(inputToken.decimals ?? 0)),
                                      inputToken.decimals ?? 0,
                                      6,
                                  )}{' '}
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
                  title: 'Minimum received',
                  children: (
                      <Typography className={classes.title}>
                          {formatBalance(minimumReceived, outputToken.decimals ?? 0, 6)} {outputToken.symbol}
                      </Typography>
                  ),
              }
            : null,
        !isExactIn
            ? {
                  title: 'Maximum sold',
                  children: (
                      <Typography className={classes.title}>
                          {formatBalance(maximumSold, inputToken.decimals ?? 0, 6)} {inputToken.symbol}
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
                    {formatBalance(fee, inputToken.decimals ?? 0, 6)} {inputToken.symbol}
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
                        .filter(
                            (x) =>
                                x.proportion !== '0' &&
                                new BigNumber(x.proportion).isGreaterThan(new BigNumber('0.00001')),
                        )
                        .sort((a, z) => (new BigNumber(a.proportion).isGreaterThan(z.proportion) ? -1 : 1))
                        .slice(0, 3)
                        .map(
                            (y) =>
                                `${resolveZrxTradePoolName(y.name)} (${formatPercentage(new BigNumber(y.proportion))})`,
                        )
                        .join('+')}
                </Typography>
            ),
        },
    ]

    return (
        <Paper className={classes.root} variant="outlined">
            <List className={classes.list} component="ul">
                {[
                    ...records,
                    ...(provider === TradeProvider.UNISWAP ? uniswapRecords : []),
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
