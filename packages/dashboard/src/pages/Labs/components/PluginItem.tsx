import { SettingsIcon } from '@masknet/icons'
import { MaskColorVar } from '@masknet/theme'
import {
    Avatar,
    Box,
    ListItem,
    ListItemAvatar,
    ListItemText,
    makeStyles,
    experimentalStyled as styled,
    listItemTextClasses,
} from '@material-ui/core'
import { ReactNode, useEffect, useState } from 'react'
import SettingSwitch from '../../Settings/components/SettingSwitch'
import { Twitter, Facebook, Explore } from './Actions'

const useStyles = makeStyles((theme) => ({
    empty: {
        margin: theme.spacing(1),
    },
    root: {
        background: MaskColorVar.secondaryBackground,
        borderRadius: 16,
        width: 355,
        minHeight: 158,
        margin: theme.spacing(1),
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        paddingTop: 0,
    },
    avatar: {
        background: MaskColorVar.primaryBackground,
        width: '44px',
        height: '44px',
    },
    settings: {
        alignSelf: 'flex-start',
        paddingTop: theme.spacing(1),
        cursor: 'pointer',
    },
    actions: {
        display: 'flex',
        justifyContent: 'flex-end',
        alignItems: 'center',
        padding: theme.spacing(2),
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
    name: string
    title: string
    desc: string
    icon?: ReactNode
    onSwitch: (name: string, checked: boolean) => void
    onTwitter?: (name: string) => void
    onFacebook?: (name: string) => void
    onExplore?: (name: string) => void
    onSetting?: (name: string) => void
}

export function PluginItemPlaceHodler() {
    const classes = useStyles()
    return <Box className={classes.empty}></Box>
}

export default function PluginItem(props: PluginItemProps) {
    const { name, title, desc, icon, onSwitch, onTwitter, onFacebook, onExplore, onSetting } = props
    const classes = useStyles()
    const [checked, setChecked] = useState(true)

    useEffect(() => {
        onSwitch(name, checked)
    }, [checked])

    return (
        <Box className={classes.root}>
            <ListItem>
                <ListItemAvatar sx={{ alignSelf: 'flex-start', paddingTop: 1 }}>
                    <Avatar className={classes.avatar}>{icon}</Avatar>
                </ListItemAvatar>
                <TextWrapper primary={title} secondary={desc}></TextWrapper>
                {onSetting ? (
                    <Box className={classes.settings}>
                        <SettingsIcon onClick={() => onSetting(name)} />
                    </Box>
                ) : null}
            </ListItem>
            <Box className={classes.actions}>
                <Box sx={{ flex: 1 }}>
                    {onTwitter ? <Twitter onClick={() => onTwitter(name)} /> : null}
                    {onFacebook ? <Facebook onClick={() => onFacebook(name)} /> : null}
                    {onExplore ? <Explore onClick={() => onExplore(name)} /> : null}
                </Box>
                <SettingSwitch size="small" defaultChecked onChange={(event) => setChecked(event.target.checked)} />
            </Box>
        </Box>
    )
}
