import { makeStyles, MaskColorVar } from '@masknet/theme'
import { alpha, Box, Chip, chipClasses, lighten, TextField, Typography } from '@mui/material'
import { ChangeEvent, memo, useCallback, useMemo } from 'react'
import type { Web3Helper } from '@masknet/plugin-infra/web3'
import { formatBalance, formatCurrency, FungibleToken } from '@masknet/web3-shared-base'
import { FormattedBalance, FormattedCurrency, SelectTokenChip, SelectTokenChipProps } from '@masknet/shared'
import { useI18N } from '../../../../../utils'
import { isDashboardPage } from '@masknet/shared-base'

// TODO: remove isDashboard after remove Dashboard page
const useStyles = makeStyles<{ isDashboard: boolean }>()((theme, { isDashboard }) => ({
    filledInput: {
        borderRadius: 12,
        padding: 12,
        background: `${isDashboard ? MaskColorVar.primaryBackground2 : theme.palette.maskColor?.input}!important`,
        border: `1px solid ${isDashboard ? MaskColorVar.lineLight : theme.palette.maskColor?.line}`,
        position: 'relative',
    },
    balance: {
        fontSize: 14,
        fontWeight: 700,
        lineHeight: '18px',
        color: isDashboard ? theme.palette.text.primary : theme.palette.maskColor?.second,
        wordBreak: 'keep-all',
    },
    amount: {
        marginLeft: 10,
        color: !isDashboard ? theme.palette.maskColor?.primary : undefined,
        fontSize: 14,
        fontWeight: 700,
    },
    input: {
        textAlign: 'right',
        fontWeight: 500,
        color: theme.palette.text.primary,
        lineHeight: 1.2,
        fontSize: 30,
        paddingBottom: 20,
    },
    chip: {
        borderRadius: 6,
        marginLeft: 8,
        height: 20,
        backgroundColor: !isDashboard ? theme.palette.maskColor?.primary : undefined,
        '&:hover': {
            backgroundColor: !isDashboard ? lighten(theme.palette.maskColor?.primary, 0.1) : undefined,
        },
    },
    chipLabel: {
        fontSize: 12,
        lineHeight: '16px',
        color: theme.palette.common.white,
        padding: '0 6px',
    },
    label: {
        fontSize: 14,
        fontWeight: 700,
        lineHeight: '18px',
        color: theme.palette.maskColor?.second,
        position: 'absolute',
        top: 12,
        left: 12,
    },
    price: {
        fontSize: 14,
        lineHeight: '20px',
        position: 'absolute',
        bottom: 12,
        right: 12,
        color: isDashboard ? MaskColorVar.normalText : theme.palette.maskColor?.second,
    },
    action: {
        position: 'absolute',
        top: 12,
        right: 12,
        display: 'flex',
        alignItems: 'center',
    },
    selectedTokenChip: {
        borderRadius: '22px!important',
        height: 'auto',
        position: 'absolute',
        top: 52.5,
        left: 12,
        backgroundColor: isDashboard ? MaskColorVar.input : theme.palette.maskColor?.bottom,
        paddingRight: 8,
        [`& .${chipClasses.label}`]: {
            paddingTop: 10,
            paddingBottom: 10,
            lineHeight: '18px',
            fontSize: 14,
            marginRight: 12,
            fontWeight: 700,
            color: !isDashboard ? theme.palette.maskColor?.main : undefined,
        },
        ['&:hover']: {
            backgroundColor: `${isDashboard ? MaskColorVar.input : theme.palette.maskColor?.bottom}!important`,
            boxShadow: `0px 4px 30px ${alpha(
                theme.palette.maskColor.shadowBottom,
                theme.palette.mode === 'dark' ? 0.15 : 0.1,
            )}`,
        },
    },
    chipTokenIcon: {
        width: '30px!important',
        height: '30px!important',
    },
    noToken: {
        borderRadius: '18px !important',
        backgroundColor: `${isDashboard ? theme.palette.primary.main : theme.palette.maskColor?.primary} !important`,
        ['&:hover']: {
            backgroundColor: `${
                isDashboard ? theme.palette.primary.main : lighten(theme.palette.maskColor?.primary, 0.1)
            }!important`,
        },
        [`& .${chipClasses.label}`]: {
            color: theme.palette.common.white,
            marginRight: 4,
        },
    },
}))

export interface InputTokenPanelUIProps extends withClasses<'root'> {
    balance: string
    amount: string
    chainId: Web3Helper.ChainIdAll
    maxAmount: string
    token?: FungibleToken<Web3Helper.ChainIdAll, Web3Helper.SchemaTypeAll> | null
    tokenValueUSD: string
    onAmountChange: (amount: string) => void
    SelectTokenChip?: Partial<SelectTokenChipProps>
}

export const InputTokenPanelUI = memo<InputTokenPanelUIProps>(
    ({
        chainId,
        token,
        balance,
        onAmountChange,
        amount,
        SelectTokenChip: SelectTokenChipProps,
        maxAmount,
        tokenValueUSD,
    }) => {
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
                        <Box>
                            <Typography className={classes.label}>{t('plugin_trader_swap_from')}</Typography>
                            <SelectTokenChip
                                token={token}
                                chainId={chainId}
                                classes={{
                                    chip: classes.selectedTokenChip,
                                    tokenIcon: classes.chipTokenIcon,
                                    noToken: classes.noToken,
                                }}
                                {...SelectTokenChipProps}
                            />
                        </Box>
                    ),
                    endAdornment: (
                        <>
                            <Box className={classes.action}>
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
                                    classes={{ root: classes.chip, label: classes.chipLabel }}
                                    onClick={() => {
                                        onAmountChange(maxAmount)
                                    }}
                                />
                            </Box>
                            <Typography className={classes.price}>
                                &asymp; <FormattedCurrency value={tokenValueUSD} formatter={formatCurrency} />
                            </Typography>
                        </>
                    ),
                }}
                inputProps={{ className: classes.input, autoComplete: 'off' }}
            />
        )
    },
)
