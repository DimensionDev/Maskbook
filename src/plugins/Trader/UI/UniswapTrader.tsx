import React, { useState, useEffect } from 'react'
import classNames from 'classnames'
import { makeStyles, Theme, createStyles, Typography } from '@material-ui/core'
import ArrowDownwardIcon from '@material-ui/icons/ArrowDownward'
import type { Coin } from '../types'
import { useStylesExtends } from '../../../components/custom-ui-helper'
import ActionButton from '../../../extension/options-page/DashboardComponents/ActionButton'
import { SWAP_OPPOSITE_TOKEN } from '../constants'
import { TokenAmountPanel } from './TokenAmountPanel'
import { useERC20Token } from '../hooks/useERC20Token'
import BigNumber from 'bignumber.js'

const useStyles = makeStyles((theme: Theme) => {
    return createStyles({
        form: {
            width: 300,
            margin: `${theme.spacing(2)}px auto`,
        },
        section: {
            textAlign: 'center',
            margin: `${theme.spacing(1)}px auto`,
        },
        divider: {
            marginTop: theme.spacing(-0.5),
            marginBottom: theme.spacing(1),
        },
        icon: {
            cursor: 'pointer',
        },
        submit: {
            marginTop: theme.spacing(2),
            paddingTop: 14,
            paddingBottom: 14,
        },
    })
})

export interface UniswapTraderProps extends withClasses<KeysInferFromUseStyles<typeof useStyles>> {
    coin: Coin
}

export function UniswapTrader(props: UniswapTraderProps) {
    const classes = useStylesExtends(useStyles(), props)
    const { coin } = props

    const [reversed, setReversed] = useState(false)
    const [oppositeToken, setOppositeToken] = useState<Coin | null>(null)

    const tokenA = reversed ? oppositeToken : props.coin
    const tokenB = reversed ? props.coin : oppositeToken

    //#region get token info on chain
    const { value: ERC20TokenA } = useERC20Token(tokenA)
    const { value: ERC20TokenB } = useERC20Token(tokenB)
    //#endregion

    //#region calc amount
    const [amountA, setAmountA] = useState('0')
    const [amountB, setAmountB] = useState('0')

    const tradeAmountA = new BigNumber(amountA)
    const tradeAmountB = new BigNumber(amountB)

    useEffect(() => {
        // do it
    }, [amountA, amountB])
    //#endregion

    console.log({
        tokenA,
        tokenB,
        ERC20TokenA,
        ERC20TokenB,
        coin,
    })

    if (!ERC20TokenA?.address && !ERC20TokenB?.address) return null

    return (
        <form className={classes.form} noValidate autoComplete="off">
            <div className={classes.section}>
                <TokenAmountPanel
                    label="From"
                    token={ERC20TokenA}
                    amount={amountA}
                    onAmountChange={setAmountA}
                    SelectTokenChip={{
                        readonly: tokenA?.id === coin.id,
                    }}
                    TextFieldProps={{
                        disabled: !tokenA,
                    }}
                />
            </div>
            <div className={classNames(classes.section, classes.divider)}>
                <Typography color="primary">
                    <ArrowDownwardIcon className={classes.icon} onClick={() => setReversed((x) => !x)} />
                </Typography>
            </div>
            <div className={classes.section}>
                <TokenAmountPanel
                    label="To"
                    token={ERC20TokenB}
                    amount={amountB}
                    onAmountChange={setAmountB}
                    MaxChipProps={{ style: { display: 'none' } }}
                    SelectTokenChip={{
                        readonly: tokenB?.id === coin.id,
                    }}
                    TextFieldProps={{
                        disabled: !tokenB,
                    }}
                />
            </div>
            <div className={classes.section}>
                <ActionButton
                    className={classes.submit}
                    fullWidth
                    variant="contained"
                    size="large"
                    onClick={() => console.log('clicked!')}>
                    {(() => {
                        if (tradeAmountA.isZero() && tradeAmountB.isZero()) return 'Enter an amount'
                        if (!tokenA || !tokenB) {
                            if (!reversed && tradeAmountA.isPositive()) return 'Select a token'
                            if (reversed && tradeAmountB.isPositive()) return 'Select a token'
                        }
                        if (new BigNumber(ERC20TokenA?.balance ?? '0').isLessThan(tradeAmountA))
                            return `Insufficient ${ERC20TokenA?.symbol} balance`
                        if (new BigNumber(ERC20TokenB?.balance ?? '0').isLessThan(tradeAmountB))
                            return `Insufficient ${ERC20TokenB?.symbol} balance`
                        return ''
                    })()}
                </ActionButton>
            </div>
        </form>
    )
}
