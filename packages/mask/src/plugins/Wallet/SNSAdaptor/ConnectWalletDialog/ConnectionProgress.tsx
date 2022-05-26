import type { AsyncStateRetry } from 'react-use/lib/useAsyncRetry'
import { Box, Card, CircularProgress, Typography, Paper, Link } from '@mui/material'
import { useStylesExtends, makeStyles, MaskColorVar } from '@masknet/theme'
import { WalletIcon } from '@masknet/shared'
import { WarningTriangleIcon } from '@masknet/icons'
import {
    useProviderDescriptor,
    useNetworkDescriptor,
    useWeb3State,
    Web3Plugin,
    NetworkPluginID,
} from '@masknet/plugin-infra/web3'
import ActionButton from '../../../../extension/options-page/DashboardComponents/ActionButton'
import { useI18N } from '../../../../utils'
import { Trans } from 'react-i18next'

const useStyles = makeStyles<{ contentBackground?: string }>()((theme, props) => ({
    content: {
        padding: theme.spacing('20px', 2),
        borderRadius: 8,
        background: props.contentBackground ?? theme.palette.background.default,
    },
    tipContent: {
        display: 'flex',
        flexWrap: 'nowrap',
        alignItems: 'center',
        marginTop: 10,
        backgroundColor: MaskColorVar.warningBackground,
        padding: '14.5px 14.5px 16px 14.5px',
        borderRadius: 8,
    },
    tipContentText: {
        color: MaskColorVar.warning,
        fontSize: 13,
        marginLeft: 8.5,
    },
    tipLink: {
        color: MaskColorVar.warning,
        textDecoration: 'underline',
    },
    connectWith: {
        color: theme.palette.maskColor.dark,
        fontWeight: 700,
    },
    error: {
        fontSize: 14,
        paddingRight: theme.spacing(1),
    },
    progress: {
        color: theme.palette.common.black,
    },
    warningTriangleIcon: {
        fontSize: 20,
    },
}))

export interface ConnectionProgressProps extends withClasses<never> {
    providerType: Web3Plugin.ProviderDescriptor['type']
    networkType: Web3Plugin.NetworkDescriptor['type']
    networkPluginId: NetworkPluginID
    connection: AsyncStateRetry<true>
}

export function ConnectionProgress(props: ConnectionProgressProps) {
    const { providerType, networkType, networkPluginId, connection } = props
    const { value: connected, loading, error, retry } = connection

    const { Utils } = useWeb3State(networkPluginId)
    const providerDescriptor = useProviderDescriptor(providerType, networkPluginId)
    const networkDescriptor = useNetworkDescriptor(networkType, networkPluginId)
    const { t } = useI18N()
    const classes = useStylesExtends(useStyles({ contentBackground: providerDescriptor?.backgroundGradient }), props)

    return (
        <>
            <Paper elevation={0}>
                <Card className={`${classes.content} dashboard-style`} elevation={0}>
                    <Box display="flex" alignItems="center">
                        <WalletIcon
                            size={30}
                            badgeSize={12}
                            mainIcon={providerDescriptor?.icon}
                            badgeIcon={networkDescriptor?.icon}
                        />
                        <Box display="flex" flex={1} flexDirection="column" sx={{ marginLeft: 2 }}>
                            <Typography className={classes.connectWith}>
                                {loading
                                    ? t('plugin_wallet_connect_with')
                                    : t(connected ? 'plugin_wallet_connected_with' : 'plugin_wallet_connect_with')}{' '}
                                {Utils?.resolveProviderName?.(providerType)}
                            </Typography>
                            {loading ? (
                                <Box display="flex" alignItems="center">
                                    <CircularProgress className={classes.progress} size={14} sx={{ marginRight: 1 }} />
                                    <Typography variant="body2" className={classes.progress}>
                                        {t('initializing')}
                                    </Typography>
                                </Box>
                            ) : null}
                            {!loading && error ? (
                                <Typography className={classes.error} color="red" variant="body2">
                                    {error.message?.includes('Already processing eth_requestAccounts') ||
                                    error.message?.includes(
                                        "Request of type 'wallet_requestPermissions' already pending for origin",
                                    )
                                        ? t('plugin_wallet_metamask_error_already_request')
                                        : error.message ?? 'Something went wrong.'}
                                </Typography>
                            ) : null}
                        </Box>
                        {!connected && error ? (
                            <ActionButton color="primary" variant="contained" onClick={retry} disabled={loading}>
                                {t('plugin_wallet_connect_with_retry')}
                            </ActionButton>
                        ) : null}
                    </Box>
                </Card>
            </Paper>
            {providerDescriptor?.ID === `${NetworkPluginID.PLUGIN_EVM}_walletconnect` ? null : (
                <Card className={classes.tipContent} elevation={0}>
                    <WarningTriangleIcon className={classes.warningTriangleIcon} />
                    <Typography className={classes.tipContentText} variant="body2">
                        <Trans
                            i18nKey="plugin_wallet_connect_tip"
                            components={{
                                providerLink: Utils?.resolveProviderHomeLink?.(providerType) ? (
                                    <Link
                                        className={classes.tipLink}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        href={Utils?.resolveProviderHomeLink?.(providerType)}
                                    />
                                ) : (
                                    <span />
                                ),
                            }}
                            values={{
                                providerName: Utils?.resolveProviderName?.(providerType),
                                providerShortenLink: Utils?.resolveProviderShortenLink?.(providerType),
                            }}
                        />
                    </Typography>
                </Card>
            )}
        </>
    )
}
