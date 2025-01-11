import { Trans } from '@lingui/react/macro'
import { Icons } from '@masknet/icons'
import { ElementAnchor, EmptyStatus, Image, LoadingStatus, ReloadStatus } from '@masknet/shared'
import { EMPTY_LIST } from '@masknet/shared-base'
import { LoadingBase, makeStyles } from '@masknet/theme'
import { Link, Typography } from '@mui/material'
import { format } from 'date-fns'
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
        color: theme.palette.maskColor.main,
    },
    info: {
        fontSize: '13px',
        fontWeight: 400,
        lineHeight: '18px',
        color: theme.palette.maskColor.main,
        display: 'flex',
        gap: theme.spacing(1.5),
        alignItems: 'center',
    },
    loading: {
        color: theme.palette.maskColor.main,
    },
}))

interface EventListProps {
    date: Date
}

export function EventList({ date }: EventListProps) {
    const { classes, cx } = useStyles()
    const { isPending, isFetching, data = EMPTY_LIST, error, hasNextPage, fetchNextPage } = useLumaEvents(date)

    if (isPending && !data.length) {
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
    if (!data.length) {
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
                {data.map((event) => {
                    return (
                        <Link
                            key={event.event_id}
                            className={classes.eventCard}
                            href={event.event_url}
                            rel="noopener noreferrer"
                            target="_blank">
                            {event.host_name && event.host_avatar ?
                                <div className={classes.eventHeader}>
                                    <div className={classes.projectWrap}>
                                        <Image
                                            src={event.host_avatar}
                                            classes={{ container: classes.logo }}
                                            size={24}
                                            alt={event.host_name}
                                        />
                                        <Typography className={classes.projectName}>{event.host_name}</Typography>
                                    </div>
                                </div>
                            :   null}
                            <Typography className={classes.eventTitle}>{event.event_title}</Typography>
                            {event.event_full_location ?
                                <Typography className={classes.info}>
                                    <Icons.Location size={18} />
                                    {event.event_full_location}
                                </Typography>
                            :   null}
                            <Typography className={classes.info}>
                                <Icons.LinearCalendar size={18} />
                                {format(event.event_date, 'MMM dd, yyyy HH:mm')}
                            </Typography>
                            <ImageLoader src={event.poster_url} />
                        </Link>
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
