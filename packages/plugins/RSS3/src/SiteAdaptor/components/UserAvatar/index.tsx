import { EthereumBlockie, Image } from '@masknet/shared'
import { makeStyles } from '@masknet/theme'
import { RSS3 } from '@masknet/web3-providers'
import { resolveIPFS_URL } from '@masknet/web3-shared-base'
import { isValidAddress } from '@masknet/web3-shared-evm'
import { useQuery } from '@tanstack/react-query'
import { memo, type HTMLProps } from 'react'

const useStyles = makeStyles<{ size: number }>()((theme, { size }) => ({
    container: {
        display: 'inline-block !important',
        width: size,
        height: size,
        borderRadius: '50%',
        overflow: 'hidden',
    },
    fallbackImage: {
        width: size,
        height: size,
    },
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
    const { data: profile } = useQuery({
        queryKey: ['rss3-profiles', identity],
        queryFn: async () => {
            if (!identity || isValidAddress(identity)) return null
            const profiles = await RSS3.getProfiles(identity)
            if (!profiles.length) return null
            return profiles.find((x) => x.handle === identity)
        },
    })
    const url = profile?.profile_uri?.[0]
    if (!url) {
        return (
            <EthereumBlockie
                address={identity || profile?.address || ''}
                classes={{ icon: classes.blockie }}
                style={rest.style}
            />
        )
    }
    return (
        <Image
            classes={{ container: classes.container, fallbackImage: classes.fallbackImage }}
            src={resolveIPFS_URL(url)}
            width={size}
            height={size}
            {...rest}
            containerProps={{ style: rest.style }}
        />
    )
})
