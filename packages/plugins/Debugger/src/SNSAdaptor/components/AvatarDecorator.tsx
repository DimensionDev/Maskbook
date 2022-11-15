import { makeStyles } from '@masknet/theme'
import { Web3Helper } from '@masknet/web3-helpers'
import type { SocialAccount, SocialIdentity } from '@masknet/web3-shared-base'

interface AvatarDecoratorProps {
    identity?: SocialIdentity
    persona?: string
    socialAccounts?: SocialAccount<Web3Helper.ChainIdAll>[]
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
export function AvatarDecorator({ identity, persona, socialAccounts }: AvatarDecoratorProps) {
    const { classes } = useStyles()
    return (
        <div
            className={classes.container}
            data-nickname={identity?.nickname ?? 'N/A'}
            data-persona={persona ?? 'N/A'}
            data-address-list={JSON.stringify(socialAccounts)}
        />
    )
}
