import React from 'react'
import { EmptyStatus } from '@masknet/shared'
import { useI18N } from '../../locales/i18n_generated.js'
import { CountdownTimer } from './CountDownTimer.js'
import { formatDate } from './EventList.js'
import { makeStyles, LoadingBase } from '@masknet/theme'
import { Typography } from '@mui/material'

const useStyles = makeStyles()((theme) => ({
    container: {
        display: 'flex',
        flexDirection: 'column',
        height: '506px',
        width: '100%',
        overflowY: 'auto',
        position: 'relative',
        gap: '10px',
    },
    empty: {
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%,-50%)',
        display: 'flex',
        alignItems: 'center',
        flexDirection: 'column',
        gap: 12,
        color: theme.palette.maskColor.second,
        whiteSpace: 'nowrap',
    },
    eventCard: {
        display: 'flex',
        padding: '8px 12px',
        flexDirection: 'column',
        gap: '8px',
        fontWeight: 700,
        lineHeight: '16px',
        fontSize: '12px',
        cursor: 'pointer',
    },
    eventHeader: {
        display: 'flex',
        width: '100%',
        justifyContent: 'space-between',
    },
    projectWrap: {
        display: 'flex',
        gap: 8,
        alignItems: 'center',
        color: theme.palette.maskColor.main,
    },
    logo: {
        width: '24px',
        height: '24px',
        borderRadius: '50%',
    },
    eventTitle: {
        fontSize: '14px',
        fontWeight: 400,
        lineHeight: '18px',
        color: theme.palette.maskColor.main,
    },
    second: {
        fontSize: '14px',
        fontWeight: 400,
        lineHeight: '18px',
        color: theme.palette.maskColor.second,
    },
    poster: {
        borderRadius: '8px',
        width: '100%',
        height: '156px',
        objectFit: 'cover',
    },
}))

interface NFTListProps {
    list: any[]
    isLoading: boolean
    empty: boolean
}

export function NFTList({ list, isLoading, empty }: NFTListProps) {
    const { classes, cx } = useStyles()
    const t = useI18N()
    return (
        <div className={classes.container}>
            {isLoading && !list?.length ? (
                <div className={cx(classes.empty, classes.eventTitle)}>
                    <LoadingBase />
                    <Typography>{t.loading()}</Typography>
                </div>
            ) : !empty ? (
                list?.map((v) => {
                    return (
                        <div
                            className={classes.eventCard}
                            key={v.eventTitle}
                            onClick={() => {
                                window.open(v.event_url)
                            }}>
                            <div className={classes.eventHeader}>
                                <div className={classes.projectWrap}>
                                    <img src={v.project.logo} className={classes.logo} alt="logo" />
                                    <Typography> {v.project.name}</Typography>
                                </div>
                            </div>
                            <Typography className={classes.eventTitle}>{v.event_title}</Typography>
                            <div className={classes.eventHeader}>
                                <CountdownTimer targetDate={new Date(Number(v.event_date) * 1000)} />
                            </div>
                            <div className={classes.eventHeader}>
                                <Typography className={classes.second}>{t.total()}</Typography>
                                <Typography className={classes.eventTitle}>{v.ext_info.nft_info.total}</Typography>
                            </div>
                            <div className={classes.eventHeader}>
                                <Typography className={classes.second}>{t.price()}</Typography>
                                <Typography className={classes.eventTitle}>{v.ext_info.nft_info.token}</Typography>
                            </div>
                            <div className={classes.eventHeader}>
                                <Typography className={classes.second}>{t.date()}</Typography>
                                <Typography className={classes.eventTitle}>{formatDate(v.event_date)}</Typography>
                            </div>
                            <img className={classes.poster} src={v.poster_url} alt="poster" />
                        </div>
                    )
                })
            ) : (
                <EmptyStatus className={classes.empty}>{t.empty_status()}</EmptyStatus>
            )}
        </div>
    )
}
