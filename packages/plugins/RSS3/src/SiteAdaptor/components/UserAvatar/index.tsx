import { EthereumBlockie } from '@masknet/shared'
import { makeStyles } from '@masknet/theme'
import { memo, type HTMLProps } from 'react'

const useStyles = makeStyles<{ size: number }>()((theme, { size }) => ({
    blockie: {
        width: size,
        height: size,
        display: 'inline-block !important',
    },
}))

interface Props extends HTMLProps<HTMLImageElement> {
    /** address or handle */
    identity: string | undefined
    size?: number
}
export const UserAvatar = memo(function UserAvatar({ identity, size = 20, ...rest }: Props) {
    const { classes } = useStyles({ size })
    return <EthereumBlockie address={identity || ''} classes={{ icon: classes.blockie }} style={rest.style} />
})
