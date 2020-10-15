import { noop } from 'lodash-es'
import React, { useState, useCallback, useEffect } from 'react'
import { makeStyles, createStyles, Button, Card, Typography, DialogTitle, IconButton } from '@material-ui/core'
import { useI18N } from '../../../utils/i18n-next-ui'
import { DialogDismissIconUI } from '../../../components/InjectedComponents/DialogDismissIcon'
import Services from '../../../extension/service'
import { useAccount } from '../../../web3/hooks/useAccount'
import { EthereumTokenType } from '../../../web3/types'
import { formatBalance } from '../../Wallet/formatter'
import { TransactionDialog } from '../../../web3/UI/TransactionDialog'
import { LotteryRecord, LotteryStatus } from '../types'
import { BigNumber } from 'bignumber.js'
import type { LotteryJSONPayload } from '../types'
import { PluginMessageCenter } from '../../PluginMessages'
import { usePayloadComputed } from '../hooks/usePayloadComputed'
import { useParticipateCallback } from '../hooks/useParticipateCallback'
import { useDrawCallback } from '../hooks/useDrawCallback'
import { useRefundCallback } from '../hooks/useRefundCallback'
import ShadowRootDialog from '../../../utils/shadow-root/ShadowRootDialog'
import { PortalShadowRoot } from '../../../utils/shadow-root/ShadowRootPortal'

const useStyles = makeStyles((theme) =>
    createStyles({
        card: {
            borderRadius: theme.spacing(1),
            margin: theme.spacing(2, 0),
            padding: theme.spacing(2),
        },
        line: {
            display: 'flex',
            justifyContent: 'space-between',
        },
        status: {
            display: 'flex',
            alignItems: 'center',
        },
        statusLabel: {
            borderRadius: theme.spacing(1),
            padding: theme.spacing(0.2, 1),
            background: 'rgba(0, 0, 0, 0.2)',
            textTransform: 'capitalize',
        },
        btnPanel: {
            width: '50%',
            margin: '0 auto',
            marginTop: '20px',
            display: 'block',
            textAlign: 'center',
        },
        btnlistPanel: {
            display: 'block',
            textAlign: 'center',
        },
        roundbtn: {
            height: '86px',
            width: '86px',
            borderRadius: '50%',
            backgroundColor: 'red',
            color: 'white',
            padding: '5px',
            marginBottom: '10px',
        },
        minbtn: {
            backgroundColor: theme.palette.primary.main,
            color: 'white',
            padding: '5px',
            marginBottom: '10px',
            margin: '5px',
        },
        participator_list_hint: {
            display: 'block',
            fontSize: '10px',
            color: 'gray',
        },
        participator_li: {
            color: 'gray',
            fontSize: '10px',
            padding: '5px',
            listStyle: 'none',
            display: 'inline',
            marginRight: '5px',
            border: '1px solid black',
        },
        participator_ul: {
            paddingLeft: '0px',
        },
        prize_li: {
            listStyle: 'none',
        },
        winnerlist: {
            width: '100%',
            color: 'gray',
            textAlign: 'center',
            border: '1px solid gray',
        },
        winner_title: {
            margin: '15px',
            fontSize: '12px',
        },
        winner_addr: {
            marginBottom: '10px',
        },
        option: {
            position: 'relative',
            display: 'flex',
            justifyContent: 'space-between',
            margin: theme.spacing(1, 0),
            padding: theme.spacing(0, 1),
            height: '28px',
        },
        from: {
            flex: '1',
            color: '#b7b7a4',
        },
        words: {
            color: '#e63946',
            diplay: 'initial',
        },
        title: {
            flex: '1',
        },
        content: {
            display: 'flex',
            flexDirection: 'column',
            flex: 1,
            justifyContent: 'center',
        },
        bar: {
            position: 'absolute',
            top: '0',
            left: '0',
            zIndex: 100,
            backgroundColor: theme.palette.primary.main,
            opacity: 0.6,
            minWidth: theme.spacing(1),
            height: '28px',
            borderRadius: theme.spacing(0.8),
        },
        text: {
            zIndex: 101,
            lineHeight: '28px',
            margin: '0 4px',
        },
        deadline: {
            color: '#657786',
        },
        LinkPointer: {
            cursor: 'pointer',
            color: theme.palette.primary.main,
        },
        dailogPanel: {
            padding: theme.spacing(1),
            margin: theme.spacing(1),
            textAlign: 'left',
        },
        dailogLiItem: {
            listStyle: 'none',
            margin: theme.spacing(1),
            padding: theme.spacing(1),
        },
        header: {
            borderBottom: '1px solid #ccd6dd',
            display: 'flex',
            padding: '10px 15px',
        },
        close: {},
        dialogTitle: {
            textAlign: 'center',
            margin: theme.spacing(1),
        },
    }),
)

