import { openWindow } from '@masknet/shared-base-ui'
import { makeStyles, useStylesExtends } from '@masknet/theme'
import { NetworkPluginID } from '@masknet/web3-shared-base'
import { resolveOpenSeaLink } from '@masknet/web3-shared-evm'
import Link from '@mui/material/Link'
import { useNFT } from '../hooks'
import type { AvatarMetaDB } from '../types'
import { formatPrice, formatText } from '../utils'
import { NFTAvatarRing } from './NFTAvatarRing'

const useStyles = makeStyles()((theme) => ({
    root: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
    },
    image: {
        position: 'absolute',
        bottom: 0,
    },
}))

interface NFTBadgeProps extends withClasses<'root' | 'text' | 'icon'> {
    avatar: AvatarMetaDB
    size?: number
    width?: number
    hasRainbow?: boolean
    borderSize?: number
}

export function NFTBadge(props: NFTBadgeProps) {
    const { avatar, size = 140, hasRainbow, borderSize } = props
    const classes = useStylesExtends(useStyles(), props)

    const { value = { amount: '0', symbol: 'ETH', name: '', slug: '' }, loading } = useNFT(
        avatar.address,
        avatar.tokenId,
        avatar.pluginId ?? NetworkPluginID.PLUGIN_EVM,
        avatar.chainId,
    )

    const { amount, symbol, name, slug } = value

    return (
        <div
            className={classes.root}
            onClick={(e) => {
                e.preventDefault()
                openWindow(resolveOpenSeaLink(avatar.address, avatar.tokenId))
            }}>
            <Link
                href={resolveOpenSeaLink(avatar.address, avatar.tokenId, avatar.chainId)}
                target="_blank"
                rel="noopener noreferrer">
                <NFTAvatarRing
                    id="NFTAvatarRing"
                    width={size}
                    strokeWidth={14}
                    stroke="black"
                    hasRainbow={hasRainbow}
                    borderSize={borderSize}
                    fontSize={9}
                    text={
                        loading
                            ? 'loading...'
                            : `${formatText(name, avatar.tokenId)} ${slug.toLowerCase() === 'ens' ? 'ENS' : ''}`
                    }
                    price={loading ? '' : formatPrice(amount, symbol)}
                />
            </Link>
        </div>
    )
}
