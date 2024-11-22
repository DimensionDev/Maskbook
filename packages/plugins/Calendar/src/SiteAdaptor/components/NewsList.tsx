import { Trans } from '@lingui/macro'
import { EmptyStatus, Image, LoadingStatus } from '@masknet/shared'
import { EMPTY_OBJECT } from '@masknet/shared-base'
import { makeStyles } from '@masknet/theme'
import { Link, Typography } from '@mui/material'
import { format } from 'date-fns'
import { useCallback, useEffect, useMemo } from 'react'
import { useNewsList } from '../../hooks/useEventList.js'

const useStyles = makeStyles()((theme) => ({
    container: {
        display: 'flex',
        flexDirection: 'column',
        height: '506px',
        width: '100%',
        overflowY: 'scroll',
        position: 'relative',
        gap: '10px',
        scrollbarWidth: 'none',
        '&::-webkit-scrollbar': {
            display: 'none',
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
        '&:hover': {
            textDecoration: 'none',
        },
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
        borderRadius: '50%',
        overflow: 'hidden',
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
    date: Date
    onDatesUpdate(/** locale date string list */ dates: string[]): void
}

export function NewsList({ date, onDatesUpdate }: NewsListProps) {
    const { data: list = EMPTY_OBJECT, isLoading } = useNewsList(date)
    const dateString = date.toLocaleDateString()
    const empty = !Object.keys(list).length
    const { classes, cx } = useStyles()
    const futureNewsList = useMemo(() => {
        const newsList: string[] = []
        for (const key in list) {
            if (new Date(key) >= date) {
                newsList.push(key)
            }
        }
        return newsList
    }, [list, date])

    useEffect(() => {
        onDatesUpdate(Object.keys(list))
    }, [list, onDatesUpdate])

    const listRef = useCallback((el: HTMLDivElement | null) => {
        el?.scrollTo({ top: 0 })
    }, [])

    return (
        <div className={classes.container} ref={listRef} key={dateString}>
            <div className={classes.paddingWrap}>
                {isLoading && empty ?
                    <div className={cx(classes.empty, classes.eventTitle)}>
                        <LoadingStatus />
                    </div>
                : !empty && futureNewsList.length ?
                    futureNewsList.map((key) => {
                        return (
                            <div key={key}>
                                <Typography className={classes.dateDiv}>
                                    {format(new Date(key), 'MMM dd,yyy')}
                                </Typography>
                                {list[key].map((event) => (
                                    <Link
                                        key={event.event_url}
                                        href={event.event_url}
                                        className={classes.eventCard}
                                        rel="noopener noreferrer"
                                        target="_blank">
                                        <div className={classes.eventHeader}>
                                            <div className={classes.projectWrap}>
                                                <Image
                                                    src={event.project?.logo || event.poster_url}
                                                    classes={{ container: classes.logo }}
                                                    size={24}
                                                    alt={event.project?.name || event.event_title}
                                                />
                                                <Typography className={classes.projectName}>
                                                    {event.project?.name || event.event_title}
                                                </Typography>
                                            </div>
                                            <Typography className={classes.eventType}>{event.event_type}</Typography>
                                        </div>
                                        <Typography className={classes.eventTitle}>{event.event_title}</Typography>
                                        <Typography className={classes.eventContent}>
                                            {event.event_description}
                                        </Typography>
                                    </Link>
                                ))}
                            </div>
                        )
                    })
                :   <EmptyStatus className={classes.empty}>
                        <Trans>No content for the last two weeks.</Trans>
                    </EmptyStatus>
                }
            </div>
        </div>
    )
}
