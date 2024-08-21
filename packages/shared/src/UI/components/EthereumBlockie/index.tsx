import { generateBlockie } from '@masknet/web3-hooks-base'
import { Avatar, type AvatarProps } from '@mui/material'
import { makeStyles } from '@masknet/theme'
import { useEffect, useRef, useState } from 'react'
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
    const { classes, cx } = useStyles(undefined, { props })
    const [blockie, setBlockie] = useState('')
    const ref = useRef(null)
    const ob = useIntersection(ref, {})
    useEffect(() => {
        if (ob?.isIntersecting && !blockie) {
            setBlockie(generateBlockie(address))
        }
    }, [ob?.isIntersecting, address, !blockie])

    return (
        <Avatar className={cx(classes.icon)} src={blockie} ref={ref} {...rest}>
            {name?.slice(0, 1).toUpperCase()}
        </Avatar>
    )
}
