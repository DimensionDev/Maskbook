import { useMemo, useState, useCallback, useRef } from 'react'
import { useActivatedPluginsSNSAdaptor, Plugin, PluginI18NFieldRender } from '@masknet/plugin-infra/content-script'
import type { PluginID } from '@masknet/web3-shared-base'
import { List, ListItem, Typography } from '@mui/material'
import { makeStyles, getMaskColor, ShadowRootTooltip } from '@masknet/theme'
import { useI18N } from '../../utils/index.js'
import { PersistentStorages } from '../../../shared/index.js'

export interface Application {
    entry: Plugin.SNSAdaptor.ApplicationEntry
    pluginID: PluginID
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

const useStyles = makeStyles<{
    iconFilterColor?: string
}>()((theme, { iconFilterColor }) => ({
    list: {
        display: 'grid',
        gap: theme.spacing(1.5),
        gridTemplateColumns: 'repeat(6, 1fr)',
        gridTemplateRows: 'repeat(3, 1fr)',
        width: '100%',
        padding: theme.spacing(2, 0),
        '&::-webkit-scrollbar': {
            display: 'none',
        },
        overflowY: 'scroll',
        height: 210,
    },
    listItem: {
        width: 84,
        height: 56,
        padding: 0,
        background: theme.palette.maskColor.bottom,
        boxShadow: `0px 0px 20px ${
            theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.05)'
        }`,
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
                    .map((entry) => ({ entry, pluginID: ID })),
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
            <Typography className={classes.unlisted}>{t('application_settings_tab_plug_app-list-listed')}</Typography>
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
    const popperBoundaryRef = useRef<HTMLUListElement | null>(null)
    const { t } = useI18N()

    return appList.length > 0 ? (
        <List className={classes.list} ref={popperBoundaryRef}>
            {appList.map((application, index) => (
                <AppListItem
                    key={index}
                    popperBoundary={popperBoundaryRef.current}
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
    popperBoundary: HTMLUListElement | null
    setUnlistedApp: (app: Application, unlisted: boolean) => void
    isListed: boolean
}

function AppListItem(props: AppListItemProps) {
    const { application, setUnlistedApp, isListed, popperBoundary } = props
    const { classes } = useStyles({ iconFilterColor: application.entry.iconFilterColor })
    return (
        <ShadowRootTooltip
            PopperProps={{
                disablePortal: false,
                placement: 'bottom',
                modifiers: [
                    {
                        name: 'flip',
                        options: {
                            boundary: popperBoundary,
                            flipVariations: false,
                        },
                    },
                ],
            }}
            title={
                <Typography>
                    <PluginI18NFieldRender field={application.entry.name} pluginID={application.pluginID} />
                </Typography>
            }
            placement="bottom"
            arrow>
            <ListItem className={classes.listItem} onClick={() => setUnlistedApp(application, isListed)}>
                <div className={classes.iconWrapper}>{application.entry.icon}</div>
            </ListItem>
        </ShadowRootTooltip>
    )
}
