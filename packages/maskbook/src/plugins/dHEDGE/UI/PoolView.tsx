import React, { useState } from 'react'
import { makeStyles, createStyles, Tab, Tabs, Typography } from '@material-ui/core'
import { useI18N } from '../../../utils/i18n-next-ui'
import { useFetchPool } from '../hooks/usePool'
import { PoolViewDeck } from './PoolViewDeck'
import { PoolStats } from './PoolStats'
import { PerformanceChart } from './PerformanceChart'
import { useConstant } from '../../../web3/hooks/useConstant'
import { CONSTANT } from '../constants'
import { useERC20TokenDetailed } from '../../../web3/hooks/useERC20TokenDetailed'

const useStyles = makeStyles((theme) => {
    return createStyles({
        root: {
            width: '100%',
            boxShadow: 'none',
            borderRadius: 0,
            marginBottom: theme.spacing(2),
            '&::-webkit-scrollbar': {
                display: 'none',
            },
        },
        tabs: {
            borderTop: `solid 1px ${theme.palette.divider}`,
            borderBottom: `solid 1px ${theme.palette.divider}`,
            width: '100%',
            minHeight: 'unset',
        },
        tab: {
            minHeight: 'unset',
            minWidth: 'unset',
        },
    })
})

interface PoolViewProps {
    address: string
}

export function PoolView(props: PoolViewProps) {
    const { address } = props

    const { t } = useI18N()
    const classes = useStyles()

    //#region primary token
    const TOKEN_LIST = useConstant(CONSTANT, 'ALLOWED_TOKEN_ADDRESSES')
    const { value: primaryTokenDetailed } = useERC20TokenDetailed(TOKEN_LIST[0])
    //#region fetch pool

    //#region fetch pool
    const { value: pool, error, loading } = useFetchPool(address)
    //#endregion

    //#region tabs
    const [tabIndex, setTabIndex] = useState(0)
    const tabs = [
        <Tab className={classes.tab} key="stats" label={t('plugin_dhedge_tab_stats')} />,
        <Tab className={classes.tab} key="chart" label={t('plugin_dhedge_tab_chart')} />,
    ].filter(Boolean)
    //#endregion

    if (loading) return <Typography>Loading...</Typography>
    if (!pool || !primaryTokenDetailed || error) return <Typography>Something went wrong.</Typography>
    return (
        <div className={classes.root}>
            <PoolViewDeck pool={pool} inputToken={primaryTokenDetailed} />
            <Tabs
                className={classes.tabs}
                indicatorColor="primary"
                textColor="primary"
                variant="fullWidth"
                value={tabIndex}
                onChange={(ev: React.ChangeEvent<{}>, newValue: number) => setTabIndex(newValue)}
                TabIndicatorProps={{
                    style: {
                        display: 'none',
                    },
                }}>
                {tabs}
            </Tabs>
            {tabIndex === 0 ? <PoolStats pool={pool} /> : null}
            {tabIndex === 1 ? <PerformanceChart pool={pool} /> : null}
        </div>
    )
}
