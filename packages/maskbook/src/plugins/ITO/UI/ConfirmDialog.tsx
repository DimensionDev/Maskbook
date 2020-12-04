import { InjectedDialog } from '../../../components/shared/InjectedDialog'
import { createStyles, DialogContent, makeStyles, Typography, Grid, Paper } from '@material-ui/core'
import type { ITOSettings } from '../hooks/useCreateCallback'
import BigNumber from 'bignumber.js'
import { formatBalance } from '../../Wallet/formatter'
import ActionButton from '../../../extension/options-page/DashboardComponents/ActionButton'

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
            padding: theme.spacing(2),
            textAlign: 'right',
            color: theme.palette.text.first,
        },
        label: {
            padding: theme.spacing(2),
            textAlign: 'left',
            color: theme.palette.text.secondary,
        },
        button: {
            margin: theme.spacing(2, 0),
            padding: 12,
        },
    }),
)
export interface ConfirmDialogProps {
    itoSettings: ITOSettings
    open: boolean
    onDecline: () => void
    onSubmit: () => void
}

export function ConfirmDialog(props: ConfirmDialogProps) {
    const { itoSettings, open, onDecline, onSubmit } = props
    const classes = useStyles()

    console.log('111')
    console.log(itoSettings)
    console.log()
    console.log('222')
    return (
        <InjectedDialog open={open} title="ITO Detail" onClose={onDecline}>
            <DialogContent>
                <Grid container spacing={0}>
                    <Grid item xs={12}>
                        <Typography variant="h3" className={classes.title}>
                            New Year Special Events
                        </Typography>
                    </Grid>
                    <Grid item xs={6}>
                        <Paper className={classes.label}>Sell Token</Paper>
                    </Grid>
                    <Grid item xs={6}>
                        <Paper className={classes.data}>{itoSettings.token?.symbol}</Paper>
                    </Grid>

                    <Grid item xs={6}>
                        <Paper className={classes.label}>Sell Total amount</Paper>
                    </Grid>
                    <Grid item xs={6}>
                        <Paper className={classes.data}>
                            {formatBalance(
                                new BigNumber(itoSettings.amount),
                                itoSettings.token?.decimals ?? 0,
                                itoSettings.token?.decimals ?? 0,
                            )}
                        </Paper>
                    </Grid>

                    {itoSettings.exchanges
                        .filter((item, index) => item)
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
                                                new BigNumber(itoSettings.rations?.[index]),
                                                item?.decimals ?? 0,
                                                item?.decimals ?? 0,
                                            )}
                                        </Paper>
                                    </Grid>
                                </>
                            )
                        })}

                    <Grid item xs={6}>
                        <Paper className={classes.label}>Allocation Per Wallet</Paper>
                    </Grid>
                    <Grid item xs={6}>
                        <Paper className={classes.data}>{itoSettings.total}</Paper>
                    </Grid>

                    <Grid item xs={6}>
                        <Paper className={classes.label}>Begin Times</Paper>
                    </Grid>
                    <Grid item xs={6}>
                        <Paper className={classes.data}>{new Date(itoSettings.beginTime).toLocaleString()}</Paper>
                    </Grid>

                    <Grid item xs={6}>
                        <Paper className={classes.label}>End Times</Paper>
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
                                new BigNumber(itoSettings.amount),
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
