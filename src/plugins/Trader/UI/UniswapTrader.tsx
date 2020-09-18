import React, { useState, useEffect, useCallback } from 'react'
import classNames from 'classnames'
import { makeStyles, Theme, createStyles, Typography } from '@material-ui/core'
import ArrowDownwardIcon from '@material-ui/icons/ArrowDownward'
import { useStylesExtends } from '../../../components/custom-ui-helper'
import ActionButton from '../../../extension/options-page/DashboardComponents/ActionButton'
import { TokenAmountPanel } from './TokenAmountPanel'
import BigNumber from 'bignumber.js'
import { MessageCenter } from '../messages'
import { useERC20Token } from '../../../web3/hooks/useERC20Token'
import type { ERC20Token } from '../../../web3/types'

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
            marginBottom: theme.spacing(-1),
        },
        icon: {
            cursor: 'pointer',
        },
        submit: {
            marginTop: theme.spacing(2),
            paddingTop: 12,
            paddingBottom: 12,
        },
    })
})

export interface UniswapTraderProps extends withClasses<KeysInferFromUseStyles<typeof useStyles>> {
    address: string
}

export function UniswapTrader(props: UniswapTraderProps) {
    const classes = useStylesExtends(useStyles(), props)

    //#region get token info on chain
    const [reversed, setReversed] = useState(false)

    const [token0Address, setToken0Address] = useState(props.address)
    const [token1Address, setToken1Address] = useState('')

    const { value: token0 } = useERC20Token(token0Address)
    const { value: token1 } = useERC20Token(token1Address)

    const ERC20TokenA = reversed ? token1 : token0
    const ERC20TokenB = reversed ? token0 : token1
    //#endregion

    //#region select token
    const [focusedTokenAddress, setFocusedTokenAddress] = useState<string>('')

    // update focused token
    useEffect(
        () =>
            MessageCenter.on('selectTokenDialogUpdated', (ev) => {
                if (ev.open) return // expect close dialog
                if (!ev.token) return
                const { address = '' } = ev.token
                token0Address === focusedTokenAddress ? setToken0Address(address) : setToken1Address(address)
            }),
        [token0Address, focusedTokenAddress],
    )

    // open select token dialog
    const onTokenSelectChipClick = useCallback(
        (token?: ERC20Token | null) => {
            setFocusedTokenAddress(token?.address ?? '')
            MessageCenter.emit('selectTokenDialogUpdated', {
                open: true,
                address: token?.address,
                excludeTokens: [token0Address, token1Address].filter(Boolean),
            })
        },
        [token0Address, token1Address],
    )
    //#endregion

    //#region calc amount
    const [amountA, setAmountA] = useState('0')
    const [amountB, setAmountB] = useState('0')

    const tradeAmountA = new BigNumber(amountA)
    const tradeAmountB = new BigNumber(amountB)

    const balanceA = new BigNumber(ERC20TokenA?.balanceOf ?? '0')
    const balanceB = new BigNumber(ERC20TokenB?.balanceOf ?? '0')

    useEffect(() => {
        // do it
    }, [amountA, amountB])
    //#endregion

    console.log({
        token0Address,
        token1Address,
        tradeAmountA: tradeAmountA.toFixed(),
        tradeAmountB: tradeAmountB.toFixed(),
        balanceA: balanceA.toFixed(),
        balanceB: balanceB.toFixed(),
        ERC20TokenA: ERC20TokenA,
        ERC20TokenB: ERC20TokenB,
    })
    return (
        <form className={classes.form} noValidate autoComplete="off">
            <div className={classes.section}>
                <TokenAmountPanel
                    label="From"
                    token={ERC20TokenA}
                    amount={amountA}
                    onAmountChange={setAmountA}
                    TextFieldProps={{
                        disabled: !ERC20TokenA,
                    }}
                    SelectTokenChip={{
                        ChipProps: {
                            onClick: () => onTokenSelectChipClick(ERC20TokenA),
                        },
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
                    TextFieldProps={{
                        disabled: !ERC20TokenB,
                    }}
                    SelectTokenChip={{
                        ChipProps: {
                            onClick: () => onTokenSelectChipClick(ERC20TokenB),
                        },
                    }}
                />
            </div>
            <div className={classes.section}>
                <ActionButton
                    className={classes.submit}
                    fullWidth
                    variant="contained"
                    size="large"
                    disabled={
                        !ERC20TokenA?.address ||
                        !ERC20TokenB?.address ||
                        tradeAmountA.isZero() ||
                        tradeAmountB.isZero() ||
                        tradeAmountA.isGreaterThan(balanceA) ||
                        tradeAmountB.isGreaterThan(balanceB)
                    }
                    onClick={() => console.log('clicked!')}>
                    {(() => {
                        if (tradeAmountA.isZero() || tradeAmountB.isZero()) return 'Enter an amount'
                        if (!ERC20TokenA || !ERC20TokenB) {
                            if (!reversed && tradeAmountA.isPositive()) return 'Select a token'
                            if (reversed && tradeAmountB.isPositive()) return 'Select a token'
                        }
                        if (balanceA.isLessThan(tradeAmountA)) return `Insufficient ${ERC20TokenA?.symbol} balance`
                        if (balanceB.isLessThan(tradeAmountB)) return `Insufficient ${ERC20TokenB?.symbol} balance`
                        return 'Swap'
                    })()}
                </ActionButton>
            </div>
        </form>
    )
}
