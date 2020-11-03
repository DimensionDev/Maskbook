import React, { useEffect, useCallback, ChangeEvent, useState, useMemo } from 'react'
import {
    makeStyles,
    Theme,
    createStyles,
    TextField,
    Typography,
    Box,
    Chip,
    InputProps,
    ChipProps,
    TextFieldProps,
} from '@material-ui/core'
import BigNumber from 'bignumber.js'
import { debounce } from 'lodash-es'
import { SelectTokenChip, SelectTokenChipProps } from './SelectTokenChip'
import { formatBalance } from '../../plugins/Wallet/formatter'
import type { Token } from '../types'
import { MIN_AMOUNT_LENGTH, MAX_AMOUNT_LENGTH } from '../constants'
import { useStylesExtends } from '../../components/custom-ui-helper'

const useStyles = makeStyles((theme: Theme) => {
    return createStyles({
        root: {},
        input: {
            '&::-webkit-outer-spin-button, &::-webkit-inner-spin-button': {
                '-webkit-appearance': 'none',
                margin: 0,
            },
            '-moz-appearance': 'textfield',
        },
        max: {
            marginRight: theme.spacing(0.5),
            borderRadius: 8,
        },
        token: {
            whiteSpace: 'pre',
            maxWidth: 300,
            paddingLeft: theme.spacing(1),
        },
        balance: {
            fontSize: 12,
        },
    })
})

export interface TokenAmountPanelProps extends withClasses<KeysInferFromUseStyles<typeof useStyles>> {
    amount: string
    balance: string
    onAmountChange: (amount: string) => void
    label: string
    token?: Token | null
    InputProps?: Partial<InputProps>
    MaxChipProps?: Partial<ChipProps>
    SelectTokenChip?: Partial<SelectTokenChipProps>
    TextFieldProps?: Partial<TextFieldProps>
}

export function TokenAmountPanel(props: TokenAmountPanelProps) {
    const { amount, balance, token, onAmountChange, label } = props

    const classes = useStylesExtends(useStyles(), props)

    //#region update amount by parent
    const { RE_MATCH_WHOLE_AMOUNT, RE_MATCH_PARTIAL_AMOUNT } = useMemo(() => {
        const fractionLength = token?.decimals ?? 18
        return {
            RE_MATCH_WHOLE_AMOUNT: new RegExp(`^\\d*\\.?\\d{0,${fractionLength}}$`), // d.ddd...d
            RE_MATCH_PARTIAL_AMOUNT: new RegExp(`^\\d*\\.(?:\\d{0,${fractionLength - 1}}0)?$`), // d.ddd...0
        }
    }, [token?.decimals])
    const [amountForUI, setAmountForUI] = useState('')

    useEffect(() => {
        setAmountForUI(amount === '0' ? '' : amount)
    }, [amount])
    //#endregion

    //#region update amount by self
    const onAmountChangeDebounced = useMemo(
        () =>
            debounce(onAmountChange, 50, {
                leading: false,
                trailing: true,
            }),
        [onAmountChange],
    )
    const onChange = useCallback(
        (ev: ChangeEvent<HTMLInputElement>) => {
            if (typeof token?.decimals === 'undefined') return
            const amount_ = ev.currentTarget.value.replace(/,/g, '.')
            if (!amount_) {
                setAmountForUI('')
                onAmountChangeDebounced('0')
            } else if (amount_ === '0') setAmountForUI('0')
            else if (RE_MATCH_PARTIAL_AMOUNT.test(amount_)) setAmountForUI(amount_)
            else if (RE_MATCH_WHOLE_AMOUNT.test(amount_)) {
                const v = new BigNumber(amount_).multipliedBy(new BigNumber(10).pow(token.decimals)).toFixed()
                setAmountForUI(v)
                onAmountChangeDebounced(v)
            }
        },
        [onAmountChangeDebounced, token?.decimals, RE_MATCH_WHOLE_AMOUNT, RE_MATCH_PARTIAL_AMOUNT],
    )
    //#endregion

    return (
        <TextField
            className={classes.root}
            label={label}
            fullWidth
            required
            type="text"
            value={
                amountForUI === ''
                    ? ''
                    : RE_MATCH_PARTIAL_AMOUNT.test(amountForUI)
                    ? amountForUI
                    : formatBalance(new BigNumber(amountForUI), token?.decimals ?? 0, MAX_AMOUNT_LENGTH - 2)
            }
            variant="outlined"
            onChange={onChange}
            InputProps={{
                inputProps: {
                    autoComplete: 'off',
                    autoCorrect: 'off',
                    title: 'Token Amount',
                    inputMode: 'decimal',
                    min: 0,
                    minLength: MIN_AMOUNT_LENGTH,
                    maxLength: MAX_AMOUNT_LENGTH,
                    pattern: '^[0-9]*[.,]?[0-9]*$',
                    placeholder: '0.0',
                    spellCheck: false,
                    className: classes.input,
                },
                endAdornment: token ? (
                    <Box
                        className={classes.token}
                        display="flex"
                        flexDirection="column"
                        justifyContent="center"
                        alignItems="flex-end">
                        <Typography className={classes.balance} color="textSecondary" variant="body2" component="span">
                            Balance: {formatBalance(new BigNumber(balance), token.decimals, 6)}
                        </Typography>
                        <Box display="flex">
                            <Chip
                                className={classes.max}
                                size="small"
                                label="MAX"
                                clickable
                                onClick={() => onAmountChange(balance)}
                                {...props.MaxChipProps}
                            />
                            <SelectTokenChip token={token} {...props.SelectTokenChip} />
                        </Box>
                    </Box>
                ) : (
                    <Box
                        className={classes.token}
                        display="flex"
                        flexDirection="column"
                        justifyContent="center"
                        alignItems="flex-end">
                        <Typography className={classes.balance} color="textSecondary" variant="body2" component="span">
                            -
                        </Typography>
                        <SelectTokenChip token={token} {...props.SelectTokenChip} />
                    </Box>
                ),
                ...props.InputProps,
            }}
            InputLabelProps={{
                shrink: true,
            }}
            {...props.TextFieldProps}
        />
    )
}
