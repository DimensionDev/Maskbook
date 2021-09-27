import { ListItem, ListItemText, ListItemIcon, styled, listItemTextClasses } from '@material-ui/core'
import { MaskColorVar } from '@masknet/theme'

export interface SettingItemProps extends React.PropsWithChildren<{}> {
    title: React.ReactNode | string
    desc?: React.ReactNode
    icon?: React.ReactElement
    error?: boolean
}

const IconWrapper = styled(ListItemIcon)(({ theme }) => ({
    alignItems: 'center',
    justifyContent: 'center',
    width: 64,
    height: 64,
    borderRadius: '50%',
    background: MaskColorVar.infoBackground,
    marginRight: theme.spacing(3),
    color: 'transparent',
}))

const TextWrapper = styled(ListItemText)(({ theme }) => ({
    [`& .${listItemTextClasses.primary}`]: {
        fontWeight: '600',
        paddingBottom: theme.spacing(2),
    },
    [`&.${listItemTextClasses.root}.error .${listItemTextClasses.secondary}`]: {
        color: theme.palette.error.main,
    },
}))

export default function SettingItem(props: SettingItemProps) {
    const { title, desc, icon, error = false } = props
    return (
        <ListItem sx={{ paddingLeft: 0 }}>
            <IconWrapper>{icon}</IconWrapper>
            <TextWrapper primary={title} secondary={desc} className={error ? 'error' : undefined} />
            {props.children}
        </ListItem>
    )
}
