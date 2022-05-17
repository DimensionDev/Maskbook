import { useChainId } from '@masknet/plugin-infra/src/web3'
import { makeStyles } from '@masknet/theme'
import { isSameAddress, NetworkPluginID } from '@masknet/web3-shared-base'
import { Card, CardContent, Tabs, Tab, Typography, Paper } from '@mui/material'
import { useState } from 'react'
import { useI18N } from '../../../utils/i18n-next-ui'
import { useFetchPools } from '../hooks/usePool'
import type { Investable } from '../types'
import { InvestmentsView } from './InvestmentsView'
import { PoolView } from './PoolView'

const useStyles = makeStyles()((theme) => ({
    root: {
        fontFamily: 'Muli,Helvetica,-apple-system,system-ui,"sans-serif"',
        width: '100%',
        boxShadow: 'none',
        border: `solid 1px ${theme.palette.divider}`,
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
}))

interface PoolViewProps {
    address: string
    category: string
}

export function FurucomboView(props: PoolViewProps) {
    const { t } = useI18N()
    const { classes } = useStyles()
    const [tabIndex, setTabIndex] = useState(0)
    const currentChainId = useChainId(NetworkPluginID.PLUGIN_EVM)

    const { value, loading, error } = useFetchPools()

    if (loading) return <Typography align="center">{t('loading')}</Typography>

    if (error || !value)
        return (
            <Typography align="center" color="textPrimary">
                {t('plugin_furucombo_smt_wrong')}
            </Typography>
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
            <Typography align="center" color="textPrimary">
                {t('plugin_furucombo_pool_not_found')}
            </Typography>
        )

    return (
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
    )
}
