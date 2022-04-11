import { useActivatedPluginsSNSAdaptor, Plugin } from '@masknet/plugin-infra/content-script'
import { useAsyncRetry } from 'react-use'
import { useLayoutEffect, useState } from 'react'
import { List, ListItem, Typography, CircularProgress } from '@mui/material'
import { makeStyles, getMaskColor } from '@masknet/theme'
import { KeyValue } from '@masknet/web3-providers'
import { useI18N } from '../../utils'

export interface Application {
    entry: Plugin.SNSAdaptor.ApplicationEntry
    pluginId: string
    enabled?: boolean
}

// #region kv storage
export const APPLICATION_ENTRY_SETTING_KEY = 'application_entry_setting'
const storage = KeyValue.createJSON_Storage(APPLICATION_ENTRY_SETTING_KEY)

async function setAppUnlisted(app: Application, unlisted: boolean) {
    await storage.set(app.pluginId + '_' + app.entry.name, { unlisted })
}

export async function getAppUnlisted(app: Application) {
    return storage.get<{ unlisted: boolean }>(app.pluginId + '_' + app.entry.name)
}

export function useUnListedApplicationList(list: Application[]) {
    return useAsyncRetry(async () => {
        const calls = list.map(async (x) => {
            try {
                const result = await getAppUnlisted(x)
                if (result?.unlisted) return { value: x, unlisted: true }
                return { value: x, unlisted: false }
            } catch {
                return { value: x, unlisted: false }
            }
        })
        const results = await Promise.all(calls)
        const unlistedAppList = results.filter((x) => x.unlisted).map((x) => x.value)
        const listedAppList = results.filter((x) => !x.unlisted).map((x) => x.value)
        return { listedAppList, unlistedAppList }
    }, [JSON.stringify(list)])
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

export function ApplicationSettingPluginDragger() {
    const { classes } = useStyles()
    const { t } = useI18N()
    const snsAdaptorPlugins = useActivatedPluginsSNSAdaptor('any')
    const [hasInit, setInit] = useState(false)
    const applicationList = snsAdaptorPlugins
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
        .sort((a, b) => (a.entry.appBoardSortingDefaultPriority ?? 0) - (b.entry.appBoardSortingDefaultPriority ?? 0))
    const { value, retry, loading } = useUnListedApplicationList(applicationList)

    useLayoutEffect(() => {
        if (!loading) setInit(true)
    }, [loading])

    return loading && !hasInit ? (
        <div className={classes.loadingWrapper}>
            <CircularProgress size={24} color="primary" sx={{ marginRight: 1 }} />
        </div>
    ) : (
        <div>
            {value ? (
                <AppList appList={value.listedAppList} retry={retry} setAppUnlisted={setAppUnlisted} isListed />
            ) : null}
            <Typography className={classes.unlisted}>{t('application_settings_tab_plug_app-list-unlisted')}</Typography>
            {value ? (
                <AppList
                    appList={value.unlistedAppList}
                    retry={retry}
                    setAppUnlisted={setAppUnlisted}
                    isListed={false}
                />
            ) : null}
        </div>
    )
}

interface AppListProps {
    appList: Application[]
    retry: () => void
    setAppUnlisted: (app: Application, unlisted: boolean) => Promise<void>
    isListed: boolean
}

function AppList(props: AppListProps) {
    const { appList, retry, setAppUnlisted, isListed } = props
    const { classes } = useStyles()
    const { t } = useI18N()

    return appList.length > 0 ? (
        <List className={classes.list}>
            {appList.map((x, i) => (
                <ListItem
                    key={i + x.pluginId}
                    className={classes.listItem}
                    onClick={async () => {
                        await setAppUnlisted(x, isListed)
                        retry()
                    }}>
                    <div className={classes.iconWrapper}>{x.entry.AppIcon}</div>
                </ListItem>
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
