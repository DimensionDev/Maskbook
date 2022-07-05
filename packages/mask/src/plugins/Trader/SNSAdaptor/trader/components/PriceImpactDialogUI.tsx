import { makeStyles, MaskColorVar } from '@masknet/theme'
import { InjectedDialog, InjectedDialogProps } from '@masknet/shared'
import { memo } from 'react'
import { useI18N, Translate } from '../../../locales'
import { Button, DialogActions, dialogClasses, DialogContent, dialogTitleClasses, Typography } from '@mui/material'
import { CircleWarningIcon } from '@masknet/icons'
import { isDashboardPage } from '@masknet/shared-base'
import { formatPercentage } from '@masknet/web3-shared-evm'
import type BigNumber from 'bignumber.js'

const useStyles = makeStyles<{ isDashboard: boolean }>()((theme, { isDashboard }) => ({
    dialog: {
        [`.${dialogClasses.paper}`]: {
            width: '420px!important',
        },
        [`.${dialogTitleClasses.root}`]: {
            // 'row !important' is not assignable to FlexDirection
            flexDirection: 'row !important' as 'row',
            '& > p': {
                justifyContent: 'center !important',
            },
        },
    },
    content: {
        minHeight: 278,
        padding: '38px 16px 120px 16px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
    },
    icon: {
        color: isDashboard ? MaskColorVar.redMain : theme.palette.maskColor?.danger,
        width: 90,
        height: 90,
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
        position: 'sticky',
        bottom: 0,
        boxShadow:
            theme.palette.mode === 'dark'
                ? '0px 0px 20px rgba(255, 255, 255, 0.12)'
                : ' 0px 0px 20px rgba(0, 0, 0, 0.05)',
        '& > *': {
            margin: '0px !important',
        },
    },
}))

export interface PriceImpactDialogProps extends InjectedDialogProps {
    priceImpact?: BigNumber.Value
    symbol?: string
    onConfirm: () => void
    lostToken: string
    lostValue: string
}

export const PriceImpactDialogUI = memo<PriceImpactDialogProps>(
    ({ open, onClose, lostToken, lostValue, priceImpact, symbol, onConfirm }) => {
        const t = useI18N()
        const isDashboard = isDashboardPage()
        const { classes } = useStyles({ isDashboard })

        return (
            <InjectedDialog open={open} onClose={onClose} title={t.impact_warning()} className={classes.dialog}>
                <DialogContent className={classes.content}>
                    <CircleWarningIcon className={classes.icon} />
                    <Typography className={classes.title}>{t.risk_warning()}</Typography>
                    <Typography className={classes.description}>
                        <Translate.risk_warning_description
                            components={{ span: <span /> }}
                            values={{
                                impact: formatPercentage(priceImpact ?? 0),
                                lostSymbol: `${lostToken} ${symbol}`,
                                lostValue: `${lostValue} USD`,
                            }}
                        />
                    </Typography>
                </DialogContent>
                <DialogActions className={classes.actions}>
                    <Button fullWidth onClick={onClose}>
                        {t.adjust_order()}
                    </Button>
                    <Button fullWidth color="error" onClick={onConfirm}>
                        {t.make_trade_anyway()}
                    </Button>
                </DialogActions>
            </InjectedDialog>
        )
    },
)
