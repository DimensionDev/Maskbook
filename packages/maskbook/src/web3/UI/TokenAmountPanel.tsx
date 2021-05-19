import { useCallback, ChangeEvent, useMemo } from 'react'
import { makeStyles, TextField, Typography, Box, Chip, InputProps, ChipProps, TextFieldProps } from '@material-ui/core'
import classNames from 'classnames'
import { SelectTokenChip, SelectTokenChipProps } from './SelectTokenChip'
import { formatBalance, FormattedBalance } from '@dimensiondev/maskbook-shared'
import { MIN_AMOUNT_LENGTH, MAX_AMOUNT_LENGTH } from '../constants'
import { useStylesExtends } from '../../components/custom-ui-helper'
import type { EtherTokenDetailed, ERC20TokenDetailed } from '../types'

const useStyles = makeStyles((theme) => {
    return {
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
            whiteSpace: 'nowrap',
            textOverflow: 'ellipsis',
            overflow: 'hidden',
            maxWidth: '80%',
            fontSize: 12,
            top: theme.spacing(0.5),
            position: 'absolute',
        },
        inputShrinkLabel: {
            transform: 'translate(17px, -3px) scale(0.75) !important',
        },
    }
})

export interface TokenAmountPanelProps extends withClasses<'root'> {
    amount: string
    maxAmount?: string
    balance: string
    disableToken?: boolean
    disableBalance?: boolean
    label: string
    token?: EtherTokenDetailed | ERC20TokenDetailed | null
    onAmountChange: (amount: string) => void
    InputProps?: Partial<InputProps>
    MaxChipProps?: Partial<ChipProps>
    MaxChipStyle?: ChipProps['classes']
    SelectTokenChip?: Partial<SelectTokenChipProps>
    TextFieldProps?: Partial<TextFieldProps>
}

export function TokenAmountPanel(props: TokenAmountPanelProps) {
    const {
        amount,
        maxAmount,
        balance,
        token,
        onAmountChange,
        label,
        disableToken = false,
        disableBalance = false,
        MaxChipProps,
    } = props

    const classes = useStylesExtends(useStyles(), props)

    //#region update amount by self
    const { RE_MATCH_WHOLE_AMOUNT } = useMemo(
        () => ({
            RE_MATCH_WHOLE_AMOUNT: new RegExp(`^\\d*\\.?\\d{0,${token?.decimals}}$`), // d.ddd...d
        }),
        [token?.decimals],
    )
    const onChange = useCallback(
        (ev: ChangeEvent<HTMLInputElement>) => {
            const amount_ = ev.currentTarget.value.replace(/,/g, '.')
            if (amount_ === '' || RE_MATCH_WHOLE_AMOUNT.test(amount_)) onAmountChange(amount_)
        },
        [onAmountChange, RE_MATCH_WHOLE_AMOUNT],
    )
    //#endregion

    return (
        <TextField
            className={classes.root}
            label={label}
            fullWidth
            required
            type="text"
            value={amount}
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
                endAdornment: disableToken ? null : token ? (
                    <Box
                        className={classes.token}
                        sx={{
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'center',
                            alignItems: 'flex-end',
                        }}>
                        {!disableBalance ? (
                            <Typography
                                className={classes.balance}
                                color="textSecondary"
                                variant="body2"
                                component="span">
                                Balance:
                                <FormattedBalance value={balance} decimals={token.decimals} significant={6} />
                            </Typography>
                        ) : null}
                        <Box
                            sx={{
                                display: 'flex',
                                alignItems: 'center',
                                marginTop: 2,
                            }}>
                            {balance !== '0' && !disableBalance ? (
                                <Chip
                                    classes={{
                                        root: classNames(classes.max, MaxChipProps?.classes?.root),
                                        ...MaxChipProps?.classes,
                                    }}
                                    size="small"
                                    label="MAX"
                                    clickable
                                    color="primary"
                                    variant="outlined"
                                    onClick={() => {
                                        onAmountChange(formatBalance(maxAmount ?? balance, token.decimals))
                                    }}
                                    {...MaxChipProps}
                                />
                            ) : null}
                            <SelectTokenChip token={token} {...props.SelectTokenChip} />
                        </Box>
                    </Box>
                ) : (
                    <Box
                        className={classes.token}
                        sx={{
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'center',
                            alignItems: 'flex-end',
                            marginTop: 2,
                        }}>
                        {!disableBalance ? (
                            <Typography
                                className={classes.balance}
                                color="textSecondary"
                                variant="body2"
                                component="span">
                                -
                            </Typography>
                        ) : null}
                        <SelectTokenChip token={token} {...props.SelectTokenChip} />
                    </Box>
                ),
                ...props.InputProps,
            }}
            InputLabelProps={{
                shrink: true,
                classes: {
                    shrink: classes.inputShrinkLabel,
                },
            }}
            {...props.TextFieldProps}
        />
    )
}
