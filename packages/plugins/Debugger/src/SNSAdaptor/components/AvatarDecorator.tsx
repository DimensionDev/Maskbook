import type { NetworkPluginID, SocialAddress, SocialIdentity } from '@masknet/web3-shared-base'
import { makeStyles } from '@masknet/theme'

interface AvatarDecoratorProps {
    identity?: SocialIdentity
    persona?: string
    socialAddressList?: Array<SocialAddress<NetworkPluginID>>
}

const useStyles = makeStyles()({
    container: {
        position: 'absolute',
        left: 0,
        top: 0,
        backgroundColor: '#fff',
        zIndex: 10,
        '&:hover': {
            display: 'block',
        },
    },
})
export function AvatarDecorator({ identity, persona, socialAddressList }: AvatarDecoratorProps) {
    const { classes } = useStyles()
    return (
        <div
            className={classes.container}
            data-nickname={identity?.nickname ?? 'N/A'}
            data-persona={persona ?? 'N/A'}
            data-address-list={JSON.stringify(socialAddressList)}
        />
    )
}
