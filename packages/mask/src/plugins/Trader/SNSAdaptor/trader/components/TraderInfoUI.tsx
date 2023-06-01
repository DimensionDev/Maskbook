import { memo } from 'react'
import { Icons } from '@masknet/icons'
import type { Web3Helper } from '@masknet/web3-helpers'
import { Sniffings } from '@masknet/shared-base'
import { makeStyles, MaskColorVar } from '@masknet/theme'
import { formatBalance, isZero } from '@masknet/web3-shared-base'
import { Box, TextField, Typography } from '@mui/material'
import { FormattedBalance } from '@masknet/shared'
import { useI18N } from '../../../../../utils/index.js'
import { DotLoading } from './DotLoading.js'

// TODO: remove isDashboard after remove Dashboard page
const useStyles = makeStyles()((theme) => ({
    trade: {
        marginBottom: 8,
        padding: 10,
        backgroundColor: `${
            Sniffings.is_dashboard_page ? MaskColorVar.input : theme.palette.maskColor?.bottom
        }!important`,
        border: `1px solid ${Sniffings.is_dashboard_page ? MaskColorVar.lineLight : theme.palette.maskColor?.line}`,
        borderRadius: 8,
        alignItems: 'flex-start',
        cursor: 'pointer',
        position: 'relative',
        minHeight: 82,
    },
    warningText: {
        lineHeight: '18px',
        position: 'absolute',
        bottom: 10,
        right: 10,
        color: Sniffings.is_dashboard_page ? MaskColorVar.redMain : theme.palette.maskColor?.danger,
        display: 'flex',
        alignItems: 'center',
        gap: 4,
    },
    provider: {
        color: Sniffings.is_dashboard_page ? theme.palette.text.primary : theme.palette.maskColor?.main,
        fontSize: 18,
        lineHeight: '36px',
        fontWeight: 700,
        wordBreak: 'keep-all',
    },
    cost: {
        color: Sniffings.is_dashboard_page ? MaskColorVar.normalText : theme.palette.maskColor?.second,
        lineHeight: '18px',
        marginTop: 8,
        display: 'flex',
        alignItems: 'center',
    },
    input: {
        textAlign: 'right',
        fontWeight: 700,
        color: theme.palette.text.primary,
        lineHeight: 1.2,
        fontSize: 30,
        padding: 0,
        cursor: 'pointer',
        width: 'auto',
    },
    focus: {
        border: `2px solid ${
            Sniffings.is_dashboard_page ? theme.palette.primary.main : theme.palette.maskColor?.primary
        }!important`,
    },
    best: {
        position: 'absolute',
        top: -12,
        right: 22,
    },
    dotLoading: {
        position: 'absolute',
        top: 32,
        right: 10,
    },
}))

export interface TraderInfoUIProps {
    isBest?: boolean
    isFocus?: boolean
    gasPrice?: string
    onClick: () => void
    loading: boolean
    providerName: string
    balance: string
    priceImpact: string
    isGreatThanSlippageSetting: boolean
    gasFee: string
    gasFeeValueUSD: string
    nativeToken?: Web3Helper.FungibleTokenAll
}

export const TraderInfoUI = memo<TraderInfoUIProps>(
    ({
        loading,
        providerName,
        onClick,
        balance,
        isFocus,
        gasFee,
        gasFeeValueUSD,
        nativeToken,
        isBest,
        isGreatThanSlippageSetting,
        priceImpact,
    }) => {
        const { t } = useI18N()
        const { classes, cx } = useStyles()

        return (
            <TextField
                key={providerName}
                fullWidth
                type="text"
                variant="filled"
                onClick={onClick}
                value={!loading ? balance : ''}
                InputProps={{
                    className: cx(classes.trade, isFocus ? classes.focus : null),
                    disableUnderline: true,
                    startAdornment: (
                        <Box
                            sx={{
                                display: 'flex',
                                flexDirection: 'column',
                                justifyContent: 'center',
                                alignItems: 'flex-start',
                                width: '100%',
                            }}>
                            <Typography className={classes.provider}>{providerName}</Typography>
                            {!isZero(gasFee) ? (
                                <Typography className={classes.cost}>
                                    <Typography fontSize={14} lineHeight="20px" component="span">
                                        {t('plugin_trader_gas_fee')}
                                    </Typography>
                                    <Typography fontSize={14} lineHeight="20px" component="span" marginLeft={0.5}>
                                        <FormattedBalance
                                            value={gasFee}
                                            decimals={nativeToken?.decimals ?? 0}
                                            significant={4}
                                            symbol={nativeToken?.symbol}
                                            formatter={formatBalance}
                                        />
                                    </Typography>
                                    <Typography fontSize={14} lineHeight="20px" component="span">
                                        ({gasFeeValueUSD.includes('<') ? '' : '\u2248'}
                                        {gasFeeValueUSD})
                                    </Typography>
                                </Typography>
                            ) : null}
                        </Box>
                    ),
                    endAdornment: (
                        <>
                            {isBest ? <Icons.BestTrade className={classes.best} /> : null}
                            {isGreatThanSlippageSetting ? (
                                <Typography className={classes.warningText}>
                                    <Icons.CircleWarning size={18} />
                                    {t('plugin_trader_price_image_value', {
                                        percent: priceImpact,
                                    })}
                                </Typography>
                            ) : null}
                            {loading ? (
                                <div className={classes.dotLoading}>
                                    <DotLoading />
                                </div>
                            ) : null}
                        </>
                    ),
                }}
                inputProps={{ className: classes.input, disabled: true }}
            />
        )
    },
)

export interface DefaultTraderPlaceholderUIProps {
    nativeToken?: Web3Helper.FungibleTokenAll
}

export const DefaultTraderPlaceholderUI = memo<DefaultTraderPlaceholderUIProps>(({ nativeToken }) => {
    const { t } = useI18N()
    const { classes, cx } = useStyles()

    return (
        <TextField
            fullWidth
            type="text"
            variant="filled"
            value={0}
            InputProps={{
                className: cx(classes.trade, classes.focus),
                disableUnderline: true,
                startAdornment: (
                    <Box
                        sx={{
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'center',
                            alignItems: 'flex-start',
                            width: '100%',
                        }}>
                        <Typography className={classes.provider}>DEX</Typography>

                        <Typography className={classes.cost}>
                            <Typography fontSize={14} lineHeight="20px" component="span">
                                {t('plugin_trader_gas_fee')}
                            </Typography>
                            <Typography fontSize={14} lineHeight="20px" component="span" marginLeft={0.5}>
                                <FormattedBalance
                                    value={0}
                                    decimals={nativeToken?.decimals ?? 0}
                                    significant={4}
                                    symbol={nativeToken?.symbol}
                                    formatter={formatBalance}
                                />
                            </Typography>
                            <Typography fontSize={14} lineHeight="20px" component="span">
                                {t('plugin_trader_tx_cost_usd', { usd: 0 })}
                            </Typography>
                        </Typography>
                    </Box>
                ),
            }}
            inputProps={{ className: classes.input, disabled: true }}
        />
    )
})