interface LotteryCardProps {
    payload?: LotteryJSONPayload
    from?: string
}

export function LotteryCard(props: LotteryCardProps) {
    const { t } = useI18N()
    const { payload, from } = props

    const classes = useStyles()
    const account = useAccount()

    /*
    * TO-DO: use db

    useEffect(() => {
        if (!payload) return noop
        const updateLottery = () => {
            Services.Plugin.invokePlugin('maskbook.lottery', 'addLottery', from ?? '', payload)
        }
        updateLottery()
        console.log('add lottery in DB!')
        return PluginMessageCenter.on('maskbook.lottery.update', updateLottery)
    }, [from, JSON.stringify(payload)])
    */

    const { availability, computed } = usePayloadComputed(account, payload)
    const {
        canFetch,
        canParticipate,
        canDraw,
        canRefund,
        listOfStatus,
        tokenAmount,
        tokenSymbol,
        participator,
        winner,
    } = computed

    const total_token = payload?.total_token
    const total_winner = payload?.total_winner
    const prize_class = payload?.prize_class

    const message = payload?.sender.message
    const sender_name = payload?.sender.name
    const token_type = payload?.token_type

    const if_draw_at_time = payload?.if_draw_at_time
    const draw_at_number = payload?.draw_at_number

    const start_time = payload?.creation_time ?? 0
    const draw_time_ts = 1000 * (payload?.draw_at_time ?? 0)
    const ts = start_time * 1000 + draw_time_ts
    const draw_at_time = new Date(ts).toLocaleString()
    const duration = payload?.duration ?? 0
    const expired_time = new Date(start_time * 1000 + duration * 1000).toLocaleString()

    const token_amount = (origin_token: string | number) => {
        return token_type === EthereumTokenType.Ether
            ? formatBalance(new BigNumber(origin_token), 18, 18)
            : payload?.token
            ? formatBalance(new BigNumber(origin_token), payload?.token.decimals, payload?.token.decimals)
            : '-'
    }

    var prize_li: JSX.Element[] = []
    if (prize_class) {
        prize_li = prize_class.map((pc: (string | number)[], index: number) => (
            <li key={index} className={classes.prize_li}>
                <Typography className={classes.from}>
                    {t('plugin_lottery_prize_class', {
                        index: index + 1,
                        token_number: token_amount(pc[0]),
                        token_symbol: tokenSymbol,
                        winner_number: pc[1],
                    })}
                </Typography>
            </li>
        ))
    }

    const winnerlist = winner
    const produce_winner: { prize?: string; addr: JSX.Element[] }[] = []
    var winner_li: JSX.Element[] = []
    if (winnerlist && prize_class) {
        winnerlist.map((winner: object, index: number) => {
            const prize_id = Object.values(winner)[0]
            const address = Object.values(winner)[1].substr(0, 8)
            const prize = token_amount(prize_class[prize_id][0])

            if (produce_winner[prize_id]) {
                produce_winner[prize_id].addr.push(
                    <li className={classes.participator_li} key={index}>
                        {address}..
                    </li>,
                )
            } else {
                produce_winner[prize_id] = {
                    prize: prize,
                    addr: [
                        <li className={classes.participator_li} key={index}>
                            {address}..
                        </li>,
                    ],
                }
            }
        })
    }
    winner_li = produce_winner.map((w, index) => (
        <ul className={classes.participator_ul}>
            <div key={index} className={classes.winner_title}>
                {' '}
                {t('plugin_lottery_description_prize')}：{w.prize} {tokenSymbol}
            </div>
            <div className={classes.winner_addr}>{w.addr}</div>
        </ul>
    ))

    var participator_li: JSX.Element[] = []
    if (participator) {
        participator_li = participator.slice(0, 5).map((addr: string, index: number) => (
            <li className={classes.participator_li} key={index}>
                {addr.substr(0, 8)}..
            </li>
        ))
    }

    //#region blocking
    const [openParticipateTransactionDialog, setOpenParticipateTransactionDialog] = useState(false)
    const [participateState, participateCallback] = useParticipateCallback(payload?.lyid, payload?.password)
    const [openDrawTransactionDialog, setOpenDrawTransactionDialog] = useState(false)
    const [drawState, drawCallback] = useDrawCallback(payload?.lyid)
    const [openRefundTransactionDialog, setOpenRefundTransactionDialog] = useState(false)
    const [refundState, refundCallback] = useRefundCallback(payload?.lyid)

    //participate click-event
    const onClickParticipate = useCallback(async () => {
        setOpenParticipateTransactionDialog(true)
        if (canParticipate) await participateCallback()
        else console.log('can not participate!!!!')
    }, [canParticipate, participateState, participateCallback])

    const onParticipateTransactionDialogClose = useCallback(() => {
        setOpenParticipateTransactionDialog(false)
    }, [participateState])

    //draw click-event
    const onClickDraw = useCallback(async () => {
        setOpenDrawTransactionDialog(true)
        if (canDraw) await drawCallback()
        else console.log('can not draw!!!!')
    }, [canDraw, drawState, drawCallback])

    const onDrawTransactionDialogClose = useCallback(() => {
        setOpenDrawTransactionDialog(false)
    }, [drawState])

    //refund click-event
    const onClickRefund = useCallback(async () => {
        setOpenRefundTransactionDialog(true)
        if (canRefund) await refundCallback()
        else console.log('can not refund!!!!')
    }, [canRefund, refundState, refundCallback])

    const onRefundTransactionDialogClose = useCallback(() => {
        setOpenRefundTransactionDialog(false)
    }, [refundState])
    //#endregion

    //show-lottery-info click-event
    const showLotteryInfo = () => {
        setShowLottoInfoDialogOpen(true)
    }
    const [isShowLottoInfoDialogOpen, setShowLottoInfoDialogOpen] = useState(false)
    const closeShowLotteryInfo = () => {
        setShowLottoInfoDialogOpen(false)
    }

    //show-whole-participators click-event
    const [isShowPartiDialogOpen, setShowPartiDialogOpen] = useState(false)
    const showAllParticipators = () => {
        setShowPartiDialogOpen(true)
    }
    const closeShowPartiDialog = () => {
        setShowPartiDialogOpen(false)
    }

    return (
        <Card className={classes.card}>
            <Typography className={classes.from}>From: {sender_name}</Typography>
            <Typography className={classes.words} variant="h6">
                {message}
            </Typography>

            {canFetch ? (
                <Typography className={classes.statusLabel}>
                    {(() => {
                        if (canRefund) return t('plugin_lottery_status_can_refund')
                        if (listOfStatus.includes(LotteryStatus.won)) return t('plugin_lottery_status_won')
                        if (
                            listOfStatus.includes(LotteryStatus.notWon) &&
                            listOfStatus.includes(LotteryStatus.participated)
                        )
                            return t('plugin_lottery_status_notwon')
                        if (listOfStatus.includes(LotteryStatus.participated))
                            return t('plugin_lottery_status_participated')
                        if (listOfStatus.includes(LotteryStatus.refunded)) return t('plugin_lottery_status_refunded')
                        if (listOfStatus.includes(LotteryStatus.drew)) return t('plugin_lottery_status_drew')
                        if (listOfStatus.includes(LotteryStatus.expired)) return t('plugin_lottery_status_expired')

                        return t('plugin_lottery_status_ready_to_participate')
                    })()}
                </Typography>
            ) : null}
            {!canFetch && payload?.network ? (
                <Typography className={classes.statusLabel}>
                    {t('plugin_lottery_wrong_network', { network: payload.network })}
                </Typography>
            ) : null}

            {prize_li}
            <Typography className={classes.from}>
                {if_draw_at_time
                    ? t('plugin_lottery_time_to_draw', { time: draw_at_time })
                    : t('plugin_lottery_number_to_draw', { number: draw_at_number })}
            </Typography>
            {!if_draw_at_time && (
                <Typography className={classes.from}>
                    {t('plugin_lottery_time_to_expired', { time: expired_time })}
                </Typography>
            )}
            <div className={classes.btnPanel}>
                {canParticipate && (
                    <Button className={classes.roundbtn} onClick={onClickParticipate}>
                        {t('plugin_lottery_description_participate')}
                    </Button>
                )}
                {canParticipate && (
                    <TransactionDialog
                        state={participateState}
                        summary={`participate Lottery from ${payload?.sender.name}`}
                        open={openParticipateTransactionDialog}
                        onClose={onParticipateTransactionDialogClose}
                    />
                )}
                <div className={classes.participator_list_hint}>
                    {t('plugin_lottery_description_already_x_people_participated', {
                        number: participator?.length ?? 0,
                    })}
                    , &#12288;
                    <a className={classes.LinkPointer} onClick={showAllParticipators}>
                        {t('plugin_lottery_description_check_all_participator')} 》
                    </a>
                </div>
            </div>
            <div className={classes.btnlistPanel}>
                <ul className={classes.participator_ul}>{participator_li}</ul>
            </div>

            <div>
                <hr></hr>
                <div className={classes.btnlistPanel}>
                    <Button disabled={!canDraw} onClick={onClickDraw} className={classes.minbtn}>
                        {t('plugin_lottery_description_drawing')}
                    </Button>
                    <Button onClick={showLotteryInfo} className={classes.minbtn}>
                        {t('plugin_lottery_description_show_all_info')}
                    </Button>
                    <Button disabled={!canRefund} onClick={onClickRefund} className={classes.minbtn}>
                        {t('plugin_lottery_description_refund')}
                    </Button>
                    {canDraw && (
                        <TransactionDialog
                            state={drawState}
                            summary={`draw Lottery from ${payload?.sender.name}`}
                            open={openDrawTransactionDialog}
                            onClose={onDrawTransactionDialogClose}
                        />
                    )}
                    {canRefund && (
                        <TransactionDialog
                            state={refundState}
                            summary={`refund Lottery from ${payload?.sender.name}`}
                            open={openRefundTransactionDialog}
                            onClose={onRefundTransactionDialogClose}
                        />
                    )}
                </div>
            </div>
            {(listOfStatus.includes(LotteryStatus.drew) || listOfStatus.includes(LotteryStatus.refunded)) && (
                <div className={classes.btnlistPanel}>
                    <hr></hr>
                    <div className={classes.btnlistPanel}>
                        <Typography className={classes.title} variant="h6">
                            {t('plugin_lottery_description_list_of_winner')}
                        </Typography>
                    </div>
                    <div className={classes.winnerlist}>{winner_li}</div>
                </div>
            )}
            <ShadowRootDialog open={isShowLottoInfoDialogOpen}>
                <DialogTitle className={classes.header}>
                    <IconButton classes={{ root: classes.close }} onClick={closeShowLotteryInfo}>
                        <DialogDismissIconUI />
                    </IconButton>
                    <Typography className={classes.dialogTitle} display="inline" variant="h6">
                        {t('plugin_lottery_description_lottery_json_info')}
                    </Typography>
                </DialogTitle>
                <div className={classes.dailogPanel}>
                    <pre>
                        {JSON.stringify(
                            payload,
                            (key, value) => {
                                if (key === 'password') return undefined
                                else return value
                            },
                            2,
                        )}
                    </pre>
                </div>
            </ShadowRootDialog>
            <ShadowRootDialog open={isShowPartiDialogOpen}>
                <DialogTitle className={classes.header}>
                    <IconButton classes={{ root: classes.close }} onClick={closeShowPartiDialog}>
                        <DialogDismissIconUI />
                    </IconButton>
                    <Typography className={classes.dialogTitle} display="inline" variant="h6">
                        {t('plugin_lottery_description_list_of_participators')}
                    </Typography>
                </DialogTitle>
                <div className={classes.dailogPanel}>
                    {participator?.map((p: string, index: number) => (
                        <li className={classes.dailogLiItem} key={index}>
                            <a
                                target="new_tab"
                                href={`https://${payload?.network ?? 'mainnet'}.etherscan.io/address/${p}`}>
                                {p}
                            </a>
                        </li>
                    ))}
                </div>
            </ShadowRootDialog>
        </Card>
    )
}
