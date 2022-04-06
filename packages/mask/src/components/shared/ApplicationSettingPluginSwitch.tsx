import { List, ListItem, ListItemAvatar, Avatar, Typography, Box } from '@mui/material'
import { openWindow } from '@masknet/shared-base-ui'
import { TutorialIcon } from '@masknet/icons'
import { useActivatedPluginsSNSAdaptor, Plugin } from '@masknet/plugin-infra'
import { SettingSwitch } from '@masknet/shared'
import { makeStyles, MaskColorVar } from '@masknet/theme'
import { Services } from '../../extension/service'
interface Props {}
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
    },
}))
export function ApplicationSettingPluginSwitch(props: Props) {
    const { classes } = useStyles()
    const snsAdaptorPlugins = useActivatedPluginsSNSAdaptor('any')
    const snsAdaptorMinimalPlugins = useActivatedPluginsSNSAdaptor(true)

    async function onSwitch(id: string, checked: boolean) {
        await Services.Settings.setPluginMinimalModeEnabled(id, !checked)
    }

    return (
        <List>
            {snsAdaptorPlugins
                .reduce<{ entry: Plugin.SNSAdaptor.ApplicationEntry; pluginId: string }[]>((acc, cur) => {
                    if (!cur.ApplicationEntries) return acc
                    return acc.concat(
                        cur.ApplicationEntries.map((x) => {
                            return {
                                entry: x,
                                pluginId: cur.ID,
                            }
                        }) ?? [],
                    )
                }, [])
                .filter((x) => x.entry.isInDappList)
                .sort((a, b) => (a.entry.marketListSortingPriority ?? 0) - (b.entry.marketListSortingPriority ?? 0))
                .map((x, i) => (
                    <ListItem key={x.pluginId + i} className={classes.listItem}>
                        <section className={classes.listContent}>
                            <ListItemAvatar>
                                <Avatar className={classes.avatar}>{x.entry.AppIcon}</Avatar>
                            </ListItemAvatar>
                            <div className={classes.info}>
                                <div className={classes.headerWrapper}>
                                    <Typography className={classes.name}>{x.entry.name}</Typography>
                                    {x.entry.tutorialLink ? (
                                        <Box className={classes.settings}>
                                            <TutorialIcon onClick={() => openWindow(x.entry.tutorialLink)} />
                                        </Box>
                                    ) : null}
                                </div>
                                <Typography className={classes.desc}>{x.entry.description}</Typography>
                            </div>
                        </section>

                        <SettingSwitch
                            size="small"
                            checked={!snsAdaptorMinimalPlugins.map((x) => x.ID).includes(x.pluginId)}
                            onChange={(event) => onSwitch(x.pluginId, event.target.checked)}
                        />
                    </ListItem>
                ))}
        </List>
    )
}
