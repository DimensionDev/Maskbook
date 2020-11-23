import { Avatar, AvatarProps, createStyles, makeStyles } from '@material-ui/core'
import { useBlockie } from '../hooks/useBlockie'
import { useStylesExtends } from '../../components/custom-ui-helper'

const useStyles = makeStyles((theme) =>
    createStyles({
        icon: {
            width: 16,
            height: 16,
            backgroundColor: theme.palette.common.white,
            margin: 0,
        },
    }),
)

export interface EthereumBlockieProps extends withClasses<KeysInferFromUseStyles<typeof useStyles>> {
    name?: string
    address: string
    AvatarProps?: Partial<AvatarProps>
}

export function EthereumBlockie(props: EthereumBlockieProps) {
    const { address, name } = props
    const classes = useStylesExtends(useStyles(), props)
    const blockie = useBlockie(address)

    return (
        <Avatar className={classes.icon} src={blockie}>
            {name?.substr(0, 1).toLocaleUpperCase()}
        </Avatar>
    )
}
