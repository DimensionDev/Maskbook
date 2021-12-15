import { SettingsIcon, TutorialIcon } from '@masknet/icons'
import { MaskColorVar } from '@masknet/theme'
import { Avatar, Box, ListItem, ListItemAvatar, ListItemText, styled, listItemTextClasses } from '@mui/material'
import { makeStyles } from '@masknet/theme'
import type { ReactNode } from 'react'
import SettingSwitch from '../../Settings/components/SettingSwitch'
import { Twitter, Facebook, Explore } from './Actions'

const useStyles = makeStyles()((theme) => ({
    empty: {
        margin: theme.spacing(1),
    },
    root: {
        background: MaskColorVar.secondaryBackground,
        borderRadius: 16,
        minWidth: 355,
        minHeight: 158,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        paddingTop: 0,
    },
    avatar: {
        background: MaskColorVar.primaryBackground,
        width: '44px',
        height: '44px',
        '> *': {
            width: 28,
            height: 28,
        },
    },
    settings: {
        alignSelf: 'flex-start',
        paddingTop: theme.spacing(1),
        marginLeft: theme.spacing(1),
        cursor: 'pointer',
        color: MaskColorVar.textSecondary,
    },
    actions: {
        display: 'flex',
        justifyContent: 'flex-end',
        alignItems: 'center',
        padding: theme.spacing(1),
    },
}))

const TextWrapper = styled<typeof ListItemText>(ListItemText)(({ theme }) => ({
    [`& .${listItemTextClasses.secondary}`]: {
        paddingTop: theme.spacing(1),
        color: MaskColorVar.textPrimary,
        fontSize: 12,
    },
}))

export interface PluginItemProps {
    id: string
    title: string
    desc: string
    icon?: ReactNode
    enabled?: boolean
    hideSwitch?: boolean
    onSwitch: (id: string, checked: boolean) => void
    onTwitter?: (id: string) => void
    onFacebook?: (id: string) => void
    onExplore?: (id: string) => void
    onSetting?: (id: string) => void
    onTutorial: (id: string) => void
}

export function PluginItemPlaceholder() {
    const { classes } = useStyles()
    return <Box className={classes.empty} />
}

export default function PluginItem(props: PluginItemProps) {
    const {
        id,
        title,
        desc,
        icon,
        enabled,
        hideSwitch,
        onSwitch,
        onTwitter,
        onFacebook,
        onExplore,
        onSetting,
        onTutorial,
    } = props
    const { classes } = useStyles()
    return (
        <Box className={classes.root}>
            <ListItem>
                <ListItemAvatar sx={{ alignSelf: 'flex-start', paddingTop: 1 }}>
                    <Avatar className={classes.avatar}>{icon}</Avatar>
                </ListItemAvatar>
                <TextWrapper primary={title} secondary={desc} />
                <Box className={classes.settings}>
                    <TutorialIcon onClick={() => onTutorial(id)} />
                </Box>
                {onSetting ? (
                    <Box className={classes.settings}>
                        <SettingsIcon onClick={() => onSetting(id)} />
                    </Box>
                ) : null}
            </ListItem>
            <Box className={classes.actions}>
                {enabled ? (
                    <Box sx={{ flex: 1 }}>
                        {onTwitter ? <Twitter onClick={() => onTwitter(id)} /> : null}
                        {onFacebook ? <Facebook onClick={() => onFacebook(id)} /> : null}
                        {onExplore ? <Explore onClick={() => onExplore(id)} /> : null}
                    </Box>
                ) : null}
                {!hideSwitch ? (
                    <SettingSwitch
                        size="small"
                        checked={enabled}
                        onChange={(event) => onSwitch(id, event.target.checked)}
                    />
                ) : null}
            </Box>
        </Box>
    )
}
