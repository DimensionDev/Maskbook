import React, { useMemo } from 'react'
import { makeStyles } from '@masknet/theme'
import { EmptyStatus, LoadingStatus } from '@masknet/shared'
import { useCalendarTrans } from '../../locales/i18n_generated.js'
import { Typography } from '@mui/material'
import format from 'date-fns/format'

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
        borderBottom: `1px solid ${theme.palette.maskColor.line}`,
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
        color: theme.palette.maskColor.main,
    },
    eventContent: {
        fontSize: '13px',
        fontWeight: 400,
        lineHeight: '18px',
        color: theme.palette.maskColor.second,
    },
    eventType: {
        fontSize: '12px',
        fontWeight: 400,
        color: theme.palette.maskColor.main,
        borderRadius: '4px',
        background: theme.palette.maskColor.bg,
        padding: '2px 4px',
        textAlign: 'center',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
    },
    dateDiv: {
        fontSize: '14px',
        fontWeight: 700,
        lineHeight: '18px',
        color: theme.palette.maskColor.main,
        padding: '10px 0',
    },
}))

interface NewsListProps {
    list: Record<string, any[]>
    isLoading: boolean
    empty: boolean
    dateString: string
}

export function NewsList({ list, isLoading, empty, dateString }: NewsListProps) {
    const { classes, cx } = useStyles()
    const t = useCalendarTrans()
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
                    listAfterDate.map((key) => {
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
                                            <Typography className={classes.eventType}>{v.event_type}</Typography>
                                        </div>
                                        <Typography className={classes.eventTitle}>{v.event_title}</Typography>
                                        <Typography className={classes.eventContent}>{v.event_description}</Typography>
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
