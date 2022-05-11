import type { AsyncStateRetry } from 'react-use/lib/useAsyncRetry'
import { Box, Card, CircularProgress, Typography, Paper, Link } from '@mui/material'
import { useStylesExtends, makeStyles, MaskColorVar } from '@masknet/theme'
import { ImageIcon } from '@masknet/shared'
import { WarningTriangleIcon } from '@masknet/icons'
import { NetworkPluginID, useProviderDescriptor } from '@masknet/plugin-infra/web3'
import {
    ProviderType,
    resolveProviderName,
    resolveProviderShortenLink,
    resolveProviderHomeLink,
} from '@masknet/web3-shared-evm'
import ActionButton from '../../../../extension/options-page/DashboardComponents/ActionButton'
import { useI18N } from '../../../../utils'
import { Trans } from 'react-i18next'

const useStyles = makeStyles()((theme) => ({
    content: {
        padding: theme.spacing(2, 4, 3),
        borderRadius: 8,
        backgroundColor: theme.palette.background.default,
    },
    tipContent: {
        display: 'flex',
        flexWrap: 'nowrap',
        alignItems: 'center',
        marginTop: 10,
        backgroundColor: MaskColorVar.warningBackground,
        padding: theme.spacing(2, 0, 2, 1.5),
        borderRadius: 8,
    },
    tipContentText: {
        color: MaskColorVar.warning,
        fontSize: 12,
        marginLeft: 10,
    },
    tipLink: {
        color: MaskColorVar.warning,
        textDecoration: 'underline',
    },
    error: {
        fontSize: 12,
        paddingTop: theme.spacing(0.5),
        paddingRight: theme.spacing(1),
    },
}))

export interface ConnectionProgressProps extends withClasses<never> {
    providerType: ProviderType
    connection: AsyncStateRetry<true>
}

export function ConnectionProgress(props: ConnectionProgressProps) {
    const { providerType, connection } = props
    const { value: connected, loading, error, retry } = connection

    const { t } = useI18N()
    const classes = useStylesExtends(useStyles(), props)

    const providerDescriptor = useProviderDescriptor(providerType, NetworkPluginID.PLUGIN_EVM)
    return (
        <>
            <Paper elevation={0}>
                <Card className={`${classes.content} dashboard-style`} elevation={0}>
                    <Box display="flex" alignItems="center">
                        <ImageIcon icon={providerDescriptor?.icon} />
                        <Box display="flex" flex={1} flexDirection="column" sx={{ marginLeft: 2 }}>
                            <Typography>
                                {loading
                                    ? t('plugin_wallet_connecting_with')
                                    : t(connected ? 'plugin_wallet_connected_with' : 'plugin_wallet_connect_with')}{' '}
                                {resolveProviderName(providerType)}
                            </Typography>
                            {loading ? (
                                <Box display="flex" alignItems="center">
                                    <CircularProgress size={14} color="primary" sx={{ marginRight: 1 }} />
                                    <Typography variant="body2">{t('initializing')}</Typography>
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
            <Card className={classes.tipContent} elevation={0}>
                <WarningTriangleIcon />
                <Typography className={classes.tipContentText} variant="body2">
                    <Trans
                        i18nKey="plugin_wallet_connect_tip"
                        components={{
                            providerLink: resolveProviderHomeLink(providerType) ? (
                                <Link
                                    className={classes.tipLink}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    href={resolveProviderHomeLink(providerType)}
                                />
                            ) : (
                                <span />
                            ),
                        }}
                        values={{
                            providerName: resolveProviderName(providerType),
                            providerShortenLink: resolveProviderShortenLink(providerType),
                        }}
                    />
                </Typography>
            </Card>
        </>
    )
}
