import { useState } from 'react'
import { Grid, makeStyles, Typography } from '@material-ui/core'
import { Trans } from 'react-i18next'
import type { Market } from '../types'
import { getResolutionRules } from '../utils'

import { POOL_DESCRIPTION_LIMIT } from '../constants'

const useStyles = makeStyles((theme) => ({
    root: {
        padding: theme.spacing(2),
        paddingTop: theme.spacing(1),
        paddingBottom: theme.spacing(1),
        alignItems: 'center',
        '& svg': {
            marginRight: theme.spacing(0.5),
        },
    },
    info: {
        border: `solid 1px ${theme.palette.divider}`,
        borderRadius: '.5rem',
        height: '5.375rem',
        '&>.MuiGrid-item:not(:last-of-type)': {
            borderRight: `solid 1px ${theme.palette.divider}`,
        },
        '&>.MuiGrid-item': {
            gridGap: '1.1rem',
            '& .MuiGrid-item:nth-child(2) p': {
                fontSize: '1.25rem',
                fontWeight: 600,
            },
        },
    },
    marketDetails: {
        paddingTop: theme.spacing(1),
        paddingBottom: theme.spacing(1),
        maxWidth: '100%',
    },
}))

interface MarketDescriptionProps {
    market: Market
}

export const MarketDescription = (props: MarketDescriptionProps) => {
    const { market } = props
    const classes = useStyles()

    const cleanDescription = getResolutionRules(market).join(' ')
    const [expanded, setExpanded] = useState(cleanDescription.length < POOL_DESCRIPTION_LIMIT)

    return (
        <div className={classes.root}>
            <Grid container direction="row" wrap="nowrap" className={classes.info}>
                <Grid item container direction="column" justifyContent="center">
                    <Grid item>
                        <Typography variant="body2" color="textSecondary" align="center">
                            <Trans i18nKey="plugin_augur_24hr_volume" />
                        </Typography>
                    </Grid>
                    <Grid item>
                        <Typography variant="body2" align="center">
                            $0.00
                        </Typography>
                    </Grid>
                </Grid>
                <Grid item container direction="column" justifyContent="center">
                    <Grid item>
                        <Typography variant="body2" color="textSecondary" align="center">
                            <Trans i18nKey="plugin_augur_total_volume" />
                        </Typography>
                    </Grid>
                    <Grid item>
                        <Typography variant="body2" align="center">
                            $0.00
                        </Typography>
                    </Grid>
                </Grid>
                <Grid item container direction="column" justifyContent="center">
                    <Grid item>
                        <Typography variant="body2" color="textSecondary" align="center">
                            <Trans i18nKey="plugin_augur_liquidity" />
                        </Typography>
                    </Grid>
                    <Grid item>
                        <Typography variant="body2" align="center">
                            $0.00
                        </Typography>
                    </Grid>
                </Grid>
            </Grid>

            {cleanDescription ? (
                <div className={classes.marketDetails}>
                    <Typography variant="h6" color="textPrimary">
                        <Trans i18nKey="plugin_augur_market_details" />
                    </Typography>
                    <Typography variant="subtitle2" color="textSecondary">
                        {/* {getResolutionRules(market).join(' ')} */}
                        <span
                            dangerouslySetInnerHTML={{
                                __html: expanded
                                    ? cleanDescription
                                    : cleanDescription.slice(0, POOL_DESCRIPTION_LIMIT).concat('...'),
                            }}
                        />
                    </Typography>
                    {cleanDescription.length > POOL_DESCRIPTION_LIMIT ? (
                        <Typography
                            variant="body2"
                            color="primary"
                            onClick={() => setExpanded(!expanded)}
                            style={{ cursor: 'pointer' }}>
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
