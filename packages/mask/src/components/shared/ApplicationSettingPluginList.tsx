import { useMemo, memo } from 'react'
import { useActivatedPluginsSNSAdaptor, type Plugin, PluginI18NFieldRender } from '@masknet/plugin-infra/content-script'
import type { PluginID } from '@masknet/shared-base'
import { List, ListItem, Typography } from '@mui/material'
import { makeStyles, getMaskColor, ShadowRootTooltip, Boundary, useBoundedPopperProps } from '@masknet/theme'
import { useI18N } from '../../utils/index.js'
import { PersistentStorages } from '../../../shared/index.js'
import { useAsync } from 'react-use'
import { useSubscription } from 'use-subscription'

export interface Application {
    entry: Plugin.SNSAdaptor.ApplicationEntry
    pluginID: PluginID
    enabled?: boolean
    isWalletConnectedRequired?: boolean
}

export function useUnlistedEntries() {
    return useSubscription(PersistentStorages.ApplicationEntryUnListed.storage.list.subscription)
}

async function toggleEntryListing(entryId: string, listing: boolean) {
    const state = PersistentStorages.ApplicationEntryUnListed.storage.list
    if (!state.initialized) await state.initializedPromise
    if (listing) {
        state.setValue(state.value.filter((id) => id !== entryId))
    } else {
        state.setValue([...state.value, entryId])
    }
}

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

/**
 * Migrate from legacy data
 */
function useMigrateData() {
    useAsync(async () => {
        await PersistentStorages.ApplicationEntryUnListedList.storage.current.initializedPromise
        await PersistentStorages.ApplicationEntryUnListed.storage.list.initializedPromise
        const legacyData = PersistentStorages.ApplicationEntryUnListedList.storage.current.value
        const newData = PersistentStorages.ApplicationEntryUnListed.storage.list.value
        const pairs = Array.from(Object.entries(legacyData))
        const unlisted = pairs.filter((x) => x[1])
        if (unlisted.length && !newData.length) {
            const legacyList = unlisted.map((x) => x[0])
            PersistentStorages.ApplicationEntryUnListed.storage.list.setValue(legacyList)
            PersistentStorages.ApplicationEntryUnListedList.storage.current.setValue({})
        }
    }, [])
}

export function ApplicationSettingPluginList() {
    const { classes } = useStyles({ iconFilterColor: undefined })
    const { t } = useI18N()

    useMigrateData()

    const snsAdaptorPlugins = useActivatedPluginsSNSAdaptor('any')
    const applicationList = useMemo(() => {
        return snsAdaptorPlugins
            .flatMap(({ ID, ApplicationEntries: entries }) => {
                if (!entries) return []
                return entries
                    .filter((entry) => entry.appBoardSortingDefaultPriority && !entry.recommendFeature)
                    .map((entry) => ({ entry, pluginID: ID }))
            })
            .sort((a, b) => {
                return (a.entry.appBoardSortingDefaultPriority ?? 0) - (b.entry.appBoardSortingDefaultPriority ?? 0)
            })
    }, [snsAdaptorPlugins])

    const unlisted = useUnlistedEntries()
    const listedEntries = useMemo(() => {
        return applicationList.filter((x) => !unlisted.includes(x.entry.ApplicationEntryID))
    }, [unlisted])
    const unlistedEntries = useMemo(() => {
        return applicationList.filter((x) => unlisted.includes(x.entry.ApplicationEntryID))
    }, [unlisted])

    return (
        <div>
            <Typography className={classes.unlisted}>{t('application_settings_tab_plug_app-list-listed')}</Typography>
            <AppList appList={listedEntries} isListing />
            <Typography className={classes.unlisted}>{t('application_settings_tab_plug_app-list-unlisted')}</Typography>
            <AppList appList={unlistedEntries} isListing={false} />
        </div>
    )
}

interface AppListProps {
    appList: Application[]
    isListing: boolean
}

function AppList({ appList, isListing }: AppListProps) {
    const { classes } = useStyles({ iconFilterColor: undefined })
    const { t } = useI18N()

    return appList.length > 0 ? (
        <Boundary>
            <List className={classes.list}>
                {appList.map((application) => (
                    <AppListItem
                        key={application.entry.ApplicationEntryID}
                        pluginID={application.pluginID}
                        entry={application.entry}
                        isListing={isListing}
                    />
                ))}
            </List>
        </Boundary>
    ) : (
        <div className={classes.placeholderWrapper}>
            <Typography className={classes.placeholder}>
                {isListing
                    ? t('application_settings_tab_plug_app-unlisted-placeholder')
                    : t('application_settings_tab_plug_app-listed-placeholder')}
            </Typography>
        </div>
    )
}

interface AppListItemProps {
    pluginID: string
    entry: Plugin.SNSAdaptor.ApplicationEntry
    isListing: boolean
}

const AppListItem = memo(function AppListItem({ pluginID, entry, isListing }: AppListItemProps) {
    const { classes } = useStyles({ iconFilterColor: entry.iconFilterColor })
    const popperProps = useBoundedPopperProps()

    return (
        <ShadowRootTooltip
            PopperProps={popperProps}
            disableInteractive
            title={
                <Typography>
                    <PluginI18NFieldRender field={entry.name} pluginID={pluginID} />
                </Typography>
            }
            placement="bottom"
            arrow>
            <ListItem
                className={classes.listItem}
                onClick={() => toggleEntryListing(entry.ApplicationEntryID, !isListing)}>
                <div className={classes.iconWrapper}>{entry.icon}</div>
            </ListItem>
        </ShadowRootTooltip>
    )
})
