import React, { useCallback, ChangeEvent } from 'react'
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
import type { ERC20TokenForUI } from '../types'
import { MIN_AMOUNT_LENGTH, MAX_AMOUNT_LENGTH } from '../constants'
import { SelectTokenChip, SelectTokenChipProps } from './SelectTokenChip'
import { formatBalance } from '../../Wallet/formatter'
import BigNumber from 'bignumber.js'
import { useCapturedEvents } from '../../../utils/hooks/useCapturedEvents'

const RE_MATCH_PARTIAL_AMOUNT = /^\d*\.(?:0*)?$/
const RE_MATCH_WHOLE_AMOUNT = /^\d*\.?\d*$/

const useStyles = makeStyles((theme: Theme) => {
    return createStyles({
        textfield: {},
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

export interface TokenAmountPanelProps {
    amount: string
    onAmountChange: (amount: string) => void
    label: string
    token?: ERC20TokenForUI | null
    InputProps?: Partial<InputProps>
    MaxChipProps?: Partial<ChipProps>
    SelectTokenChip?: Partial<SelectTokenChipProps>
    TextFieldProps?: Partial<TextFieldProps>
}

export function TokenAmountPanel(props: TokenAmountPanelProps) {
    const classes = useStyles()
    const [, inputRef] = useCapturedEvents()
    const { amount, token, onAmountChange, label } = props

    const onChange = useCallback(
        (ev: ChangeEvent<HTMLInputElement>) => {
            if (typeof token?.decimals === 'undefined') return
            const amount_ = ev.currentTarget.value.replace(/,/g, '.')
            if (!amount_) onAmountChange('0')
            // typing the fraction part
            else if (RE_MATCH_PARTIAL_AMOUNT.test(amount_)) onAmountChange(amount_)
            else if (RE_MATCH_WHOLE_AMOUNT.test(amount_))
                onAmountChange(new BigNumber(amount_).multipliedBy(new BigNumber(10).pow(token.decimals)).toFixed())
        },
        [token?.decimals],
    )

    return (
        <TextField
            className={classes.textfield}
            label={label}
            fullWidth
            required
            type="text"
            value={
                amount === '0'
                    ? ''
                    : RE_MATCH_PARTIAL_AMOUNT.test(amount)
                    ? amount
                    : formatBalance(new BigNumber(amount), token?.decimals ?? 0, MAX_AMOUNT_LENGTH - 2)
            }
            variant="outlined"
            onChange={onChange}
            InputProps={{
                inputRef: inputRef,
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
                            Balance: {formatBalance(new BigNumber(token?.balance ?? '0'), token.decimals, 6)}
                        </Typography>
                        <Box display="flex">
                            <Chip
                                className={classes.max}
                                size="small"
                                label="MAX"
                                clickable
                                onClick={() => onAmountChange(token.balance ?? '0')}
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
            {...props.TextFieldProps}
        />
    )
}
