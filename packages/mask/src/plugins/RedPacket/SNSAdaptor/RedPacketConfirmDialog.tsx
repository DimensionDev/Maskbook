import BigNumber from 'bignumber.js'
import classNames from 'classnames'
import { useEffect } from 'react'
import { explorerResolver, isNativeTokenAddress } from '@masknet/web3-shared-evm'
import { Grid, Link, Paper, Typography } from '@mui/material'
import { makeStyles } from '@masknet/theme'
import LaunchIcon from '@mui/icons-material/Launch'
import { FormattedBalance } from '@masknet/shared'
import ActionButton from '../../../extension/options-page/DashboardComponents/ActionButton'
import { useI18N } from '../locales'
import type { RedPacketSettings } from './hooks/useCreateCallback'
import { useChainId } from '@masknet/plugin-infra/web3'
import { NetworkPluginID, formatBalance } from '@masknet/web3-shared-base'

const useStyles = makeStyles()((theme) => ({
    link: {
        display: 'flex',
        marginLeft: theme.spacing(0.5),
    },
    grid: {
        paddingTop: theme.spacing(2),
        paddingBottom: theme.spacing(2),
    },
    gridWrapper: {
        paddingLeft: theme.spacing(3),
        paddingRight: theme.spacing(3),
    },
    hit: {
        fontSize: 14,
        fontWeight: 300,
        borderRadius: 8,
        backgroundColor: theme.palette.background.default,
        color: theme.palette.text.primary,
        padding: theme.spacing(1.2),
        marginBottom: theme.spacing(1),
    },
    token: {
        display: 'flex',
        justifyContent: 'flex-end',
        alignItems: 'center',
    },
    data: {
        textAlign: 'right',
        color: theme.palette.text.primary,
    },
    label: {
        textAlign: 'left',
        color: theme.palette.text.secondary,
    },
    button: {
        padding: theme.spacing(2),
    },
    gasEstimation: {
        display: 'flex',
        justifyContent: 'flex-end',
        alignItems: 'center',
        cursor: 'pointer',
        '& > p': {
            marginRight: 5,
            color: theme.palette.mode === 'light' ? '#7B8192' : '#6F767C',
        },
    },
    ellipsis: {
        textOverflow: 'ellipsis',
        overflow: 'hidden',
    },
}))

export interface ConfirmRedPacketFormProps {
    onBack: () => void
    onCreate: () => void
    onClose: () => void
    settings?: RedPacketSettings
}

export function RedPacketConfirmDialog(props: ConfirmRedPacketFormProps) {
    const t = useI18N()
    const { onBack, settings, onCreate, onClose } = props
    const { classes } = useStyles()
    const chainId = useChainId(NetworkPluginID.PLUGIN_EVM)
    useEffect(() => {
        if (settings?.token?.chainId !== chainId) onClose()
    }, [chainId, onClose])

    return (
        <Grid container spacing={2} className={classNames(classes.grid, classes.gridWrapper)}>
            <Grid item xs={12}>
                <Typography variant="h4" color="textPrimary" align="center" className={classes.ellipsis}>
                    {settings?.message}
                </Typography>
            </Grid>
            <Grid item xs={6}>
                <Typography variant="body1" color="textSecondary">
                    {t.token()}
                </Typography>
            </Grid>
            <Grid item xs={6}>
                <Typography variant="body1" color="textPrimary" align="right" className={classes.token}>
                    <span>{settings?.token?.symbol}</span>
                    {isNativeTokenAddress(settings?.token) ? null : (
                        <Link
                            color="textPrimary"
                            className={classes.link}
                            href={explorerResolver.fungibleTokenLink(chainId, settings?.token?.address ?? '')}
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
                    {t.split_mode()}
                </Typography>
            </Grid>
            <Grid item xs={6}>
                <Typography variant="body1" color="textPrimary" align="right">
                    {settings?.isRandom ? t.random() : t.average()}
                </Typography>
            </Grid>

            <Grid item xs={6}>
                <Typography variant="body1" color="textSecondary">
                    {t.shares()}
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
                            {t.amount_per_share()}
                        </Typography>
                    </Grid>
                    <Grid item xs={6}>
                        <Typography variant="body1" color="textPrimary" align="right">
                            <FormattedBalance
                                value={new BigNumber(settings?.total ?? 0).div(settings?.shares ?? 1)}
                                decimals={settings?.token?.decimals}
                                symbol={settings?.token?.symbol}
                                formatter={formatBalance}
                            />
                        </Typography>
                    </Grid>
                </>
            )}

            <Grid item xs={6}>
                <Typography variant="body1" color="textSecondary">
                    {t.amount_total()}
                </Typography>
            </Grid>
            <Grid item xs={6}>
                <Typography variant="body1" color="textPrimary" align="right">
                    <FormattedBalance
                        value={settings?.total}
                        decimals={settings?.token?.decimals!}
                        symbol={settings?.token?.symbol!}
                        formatter={formatBalance}
                    />
                </Typography>
            </Grid>
            <Grid item xs={12}>
                <Paper className={classes.hit}>
                    <Typography variant="body1" align="center" style={{ fontSize: 14, lineHeight: '20px' }}>
                        {t.hint()}
                    </Typography>
                </Paper>
            </Grid>

            <Grid item xs={6}>
                <ActionButton variant="contained" size="large" fullWidth onClick={onBack}>
                    {t.back()}
                </ActionButton>
            </Grid>
            <Grid item xs={6}>
                <ActionButton variant="contained" size="large" fullWidth onClick={onCreate}>
                    {t.send_symbol({
                        amount: formatBalance(settings?.total, settings?.token?.decimals ?? 0),
                        symbol: settings?.token?.symbol ?? '-',
                    })}
                </ActionButton>
            </Grid>
        </Grid>
    )
}
