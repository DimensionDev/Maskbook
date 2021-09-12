import { Typography, Grid } from '@material-ui/core'
import { makeStyles } from '@masknet/theme'
import { getSlicePoolId } from '../../utils'
import React, { useState } from 'react'

import { BtcIcon } from '../../constants/assets/global_btcCoin'
import { GasIcon } from '../../constants/assets/global_gasCoin'
import { UsdcIcon } from '../../constants/assets/global_usdc'
import { UsdtIcon } from '../../constants/assets/global_usdt'
import { DaiIcon } from '../../constants/assets/global_DaiCoin'
import { BigNumber } from 'bignumber.js'

import { useValuePerShortToken, useValuePerLongToken } from '../../hooks/usePoolData'
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
        WebkitBackgroundClip: 'text',
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
    const [value, setValue] = useState(0)
    const [colorValue, setColorValue] = useState('69,231,221')

    console.log('props.poolId check :', props.poolId)

    // sponsorValue???
    const poolValue = new BigNumber(useValuePerShortToken(42, props.poolId) ?? '')
        .plus(new BigNumber(useValuePerLongToken(42, props.poolId) ?? ''))
        .plus(new BigNumber(useValuePerLongToken(42, props.poolId) ?? ''))
        .toFixed(0)

    console.log('_poolValue :', poolValue)

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
                        <Typography
                            className={classes.prize}
                            style={{ color: `rgba(${colorValue})` }}
                            variant="body1"
                            fontWeight="fontWeightBold">
                            {poolValue ? poolValue.toString().replace(/(\d)(?=(?:\d{3})+$)/g, '$1,') : '-'}
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

//=> Functions
const countUp = (setter: any, speed: number, value: number) => {
    if (value > 0) {
        let num = 0
        const timer = setInterval(() => {
            const increment = num === 0 ? 25 : num / 5
            num += increment === 0 ? 1 : Math.floor(increment)
            setter(num)
            if (num >= value) {
                clearInterval(timer)
                setter(value)
            }
        }, speed)
    } else setter(value)
}

const colorChange = (setter: any, speed: number, cvalue: string) => {
    const targetr = parseInt(cvalue.split(',')[0], 10),
        targetg = parseInt(cvalue.split(',')[1], 10),
        targetb = parseInt(cvalue.split(',')[2], 10)
    let r = 180,
        g = 144,
        b = 202
    const timer = setInterval(() => {
        const incrementr = r === 180 ? 1 : Math.abs(targetr - r) / 30.0
        const incrementg = g === 144 ? 1 : Math.abs(targetg - g) / 50.0
        const incrementb = b === 202 ? 1 : Math.abs(targetb - b) / 80.0
        if (r > 255) r -= 255
        if (g > 255) g -= 255
        if (b > 255) b -= 255
        r -= r === targetr ? 0 : incrementr
        g += g === targetg ? 0 : incrementg
        b += b === targetb ? 0 : incrementb
        setter(`${r},${g},${b}`)
        if (r === targetr && g === targetg && b === targetb) {
            clearInterval(timer)
            setter(cvalue)
        }
    }, speed)
}
