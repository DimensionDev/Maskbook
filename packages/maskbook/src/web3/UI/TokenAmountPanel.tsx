import { useCallback, ChangeEvent, useMemo } from 'react'
import {
    makeStyles,
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
import { SelectTokenChip, SelectTokenChipProps } from './SelectTokenChip'
import { formatBalance } from '../../plugins/Wallet/formatter'
import { MIN_AMOUNT_LENGTH, MAX_AMOUNT_LENGTH } from '../constants'
import { useStylesExtends } from '../../components/custom-ui-helper'
import type { EtherTokenDetailed, ERC20TokenDetailed } from '../types'

const useStyles = makeStyles((theme) => {
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
    viewBalance: boolean
    onAmountChange: (amount: string) => void
    label: string
    token?: EtherTokenDetailed | ERC20TokenDetailed | null
    InputProps?: Partial<InputProps>
    MaxChipProps?: Partial<ChipProps>
    SelectTokenChip?: Partial<SelectTokenChipProps>
    TextFieldProps?: Partial<TextFieldProps>
}

export function TokenAmountPanel(props: TokenAmountPanelProps) {
    const { amount, balance, token, onAmountChange, label, viewBalance = true } = props

    const classes = useStylesExtends(useStyles(), props)

    //#region update amount by parent
    const { RE_MATCH_WHOLE_AMOUNT } = useMemo(
        () => ({
            RE_MATCH_WHOLE_AMOUNT: new RegExp(`^\\d*\\.?\\d{0,${token?.decimals ?? 0}}$`), // d.ddd...d
        }),
        [token?.decimals],
    )
    //#endregion

    //#region update amount by self
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
                endAdornment: token ? (
                    <Box
                        className={classes.token}
                        sx={{
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'center',
                            alignItems: 'flex-end',
                        }}>
                        {viewBalance ? (
                            <Typography
                                className={classes.balance}
                                color="textSecondary"
                                variant="body2"
                                component="span">
                                Balance: {formatBalance(new BigNumber(balance), token.decimals ?? 0, 6)}
                            </Typography>
                        ) : (
                            ''
                        )}
                        <Box
                            sx={{
                                display: 'flex',
                            }}>
                            {balance !== '0' && viewBalance ? (
                                <Chip
                                    className={classes.max}
                                    size="small"
                                    label="MAX"
                                    clickable
                                    color="primary"
                                    variant="outlined"
                                    onClick={() =>
                                        onAmountChange(formatBalance(new BigNumber(balance), token.decimals ?? 0))
                                    }
                                    {...props.MaxChipProps}
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
                        }}>
                        {viewBalance ? (
                            <Typography
                                className={classes.balance}
                                color="textSecondary"
                                variant="body2"
                                component="span">
                                -
                            </Typography>
                        ) : (
                            ''
                        )}
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
