import { Grid, Typography } from '@material-ui/core'
import { makeStyles } from '@masknet/theme'
import { useValuePerShortToken, useValuePerLongToken } from '../../hooks/usePoolData'
import { BigNumber } from 'bignumber.js'

const useStyles = makeStyles()((theme) => ({
    root: {
        fontSize: '11px',
        lineHeight: '15px',
        fontFamily: '-apple-system,system-ui,sans-serif',
    },
    bar: {
        transform: 'translateY(5px)',
        '& div': {
            height: '8px ',
            borderRadius: '2px',
            // width: '90px !important',
            '&:last-child': {
                marginLeft: '2px',
            },
        },
    },
    viewPoolLink: {
        cursor: 'pointer',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: '8px',
        textDecoration: 'none',
        fontSize: '15px',
        fontWeight: 600,
        color: '#45e7dd',
        '&:hover': {
            color: '#ffffff',
        },
    },
}))

export function CardButtom(props: any) {
    const { classes } = useStyles()

    const longValue = new BigNumber(useValuePerShortToken(42, props.poolId) ?? '')
    const shortValue = new BigNumber(useValuePerLongToken(42, props.poolId) ?? '')

    const _longRatio = new BigNumber(longValue)
        .div(new BigNumber(longValue).plus(new BigNumber(shortValue)))
        .multipliedBy(100)

    const longRatio = _longRatio.isNaN() ? 50 : parseInt(_longRatio.toFixed(0), 10)

    const longWidth = longRatio * 0.01 * 200
    const shortWidth = (1 - longRatio * 0.01) * 200
    const _shortAPY = new BigNumber(longValue)
        .plus(new BigNumber(shortValue))
        // .plus(new BigNumber(sponsorValue))
        .div(new BigNumber(shortValue))
        .toFixed(2)
    const _longAPY = new BigNumber(longValue)
        .plus(new BigNumber(shortValue))
        // .plus(new BigNumber(sponsorValue))
        .div(new BigNumber(longValue))
        .toFixed(2)

    return (
        <Grid item container direction="row" className={classes.root}>
            <Grid item container xs={10} direction="column">
                <Grid item container direction="row">
                    <Grid item xs={1} color="#32c682" paddingRight="10px">
                        <span>LONG</span>
                    </Grid>
                    <Grid item xs={1} color="#32c682" paddingRight="10px">
                        <span>{longRatio}%</span>
                    </Grid>
                    <Grid item xs={6} container direction="row" className={classes.bar}>
                        <div style={{ width: `${longWidth}px`, backgroundColor: '#32c682' }} />
                        <div style={{ width: `${shortWidth}px`, backgroundColor: '#e66362' }} />
                    </Grid>

                    <Grid item xs={1} color="#e66362" paddingLeft="20px">
                        <span>{100 - longRatio}%</span>
                    </Grid>
                    <Grid item xs={1} color="#e66362" paddingLeft="20px">
                        <span>SHORT</span>
                    </Grid>
                </Grid>
                <Grid item container direction="row" color="#FFF" paddingRight="10px">
                    <Grid item xs={1}>
                        <span>{_longAPY !== 'NaN' ? _longAPY : ' - '}x</span>
                    </Grid>
                    <Grid item xs={1} paddingRight="10px">
                        <span>APY</span>
                    </Grid>
                    <Grid item xs={6} marginRight="10px" />
                    <Grid item xs={1} paddingLeft="14px">
                        <span>{_shortAPY !== 'NaN' ? _shortAPY : ' - '}x</span>
                    </Grid>
                    <Grid item xs={1} paddingLeft="24px">
                        <span>APY</span>
                    </Grid>
                </Grid>
            </Grid>
            <Grid item>
                <a
                    className={classes.viewPoolLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    href="https://app.entropyfi.com/#/Prediction">
                    <Typography fontSize="1rem" variant="h6">
                        View pool
                    </Typography>
                </a>
            </Grid>
        </Grid>
    )
}
