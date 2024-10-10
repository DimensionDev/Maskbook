import { memo, useCallback, useEffect, useMemo, useRef } from 'react'
import { Icons } from '@masknet/icons'
import { PluginTransFieldRender, useActivatedPluginsSiteAdaptor } from '@masknet/plugin-infra/content-script'
import { CrossIsolationMessages, PluginID } from '@masknet/shared-base'
import { openWindow } from '@masknet/shared-base-ui'
import { makeStyles, MaskColorVar } from '@masknet/theme'
import { Avatar, Box, List, ListItem, ListItemAvatar, Stack, Switch, Typography } from '@mui/material'
import { Trans } from '@lingui/macro'

const useStyles = makeStyles()((theme) => ({
    listItem: {
        padding: theme.spacing(1.5),
        borderRadius: 12,
        border: `1px solid ${theme.palette.maskColor.line}`,
        '&:hover': {
            background: theme.palette.maskColor.bg,
        },
        '&:hover .MuiAvatar-root': {
            background: theme.palette.background.paper,
        },
        '&:not(:last-child)': {
            marginBottom: theme.spacing(1.5),
        },
    },
    listContent: {
        display: 'flex',
        flexDirection: 'row',
        flexGrow: 1,
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
            width: '26px !important',
            height: '26px !important',
        },
    },
    placeholder: {
        minWidth: 56,
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

const DSearch_KEY = 'decentralized_search'

interface Props {
    focusPluginID?: PluginID | typeof DSearch_KEY
    setPluginMinimalModeEnabled?: (id: string, checked: boolean) => Promise<void>
}

export const ApplicationSettingPluginSwitch = memo(function ApplicationSettingPluginSwitch({
    focusPluginID,
    setPluginMinimalModeEnabled,
}: Props) {
    const { classes } = useStyles()
    const plugins = useActivatedPluginsSiteAdaptor('any')
    const pluginsInMinimalMode = useActivatedPluginsSiteAdaptor(true)
    const availablePlugins = useMemo(() => {
        return plugins
            .flatMap(({ ID, ApplicationEntries: entries }) => (entries ?? []).map((entry) => ({ entry, pluginID: ID })))
            .filter((x) => x.entry.category === 'dapp' && !x.entry.hiddenInList)
            .sort((a, b) => (a.entry.marketListSortingPriority ?? 0) - (b.entry.marketListSortingPriority ?? 0))
    }, [plugins])

    const targetPluginRef = useRef<HTMLLIElement | null>(undefined)
    const noAvailablePlugins = availablePlugins.length === 0

    useEffect(() => {
        if (!focusPluginID || noAvailablePlugins || !targetPluginRef.current) return
        targetPluginRef.current.scrollIntoView()
    }, [focusPluginID, noAvailablePlugins])

    const onSwitch = useCallback(
        async (id: string, checked: boolean) => {
            if (id === PluginID.GoPlusSecurity && checked === false) {
                CrossIsolationMessages.events.checkSecurityConfirmationDialogEvent.sendToAll({ open: true })
            } else {
                await setPluginMinimalModeEnabled?.(id, !checked)
            }
        },
        [setPluginMinimalModeEnabled],
    )

    return (
        <List>
            <DSearchSettings
                checked={!pluginsInMinimalMode.map((x) => x.ID).includes(PluginID.Handle)}
                onSwitch={(event) => onSwitch(PluginID.Handle, event.target.checked)}
                setRef={(element: HTMLLIElement | null) => {
                    if (DSearch_KEY === focusPluginID) {
                        targetPluginRef.current = element
                    }
                }}
            />
            {availablePlugins.map((x) => (
                <ListItem
                    key={x.entry.ApplicationEntryID}
                    ref={(ele) => {
                        if (x.pluginID === focusPluginID) {
                            targetPluginRef.current = ele
                        }
                    }}
                    className={classes.listItem}>
                    <Stack width="100%">
                        <Stack direction="row" width="100%">
                            <section className={classes.listContent}>
                                <ListItemAvatar>
                                    <Avatar className={classes.avatar}>{x.entry.icon}</Avatar>
                                </ListItemAvatar>
                                <Stack className={classes.info} flex={1}>
                                    <div className={classes.headerWrapper}>
                                        <Typography className={classes.name}>
                                            <PluginTransFieldRender field={x.entry.name} pluginID={x.pluginID} />
                                        </Typography>
                                        {x.entry.tutorialLink ?
                                            <Box className={classes.settings}>
                                                <Icons.Tutorial
                                                    size={22}
                                                    onClick={() => openWindow(x.entry.tutorialLink)}
                                                />
                                            </Box>
                                        :   null}
                                    </div>
                                    <Typography className={classes.desc}>
                                        <PluginTransFieldRender field={x.entry.description} pluginID={x.pluginID} />
                                    </Typography>
                                </Stack>
                            </section>
                            <Stack justifyContent="center">
                                <Switch
                                    checked={!pluginsInMinimalMode.map((x) => x.ID).includes(x.pluginID)}
                                    onChange={(event) => onSwitch(x.pluginID, event.target.checked)}
                                />
                            </Stack>
                        </Stack>
                        {x.entry.features?.length ?
                            <Stack direction="row" mt={1.25}>
                                <Box className={classes.placeholder} />
                                <Stack spacing={1.25}>
                                    {x.entry.features.map((f, i) => (
                                        <Stack key={i}>
                                            <Typography className={classes.name} fontSize={14}>
                                                <PluginTransFieldRender field={f.name} pluginID={x.pluginID} />
                                            </Typography>
                                            <Typography className={classes.desc}>
                                                <PluginTransFieldRender field={f.description} pluginID={x.pluginID} />
                                            </Typography>
                                        </Stack>
                                    ))}
                                </Stack>
                            </Stack>
                        :   null}
                    </Stack>
                </ListItem>
            ))}
        </List>
    )
})

interface DSearchSettingsProps {
    checked: boolean
    onSwitch: (event: React.ChangeEvent<HTMLInputElement>) => void
    setRef(element: HTMLLIElement | null): void
}

function DSearchSettings({ checked, onSwitch, setRef }: DSearchSettingsProps) {
    const { classes } = useStyles()

    return (
        <ListItem key={DSearch_KEY} ref={(ele) => setRef(ele)} className={classes.listItem}>
            <Stack width="100%">
                <Stack direction="row" width="100%">
                    <section className={classes.listContent}>
                        <ListItemAvatar>
                            <Avatar className={classes.avatar}>
                                <Icons.DecentralizedSearch />
                            </Avatar>
                        </ListItemAvatar>
                        <Stack className={classes.info} flex={1}>
                            <div className={classes.headerWrapper}>
                                <Typography className={classes.name}>
                                    <Trans>DSearch</Trans>
                                </Typography>
                            </div>
                            <Typography className={classes.desc}>
                                <Trans>
                                    Optimize search results with token names, NFT collections, ENS domains or wallet
                                    addresses.
                                </Trans>
                            </Typography>
                        </Stack>
                    </section>
                    <Stack justifyContent="center">
                        <Switch checked={checked} onChange={onSwitch} />
                    </Stack>
                </Stack>
                <Stack direction="row" mt={1.25}>
                    <Box className={classes.placeholder} />
                    <Stack spacing={1.25}>
                        <Stack>
                            <Typography className={classes.name} fontSize={14}>
                                <Trans>Token</Trans>
                            </Typography>
                            <Typography className={classes.desc}>
                                <Trans>Get optimized search results when you're looking for a token.</Trans>
                            </Typography>
                        </Stack>
                        <Stack>
                            <Typography className={classes.name} fontSize={14}>
                                <Trans>NFTs</Trans>
                            </Typography>
                            <Typography className={classes.desc}>
                                <Trans>
                                    Search with the name of an NFT collection or its symbol to get optimized results.
                                </Trans>
                            </Typography>
                        </Stack>
                        <Stack>
                            <Typography className={classes.name} fontSize={14}>
                                <Trans>ENS or Wallet Address</Trans>
                            </Typography>
                            <Typography className={classes.desc}>
                                <Trans>Search with an ENS domain or wallet address to get optimized results.</Trans>
                            </Typography>
                        </Stack>
                    </Stack>
                </Stack>
            </Stack>
        </ListItem>
    )
}
