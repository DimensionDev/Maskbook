import React from 'react'
import { makeStyles, Theme, createStyles } from '@material-ui/core'
import type { Coin } from '../types'

const useStyles = makeStyles((theme: Theme) => {
    return createStyles({})
})

export interface UniswapTraderProps extends withClasses<KeysInferFromUseStyles<typeof useStyles>> {
    coin: Coin
}

export function UniswapTrader(props: UniswapTraderProps) {
    return <h1>Uniswap Trader</h1>
}
