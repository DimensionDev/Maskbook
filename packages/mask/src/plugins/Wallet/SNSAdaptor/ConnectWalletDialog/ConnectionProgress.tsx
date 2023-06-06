import { Trans } from 'react-i18next'
import type { AsyncStateRetry } from 'react-use/lib/useAsyncRetry.js'
import { Icons } from '@masknet/icons'
import { WalletIcon } from '@masknet/shared'
import { type NetworkPluginID, Sniffings } from '@masknet/shared-base'
import { ProviderType } from '@masknet/web3-shared-evm'
import { Box, Card, Typography, Paper, Link } from '@mui/material'
import { makeStyles, MaskColorVar, ActionButton, LoadingBase } from '@masknet/theme'
import { useProviderDescriptor, useNetworkDescriptor, useWeb3Others } from '@masknet/web3-hooks-base'
import type { Web3Helper } from '@masknet/web3-helpers'
import { useI18N } from '../../../../utils/index.js'

const useStyles = makeStyles<{
    contentBackground?: string
}>()((theme, props) => ({
    content: {
        padding: theme.spacing('22px', '12px'),
        borderRadius: 8,
        background: props.contentBackground ?? theme.palette.background.default,
    },
    tipContent: {
        display: 'flex',
        flexWrap: 'nowrap',
        alignItems: 'center',
        marginTop: 12,
        backgroundColor: MaskColorVar.warningBackground,
        padding: '13px 12px',
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
        fontSize: '14px',
        color: Sniffings.is_dashboard_page ? '#07101B' : theme.palette.maskColor.dark,
        fontWeight: 700,
    },
    error: {
        paddingRight: theme.spacing(1),
    },
    progressIcon: {
        fontSize: 14,
        color: theme.palette.common.white,
    },
    progress: {
        color: theme.palette.common.black,
    },
    warningTriangleIcon: {
        fontSize: 20,
    },
    retryButton: {
        fontSize: 12,
        backgroundColor: theme.palette.maskColor.publicMain,
        color: theme.palette.maskColor.white,
        '&:hover': {
            backgroundColor: theme.palette.maskColor.publicMain,
            color: theme.palette.maskColor.white,
        },
    },
}))

export interface ConnectionProgressProps {
    pluginID: NetworkPluginID
    providerType: Web3Helper.ProviderTypeAll
    networkType: Web3Helper.NetworkTypeAll
    connection: AsyncStateRetry<true>
}

export function ConnectionProgress(props: ConnectionProgressProps) {
    const { pluginID, providerType, networkType, connection } = props
    const { value: connected, loading, error, retry } = connection

    const { t } = useI18N()

    const Others = useWeb3Others(pluginID)
    const providerDescriptor = useProviderDescriptor(pluginID, providerType)
    const networkDescriptor = useNetworkDescriptor(pluginID, networkType)
    const { classes } = useStyles({ contentBackground: providerDescriptor.backgroundGradient })
    if (!Others) return null

    return (
        <>
            <Paper elevation={0}>
                <Card className={`${classes.content} dashboard-style`} elevation={0}>
                    <Box display="flex" alignItems="center">
                        <WalletIcon
                            size={30}
                            badgeSize={12}
                            mainIcon={providerDescriptor.icon}
                            badgeIcon={networkDescriptor?.icon}
                        />
                        <Box display="flex" flex={1} flexDirection="column" sx={{ marginLeft: 2 }}>
                            <Typography className={classes.connectWith}>
                                {loading
                                    ? t('plugin_wallet_connect_with')
                                    : t(connected ? 'plugin_wallet_connected_with' : 'plugin_wallet_connect_with')}{' '}
                                {Others.providerResolver.providerName(providerType)}
                            </Typography>
                            {loading ? (
                                <Box display="flex" alignItems="center">
                                    <LoadingBase className={classes.progressIcon} size={14} sx={{ marginRight: 1 }} />
                                    <Typography variant="body2" className={classes.progress}>
                                        {t('initializing')}
                                    </Typography>
                                </Box>
                            ) : null}
                            {!loading && error ? (
                                <Typography className={classes.error} color="red" variant="body2">
                                    {error.message.includes('Already processing eth_requestAccounts') ||
                                    error.message.includes(
                                        "Request of type 'wallet_requestPermissions' already pending for origin",
                                    )
                                        ? t('plugin_wallet_metamask_error_already_request')
                                        : error.message ?? 'Something went wrong.'}
                                </Typography>
                            ) : null}
                        </Box>
                        {!connected && error ? (
                            <ActionButton
                                loading={loading}
                                color="primary"
                                onClick={retry}
                                disabled={loading}
                                className={classes.retryButton}>
                                {t('plugin_wallet_connect_with_retry')}
                            </ActionButton>
                        ) : null}
                    </Box>
                </Card>
            </Paper>
            {providerDescriptor.type === ProviderType.WalletConnect ? null : (
                <Card className={classes.tipContent} elevation={0}>
                    <Icons.WarningTriangle className={classes.warningTriangleIcon} />
                    <Typography className={classes.tipContentText} variant="body2">
                        <Trans
                            i18nKey="plugin_wallet_connect_tip"
                            components={{
                                providerLink: Others.providerResolver.providerHomeLink(providerType) ? (
                                    <Link
                                        className={classes.tipLink}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        href={Others.providerResolver.providerHomeLink(providerType)}
                                    />
                                ) : (
                                    <span />
                                ),
                            }}
                            values={{
                                providerName: Others.providerResolver.providerName(providerType),
                                providerShortenLink: Others.providerResolver.providerShortenLink(providerType),
                            }}
                        />
                    </Typography>
                </Card>
            )}
        </>
    )
}
