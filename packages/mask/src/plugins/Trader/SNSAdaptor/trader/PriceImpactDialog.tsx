import { makeStyles, MaskColorVar } from '@masknet/theme'
import { InjectedDialog, InjectedDialogProps } from '@masknet/shared'
import { memo, useCallback } from 'react'
import type { TradeComputed } from '../../types'
import { useI18N, Translate } from '../../locales'
import { Button, DialogActions, DialogContent, Typography } from '@mui/material'
import { InfoIcon } from '@masknet/icons'
import { isDashboardPage } from '@masknet/shared-base'
import { formatBalance, multipliedBy, NetworkPluginID } from '@masknet/web3-shared-base'
import { useFungibleTokenPrice } from '@masknet/plugin-infra/web3'
import { formatPercentage } from '@masknet/web3-shared-evm'
import { AllProviderTradeContext } from '../../trader/useAllProviderTradeContext'
import BigNumber from 'bignumber.js'

const useStyles = makeStyles<{ isDashboard: boolean }>()((theme, { isDashboard }) => ({
    content: {
        padding: '38px 16px 144px 16px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
    },
    icon: {
        color: isDashboard ? MaskColorVar.redMain : theme.palette.maskColor?.danger,
        width: 85,
        height: 85,
    },
    title: {
        color: isDashboard ? MaskColorVar.redMain : theme.palette.maskColor?.danger,
        fontSize: 24,
        lineHeight: 1.2,
        fontWeight: 700,
        marginTop: 16,
    },
    description: {
        marginTop: 56,
        color: theme.palette.maskColor?.second,
        fontSize: 16,
        lineHeight: '20px',
        '& > span': {
            color: isDashboard ? MaskColorVar.redMain : theme.palette.maskColor?.danger,
        },
    },
    actions: {
        display: 'flex',
        flexDirection: 'column',
        rowGap: 16,
        padding: 16,
    },
}))

export interface PriceImpactDialogProps extends InjectedDialogProps {
    trade: TradeComputed
    onConfirm: () => void
}
const PERCENT_DENOMINATOR = 10000

export const PriceImpactDialog = memo<PriceImpactDialogProps>(({ open, onClose, trade, onConfirm }) => {
    const t = useI18N()
    const isDashboard = isDashboardPage()
    const { classes } = useStyles({ isDashboard })

    const { setTemporarySlippage } = AllProviderTradeContext.useContainer()

    const lostToken = formatBalance(
        multipliedBy(trade.inputAmount, trade.priceImpact).toFixed(),
        trade.inputToken?.decimals ?? 0,
    )
    const { value: inputTokenPrice } = useFungibleTokenPrice(NetworkPluginID.PLUGIN_EVM, trade.inputToken?.address)

    const lostValue = multipliedBy(inputTokenPrice ?? 0, lostToken).toFixed(2)

    const handleConfirm = useCallback(() => {
        if (!trade.priceImpact) return
        setTemporarySlippage(new BigNumber(trade?.priceImpact.multipliedBy(PERCENT_DENOMINATOR).toFixed(0)).toNumber())

        onConfirm()
    }, [trade, onConfirm])

    return (
        <InjectedDialog open={open} onClose={onClose} title={t.impact_warning()}>
            <DialogContent className={classes.content}>
                <InfoIcon className={classes.icon} />
                <Typography className={classes.title}>{t.risk_warning()}</Typography>
                <Typography className={classes.description}>
                    <Translate.risk_warning_description
                        components={{ span: <span /> }}
                        values={{
                            impact: formatPercentage(trade.priceImpact),
                            lostSymbol: `${lostToken} ${trade.inputToken?.symbol}`,
                            lostValue: `${lostValue} USD`,
                        }}
                    />
                </Typography>
            </DialogContent>
            <DialogActions className={classes.actions}>
                <Button fullWidth onClick={onClose}>
                    {t.adjust_order()}
                </Button>
                <Button fullWidth color="error" onClick={handleConfirm}>
                    {t.make_trade_anyway()}
                </Button>
            </DialogActions>
        </InjectedDialog>
    )
})
