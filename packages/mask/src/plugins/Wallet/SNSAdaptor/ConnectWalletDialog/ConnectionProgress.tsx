import { Trans } from 'react-i18next'
import { WalletIcon } from '@masknet/shared'
import type { NetworkPluginID } from '@masknet/web3-shared-base'
import { ProviderType } from '@masknet/web3-shared-evm'
import type { AsyncStateRetry } from 'react-use/lib/useAsyncRetry'
import { Box, Card, CircularProgress, Typography, Paper, Link } from '@mui/material'
import { useStylesExtends, makeStyles, MaskColorVar } from '@masknet/theme'
import { useProviderDescriptor, useNetworkDescriptor, useWeb3State, Web3Helper } from '@masknet/plugin-infra/web3'
import ActionButton from '../../../../extension/options-page/DashboardComponents/ActionButton'
import { useI18N } from '../../../../utils'
import { WarningTriangleIcon } from '@masknet/icons'
import { isDashboardPage } from '@masknet/shared-base'

const useStyles = makeStyles<{ contentBackground?: string }>()((theme, props) => ({
    content: {
        padding: theme.spacing('22px', '12px'),
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
        fontSize: '14px',
        color: isDashboardPage() ? '#07101B' : theme.palette.maskColor?.dark,
        fontWeight: 700,
    },
    error: {
        fontSize: 14,
        paddingRight: theme.spacing(1),
    },
    progressIcon: {
        fontSize: 14,
        color: theme.palette.common.white,
    },
    progress: {
        fontSize: 14,
        color: theme.palette.common.black,
    },
    warningTriangleIcon: {
        fontSize: 20,
    },
    retryButton: {
        fontSize: 12,
    },
}))

export interface ConnectionProgressProps extends withClasses<never> {
    pluginID: NetworkPluginID
    providerType: Web3Helper.Definition[NetworkPluginID]['ProviderType']
    networkType: Web3Helper.Definition[NetworkPluginID]['NetworkType']
    connection: AsyncStateRetry<true>
}

export function ConnectionProgress(props: ConnectionProgressProps) {
    const { pluginID, providerType, networkType, connection } = props
    const { value: connected, loading, error, retry } = connection

    const { t } = useI18N()

    const { Others } = useWeb3State(pluginID)
    const providerDescriptor = useProviderDescriptor(pluginID, providerType)
    const networkDescriptor = useNetworkDescriptor(pluginID, networkType)
    const classes = useStylesExtends(useStyles({ contentBackground: providerDescriptor?.backgroundGradient }), props)
    if (!Others) return null

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
                                {Others.providerResolver.providerName(providerType)}
                            </Typography>
                            {loading ? (
                                <Box display="flex" alignItems="center">
                                    <CircularProgress
                                        className={classes.progressIcon}
                                        size={14}
                                        sx={{ marginRight: 1 }}
                                    />
                                    <Typography variant="body2" className={classes.progress}>
                                        {t('initializing')}
                                    </Typography>
                                </Box>
                            ) : null}
                            {!loading && error ? (
                                <Typography className={classes.error} color="red" variant="body2">
                                    {t('plugin_wallet_connecting_error')}
                                </Typography>
                            ) : null}
                        </Box>
                        {!connected && error ? (
                            <ActionButton
                                color="primary"
                                variant="contained"
                                onClick={retry}
                                disabled={loading}
                                className={classes.retryButton}>
                                {t('plugin_wallet_connect_with_retry')}
                            </ActionButton>
                        ) : null}
                    </Box>
                </Card>
            </Paper>
            {providerDescriptor?.type === ProviderType.WalletConnect ? null : (
                <Card className={classes.tipContent} elevation={0}>
                    <WarningTriangleIcon className={classes.warningTriangleIcon} />
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
