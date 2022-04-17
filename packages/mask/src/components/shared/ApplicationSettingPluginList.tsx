import { useActivatedPluginsSNSAdaptor, Plugin } from '@masknet/plugin-infra/content-script'
import { Fragment, useMemo, useEffect, useState } from 'react'
import { List, ListItem, Typography } from '@mui/material'
import { makeStyles, getMaskColor } from '@masknet/theme'
import { useI18N } from '../../utils'
import { PersistentStorages, MaskMessages, ApplicationEntryUnlistedListKey } from '../../../shared'

export interface Application {
    entry: Plugin.SNSAdaptor.ApplicationEntry
    pluginId: string
    enabled?: boolean
}

// #region kv storage
export function setUnlistedApp(app: Application, unlisted: boolean) {
    PersistentStorages.ApplicationEntryUnListedList.storage[app.entry.ID].setValue(unlisted)
}

export function getUnlistedApp(app: Application): boolean {
    return PersistentStorages.ApplicationEntryUnListedList.storage[app.entry.ID].value
}
// #endregion

const useStyles = makeStyles()((theme) => ({
    list: {
        display: 'grid',
        gap: theme.spacing(2, 1),
        gridTemplateColumns: 'repeat(6, 1fr)',
        gridTemplateRows: 'repeat(3, 1fr)',
        width: '100%',
        padding: '8px 16px 0px 0px',
        overflowY: 'scroll',
        height: 238,
    },
    listItem: {
        width: 84,
        height: 56,
        padding: 0,
        background: theme.palette.background.default,
        justifyContent: 'center',
        alignItems: 'center',
        cursor: 'pointer',
        borderRadius: 8,
        position: 'relative',
    },
    iconWrapper: {
        '> *': {
            width: 36,
            height: 36,
        },
    },
    loadingWrapper: {
        display: 'flex',
        height: 400,
        justifyContent: 'center',
        alignItems: 'center',
    },
    unlisted: {
        fontSize: 18,
        fontWeight: 600,
    },
    placeholderWrapper: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: 238,
    },
    placeholder: {
        color: getMaskColor(theme).textLight,
    },
}))

export function ApplicationSettingPluginList() {
    const { classes } = useStyles()
    const { t } = useI18N()
    const snsAdaptorPlugins = useActivatedPluginsSNSAdaptor('any')
    const applicationList = useMemo(
        () =>
            snsAdaptorPlugins
                .reduce<Application[]>((acc, cur) => {
                    if (!cur.ApplicationEntries) return acc
                    return acc.concat(
                        cur.ApplicationEntries.filter((x) => x.appBoardSortingDefaultPriority).map((x) => {
                            return {
                                entry: x,
                                pluginId: cur.ID,
                            }
                        }) ?? [],
                    )
                }, [])
                .sort(
                    (a, b) =>
                        (a.entry.appBoardSortingDefaultPriority ?? 0) - (b.entry.appBoardSortingDefaultPriority ?? 0),
                ),
        [snsAdaptorPlugins],
    )
    const [listedAppList, setListedAppList] = useState(applicationList.filter((x) => !getUnlistedApp(x)))
    const [unlistedAppList, setUnListedAppList] = useState(applicationList.filter((x) => getUnlistedApp(x)))

    useEffect(() => {
        return MaskMessages.events.__kv_backend_persistent__.on((data) => {
            if (data[0].split(':')[0] !== ApplicationEntryUnlistedListKey) return
            setListedAppList(applicationList.filter((x) => !getUnlistedApp(x)))
            setUnListedAppList(applicationList.filter((x) => getUnlistedApp(x)))
        })
    }, [])

    return (
        <div>
            <AppList appList={listedAppList} setUnlistedApp={setUnlistedApp} isListed />
            <Typography className={classes.unlisted}>{t('application_settings_tab_plug_app-list-unlisted')}</Typography>
            <AppList appList={unlistedAppList} setUnlistedApp={setUnlistedApp} isListed={false} />
        </div>
    )
}

interface AppListProps {
    appList: Application[]
    setUnlistedApp: (app: Application, unlisted: boolean) => void
    isListed: boolean
}

function AppList(props: AppListProps) {
    const { appList, setUnlistedApp, isListed } = props
    const { classes } = useStyles()
    const { t } = useI18N()

    return appList.length > 0 ? (
        <List className={classes.list}>
            {appList.map((x, i) => (
                <Fragment key={x.entry.ID}>
                    <AppListItem application={x} setUnlistedApp={setUnlistedApp} isListed={isListed} />
                </Fragment>
            ))}
        </List>
    ) : (
        <div className={classes.placeholderWrapper}>
            <Typography className={classes.placeholder}>
                {isListed
                    ? t('application_settings_tab_plug_app-unlisted-placeholder')
                    : t('application_settings_tab_plug_app-listed-placeholder')}
            </Typography>
        </div>
    )
}

interface AppListItemProps {
    application: Application
    setUnlistedApp: (app: Application, unlisted: boolean) => void
    isListed: boolean
}

function AppListItem(props: AppListItemProps) {
    const { application, setUnlistedApp, isListed } = props
    const { classes } = useStyles()
    return (
        <ListItem className={classes.listItem} onClick={() => setUnlistedApp(application, isListed)}>
            <div className={classes.iconWrapper}>{application.entry.icon}</div>
        </ListItem>
    )
}
