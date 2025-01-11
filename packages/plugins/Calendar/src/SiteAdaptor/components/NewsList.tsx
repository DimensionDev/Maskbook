import { Trans } from '@lingui/react/macro'
import { ElementAnchor, EmptyStatus, Image, LoadingStatus, ReloadStatus } from '@masknet/shared'
import { EMPTY_LIST } from '@masknet/shared-base'
import { LoadingBase, makeStyles } from '@masknet/theme'
import type { ParsedEvent } from '@masknet/web3-providers/types'
import { Link, Typography } from '@mui/material'
import { format } from 'date-fns'
import { useMemo } from 'react'
import { useNewsList } from '../../hooks/useEventList.js'

const useStyles = makeStyles()((theme) => ({
    container: {
        display: 'flex',
        flexDirection: 'column',
        height: '506px',
        width: '100%',
        overflowY: 'scroll',
        position: 'relative',
        overscrollBehavior: 'contain',
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
    loading: {
        color: theme.palette.maskColor.main,
    },
}))

interface NewsListProps {
    date: Date
}

interface Group {
    date: number
    /** 2024/10/10 */
    label: string
    events: ParsedEvent[]
}
export function NewsList({ date }: NewsListProps) {
    const { classes, cx } = useStyles()
    const { isPending, isFetching, data: newsList, error, hasNextPage, fetchNextPage } = useNewsList(date)

    const groups = useMemo(() => {
        if (!newsList?.length) return EMPTY_LIST
        const groups: Group[] = []
        newsList.forEach((event) => {
            const eventDate = new Date(event.event_date)
            const label = format(eventDate, 'MM/dd/yyyy')
            const group: Group = groups.find((g) => g.label === label) || {
                date: event.event_date,
                label,
                events: [],
            }
            if (!group.events.length) groups.push(group)
            group.events.push(event)
        })
        return groups
    }, [newsList, date])

    if (isPending && !groups.length) {
        return (
            <div className={classes.container}>
                <div className={classes.paddingWrap}>
                    <div className={cx(classes.empty, classes.eventTitle)}>
                        <LoadingStatus />
                    </div>
                </div>
            </div>
        )
    }

    if (error) {
        return (
            <div className={classes.container}>
                <div className={classes.paddingWrap}>
                    <div className={cx(classes.empty, classes.eventTitle)}>
                        <ReloadStatus message={error.message}></ReloadStatus>
                    </div>
                </div>
            </div>
        )
    }
    if (!groups.length) {
        return (
            <div className={classes.container}>
                <div className={classes.paddingWrap}>
                    <div className={cx(classes.empty, classes.eventTitle)}>
                        <EmptyStatus>
                            <Trans>No content for the last two weeks.</Trans>
                        </EmptyStatus>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className={classes.container}>
            <div className={classes.paddingWrap}>
                {groups.map((group) => {
                    return (
                        <div key={group.label}>
                            <Typography className={classes.dateDiv}>
                                {format(new Date(group.date), 'MMM dd,yyy')}
                            </Typography>
                            {group.events.map((event) => (
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
                                    <Typography className={classes.eventContent}>{event.event_description}</Typography>
                                </Link>
                            ))}
                        </div>
                    )
                })}
                {hasNextPage ?
                    <ElementAnchor height={30} callback={() => fetchNextPage()}>
                        {isFetching ?
                            <LoadingBase className={classes.loading} />
                        :   null}
                    </ElementAnchor>
                :   <Typography color={(theme) => theme.palette.maskColor.second} textAlign="center" py={2}>
                        <Trans>No more data available.</Trans>
                    </Typography>
                }
            </div>
        </div>
    )
}
