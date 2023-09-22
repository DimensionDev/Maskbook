import React, { useMemo } from 'react'
import { makeStyles } from '@masknet/theme'
import { EmptyStatus, LoadingStatus } from '@masknet/shared'
import format from 'date-fns/format'
import { Typography } from '@mui/material'
import { useI18N } from '../../locales/i18n_generated.js'

const useStyles = makeStyles()((theme) => ({
    container: {
        display: 'flex',
        flexDirection: 'column',
        height: '506px',
        width: '100%',
        overflowY: 'scroll',
        position: 'relative',
        gap: '10px',
        '&::-webkit-scrollbar': {
            width: '4px',
        },
        '&::-webkit-scrollbar-thumb': {
            backgroundColor: theme.palette.maskColor.secondaryLine,
            borderRadius: '99px',
        },
        marginBottom: '50px',
    },
    paddingWrap: {
        paddingRight: '12px',
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
        padding: '8px 0',
        flexDirection: 'column',
        gap: '8px',
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
    projectName: {
        color: theme.palette.maskColor.main,
        fontSize: '12px',
        fontWeight: 700,
        lineHeight: '16px',
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
        color: theme.palette.mode === 'dark' ? theme.palette.maskColor.second : theme.palette.maskColor.main,
    },
    time: {
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
    dateDiv: {
        fontSize: '14px',
        fontWeight: 700,
        lineHeight: '18px',
        color: theme.palette.maskColor.main,
        padding: '10px 0',
    },
}))

interface EventListProps {
    list: Record<string, any[]>
    isLoading: boolean
    empty: boolean
    dateString: string
}

export const formatDate = (date: string) => {
    const dateFormat = 'MMM dd, yyyy HH:mm'
    return format(new Date(date), dateFormat)
}

export function EventList({ list, isLoading, empty, dateString }: EventListProps) {
    const { classes, cx } = useStyles()
    const t = useI18N()
    const listAfterDate = useMemo(() => {
        const listAfterDate: string[] = []
        for (const key in list) {
            if (new Date(key) >= new Date(dateString)) {
                listAfterDate.push(key)
            }
        }
        return listAfterDate
    }, [list, dateString])
    return (
        <div className={classes.container}>
            <div className={classes.paddingWrap}>
                {isLoading && !list?.length ? (
                    <div className={cx(classes.empty, classes.eventTitle)}>
                        <LoadingStatus />
                    </div>
                ) : !empty && listAfterDate.length ? (
                    listAfterDate.map((key, index) => {
                        return (
                            <div key={key}>
                                <Typography className={classes.dateDiv}>
                                    {format(new Date(key), 'MMM dd,yyy')}
                                </Typography>
                                {list[key].map((v) => (
                                    <div
                                        className={classes.eventCard}
                                        key={v.eventTitle}
                                        onClick={() => {
                                            window.open(v.event_url)
                                        }}>
                                        <div className={classes.eventHeader}>
                                            <div className={classes.projectWrap}>
                                                <img src={v.project.logo} className={classes.logo} alt="logo" />
                                                <Typography className={classes.projectName}>
                                                    {v.project.name}
                                                </Typography>
                                            </div>
                                        </div>
                                        <Typography className={classes.eventTitle}>{v.event_title}</Typography>
                                        <Typography className={classes.time}>{formatDate(v.event_date)}</Typography>
                                        <img className={classes.poster} src={v.poster_url} alt="poster" />
                                    </div>
                                ))}
                            </div>
                        )
                    })
                ) : (
                    <EmptyStatus className={classes.empty}>{t.empty_status()}</EmptyStatus>
                )}
            </div>
        </div>
    )
}
