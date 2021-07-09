import { formatBalance, resolveTokenLinkOnExplorer } from '@masknet/web3-shared'
import { Grid, Link, makeStyles, Paper, Typography } from '@material-ui/core'
import BigNumber from 'bignumber.js'
import { isNative } from 'lodash-es'
import ActionButton from '../../../extension/options-page/DashboardComponents/ActionButton'
import { useI18N } from '../../../utils'
import type { RedPacketSettings } from './hooks/useCreateCallback'
import LaunchIcon from '@material-ui/icons/Launch'
import { FormattedBalance } from '@masknet/shared'

const useStyles = makeStyles((theme) => ({
    link: {},
    grid: {
        paddingTop: theme.spacing(2),
        paddingBottom: theme.spacing(2),
    },
    hit: {
        backgroundColor: theme.palette.divider,
        paddingTop: theme.spacing(1),
        paddingBottom: theme.spacing(1),
        marginBottom: theme.spacing(1),
    },
}))

export interface ConfirmRedPacketFormProps {
    onBack: () => void
    onCreate: () => void
    settings?: Omit<RedPacketSettings, 'password'>
}

export function ConfirmRedPacketForm(props: ConfirmRedPacketFormProps) {
    const { t } = useI18N()
    const { onBack, settings, onCreate } = props
    const classes = useStyles()

    return (
        <Grid container spacing={2} className={classes.grid}>
            <Grid item xs={12}>
                <Typography variant="h4" color="textPrimary" align="center">
                    {settings?.message}
                </Typography>
            </Grid>
            <Grid item xs={6}>
                <Typography variant="body1" color="textSecondary">
                    {t('plugin_red_packet_token')}
                </Typography>
            </Grid>
            <Grid item xs={6}>
                <Typography variant="body1" color="textPrimary" align="right">
                    {settings?.token?.symbol}
                    {isNative(settings?.token?.address!) ? null : (
                        <Link
                            className={classes.link}
                            href={resolveTokenLinkOnExplorer(settings?.token!)}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={stop}>
                            <LaunchIcon fontSize="small" />
                        </Link>
                    )}
                </Typography>
            </Grid>

            <Grid item xs={6}>
                <Typography variant="body1" color="textSecondary">
                    {t('plugin_red_packet_split_mode')}
                </Typography>
            </Grid>
            <Grid item xs={6}>
                <Typography variant="body1" color="textPrimary" align="right">
                    {settings?.isRandom ? t('plugin_red_packet_random') : t('plugin_red_packet_average')}
                </Typography>
            </Grid>

            <Grid item xs={6}>
                <Typography variant="body1" color="textSecondary">
                    {t('plugin_red_packet_shares')}
                </Typography>
            </Grid>
            <Grid item xs={6}>
                <Typography variant="body1" color="textPrimary" align="right">
                    {settings?.shares}
                </Typography>
            </Grid>

            {settings?.isRandom ? null : (
                <>
                    <Grid item xs={6}>
                        <Typography variant="body1" color="textSecondary">
                            {t('plugin_red_packet_amount_per_share')}
                        </Typography>
                    </Grid>
                    <Grid item xs={6}>
                        <Typography variant="body1" color="textPrimary" align="right">
                            {`${
                                settings?.isRandom
                                    ? formatBalance(new BigNumber(settings?.total ?? 0), settings?.token?.decimals ?? 0)
                                    : formatBalance(
                                          new BigNumber(settings?.total ?? 0).div(settings?.shares ?? 1),
                                          settings?.token?.decimals ?? 18,
                                      )
                            } ${settings?.token?.symbol}`}
                        </Typography>
                    </Grid>
                </>
            )}

            <Grid item xs={6}>
                <Typography variant="body1" color="textSecondary">
                    {t('plugin_red_packet_amount_total')}
                </Typography>
            </Grid>
            <Grid item xs={6}>
                <Typography variant="body1" color="textPrimary" align="right">
                    <FormattedBalance
                        value={settings?.total}
                        decimals={settings?.token?.decimals!}
                        symbol={settings?.token?.symbol!}
                    />
                </Typography>
            </Grid>

            <Grid item xs={12}>
                <Paper className={classes.hit}>
                    <Typography variant="body1" color="textPrimary" align="center">
                        {t('plugin_red_packet_hint')}
                    </Typography>
                </Paper>
            </Grid>

            <Grid item xs={6}>
                <ActionButton variant="contained" size="large" fullWidth onClick={onBack}>
                    {t('plugin_red_packet_back')}
                </ActionButton>
            </Grid>
            <Grid item xs={6}>
                <ActionButton variant="contained" size="large" fullWidth onClick={onCreate}>
                    {t('plugin_red_packet_send_symbol', {
                        amount: formatBalance(new BigNumber(settings?.total ?? 0), settings?.token?.decimals ?? 0),
                        symbol: settings?.token?.symbol,
                    })}
                </ActionButton>
            </Grid>
        </Grid>
    )
}
