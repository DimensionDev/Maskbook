import { useActivatedPluginsSNSAdaptor, Plugin } from '@masknet/plugin-infra/content-script'
import { useMemo, useState, useCallback } from 'react'
import { List, ListItem, Typography } from '@mui/material'
import { makeStyles, getMaskColor } from '@masknet/theme'
import { useI18N } from '../../utils'
import { PersistentStorages } from '../../../shared'

export interface Application {
    entry: Plugin.SNSAdaptor.ApplicationEntry
    pluginId: string
    enabled?: boolean
    isWalletConnectedRequired?: boolean
    isWalletConnectedEVMRequired?: boolean
}

// #region kv storage
export function setUnlistedApp(app: Application, unlisted: boolean) {
    const state = PersistentStorages.ApplicationEntryUnListedList.storage.current
    if (!state.initialized) return
    PersistentStorages.ApplicationEntryUnListedList.storage.current.setValue({
        ...state.value,
        [app.entry.ApplicationEntryID]: unlisted,
    })
}

export function getUnlistedApp(app: Application): boolean {
    const state = PersistentStorages.ApplicationEntryUnListedList.storage.current
    return state.initialized ? state.value[app.entry.ApplicationEntryID] : true
}
// #endregion

const useStyles = makeStyles<{ iconFilterColor?: string }>()((theme, { iconFilterColor }) => ({
    list: {
        display: 'grid',
        gap: theme.spacing(2, 1),
        gridTemplateColumns: 'repeat(6, 1fr)',
        gridTemplateRows: 'repeat(3, 1fr)',
        width: '100%',
        paddingTop: '8px',
        '&::-webkit-scrollbar': {
            display: 'none',
        },
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
        ...(iconFilterColor
            ? { filter: `drop-shadow(0px 6px 12px ${iconFilterColor})`, backdropFilter: 'blur(16px)' }
            : {}),
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
    const { classes } = useStyles({ iconFilterColor: undefined })
    const { t } = useI18N()
    const snsAdaptorPlugins = useActivatedPluginsSNSAdaptor('any')
    const applicationList = useMemo(() => {
        return snsAdaptorPlugins
            .flatMap(({ ID, ApplicationEntries: entries }) =>
                (entries ?? [])
                    .filter((entry) => entry.appBoardSortingDefaultPriority && !entry.recommendFeature)
                    .map((entry) => ({ entry, pluginId: ID })),
            )
            .sort((a, b) => {
                return (a.entry.appBoardSortingDefaultPriority ?? 0) - (b.entry.appBoardSortingDefaultPriority ?? 0)
            })
    }, [snsAdaptorPlugins])
    const [listedAppList, setListedAppList] = useState(applicationList.filter((x) => !getUnlistedApp(x)))
    const [unlistedAppList, setUnListedAppList] = useState(applicationList.filter((x) => getUnlistedApp(x)))

    const setAppList = useCallback(
        (app: Application, unlisted: boolean) => {
            setUnlistedApp(app, unlisted)
            const removeFromAppList = (appList: Application[]) =>
                appList.filter((x) => x.entry.ApplicationEntryID !== app.entry.ApplicationEntryID)
            const addToAppList = (appList: Application[]) => appList.concat(app)
            setListedAppList(unlisted ? removeFromAppList : addToAppList)
            setUnListedAppList(unlisted ? addToAppList : removeFromAppList)
        },
        [applicationList],
    )

    return (
        <div>
            <AppList appList={listedAppList} setUnlistedApp={setAppList} isListed />
            <Typography className={classes.unlisted}>{t('application_settings_tab_plug_app-list-unlisted')}</Typography>
            <AppList appList={unlistedAppList} setUnlistedApp={setAppList} isListed={false} />
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
    const { classes } = useStyles({ iconFilterColor: undefined })
    const { t } = useI18N()

    return appList.length > 0 ? (
        <List className={classes.list}>
            {appList.map((application, index) => (
                <AppListItem
                    key={index}
                    application={application}
                    setUnlistedApp={setUnlistedApp}
                    isListed={isListed}
                />
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
    const { classes } = useStyles({ iconFilterColor: application.entry.iconFilterColor })
    return (
        <ListItem className={classes.listItem} onClick={() => setUnlistedApp(application, isListed)}>
            <div className={classes.iconWrapper}>{application.entry.icon}</div>
        </ListItem>
    )
}
