import { InjectedDialog } from '../../../components/shared/InjectedDialog'
import { createStyles, DialogContent, makeStyles, Typography, Grid, Paper } from '@material-ui/core'
import type { PoolSettings } from '../hooks/useFillCallback'
import BigNumber from 'bignumber.js'
import { formatBalance } from '../../Wallet/formatter'
import ActionButton from '../../../extension/options-page/DashboardComponents/ActionButton'
import { useI18N } from '../../../utils/i18n-next-ui'

const useStyles = makeStyles((theme) =>
    createStyles({
        root: {
            flexGrow: 1,
        },
        title: {
            padding: theme.spacing(2),
            textAlign: 'center',
            color: theme.palette.text.secondary,
            fontSize: 18,
        },
        line: {
            display: 'flex',
            padding: theme.spacing(1),
        },
        data: {
            padding: theme.spacing(0),
            textAlign: 'right',
            color: theme.palette.text.primary,
        },
        label: {
            padding: theme.spacing(0),
            textAlign: 'left',
            color: theme.palette.text.secondary,
        },
        button: {
            padding: theme.spacing(2),
        },
    }),
)
export interface ConfirmDialogProps {
    itoSettings: PoolSettings
    open: boolean
    onDecline: () => void
    onSubmit: () => void
}

export function ConfirmDialog(props: ConfirmDialogProps) {
    const { itoSettings, open, onDecline, onSubmit } = props
    const classes = useStyles()
    const { t } = useI18N()

    console.log('111')
    console.log(itoSettings)
    console.log()
    console.log('222')
    return (
        <InjectedDialog open={open} title={t('plugin_ito_confirm_display_name')} onClose={onDecline}>
            <DialogContent>
                <Grid container spacing={0}>
                    <Grid item xs={12}>
                        <Typography ariant="h3" className={classes.title} component="span">
                            New Year Special Events
                        </Typography>
                    </Grid>
                    <Grid item xs={6}>
                        <Paper className={classes.label}>{t('plugin_ito_sell_token')}</Paper>
                    </Grid>
                    <Grid item xs={6}>
                        <Paper className={classes.data}>{itoSettings.token?.symbol}</Paper>
                    </Grid>

                    <Grid item xs={6}>
                        <Paper className={classes.label}>{t('plugin_ito_sell_total_aount')}</Paper>
                    </Grid>
                    <Grid item xs={6}>
                        <Paper className={classes.data}>
                            {formatBalance(
                                new BigNumber(itoSettings.total),
                                itoSettings.token?.decimals ?? 0,
                                itoSettings.token?.decimals ?? 0,
                            )}
                        </Paper>
                    </Grid>

                    {itoSettings.exchangeTokens
                        ?.filter((item, index) => item)
                        .map((item, index) => {
                            return (
                                <>
                                    <Grid item xs={6}>
                                        <Paper className={classes.label}>
                                            {item?.symbol}/{itoSettings.token?.symbol}
                                        </Paper>
                                    </Grid>
                                    <Grid item xs={6}>
                                        <Paper className={classes.data}>
                                            {formatBalance(
                                                new BigNumber(itoSettings.exchangeAmounts?.[index]),
                                                item?.decimals ?? 0,
                                                item?.decimals ?? 0,
                                            )}
                                        </Paper>
                                    </Grid>
                                </>
                            )
                        })}

                    <Grid item xs={6}>
                        <Paper className={classes.label}>{t('plugin_ito_allocation_per_wallet')}</Paper>
                    </Grid>
                    <Grid item xs={6}>
                        <Paper className={classes.data}>{itoSettings.total}</Paper>
                    </Grid>

                    <Grid item xs={6}>
                        <Paper className={classes.label}>{t('plugin_ito_begin_times')}</Paper>
                    </Grid>
                    <Grid item xs={6}>
                        <Paper className={classes.data}>{new Date(itoSettings.startTime).toLocaleString()}</Paper>
                    </Grid>

                    <Grid item xs={6}>
                        <Paper className={classes.label}>{t('plugin_ito_end_times')}</Paper>
                    </Grid>
                    <Grid item xs={6}>
                        <Paper className={classes.data}>{new Date(itoSettings.endTime).toLocaleString()}</Paper>
                    </Grid>
                    <Grid item xs={12}>
                        <Typography>
                            You can select Existing in ITO to view the selection after successful sending
                        </Typography>
                    </Grid>
                    <Grid item xs={12}>
                        <ActionButton className={classes.button} fullWidth variant="contained" onClick={onSubmit}>
                            {` Send ${formatBalance(
                                new BigNumber(itoSettings.total),
                                itoSettings.token?.decimals ?? 0,
                                itoSettings.token?.decimals ?? 0,
                            )} ${itoSettings.token?.symbol} `}
                        </ActionButton>
                    </Grid>
                </Grid>
            </DialogContent>
        </InjectedDialog>
    )
}
