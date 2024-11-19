import { Trans } from '@lingui/macro'
import { ElementAnchor, EmptyStatus, Image, LoadingStatus } from '@masknet/shared'
import { EMPTY_LIST } from '@masknet/shared-base'
import { LoadingBase, makeStyles } from '@masknet/theme'
import { resolveIPFS_URL } from '@masknet/web3-shared-base'
import { Link, Typography } from '@mui/material'
import { format } from 'date-fns'
import { uniq } from 'lodash-es'
import { useEffect, useMemo } from 'react'
import { useLumaEvents } from '../../hooks/useLumaEvents.js'
import { ImageLoader } from './ImageLoader.js'

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
        color: theme.palette.maskColor.main,
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
        color: theme.palette.mode === 'dark' ? theme.palette.maskColor.second : theme.palette.maskColor.main,
    },
    time: {
        fontSize: '14px',
        fontWeight: 400,
        lineHeight: '18px',
        color: theme.palette.maskColor.second,
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

interface EventListProps {
    date: Date
    onDatesUpdate(/** locale date string list */ dates: string[]): void
}

export function EventList({ date, onDatesUpdate }: EventListProps) {
    const { classes, cx } = useStyles()
    const { isLoading, isFetching, data, hasNextPage, fetchNextPage } = useLumaEvents()

    const comingEvents = useMemo(() => {
        if (!data) return EMPTY_LIST
        return data.filter((x) => new Date(x.event_date) >= date)
    }, [data, date])

    useEffect(() => {
        if (!data) return onDatesUpdate(EMPTY_LIST)
        onDatesUpdate(uniq(data.map((x) => new Date(x.event_date).toLocaleDateString())))
    }, [onDatesUpdate, data])

    if (isLoading) {
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
    if (!comingEvents.length) {
        return (
            <div className={classes.container}>
                <div className={classes.paddingWrap}>
                    <div className={cx(classes.empty, classes.eventTitle)}>
                        <EmptyStatus>
                            <Trans>No events</Trans>
                        </EmptyStatus>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className={classes.container}>
            <div className={classes.paddingWrap}>
                {comingEvents.map((entry) => {
                    return (
                        <div key={entry.event_id}>
                            <Typography className={classes.dateDiv}>
                                {format(new Date(entry.event_date), 'MMM dd,yyy')}
                            </Typography>
                            <Link
                                className={classes.eventCard}
                                href={entry.event_url}
                                rel="noopener noreferrer"
                                target="_blank">
                                <div className={classes.eventHeader}>
                                    <div className={classes.projectWrap}>
                                        <Image
                                            src={resolveIPFS_URL(entry.poster_url)}
                                            classes={{ container: classes.logo }}
                                            size={24}
                                            alt={entry.event_title}
                                        />
                                        <Typography className={classes.projectName}>{entry.event_title}</Typography>
                                    </div>
                                </div>
                                <Typography className={classes.eventTitle}>{entry.event_title}</Typography>
                                <Typography className={classes.time}>
                                    {format(new Date(date), 'MMM dd, yyyy HH:mm')}
                                </Typography>
                                <ImageLoader src={entry.poster_url} />
                            </Link>
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
