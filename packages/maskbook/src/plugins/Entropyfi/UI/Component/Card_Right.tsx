import { Grid, Button } from '@material-ui/core'
import { makeStyles } from '@masknet/theme'
import { BigNumber } from 'bignumber.js'

import useToggle from '../../hooks/useToggle'
import { getSlicePoolId } from '../../utils'
// import { usePoolState } from '../../hooks/usePoolData'

import { InfoIcon } from '../../constants/assets/global_info'
import { useInitialPrice, usePoolStatus } from '../../hooks/usePoolData'

import { CountDown } from './Count_Down'
const useStyles = makeStyles()((theme) => ({
    metaDeposit: {
        marginTop: theme.spacing(1),
        padding: theme.spacing(0, 1),
        justifyContent: 'center',
        // alignItems:'flex-start',
        maxWidth: '50%',
        transform: 'translateY(-15px)',
    },
    info: {
        justifyContent: 'center',
        alignItems: 'flex-start',
        '& nav': {
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            height: '30px',
            backgroundColor: 'rgba(94, 98, 111, 0.19)',
            backdropFilter: 'blur(50px)',
            borderRadius: '0px 0px 13px 13px',
            '& svg': {
                height: '14px',
                width: '12px',
                marginRight: '5px',
                '&:hover': {
                    transform: 'scale(0.92)',
                    '& path': {
                        fill: '#bdbebe',
                    },
                },
            },
            '& span': {
                fontFamily: '-apple-system,system-ui,sans-serif',
                fontStyle: 'normal',
                fontWeight: 600,
                fontSize: '14px',
                lineHeight: '30px',
                textAlign: 'center',
                color: '#fff',
            },
        },
    },

    cardTips: {
        '& div': {
            marginTop: '-70px',
            borderRadius: '25px',
            alignItems: 'center',
            justifyContent: 'center',
            opacity: '0',
            pointerEvents: 'none',
            '& p': {
                color: '#fff',
                fontFamily: '-apple-system,system-ui,sans-serif',
                fontWeight: 400,
                lineHeight: '13px',
                letterSpacing: '1px',
                fontSize: '10px',
                textAlign: 'start',
            },
        },
    },
    countdownNotice: {
        fontFamily: '-apple-system,system-ui,sans-serif',
        fontWeight: 400,
        fontSize: '12px',
        lineHeight: '16px',
        textAlign: 'center',
        color: '#fff',
        '& span': {
            margin: '0 5px',
            fontFamily: '-apple-system,system-ui,sans-serif',
            color: '#45e7dd',
        },
    },
    deposit: {
        marginTop: theme.spacing(1),
        backgroundColor: '#45e7dd',
        color: '#fff',
        fontWeight: 400,
        letterSpacing: '0.5px',
    },
}))

export function CardRight(props: any) {
    const { classes } = useStyles()
    const [coinId, coinName] = getSlicePoolId(props.poolId)
    const [show, toggle] = useToggle(false)
    // const poolState = usePoolState()[42][props.poolId]
    const InitialPriceNUM = useInitialPrice(42, props.poolId)
    const initialPriceTEXT = new BigNumber(InitialPriceNUM || 0).toFormat(0)
    const initialPrice =
        coinId === 'ETH-GAS'
            ? `${InitialPriceNUM ? initialPriceTEXT : '-'}Gwei`
            : `$${InitialPriceNUM ? initialPriceTEXT : '-'}`
    console.log('initialPrice:', initialPriceTEXT)
    const locked = usePoolStatus(42, props.poolId) ?? 4
    console.log(props.poolId, 'card right status:', locked)
    return (
        <Grid item container direction="column" className={classes.metaDeposit}>
            <Grid item className={classes.info}>
                <nav>
                    <InfoIcon onMouseEnter={() => toggle()} onMouseLeave={() => toggle()} />
                    <span>{(locked === 2 ? false : true) ? 'Result Countdown' : 'Deposit Countdown'}</span>
                </nav>
            </Grid>
            <CountDown poolId={props.poolId} show={show} />
            <Grid item container className={classes.cardTips}>
                <TIPS show={show} locked={locked === 2 ? false : true} />
            </Grid>
            <Grid item className={classes.countdownNotice} style={{ opacity: show ? 0 : 1 }}>
                Will the {coinId} price be higher than <span>{initialPrice}</span> when the game ends ?
            </Grid>
            <Grid item style={{ opacity: show ? 0 : 1 }}>
                <Button className={classes.deposit} variant="contained" fullWidth size="small">
                    Deposit
                </Button>
            </Grid>
        </Grid>
    )
}

const TIPS = (props: any) => {
    return (
        <div style={{ opacity: props.show ? 1 : 0 }}>
            <p>
                {props.locked
                    ? 'Game period = 2 days (deposit) + 5 days (interest generation). First one deposit to the game can query the game price. '
                    : 'Protocol will automatically enroll you to the next round, your winning this round will be saved as principal for the next round.'}
            </p>
        </div>
    )
}
