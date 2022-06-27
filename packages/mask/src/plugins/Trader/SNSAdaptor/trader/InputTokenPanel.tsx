import { ChangeEvent, memo, useCallback, useMemo } from 'react'
import { useI18N } from '../../../../utils'
import { Box, Chip, chipClasses, TextField, Typography } from '@mui/material'
import { FormattedBalance, SelectTokenChip, SelectTokenChipProps, FormattedCurrency } from '@masknet/shared'
import { makeStyles, MaskColorVar } from '@masknet/theme'
import type { ChainId, SchemaType } from '@masknet/web3-shared-evm'
import BigNumber from 'bignumber.js'
import { isDashboardPage } from '@masknet/shared-base'
import { useFungibleTokenPrice } from '@masknet/plugin-infra/web3'
import { FungibleToken, NetworkPluginID, formatBalance, formatCurrency } from '@masknet/web3-shared-base'

const useStyles = makeStyles<{ isDashboard: boolean }>()((theme, { isDashboard }) => ({
    filledInput: {
        borderRadius: 12,
        padding: 12,
        background: isDashboard ? MaskColorVar.primaryBackground2 : theme.palette.background.default,
        border: `1px solid ${isDashboard ? MaskColorVar.lineLight : theme.palette.divider}`,
        position: 'relative',
    },
    balance: {
        fontSize: 14,
        lineHeight: '20px',
        color: theme.palette.text.primary,
        wordBreak: 'keep-all',
    },
    amount: {
        marginLeft: 10,
    },
    input: {
        textAlign: 'right',
        fontWeight: 500,
        color: theme.palette.text.primary,
        lineHeight: '30px',
        fontSize: 24,
    },
    chip: {
        borderRadius: 6,
        marginLeft: 8,
        height: 20,
    },
    label: {
        fontSize: 12,
        lineHeight: '16px',
        padding: '0 6px',
    },
    price: {
        fontSize: 14,
        lineHeight: '20px',
        position: 'absolute',
        top: 18,
        right: 12,
        color: isDashboard ? MaskColorVar.normalText : theme.palette.text.secondary,
    },
    selectedTokenChip: {
        borderRadius: '22px!important',
        height: 'auto',
        backgroundColor: isDashboard ? MaskColorVar.input : theme.palette.background.input,
        [`& .${chipClasses.label}`]: {
            paddingTop: 10,
            paddingBottom: 10,
            fontSize: 13,
            lineHeight: '18px',
            marginRight: 8,
        },
    },
    chipTokenIcon: {
        width: '28px!important',
        height: '28px!important',
    },
    noToken: {
        borderRadius: '18px !important',
        backgroundColor: theme.palette.primary.main,
        [`& .${chipClasses.label}`]: {
            paddingTop: 9,
            paddingBottom: 9,
            fontSize: 10,
            lineHeight: '18px',
            color: theme.palette.primary.contrastText,
            marginRight: 0,
        },
    },
}))

export interface InputTokenPanelProps extends withClasses<'root'> {
    balance: string
    amount: string
    chainId: ChainId
    token?: FungibleToken<ChainId, SchemaType> | null
    onAmountChange: (amount: string) => void
    SelectTokenChip?: Partial<SelectTokenChipProps>
}

export const InputTokenPanel = memo<InputTokenPanelProps>(
    ({ chainId, token, balance, onAmountChange, amount, ...props }) => {
        const isDashboard = isDashboardPage()
        const { t } = useI18N()
        const { classes } = useStyles({ isDashboard })

        // #region update amount by self
        const { RE_MATCH_WHOLE_AMOUNT, RE_MATCH_FRACTION_AMOUNT } = useMemo(
            () => ({
                RE_MATCH_FRACTION_AMOUNT: new RegExp(`^\\.\\d{0,${token?.decimals}}$`), // .ddd...d
                RE_MATCH_WHOLE_AMOUNT: new RegExp(`^\\d*\\.?\\d{0,${token?.decimals}}$`), // d.ddd...d
            }),
            [token?.decimals],
        )

        const onChange = useCallback(
            (ev: ChangeEvent<HTMLInputElement>) => {
                const amount_ = ev.currentTarget.value.replace(/,/g, '.')
                if (RE_MATCH_FRACTION_AMOUNT.test(amount_)) onAmountChange(`0${amount_}`)
                else if (amount_ === '' || RE_MATCH_WHOLE_AMOUNT.test(amount_)) onAmountChange(amount_)
            },
            [onAmountChange, RE_MATCH_FRACTION_AMOUNT, RE_MATCH_WHOLE_AMOUNT],
        )

        const { value: tokenPrice = 0 } = useFungibleTokenPrice(
            NetworkPluginID.PLUGIN_EVM,
            token?.address.toLowerCase(),
            { chainId },
        )

        const tokenValueUSD = useMemo(
            () => (amount ? new BigNumber(amount).times(tokenPrice).toFixed(2) : '0'),
            [amount, tokenPrice],
        )

        return (
            <TextField
                fullWidth
                type="text"
                variant="filled"
                value={amount}
                onChange={onChange}
                InputProps={{
                    className: classes.filledInput,
                    disableUnderline: true,
                    startAdornment: (
                        <Box
                            sx={{
                                display: 'flex',
                                flexDirection: 'column',
                                justifyContent: 'center',
                                alignItems: 'flex-start',
                            }}>
                            <SelectTokenChip
                                token={token}
                                chainId={chainId}
                                classes={{
                                    chip: classes.selectedTokenChip,
                                    tokenIcon: classes.chipTokenIcon,
                                    noToken: classes.noToken,
                                }}
                                {...props.SelectTokenChip}
                            />
                            <Box display="flex" mt={1} alignItems="center">
                                <Typography className={classes.balance}>
                                    {t('plugin_ito_list_table_got')}:
                                    <Typography component="span" className={classes.amount} color="primary">
                                        <FormattedBalance
                                            value={balance}
                                            decimals={token?.decimals}
                                            significant={6}
                                            formatter={formatBalance}
                                        />
                                    </Typography>
                                </Typography>
                                <Chip
                                    size="small"
                                    label="MAX"
                                    clickable
                                    color="primary"
                                    variant="filled"
                                    classes={{ root: classes.chip, label: classes.label }}
                                    onClick={() => {
                                        onAmountChange(formatBalance(balance, token?.decimals, 6))
                                    }}
                                />
                            </Box>
                        </Box>
                    ),
                    endAdornment: (
                        <Typography className={classes.price}>
                            &asymp; <FormattedCurrency value={tokenValueUSD} formatter={formatCurrency} />
                        </Typography>
                    ),
                }}
                inputProps={{ className: classes.input, autoComplete: 'off' }}
            />
        )
    },
)
