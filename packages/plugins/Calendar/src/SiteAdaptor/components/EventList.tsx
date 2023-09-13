import React from 'react'
import { makeStyles } from '@masknet/theme'
import { EmptyStatus } from '@masknet/shared'
import format from 'date-fns/format'
import { Trans } from 'react-i18next'

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
    poster: {
        borderRadius: '8px',
        width: '100%',
        height: '156px',
        objectFit: 'cover',
    },
}))

interface EventListProps {
    list: any[]
}

export const formatDate = (date: string) => {
    const dateFormat = 'MMM dd, yyyy HH:mm:ss'
    return format(new Date(Number(date) * 1000), dateFormat)
}

export function EventList({ list }: EventListProps) {
    const { classes } = useStyles()
    return (
        <div className={classes.container}>
            {list?.length ? (
                list.map((v) => {
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
                                    {v.project.name}
                                </div>
                            </div>
                            <div className={classes.eventTitle}>{v.event_title}</div>
                            <div className={classes.eventTitle}>{formatDate(v.event_date)}</div>
                            <img className={classes.poster} src={v.poster_url} alt="poster" />
                        </div>
                    )
                })
            ) : (
                <EmptyStatus className={classes.empty}>
                    <Trans i18nKey="empty_status" />
                </EmptyStatus>
            )}
        </div>
    )
}
