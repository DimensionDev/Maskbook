import { Typography, Grid } from '@material-ui/core'
import { makeStyles } from '@masknet/theme'
import { NetworkView } from './NetworkView'
import { useI18N } from '../../../utils'
import { TokenIcon } from '@masknet/shared'
import { getSlicePoolId } from '../utils'
import { useChainId } from '@masknet/web3-shared'
// import { usePoolState } from '../hooks/usePoolData'

const useStyles = makeStyles()((theme) => ({
    root: {
        padding: theme.spacing(1, 2),
        alignItems: 'stretch',
        backgroundColor: 'rgba(33, 39, 41, 0.65)',
        margin: theme.spacing(1, 0),
        borderRadius: theme.spacing(1),
        '&:hover': {
            backgroundColor: 'rgba(33, 39, 41, 0.384)',
        },
        fontSize: 14,
        display: 'flex',
        alignContent: 'center',
        justifyContent: 'center',
    },
    icon: {
        width: theme.spacing(4),
        height: theme.spacing(4),
        marginRight: theme.spacing(1),
        backgroundColor: 'transparent',
    },
    button: {
        marginTop: theme.spacing(2),
        marginBottom: theme.spacing(1),
        fontWeight: 500,
    },
    progress: {
        bottom: theme.spacing(1),
        right: theme.spacing(1),
    },
    refresh: {
        bottom: theme.spacing(1),
        right: theme.spacing(1),
        fontSize: 15,
    },
    poolLink: {
        cursor: 'pointer',
        color: 'inherit',
        textDecoration: 'inherit',
        marginRight: theme.spacing(0.5),
        '&:last-child': {
            marginRight: 0,
        },
    },
    networkIcon: {
        width: '1em',
        height: '1em',
        backgroundColor: 'transparent',
        marginRight: theme.spacing(0.5),
    },
    metaTitle: {
        marginBottom: theme.spacing(1),
        justifyContent: 'inherit',
        alignItems: 'center',
    },
    metaFooter: {
        justifyContent: 'inherit',
        alignItems: 'center',
    },
    metaText: {
        marginTop: theme.spacing(1),
        justifyContent: 'inherit',
    },
    metaTextPrize: {
        color: '#55f1d7',
        margin: theme.spacing(0, 1),
        backgroundColor: 'rgba(53, 230, 208, 0.2)',
        borderRadius: theme.spacing(1),
        padding: theme.spacing(0, 0.5),
    },
    metaPrize: {
        marginTop: theme.spacing(1),
        padding: theme.spacing(1),
        borderRadius: theme.spacing(1),
        backgroundColor: 'rgba(49, 65, 70, 0.65)',
        justifyContent: 'center',
        maxWidth: '50%',
    },
    metaDeposit: {
        marginTop: theme.spacing(1),
        padding: theme.spacing(0, 1),
        justifyContent: 'center',
        maxWidth: '50%',
    },
    prize: {
        background:
            'linear-gradient(40deg,#ff9304,#ff04ea 10%,#9b4beb 20%,#0e8dd6 30%,#0bc6df 40%,#07d464 50%,#dfd105 60%,#ff04ab 78%,#8933eb 90%,#3b89ff)',
        '-webkit-background-clip': 'text',
        color: 'transparent',
        animation: '$rainbow_animation 6s linear infinite',
        backgroundSize: '600% 600%',
        fontSize: '1.2rem',
        '@media (min-width:600px)': {
            fontSize: '2rem',
        },
    },
    '@keyframes rainbow_animation': {
        '0%': {
            backgroundPosition: '100% 0%',
        },
        '100%': {
            backgroundPosition: '0 100%',
        },
    },
    countdown: {
        alignSelf: 'center',
        width: '100%',
        display: 'flex',
        justifyContent: 'center',
    },
    deposit: {
        backgroundColor: '#3ef3d4',
        color: '#4c249f',
        marginTop: theme.spacing(0.5),
    },
    info: {
        marginTop: theme.spacing(0.5),
        justifyContent: 'space-between',
    },
    apr: {
        color: '#bdb3d2',
        display: 'flex',
    },
    poolIcon: {
        backgroundColor: 'transparent',
        marginRight: theme.spacing(0.5),
    },
    viewPool: {
        cursor: 'pointer',
        color: '#3ef3d4',
        textDecoration: 'none',
        marginRight: theme.spacing(0.5),
        '&:last-child': {
            marginRight: 0,
        },
        maxHeight: theme.spacing(1),
        '&:hover': {
            color: '#ffffff',
        },
    },
}))

export function PoolView(props: any) {
    const { classes } = useStyles()
    const { t } = useI18N()
    const [coinId, coinName] = getSlicePoolId(props.poolId)
    const chainId = useChainId()

    console.log('props.poolId:', props.poolId)
    console.log('PoolView.chainId:', chainId)

    // const poolValue = new BigNumber(poolState.shortValue)

    return (
        <Grid container direction="row" className={classes.root}>
            <Grid item container direction="column" className={classes.metaPrize}>
                <Grid container item className={classes.metaTitle}>
                    <Grid item>
                        <TokenIcon
                            address="" // how to pass address to get the correct Icon
                            logoURI="https://s2.coinmarketcap.com/static/img/coins/200x200/825.png" // temporay solution
                            classes={{ icon: classes.icon }}
                        />
                    </Grid>
                    <Grid item>
                        <Typography className={classes.prize} variant="h4" fontWeight="fontWeightBold">
                            {/* {poolValue} */}
                            $123456
                        </Typography>
                    </Grid>
                </Grid>
                <Grid container item xs={3} className={classes.metaFooter}>
                    <Grid item className={classes.metaTextPrize}>
                        {/* <Typography fontSize={10} variant="subtitle2">
                            {t('plugin_pooltogether_prize', { period: period })}
                        </Typography> */}
                    </Grid>
                    <Grid item>
                        <NetworkView chainId={chainId} />
                    </Grid>
                </Grid>
            </Grid>
        </Grid>
    )
}
