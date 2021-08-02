import { Grid, makeStyles, Typography } from '@material-ui/core'
import { useI18N } from '../../../utils/i18n-next-ui'
import { Trans } from 'react-i18next'
import type { Market } from '../types'
import { getResolutionRules } from '../utils'

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
    marketDetails: {},
}))

interface MarketDescriptionProps {
    market: Market
}

export const MarketDescription = (props: MarketDescriptionProps) => {
    const { market } = props
    const classes = useStyles()
    const { t } = useI18N()

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

            <div className={classes.marketDetails}>
                <Typography variant="h6" color="textPrimary">
                    Market Details
                </Typography>
                <Typography variant="subtitle2" color="textPrimary">
                    {getResolutionRules(market).join(' ')}
                </Typography>
            </div>
        </div>
    )
}
