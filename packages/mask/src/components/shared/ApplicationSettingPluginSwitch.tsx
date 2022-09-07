import { Icons } from '@masknet/icons'
import { PluginI18NFieldRender, PluginId, useActivatedPluginsSNSAdaptor } from '@masknet/plugin-infra/content-script'
import { CrossIsolationMessages } from '@masknet/shared-base'
import { openWindow } from '@masknet/shared-base-ui'
import { makeStyles, MaskColorVar } from '@masknet/theme'
import { Avatar, Box, List, ListItem, ListItemAvatar, Switch, Typography } from '@mui/material'
import { memo, useEffect, useMemo, useRef } from 'react'
import { Services } from '../../extension/service'

const useStyles = makeStyles()((theme) => ({
    listItem: {
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderRadius: 12,
        '&:hover': {
            background: theme.palette.background.default,
        },
        '&:hover .MuiAvatar-root': {
            background: theme.palette.background.paper,
        },
    },
    listContent: {
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
    },
    headerWrapper: {
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
    },
    settings: {
        alignSelf: 'flex-start',
        paddingTop: theme.spacing(0.5),
        marginLeft: theme.spacing(0.5),
        cursor: 'pointer',
        color: MaskColorVar.textSecondary,
        opacity: theme.palette.mode === 'dark' ? 0.5 : 1,
    },
    avatar: {
        background: theme.palette.background.default,
        width: '44px',
        height: '44px',
        '> *': {
            width: 26,
            height: 26,
        },
    },
    info: {
        maxWidth: 420,
    },
    name: {
        fontSize: 14,
        fontWeight: 700,
    },
    desc: {
        fontSize: 12,
        fontWeight: 400,
        color: theme.palette.mode === 'dark' ? theme.palette.text.secondary : theme.palette.text.primary,
    },
}))

interface Props {
    focusPluginId?: PluginId
}
export const ApplicationSettingPluginSwitch = memo(({ focusPluginId }: Props) => {
    const { classes } = useStyles()
    const snsAdaptorPlugins = useActivatedPluginsSNSAdaptor('any')
    const snsAdaptorMinimalPlugins = useActivatedPluginsSNSAdaptor(true)
    const availablePlugins = useMemo(() => {
        return snsAdaptorPlugins
            .flatMap(({ ID, ApplicationEntries: entries }) => (entries ?? []).map((entry) => ({ entry, pluginId: ID })))
            .filter((x) => x.entry.category === 'dapp')
            .sort((a, b) => (a.entry.marketListSortingPriority ?? 0) - (b.entry.marketListSortingPriority ?? 0))
    }, [snsAdaptorPlugins])

    const targetPluginRef = useRef<HTMLLIElement | null>()
    const noAvailablePlugins = availablePlugins.length === 0

    useEffect(() => {
        if (!focusPluginId || noAvailablePlugins || !targetPluginRef.current) return
        targetPluginRef.current.scrollIntoView()
    }, [focusPluginId, noAvailablePlugins])

    async function onSwitch(id: string, checked: boolean) {
        if (id === PluginId.GoPlusSecurity && checked === false)
            return CrossIsolationMessages.events.requestCheckSecurityCloseConfirmDialog.sendToAll({ open: true })
        await Services.Settings.setPluginMinimalModeEnabled(id, !checked)
    }

    return (
        <List>
            {availablePlugins.map((x) => (
                <ListItem
                    key={x.entry.ApplicationEntryID}
                    ref={(ele) => {
                        if (x.pluginId === focusPluginId) {
                            targetPluginRef.current = ele
                        }
                    }}
                    className={classes.listItem}>
                    <section className={classes.listContent}>
                        <ListItemAvatar>
                            <Avatar className={classes.avatar}>{x.entry.icon}</Avatar>
                        </ListItemAvatar>
                        <div className={classes.info}>
                            <div className={classes.headerWrapper}>
                                <Typography className={classes.name}>
                                    <PluginI18NFieldRender field={x.entry.name} pluginID={x.pluginId} />
                                </Typography>
                                {x.entry.tutorialLink ? (
                                    <Box className={classes.settings}>
                                        <Icons.Tutorial size={22} onClick={() => openWindow(x.entry.tutorialLink)} />
                                    </Box>
                                ) : null}
                            </div>
                            <Typography className={classes.desc}>
                                <PluginI18NFieldRender field={x.entry.description} pluginID={x.pluginId} />
                            </Typography>
                        </div>
                    </section>

                    <Switch
                        checked={!snsAdaptorMinimalPlugins.map((x) => x.ID).includes(x.pluginId)}
                        onChange={(event) => onSwitch(x.pluginId, event.target.checked)}
                    />
                </ListItem>
            ))}
        </List>
    )
})
