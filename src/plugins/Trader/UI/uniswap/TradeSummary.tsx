import React, { useState } from 'react'
import {
    makeStyles,
    Theme,
    createStyles,
    Paper,
    List,
    ListItem,
    ListItemText,
    ListItemSecondaryAction,
    Typography,
    IconButton,
} from '@material-ui/core'
import type { Trade } from '@uniswap/sdk'
import LoopIcon from '@material-ui/icons/Loop'
import { useComputedTrade } from '../../uniswap/useComputedTrade'
import type { Token } from '../../../../web3/types'
import { ONE_BIPS } from '../../constants'
import { useStylesExtends } from '../../../../components/custom-ui-helper'
import { TradeStrategy } from '../../types'

const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        root: {
            width: 320,
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
    trade: Trade | null
    strategy: TradeStrategy
    inputToken?: Token
    outputToken?: Token
}

export function TradeSummary(props: TradeSummaryProps) {
    const { trade, strategy, inputToken, outputToken } = props
    const classes = useStylesExtends(useStyles(), props)

    const computedTrade = useComputedTrade(trade)
    const [priceReversed, setPriceReversed] = useState(false)

    if (!trade) return null
    if (!computedTrade) return null
    if (!inputToken || !outputToken) return null

    const isExactIn = strategy === TradeStrategy.ExactIn
    const records = [
        trade.inputAmount.greaterThan('0') && trade.outputAmount.greaterThan('0')
            ? {
                  title: 'Price',
                  children: (
                      <Typography className={classes.title}>
                          {priceReversed ? (
                              <span>
                                  {trade.outputAmount.divide(trade.inputAmount).toSignificant(6)} {outputToken.symbol}
                                  {' per '}
                                  {inputToken.symbol}
                              </span>
                          ) : (
                              <span>
                                  {trade.inputAmount.divide(trade.outputAmount).toSignificant(6)} {inputToken.symbol}
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
                          {computedTrade.minimumReceived?.toSignificant(4)} {outputToken.symbol}
                      </Typography>
                  ),
              }
            : null,
        !isExactIn
            ? {
                  title: 'Maximum sold',
                  children: (
                      <Typography className={classes.title}>
                          {computedTrade.maximumSold?.toSignificant(4)} {inputToken.symbol}
                      </Typography>
                  ),
              }
            : null,
        {
            title: 'Price Impact',
            children: (
                <Typography className={classes.title}>
                    {computedTrade.priceImpact
                        ? computedTrade.priceImpact?.lessThan(ONE_BIPS)
                            ? '<0.01%'
                            : `${computedTrade.priceImpact?.toFixed(2)}%`
                        : '-'}
                </Typography>
            ),
        },
        {
            title: 'Liquidity Provider Fee',
            children: (
                <Typography className={classes.title}>
                    {computedTrade.fee?.toSignificant(6)} {inputToken.symbol}
                </Typography>
            ),
        },
    ] as {
        title: string
        tip?: string
        children?: React.ReactNode
    }[]
    return (
        <Paper className={classes.root} variant="outlined">
            <List className={classes.list} component="ul">
                {records.filter(Boolean).map((record) => (
                    <ListItem className={classes.item} key={record.title}>
                        <ListItemText primaryTypographyProps={{ className: classes.title }} primary={record.title} />
                        <ListItemSecondaryAction className={classes.content}>{record.children}</ListItemSecondaryAction>
                    </ListItem>
                ))}
            </List>
        </Paper>
    )
}
