import { makeStyles, Box, Card, CircularProgress, Typography, Paper } from '@material-ui/core'
import { resolveProviderName, ProviderType } from '@masknet/web3-shared'
import { ProviderIcon } from '../../../../components/shared/ProviderIcon'
import ActionButton from '../../../../extension/options-page/DashboardComponents/ActionButton'
import { useI18N } from '../../../../utils'
import { useStylesExtends } from '../../../../components/custom-ui-helper'
import type { AsyncStateRetry } from 'react-use/lib/useAsyncRetry'

const useStyles = makeStyles((theme) => ({
    root: {},
    content: {
        padding: theme.spacing(2, 4, 3),
        borderRadius: 8,
        backgroundColor: theme.palette.mode === 'dark' ? '#17191D' : '#F7F9FA',
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
        <Paper className={classes.root} elevation={0}>
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
                        <ActionButton color="primary" variant="contained" onClick={retry}>
                            {t('retry')}
                        </ActionButton>
                    ) : null}
                </Box>
            </Card>
        </Paper>
    )
}
