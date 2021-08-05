import { Grid, Link, makeStyles, Typography } from '@material-ui/core'
import { useI18N } from '../../../utils/i18n-next-ui'
import type { Market } from '../types'

const useStyles = makeStyles((theme) => ({
    meta: {
        paddingTop: theme.spacing(1),
        paddingBottom: theme.spacing(1),
    },

    title: {
        padding: theme.spacing(1, 0),
    },
    text: {
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        display: '-webkit-box',
        '-webkit-line-clamp': '4',
        '-webkit-box-orient': 'vertical',
    },
}))

interface MarketDeckProps {
    market: Market
}

export const MarketViewDeck = (props: MarketDeckProps) => {
    const { market } = props

    const classes = useStyles()
    const { t } = useI18N()

    return (
        <Grid container direction="row" wrap="nowrap" className={classes.meta}>
            <Grid item container direction="column">
                <Grid item className={classes.title}>
                    <Link color="primary" target="_blank" rel="noopener noreferrer" href={market.link}>
                        <Typography variant="h6">{market.title}</Typography>
                        <Typography variant="h6">{market.description}</Typography>
                    </Link>
                </Grid>
                <Grid item className={classes.meta}>
                    <Typography variant="body2" color="textSecondary" className={classes.text}>
                        {market.endDate.toString()}
                    </Typography>
                </Grid>
                {market.hasWinner ? (
                    <Grid item className={classes.meta}>
                        <Typography variant="h6" color="textSecondary" className={classes.text}>
                            {t('plugin_augur_winner')}: {market.outcomes.find((x) => x.isWinner)?.name}{' '}
                            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                                <path
                                    d="M7.67106 7.82555C7.57952 7.72731 7.46911 7.6485 7.34645 7.59385C7.22378 7.53919 7.09136 7.5098 6.95709 7.50743C6.82282 7.50506 6.68945 7.52976 6.56493 7.58006C6.44042 7.63035 6.3273 7.70521 6.23235 7.80017C6.13739 7.89513 6.06253 8.00824 6.01223 8.13276C5.96194 8.25728 5.93724 8.39065 5.93961 8.52492C5.94198 8.65919 5.97137 8.79161 6.02602 8.91427C6.08068 9.03694 6.15948 9.14734 6.25773 9.23889L8.9244 11.9056C9.01706 11.9986 9.12719 12.0724 9.24846 12.1228C9.36973 12.1732 9.49975 12.1991 9.63106 12.1991C9.76238 12.1991 9.8924 12.1732 10.0137 12.1228C10.1349 12.0724 10.2451 11.9986 10.3377 11.9056L18.0245 3.88883C18.2011 3.69926 18.2973 3.44853 18.2927 3.18947C18.2882 2.9304 18.1832 2.68322 18 2.5C17.8168 2.31678 17.5696 2.21183 17.3105 2.20726C17.0515 2.20269 16.8007 2.29886 16.6112 2.4755L9.63106 9.78422L7.67106 7.82555Z"
                                    fill="#2AE7A8"
                                />
                                <path
                                    d="M18 10C18 14.4183 14.4183 18 10 18C5.58172 18 2 14.4183 2 10C2 5.58172 5.58172 2 10 2"
                                    stroke="#2AE7A8"
                                    strokeWidth="2"
                                    strokeMiterlimit="1.5728"
                                    strokeLinecap="round"
                                />
                            </svg>
                        </Typography>
                    </Grid>
                ) : null}
            </Grid>
        </Grid>
    )
}
