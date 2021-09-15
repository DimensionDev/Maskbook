import { Grid, Button } from '@material-ui/core'
import { makeStyles } from '@masknet/theme'
import { BigNumber } from 'bignumber.js'
import { useCallback } from 'react'
import { useChainId } from '@masknet/web3-shared'

import useToggle from '../../hooks/useToggle'
import { getSlicePoolId } from '../../utils'
// import { usePoolState } from '../../hooks/usePoolData'

import { InfoIcon } from '../../constants/assets/global_info'
import { DownarrowIcon } from '../../constants/assets/global_downarrow'
import { useInitialPrice, usePoolStatus } from '../../hooks/usePoolData'
import { useRemoteControlledDialog } from '@masknet/shared'
import { PluginEntropyfiMessages } from '../../messages'

import { CountDown } from './Count_Down'

const useStyles = makeStyles()((theme) => ({
    metaDeposit: {
        marginTop: theme.spacing(1),
        padding: theme.spacing(0, 1),
        justifyContent: 'center',
        // alignItems: 'flex-start',
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
        color: '#fff',
        fontWeight: 400,
        textTransform: 'uppercase',
        justifyContent: 'center',
        '& button': {
            background: '#32c682',
            borderRadius: '30px 0 0 30px',
            width: '80px',
            marginRight: '3px',
            maxHeight: '30px',
            minHeight: '30px',
            // fontSize: '10px',
            '&:hover': {
                background: '#29a16a',
                transform: 'scale(0.98)',
            },
            '& svg': {
                width: '15px',
                height: '15px',
                '&:first-of-type': {
                    transform: 'rotate(180deg)',
                },
            },
            '&:last-child': {
                background: '#e66362',
                borderRadius: '0 30px 30px 0',
                '&:hover': {
                    background: '#c15352',
                },
            },
        },
    },
}))

export function CardRight(props: any) {
    const { classes } = useStyles()
    const chainId = useChainId()
    const [coinId, coinName] = getSlicePoolId(props.poolId)
    const [show, toggle] = useToggle(false)
    // const poolState = usePoolState()[42][props.poolId]
    const InitialPriceNUM = useInitialPrice(42, props.poolId)
    const initialPriceTEXT = new BigNumber(InitialPriceNUM || 0).toFormat(0)
    const initialPrice =
        coinId === 'ETH-GAS'
            ? `${InitialPriceNUM ? initialPriceTEXT : '-'}Gwei`
            : `$${InitialPriceNUM ? initialPriceTEXT : '-'}`
    // console.log('initialPrice:', initialPriceTEXT)
    const locked = usePoolStatus(42, props.poolId) ?? 4
    // console.log(props.poolId, 'card right status:', locked)

    // console.log(
    //     'poolAddressMap[chainId][props.poolId]:',
    //     chainId,
    //     ' ',
    //     props.poolId,
    //     ' ',
    //     poolAddressMap[chainId][props.poolId],
    // )

    //#region the deposit dialog
    const { setDialog: openDepositDialog } = useRemoteControlledDialog(PluginEntropyfiMessages.DepositDialogUpdated)
    const onDepositLong = useCallback(() => {
        if (!props.poolId) return
        openDepositDialog({
            open: true,
            poolId: props.poolId,
            choose: 'Long',
        })
    }, [props.poolId, openDepositDialog])

    const onDepositShort = useCallback(() => {
        if (!props.poolId) return
        openDepositDialog({
            open: true,
            poolId: props.poolId,
            choose: 'Short',
        })
    }, [props.poolId, openDepositDialog])

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
            <Grid item className={classes.deposit} style={{ opacity: show ? 0 : 1 }}>
                <Button variant="contained" startIcon={<DownarrowIcon />} onClick={onDepositLong}>
                    Long
                </Button>
                <Button variant="contained" endIcon={<DownarrowIcon />} onClick={onDepositShort}>
                    Short
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
