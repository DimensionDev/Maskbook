/* eslint-disable eqeqeq */
import { Grid, Button } from '@material-ui/core'
import { makeStyles } from '@masknet/theme'
import { BigNumber } from 'bignumber.js'
import { useCallback } from 'react'
import { useChainId, useERC20TokenDetailed } from '@masknet/web3-shared'

import useToggle from 'react-use/lib/useToggle'
import { getSlicePoolId } from '../../utils'

import { InfoIcon } from '../../constants/assets/global_info'
import { DownarrowIcon } from '../../constants/assets/global_downarrow'
import { WaitIcon } from '../../constants/assets/card_wait'
import { useInitialPrice, usePoolStatus } from '../../hooks/usePoolData'
import { useRemoteControlledDialog } from '@masknet/shared'
import { PluginEntropyfiMessages } from '../../messages'

import { CountDown } from './Count_Down'
import { PoolStatus, tokenMap } from '../../constants'

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
    wait: {
        marginTop: theme.spacing(1),
        color: '#777e91',
        fontWeight: 400,
        justifyContent: 'center',
        '& button': {
            fontSize: '13px',
            background: 'rgba(94, 98, 111, 0.19)',
            borderRadius: '30px',
            maxHeight: '30px',
            minHeight: '30px',
            textTransform: 'uppercase',
            pointerEvents: 'none',
            '&:hover': {
                background: 'rgba(94, 98, 111, 0.19)',
            },
            // '& span': {
            //     animation: '$timerRotate 1s infinite !important',
            //     // '& svg': {
            //     //     animation: '$timerRotate 1s infinite important',
            //     // },
            // },
        },
    },
    waitIcon: {
        animation: '$timerRotate 1s infinite!important',
    },
    '@keyframes timerRotate': {
        '0%': {
            transform: 'rotateZ(0deg)',
        },
        '50%': {
            transform: 'rotateZ(90deg)',
        },
        '100%': {
            transform: 'rotateZ(180deg)',
        },
    },
}))

export function CardRight(props: any) {
    const { classes } = useStyles()
    const chainId = useChainId()
    const [coinId, coinName] = getSlicePoolId(props.poolId)
    const [show, toggle] = useToggle(false)
    const InitialPriceNUM = useInitialPrice(chainId, props.poolId)
    const initialPriceTEXT = new BigNumber(InitialPriceNUM || 0).toFormat(0)
    const initialPrice =
        coinId === 'ETH-GAS'
            ? `${InitialPriceNUM ? initialPriceTEXT : '-'}Gwei`
            : `$${InitialPriceNUM ? initialPriceTEXT : '-'}`
    const poolStatus = usePoolStatus(chainId, props.poolId)
    const isLocked = Number(poolStatus) !== PoolStatus.Accepting
    const TOKEN_MAP = tokenMap[chainId][props.poolId]

    //#region pool token
    const {
        value: token,
        loading: loadingToken,
        retry: retryToken,
        error: errorToken,
    } = useERC20TokenDetailed(TOKEN_MAP?.principalToken.address)
    //#endregion

    // console.log(' ************************')
    // console.log(props.poolId, ' token ?: ', token)
    // console.log(props.poolId, ' address ?: ', TOKEN_MAP?.principalToken.address)
    // console.log(props.poolId, ' isLocked?: ', isLocked)
    // console.log(' *************************')

    //#region the deposit dialog
    const { setDialog: openDepositDialog } = useRemoteControlledDialog(PluginEntropyfiMessages.DepositDialogUpdated)
    const onDepositLong = useCallback(() => {
        if (!props.poolId) return
        openDepositDialog({
            open: true,
            poolId: props.poolId,
            choose: 'Long',
            token: token,
            chainId: chainId,
        })
    }, [props.poolId, openDepositDialog])

    const onDepositShort = useCallback(() => {
        if (!props.poolId) return
        openDepositDialog({
            open: true,
            poolId: props.poolId,
            choose: 'Short',
            token: token,
            chainId: chainId,
        })
    }, [props.poolId, openDepositDialog])

    return (
        <Grid item container direction="column" className={classes.metaDeposit}>
            <Grid item className={classes.info}>
                <nav>
                    <InfoIcon onMouseEnter={() => toggle(true)} onMouseLeave={() => toggle(false)} />
                    <span>{isLocked ? 'Result Countdown' : 'Deposit Countdown'}</span>
                </nav>
            </Grid>
            <CountDown poolId={props.poolId} locked={isLocked} show={show} />
            <Grid item container className={classes.cardTips}>
                <TIPS show={show} locked={isLocked} />
            </Grid>
            <Grid item className={classes.countdownNotice} style={{ opacity: show ? 0 : 1 }}>
                Will the {coinId} price be higher than <span>{initialPrice}</span> when the game ends ?
            </Grid>
            {!isLocked ? (
                <Grid item className={classes.deposit} style={{ opacity: show ? 0 : 1 }}>
                    <Button variant="contained" startIcon={<DownarrowIcon />} onClick={onDepositLong}>
                        Long
                    </Button>
                    <Button variant="contained" endIcon={<DownarrowIcon />} onClick={onDepositShort}>
                        Short
                    </Button>
                </Grid>
            ) : (
                <Grid item className={classes.wait} style={{ opacity: show ? 0 : 1 }}>
                    <Button
                        variant="contained"
                        startIcon={<WaitIcon className={classes.waitIcon} />}
                        fullWidth
                        // disableElevation
                        // disableRipple
                    >
                        Waiting to settle
                    </Button>
                </Grid>
            )}
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
