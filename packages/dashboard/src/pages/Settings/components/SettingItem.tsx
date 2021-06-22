import {
    ListItem,
    ListItemText,
    ListItemIcon,
    experimentalStyled as styled,
    listItemTextClasses,
} from '@material-ui/core'
import { MaskColorVar } from '@masknet/theme'

export interface SettingItemProps extends React.PropsWithChildren<{}> {
    title: React.ReactNode | string
    desc?: React.ReactNode
    icon?: React.ReactElement
}

const IconWarpper = styled(ListItemIcon)(({ theme }) => ({
    alignItems: 'center',
    justifyContent: 'center',
    width: 64,
    height: 64,
    borderRadius: '50%',
    background: MaskColorVar.infoBackground,
    marginRight: theme.spacing(3),
    color: MaskColorVar.primary,
}))

const TextWrapper = styled(ListItemText)(({ theme }) => ({
    [`& .${listItemTextClasses.primary}`]: {
        paddingBottom: theme.spacing(2),
    },
}))

export default function SettingItem(props: SettingItemProps) {
    const { title, desc, icon } = props
    return (
        <ListItem sx={{ paddingLeft: 0 }}>
            <IconWarpper>{icon}</IconWarpper>
            <TextWrapper primary={title} secondary={desc} />
            {props.children}
        </ListItem>
    )
}
