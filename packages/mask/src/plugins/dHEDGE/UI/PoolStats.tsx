import { useState } from 'react'
import type { Pool } from '../types'
import { Divider, Grid, Typography } from '@mui/material'
import { makeStyles, MaskColorVar } from '@masknet/theme'
import { Trans } from 'react-i18next'
import { formatAmountPostfix } from '../utils'
import DOMPurify from 'isomorphic-dompurify'
import { POOL_DESCRIPTION_LIMIT } from '../constants'
import BigNumber from 'bignumber.js'
import { formatBalance } from '@masknet/web3-shared-evm'

const DIGIT_LENGTH = 18

const useStyles = makeStyles()((theme) => ({
    root: {
        padding: theme.spacing(2),
        paddingTop: theme.spacing(1),
        paddingBottom: theme.spacing(1),
        alignItems: 'center',
        '& svg': {
            marginRight: theme.spacing(0.5),
        },
    },
    title: {
        fontSize: 12,
    },
    value: {
        fontSize: 32,
    },
    meta: {
        display: 'flex',
        alignItems: 'center',
        padding: theme.spacing(1),
    },
    description: {
        paddingTop: theme.spacing(1),
        paddingBottom: theme.spacing(1),
        maxWidth: '100%',
    },
}))

interface PoolStatsProps {
    pool: Pool
}

export function PoolStats(props: PoolStatsProps) {
    const { pool } = props
    const { classes } = useStyles()
    // #region process stats
    const valueManaged = formatAmountPostfix(formatBalance(pool?.totalValue, DIGIT_LENGTH))
    const lifeTimeReturn = new BigNumber(formatBalance(pool.performance, DIGIT_LENGTH)).minus(1).multipliedBy(100)

    const riskFactor = pool && pool?.riskFactor !== -1 ? pool?.riskFactor : '-'
    // pool detail contains raw html and need to sanitize before use
    const cleanDescription = DOMPurify.sanitize(pool.poolDetails)
    const [expanded, setExpanded] = useState(cleanDescription.length < POOL_DESCRIPTION_LIMIT)
    // #endregion

    return (
        <div className={classes.root}>
            <div className={classes.meta}>
                <Grid container direction="column" alignItems="center">
                    <Grid item xs={6}>
                        <Typography variant="body2" color="textSecondary" className={classes.title}>
                            <Trans i18nKey="plugin_dhedge_value_managed" />
                        </Typography>
                    </Grid>
                    <Grid item xs={6}>
                        <Typography variant="body2" color="textPrimary" className={classes.value}>
                            ${valueManaged}
                        </Typography>
                    </Grid>
                </Grid>
                <Grid container className={classes.meta} direction="column">
                    <Grid item xs={6}>
                        <Typography variant="body2" color="textSecondary" className={classes.title}>
                            <Trans i18nKey="plugin_dhedge_lifetime_return" />
                        </Typography>
                    </Grid>
                    <Grid item xs={6}>
                        <Typography
                            variant="body2"
                            color={
                                lifeTimeReturn.isGreaterThan(0)
                                    ? MaskColorVar.greenMain
                                    : lifeTimeReturn.isLessThan(0)
                                    ? MaskColorVar.redMain
                                    : 'textPrimary'
                            }
                            className={classes.value}>
                            {lifeTimeReturn.toFixed(2)}%
                        </Typography>
                    </Grid>
                </Grid>
                <Grid container className={classes.meta} direction="column">
                    <Grid item xs={6}>
                        <Typography variant="body2" color="textSecondary" className={classes.title}>
                            <Trans i18nKey="plugin_dhedge_risk_factor" />
                        </Typography>
                    </Grid>
                    <Grid item xs={6}>
                        <Typography
                            variant="body2"
                            color={
                                riskFactor === '-' || riskFactor === 3
                                    ? 'textPrimary'
                                    : riskFactor < 3
                                    ? MaskColorVar.greenMain
                                    : MaskColorVar.redMain
                            }
                            className={classes.value}>
                            {riskFactor} / 5
                        </Typography>
                    </Grid>
                </Grid>
            </div>
            <Divider />
            {cleanDescription ? (
                <div className={classes.description}>
                    <Typography variant="h6" color="textPrimary">
                        <Trans i18nKey="plugin_dhedge_strategy" />
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                        <span
                            dangerouslySetInnerHTML={{
                                __html: expanded
                                    ? cleanDescription
                                    : cleanDescription.slice(0, POOL_DESCRIPTION_LIMIT).concat('...'),
                            }}
                        />
                    </Typography>
                    {cleanDescription.length > POOL_DESCRIPTION_LIMIT ? (
                        <Typography variant="body2" color="primary" onClick={() => setExpanded(!expanded)}>
                            {expanded ? (
                                <Trans i18nKey="plugin_dhedge_see_less" />
                            ) : (
                                <Trans i18nKey="plugin_dhedge_see_more" />
                            )}
                        </Typography>
                    ) : null}
                </div>
            ) : null}
        </div>
    )
}
