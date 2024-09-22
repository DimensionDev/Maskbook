import { EmptyStatus, Image, LoadingStatus } from '@masknet/shared'
import { makeStyles } from '@masknet/theme'
import { resolveIPFS_URL } from '@masknet/web3-shared-base'
import { Link, Typography } from '@mui/material'
import { format } from 'date-fns'
import { useCallback, useMemo } from 'react'
import { ImageLoader } from './ImageLoader.js'
import { Trans } from '@lingui/macro'

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
    const futureEvents = useMemo(() => {
        const listAfterDate: string[] = []
        for (const key in list) {
            if (new Date(key) >= new Date(dateString)) {
                listAfterDate.push(key)
            }
        }
        return listAfterDate
    }, [list, dateString])

    const listRef = useCallback((el: HTMLDivElement | null) => {
        el?.scrollTo({ top: 0 })
    }, [])

    return (
        <div className={classes.container} ref={listRef} key={dateString}>
            <div className={classes.paddingWrap}>
                {isLoading && !list?.length ?
                    <div className={cx(classes.empty, classes.eventTitle)}>
                        <LoadingStatus />
                    </div>
                : !empty && futureEvents.length ?
                    futureEvents.map((key) => {
                        return (
                            <div key={key}>
                                <Typography className={classes.dateDiv}>
                                    {format(new Date(key), 'MMM dd,yyy')}
                                </Typography>
                                {list[key].map((v) => (
                                    <Link
                                        key={v.event_url}
                                        className={classes.eventCard}
                                        href={v.event_url}
                                        rel="noopener noreferrer"
                                        target="_blank">
                                        <div className={classes.eventHeader}>
                                            <div className={classes.projectWrap}>
                                                <Image
                                                    src={resolveIPFS_URL(v.project.logo)}
                                                    classes={{ container: classes.logo }}
                                                    size={24}
                                                    alt={v.project.name}
                                                />
                                                <Typography className={classes.projectName}>
                                                    {v.project.name}
                                                </Typography>
                                            </div>
                                        </div>
                                        <Typography className={classes.eventTitle}>{v.event_title}</Typography>
                                        <Typography className={classes.time}>{formatDate(v.event_date)}</Typography>
                                        <ImageLoader src={v.poster_url} />
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
