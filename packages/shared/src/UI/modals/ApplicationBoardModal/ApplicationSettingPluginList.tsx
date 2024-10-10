import { memo, useMemo } from 'react'
import { useSubscription } from 'use-subscription'
import {
    PluginTransFieldRender,
    useActivatedPluginsSiteAdaptor,
    type Plugin,
} from '@masknet/plugin-infra/content-script'
import { PersistentStorages, type PluginID } from '@masknet/shared-base'
import { Boundary, ShadowRootTooltip, getMaskColor, makeStyles, useBoundedPopperProps } from '@masknet/theme'
import { List, ListItemButton, Typography } from '@mui/material'
import { Trans } from '@lingui/macro'

export interface Application {
    entry: Plugin.SiteAdaptor.ApplicationEntry
    pluginID: PluginID
    enabled?: boolean
    isWalletConnectedRequired?: boolean
}

export function useUnlistedEntries() {
    return useSubscription(PersistentStorages.ApplicationEntryUnListed.storage.data.subscription)
}

async function toggleEntryListing(entryId: string, listing: boolean) {
    const state = PersistentStorages.ApplicationEntryUnListed.storage.data
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
        scrollbarWidth: 'none',
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
        borderRadius: 8,
        position: 'relative',
    },
    iconWrapper: {
        '> *': {
            width: 36,
            height: 36,
        },
        ...(iconFilterColor ?
            { filter: `drop-shadow(0px 6px 12px ${iconFilterColor})`, backdropFilter: 'blur(16px)' }
        :   {}),
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

    const plugins = useActivatedPluginsSiteAdaptor('any')
    const applicationList = useMemo(() => {
        return plugins
            .flatMap(({ ID, ApplicationEntries: entries }) => {
                if (!entries) return []
                return entries
                    .filter((entry) => entry.appBoardSortingDefaultPriority && !entry.recommendFeature)
                    .map((entry) => ({ entry, pluginID: ID }))
            })
            .sort((a, b) => {
                return a.entry.appBoardSortingDefaultPriority! - b.entry.appBoardSortingDefaultPriority!
            })
    }, [plugins])

    const unlisted = useUnlistedEntries()
    const listedEntries = useMemo(() => {
        return applicationList.filter((x) => !unlisted.includes(x.entry.ApplicationEntryID))
    }, [unlisted, applicationList])
    const unlistedEntries = useMemo(() => {
        return applicationList.filter((x) => unlisted.includes(x.entry.ApplicationEntryID))
    }, [unlisted, applicationList])

    return (
        <div>
            <Typography className={classes.unlisted}>
                <Trans>Listed</Trans>
            </Typography>
            <AppList appList={listedEntries} isListing />
            <Typography className={classes.unlisted}>
                <Trans>Unlisted</Trans>
            </Typography>
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

    return appList.length > 0 ?
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
        :   <div className={classes.placeholderWrapper}>
                <Typography className={classes.placeholder}>
                    {isListing ?
                        <Trans>Click the application icon to list it on the App board.</Trans>
                    :   <Trans>Click the application icon to hide in the App list.</Trans>}
                </Typography>
            </div>
}

interface AppListItemProps {
    pluginID: string
    entry: Plugin.SiteAdaptor.ApplicationEntry
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
                    <PluginTransFieldRender field={entry.name} pluginID={pluginID} />
                </Typography>
            }
            placement="bottom"
            arrow>
            <ListItemButton
                disableTouchRipple
                className={classes.listItem}
                onClick={() => toggleEntryListing(entry.ApplicationEntryID, !isListing)}>
                <div className={classes.iconWrapper}>{entry.icon}</div>
            </ListItemButton>
        </ShadowRootTooltip>
    )
})
