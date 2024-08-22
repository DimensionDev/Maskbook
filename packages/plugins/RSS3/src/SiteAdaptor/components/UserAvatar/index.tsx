import { EthereumBlockie, Image } from '@masknet/shared'
import { makeStyles } from '@masknet/theme'
import { RSS3 } from '@masknet/web3-providers'
import { resolveIPFS_URL } from '@masknet/web3-shared-base'
import { useQuery } from '@tanstack/react-query'
import { sortBy } from 'lodash-es'
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
            const profiles = await RSS3.getProfiles(identity)
            if (!profiles.length) return null
            const isNotAddr = !identity?.startsWith('0x')
            const sorted = sortBy(profiles, (profile) => {
                if (isNotAddr) return profile.platform === 'ENS Registrar' ? -1 : 0
                return profile.profile_uri.filter(Boolean).length ? -1 : 0
            })
            return sorted[0]
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
