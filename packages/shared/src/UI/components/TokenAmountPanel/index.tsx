import { type ChangeEvent, useCallback, useMemo } from 'react'
import { BigNumber } from 'bignumber.js'
import { Box, Chip, type ChipProps, type InputProps, type StandardTextFieldProps, Typography } from '@mui/material'
import { makeStyles, MaskTextField } from '@masknet/theme'
import { NUMERIC_INPUT_REGEXP_PATTERN } from '@masknet/shared-base'
import { type FungibleToken, formatBalance } from '@masknet/web3-shared-base'
import type { ChainId, SchemaType } from '@masknet/web3-shared-evm'
import { SelectTokenChip, type SelectTokenChipProps } from '../SelectTokenChip/index.js'
import { FormattedBalance } from '../../wallet/index.js'
import { Trans } from '@lingui/macro'

const MIN_AMOUNT_LENGTH = 1
const MAX_AMOUNT_LENGTH = 79

const useStyles = makeStyles()((theme) => {
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
            marginRight: theme.spacing(0.2),
            borderRadius: 8,
            fontSize: 12,
            height: 18,
        },
        token: {
            whiteSpace: 'pre',
            maxWidth: 300,
            paddingLeft: theme.spacing(1),
            fontSize: 12,
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
    maxAmountShares?: number
    balance: string
    disableToken?: boolean
    disableBalance?: boolean
    label: string
    token?: FungibleToken<ChainId, SchemaType> | null
    onAmountChange: (amount: string) => void
    InputProps?: Partial<InputProps>
    MaxChipProps?: Partial<ChipProps>
    MaxChipStyle?: ChipProps['classes']
    SelectTokenChip?: Partial<SelectTokenChipProps>
    TextFieldProps?: Exclude<StandardTextFieldProps, 'variant'>
}

// todo: merge into one with TokenAmountPanel
export function TokenAmountPanel(props: TokenAmountPanelProps) {
    const {
        amount,
        maxAmount,
        balance,
        token,
        onAmountChange,
        maxAmountShares = 1,
        label,
        disableToken = false,
        disableBalance = false,
        MaxChipProps,
    } = props
    const { classes, cx } = useStyles(undefined, { props })

    // #region update amount by self
    const { RE_MATCH_WHOLE_AMOUNT, RE_MATCH_FRACTION_AMOUNT } = useMemo(
        () => ({
            RE_MATCH_FRACTION_AMOUNT: new RegExp(`^\\.\\d{0,${token?.decimals}}$`),
            RE_MATCH_WHOLE_AMOUNT: new RegExp(`^\\d*\\.?\\d{0,${token?.decimals}}$`), // d.ddd...d
        }),
        [token?.decimals],
    )
    const onChange = useCallback(
        (ev: ChangeEvent<HTMLInputElement>) => {
            const amount_ = ev.currentTarget.value.replaceAll(',', '.')
            if (RE_MATCH_FRACTION_AMOUNT.test(amount_)) onAmountChange(`0${amount_}`)
            else if (amount_ === '' || RE_MATCH_WHOLE_AMOUNT.test(amount_)) onAmountChange(amount_)
        },
        [onAmountChange, RE_MATCH_WHOLE_AMOUNT, RE_MATCH_FRACTION_AMOUNT],
    )
    // #endregion

    return (
        <MaskTextField
            className={classes.root}
            label={label}
            fullWidth
            required
            type="text"
            value={amount}
            onChange={onChange}
            placeholder="0.0"
            InputProps={{
                inputProps: {
                    autoComplete: 'off',
                    autoCorrect: 'off',
                    title: 'Token Amount',
                    inputMode: 'decimal',
                    min: 0,
                    minLength: MIN_AMOUNT_LENGTH,
                    maxLength: MAX_AMOUNT_LENGTH,
                    pattern: NUMERIC_INPUT_REGEXP_PATTERN,
                    spellCheck: false,
                    className: classes.input,
                },
                endAdornment:
                    disableToken ? null
                    : token ?
                        <Box
                            className={classes.token}
                            sx={{
                                display: 'flex',
                                flexDirection: 'column',
                                justifyContent: 'center',
                                alignItems: 'flex-end',
                            }}>
                            {!disableBalance ?
                                <Typography
                                    className={classes.balance}
                                    color="textSecondary"
                                    variant="body2"
                                    component="span">
                                    <Trans>
                                        Balance:{' '}
                                        <FormattedBalance
                                            value={balance}
                                            decimals={token.decimals}
                                            significant={6}
                                            formatter={formatBalance}
                                        />
                                    </Trans>
                                </Typography>
                            :   null}
                            <Box
                                sx={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    marginTop: 2,
                                }}>
                                {balance !== '0' && !disableBalance ?
                                    <Chip
                                        classes={{
                                            root: cx(classes.max, MaxChipProps?.classes?.root),
                                            ...MaxChipProps?.classes,
                                        }}
                                        size="small"
                                        label="MAX"
                                        clickable
                                        color="primary"
                                        variant="outlined"
                                        onClick={() => {
                                            onAmountChange(
                                                formatBalance(
                                                    new BigNumber(maxAmount ?? balance)
                                                        .dividedBy(maxAmountShares)
                                                        .decimalPlaces(0, 1),
                                                    token.decimals,
                                                ),
                                            )
                                        }}
                                        {...MaxChipProps}
                                    />
                                :   null}
                                <SelectTokenChip token={token} {...props.SelectTokenChip} />
                            </Box>
                        </Box>
                    :   <Box
                            className={classes.token}
                            sx={{
                                display: 'flex',
                                flexDirection: 'column',
                                justifyContent: 'center',
                                alignItems: 'flex-end',
                                marginTop: 2,
                            }}>
                            {!disableBalance ?
                                <Typography
                                    className={classes.balance}
                                    color="textSecondary"
                                    variant="body2"
                                    component="span">
                                    -
                                </Typography>
                            :   null}
                            <SelectTokenChip token={token} {...props.SelectTokenChip} />
                        </Box>,
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
