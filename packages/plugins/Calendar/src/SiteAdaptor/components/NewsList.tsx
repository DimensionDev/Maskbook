import React from 'react'
import { makeStyles } from '@masknet/theme'
import { EmptyStatus } from '@masknet/shared'
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
}))

interface NewsListProps {
    list: any[]
}

export function NewsList({ list }: NewsListProps) {
    const { classes } = useStyles()
    const { t } = useI18N()
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
                                <div className={classes.eventType}>{v.event_type}</div>
                            </div>
                            <div className={classes.eventTitle}>{v.event_title}</div>
                            <div className={classes.eventContent}>{v.event_description}</div>
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
