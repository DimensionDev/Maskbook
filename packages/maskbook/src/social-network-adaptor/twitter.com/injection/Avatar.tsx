import { DOMProxy, LiveSelector, MutationObserverWatcher } from '@dimensiondev/holoflows-kit'
import { NFTAvatarAmountIcon } from '@masknet/icons'
import { makeStyles } from '@masknet/theme'
import { resolveOpenSeaLink } from '@masknet/web3-shared'
import { Link, Typography } from '@material-ui/core'
import { AvatarMetaDB, getNFTAvatar } from '../../../components/InjectedComponents/NFT/NFTAvatar'
import { createReactRootShadowed, Flags, startWatch } from '../../../utils'
import { postAvatarsContentSelector } from '../utils/selector'
import { getAvatarId } from '../utils/user'

const useStyles = makeStyles()({
    root: {
        display: 'flex',
        justifyContent: 'center',
        position: 'absolute',
        left: 0,
        top: 44,
    },
    wrapper: {
        position: 'absolute',
        left: 0,
        top: 10,
        background:
            'linear-gradient(106.15deg, #FF0000 5.97%, #FF8A00 21.54%, #FFC700 42.35%, #52FF00 56.58%, #00FFFF 73.01%, #0038FF 87.8%, #AD00FF 101.49%, #FF0000 110.25%)',
        borderRadius: 3,
        minWidth: 43,
        width: 'auto',
        display: 'flex',
        justifyContent: 'center',
    },
    icon: {
        width: '100%',
        paddingLeft: 10,
    },
    text: {
        fontSize: 10,
        transform: 'scale(0.8)',
        margin: 0,
        color: 'white',
        whiteSpace: 'nowrap',
        textShadow:
            '1px 1px black, 1px 0px black, 0px 1px black, -1px 0px black, 0px -1px black, -1px -1px black, 1px -1px black, -1px 1px black',
        lineHeight: 1,
    },
})

interface NFTBadgeInTwitterProps {
    avatar: AvatarMetaDB
}
function NFTBadgeInTwitter({ avatar }: NFTBadgeInTwitterProps) {
    const { classes } = useStyles()
    return (
        <div
            className={classes.root}
            onClick={(e) => {
                e.preventDefault()
                window.open(resolveOpenSeaLink(avatar.address, avatar.tokenId), '_blank')
            }}>
            <Link
                title={resolveOpenSeaLink(avatar.address, avatar.tokenId)}
                href={resolveOpenSeaLink(avatar.address, avatar.tokenId)}
                target="_blank"
                rel="noopener noreferrer">
                <NFTAvatarAmountIcon className={classes.icon} />
                <div className={classes.wrapper}>
                    <Typography className={classes.text}>{`${avatar.amount} ETH`}</Typography>
                </div>
            </Link>
        </div>
    )
}

function _(main: () => LiveSelector<HTMLElement, false>, signal: AbortSignal) {
    startWatch(
        new MutationObserverWatcher(main()).useForeach((ele, _, meta) => {
            let remover = () => {}
            const remove = () => remover()

            const run = async () => {
                const twitterIdNode = ele.querySelector(
                    'div > :nth-child(2) > :nth-child(2) > div > div > div > div > div > a > div > :last-child',
                ) as HTMLSpanElement
                if (!twitterIdNode) return
                const twitterId = twitterIdNode.innerText.trim().replace('@', '')
                const avatar = await getNFTAvatar(twitterId)
                if (!avatar) return
                const avatarIdNode = ele.querySelector(
                    'div > :nth-child(2) > div > div > div > a > div > :last-child > div > img',
                ) as HTMLImageElement
                if (!avatarIdNode) return
                const avatarId = getAvatarId(avatarIdNode.getAttribute('src') ?? '')
                if (avatarId !== avatar.avatarId) return
                const nftDom = ele.firstChild?.firstChild?.lastChild?.firstChild?.firstChild?.firstChild as HTMLElement
                if (!nftDom) return
                const proxy = DOMProxy({ afterShadowRootInit: { mode: Flags.using_ShadowDOM_attach_mode } })
                proxy.realCurrent = nftDom
                const root = createReactRootShadowed(proxy.afterShadow, { signal })
                root.render(<NFTBadgeInTwitter avatar={avatar} />)
                remover = root.destory
            }

            run()
            return {
                onNodeMutation: run,
                onTargetChanged: run,
                onRemove: remove,
            }
        }),
        signal,
    )
}

export async function injectUserNFTAvatarAtTwitter(signal: AbortSignal) {
    _(postAvatarsContentSelector, signal)
}
