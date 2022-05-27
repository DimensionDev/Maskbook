import { useChainId } from '@masknet/plugin-infra/web3'
import { isSameAddress, NetworkPluginID } from '@masknet/web3-shared-base'
import { makeStyles, MaskColorVar } from '@masknet/theme'
import { Card, CardContent, Tabs, Tab, Typography, Paper, CircularProgress, Button, Stack, Box } from '@mui/material'
import { useState } from 'react'
import { useI18N } from '../../../utils/i18n-next-ui'
import { ChainBoundary } from '../../../web3/UI/ChainBoundary'
import { useFetchPools } from '../hooks/usePool'
import type { Investable } from '../types'
import { InvestmentsView } from './InvestmentsView'
import { PoolView } from './PoolView'

const useStyles = makeStyles()((theme) => ({
    root: {
        fontFamily: 'Muli,Helvetica,-apple-system,system-ui,"sans-serif"',
        width: '100%',
        boxShadow: 'none',
        padding: 0,
    },
    content: {
        width: '100%',
        height: 'var(--contentHeight)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-around',
        padding: '0 !important',
    },
    tabs: {
        borderTop: `solid 1px ${theme.palette.divider}`,
        borderBottom: `solid 1px ${theme.palette.divider}`,
        backgroundColor: '#1b1b21',
    },
    tab: {
        fontFamily: 'inherit',
        color: 'white',
    },
    reload: {
        backgroundColor: theme.palette.maskColor.dark,
        '&:hover': {
            backgroundColor: theme.palette.maskColor.dark,
        },
        color: 'white',
        width: 254,
    },
}))

interface PoolViewProps {
    address: string
    category: string
    chainId: number
}

export function FurucomboView(props: PoolViewProps) {
    const { t } = useI18N()
    const { classes } = useStyles()
    const [tabIndex, setTabIndex] = useState(0)
    const currentChainId = useChainId(NetworkPluginID.PLUGIN_EVM)

    const { value, loading, error, retry } = useFetchPools()

    if (loading)
        return (
            <Stack sx={{ alignItems: 'center' }}>
                <CircularProgress size="small" />
            </Stack>
        )

    if (error || !value)
        return (
            <Stack sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                <Typography align="center" color={MaskColorVar.errorPlugin}>
                    {t('plugin_furucombo_load_failed')}
                </Typography>
                <Button variant="contained" className={classes.reload} onClick={retry}>
                    {t('plugin_furucombo_reload')}
                </Button>
            </Stack>
        )

    const { investables = [] } = value

    const investable = investables.find(
        (investable: Investable) =>
            isSameAddress(investable.address, props.address) &&
            investable.chainId === currentChainId &&
            investable.category === props.category,
    )

    if (!investable)
        return (
            <>
                <Typography align="center" color="error">
                    {t('plugin_furucombo_pool_not_found')}
                </Typography>

                <Box sx={{ padding: 1.5 }}>
                    <ChainBoundary expectedPluginID={NetworkPluginID.PLUGIN_EVM} expectedChainId={props.chainId} />
                </Box>
            </>
        )

    return (
        <>
            <Card className={classes.root}>
                <CardContent className={classes.content}>
                    <Tabs
                        value={tabIndex}
                        className={classes.tabs}
                        variant="fullWidth"
                        indicatorColor="primary"
                        textColor="secondary"
                        onChange={(_, newValue: number) => setTabIndex(newValue)}>
                        <Tab value={0} className={classes.tab} key={0} label={t('plugin_furucombo_tab_pool')} />,
                        <Tab value={1} className={classes.tab} key={1} label={t('plugin_furucombo_tab_investments')} />,
                    </Tabs>
                    <Paper>
                        {tabIndex === 0 ? <PoolView investable={investable} /> : null}
                        {tabIndex === 1 ? <InvestmentsView investables={investables} /> : null}
                    </Paper>
                </CardContent>
            </Card>
            <Box sx={{ padding: 1.5 }}>
                <ChainBoundary expectedPluginID={NetworkPluginID.PLUGIN_EVM} expectedChainId={props.chainId} />
            </Box>
        </>
    )
}
