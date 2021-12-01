import { useBlockie } from '@masknet/web3-shared-evm'
import { Avatar, AvatarProps } from '@mui/material'
import { makeStyles, useStylesExtends } from '@masknet/theme'

const useStyles = makeStyles()((theme) => ({
    icon: {
        width: 16,
        height: 16,
        backgroundColor: theme.palette.common.white,
        margin: 0,
    },
}))

export interface EthereumBlockieProps extends withClasses<never> {
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
