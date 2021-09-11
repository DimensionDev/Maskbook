import { Typography, Grid } from '@material-ui/core'
import { makeStyles } from '@masknet/theme'

import { getSlicePoolId } from '../../utils'

import { BtcIcon } from '../../constants/assets/global_btcCoin'
import { GasIcon } from '../../constants/assets/global_gasCoin'
import { UsdcIcon } from '../../constants/assets/global_usdc'
import { UsdtIcon } from '../../constants/assets/global_usdt'
import { DaiIcon } from '../../constants/assets/global_DaiCoin'

const useStyles = makeStyles()((theme) => ({
    metaTitle: {
        marginTop: theme.spacing(2),
        marginBottom: theme.spacing(1),
        justifyContent: 'inherit',
        alignItems: 'center',
    },
    metaFooter: {
        justifyContent: 'start',
        alignItems: 'center',
        marginLeft: theme.spacing(-5),
        marginTop: theme.spacing(-3.5),
    },

    metaPrize: {
        marginTop: theme.spacing(1),
        padding: theme.spacing(1),
        borderRadius: theme.spacing(1),
        // backgroundColor: 'rgba(49, 65, 70, 0.65)',
        justifyContent: 'center',
        maxWidth: '50%',
    },
    icon: {
        backgroundColor: 'transparent',
        position: 'relative',
        zIndex: 10,
        '& svg': {
            width: '1.3em',
            height: '1.3em',
        },
    },
    icon_back: {
        width: theme.spacing(3),
        height: theme.spacing(3),
        backgroundColor: 'transparent',
        marginTop: '-23px',
        marginLeft: '35px',
    },

    prize: {
        background:
            'linear-gradient(40deg,#ff9304,#ff04ea 10%,#9b4beb 20%,#0e8dd6 30%,#0bc6df 40%,#07d464 50%,#dfd105 60%,#ff04ab 78%,#8933eb 90%,#3b89ff)',
        '-webkit-background-clip': 'text',
        color: 'transparent',
        animation: '$rainbow_animation 6s linear infinite',
        backgroundSize: '600% 600%',
        fontSize: '1.1rem',
        '@media (min-width:600px)': {
            fontSize: '1.5rem',
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
}))

export function CardLeft(props: any) {
    const { classes } = useStyles()
    const [coinId, coinName] = getSlicePoolId(props.poolId)
    const iconArr: any = {
        BTC: <BtcIcon />,
        'ETH-GAS': <GasIcon />,

        USDT: <UsdtIcon />,
        USDC: <UsdcIcon />,
        DAI: <DaiIcon />,
    }
    return (
        <Grid item container direction="column" className={classes.metaPrize}>
            <Grid item container xs={2} className={classes.metaFooter}>
                <Grid item justify-content="start">
                    <Grid item className={classes.icon}>
                        {iconArr[coinId]}
                    </Grid>
                    <Grid item className={classes.icon_back}>
                        {iconArr[coinName]}
                    </Grid>
                </Grid>
                <Grid item>
                    <Typography color="#FFF" marginLeft="10px" align="left" variant="subtitle1">
                        {coinId} Weekly
                    </Typography>
                </Grid>
            </Grid>
            <Grid item container wrap="nowrap" className={classes.metaTitle}>
                <Grid item xs={3} marginLeft="-16px">
                    {iconArr[coinName]}
                </Grid>
                <Grid item container>
                    <Grid item>
                        <Typography className={classes.prize} variant="body1" fontWeight="fontWeightBold">
                            {/* {poolValue} */}
                            $55555
                        </Typography>
                    </Grid>
                    <Grid item>
                        <Grid item>
                            <Typography color="#45e7dd" marginLeft="10px" align="left" variant="body2">
                                {coinName}
                            </Typography>
                        </Grid>
                        <Grid item>
                            <Typography color="#B1B5C4" marginLeft="10px" variant="body2">
                                {' in Pool '}
                            </Typography>
                        </Grid>
                    </Grid>
                </Grid>
            </Grid>
        </Grid>
    )
}
