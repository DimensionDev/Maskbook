import { generateBlockie } from '@masknet/web3-hooks-base'
import { Avatar, type AvatarProps } from '@mui/material'
import { makeStyles } from '@masknet/theme'
import { useRef, useState } from 'react'
import { useIntersection } from 'react-use'

const useStyles = makeStyles()((theme) => ({
    icon: {
        width: 16,
        height: 16,
        backgroundColor: theme.palette.common.white,
        margin: 0,
    },
}))

export interface EthereumBlockieProps extends withClasses<'icon'>, Omit<AvatarProps, 'classes'> {
    name?: string
    address: string
    AvatarProps?: Partial<AvatarProps>
}

export function EthereumBlockie(props: EthereumBlockieProps) {
    const { address, name, ...rest } = props
    const { classes } = useStyles(undefined, { props })
    const [blockie, setBlockie] = useState('')
    const ref = useRef<HTMLElement>(null)
    const ob = useIntersection(ref as any, {})
    if (!blockie && ob?.isIntersecting) {
        setBlockie(generateBlockie(address))
    }

    return (
        <Avatar className={classes.icon} src={blockie} ref={ref as any} {...rest}>
            {name?.slice(0, 1).toUpperCase()}
        </Avatar>
    )
}
