import { Box, Card, CircularProgress, Typography, Paper } from '@material-ui/core'
import { makeStyles } from '@masknet/theme'
import { resolveProviderName, ProviderType } from '@masknet/web3-shared'
import ActionButton from '../../../../extension/options-page/DashboardComponents/ActionButton'
import { useI18N } from '../../../../utils'
import { ProviderIcon, useStylesExtends } from '@masknet/shared'
import type { AsyncStateRetry } from 'react-use/lib/useAsyncRetry'
import { getMaskColor } from '@masknet/theme'

const useStyles = makeStyles()((theme) => ({
    content: {
        padding: theme.spacing(2, 4, 3),
        borderRadius: 8,
        backgroundColor: getMaskColor(theme).twitterBackground,
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

    return (
        <Paper elevation={0}>
            <Card className={classes.content} elevation={0}>
                <Box display="flex" alignItems="center">
                    <ProviderIcon providerType={providerType} />
                    <Box display="flex" flex={1} flexDirection="column" sx={{ marginLeft: 2 }}>
                        {connected ? (
                            <Typography>Connected to {resolveProviderName(providerType)}</Typography>
                        ) : (
                            <Typography>Connect to {resolveProviderName(providerType)}</Typography>
                        )}
                        {loading ? (
                            <Box display="flex" alignItems="center">
                                <CircularProgress size={14} color="primary" sx={{ marginRight: 1 }} />
                                <Typography variant="body2">Initializing…</Typography>
                            </Box>
                        ) : null}
                        {!loading && error ? (
                            <Typography className={classes.error} color="red" variant="body2">
                                {error.message}
                            </Typography>
                        ) : null}
                    </Box>
                    {!connected && error ? (
                        <ActionButton color="primary" variant="contained" onClick={retry} disabled={loading}>
                            {t('retry')}
                        </ActionButton>
                    ) : null}
                </Box>
            </Card>
        </Paper>
    )
}
