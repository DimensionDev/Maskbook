import { useAccount, useWeb3State } from '@masknet/plugin-infra/web3'
import { openWindow } from '@masknet/shared-base-ui'
import { makeStyles, useStylesExtends } from '@masknet/theme'
import { NetworkPluginID } from '@masknet/web3-shared-base'
import { ChainId } from '@masknet/web3-shared-evm'
import Link from '@mui/material/Link'
import { useNFT } from '../hooks'
import { useWallet } from '../hooks/useWallet'
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
    const account = useAccount()
    const { loading: loadingWallet, value: storage } = useWallet(avatar.userId)
    const { value = { amount: '0', symbol: '', name: '', slug: '' }, loading } = useNFT(
        storage?.address ?? account,
        avatar.address,
        avatar.tokenId,
        avatar.pluginId ?? NetworkPluginID.PLUGIN_EVM,
        avatar.chainId,
    )
    const { Others } = useWeb3State<'all'>(avatar.pluginId ?? NetworkPluginID.PLUGIN_EVM)
    const { amount, symbol, name, slug } = value
    return (
        <div
            className={classes.root}
            onClick={(e) => {
                e.preventDefault()
                openWindow(
                    Others?.explorerResolver.nonFungibleTokenLink(
                        avatar.chainId ?? ChainId.Mainnet,
                        avatar.address,
                        avatar.tokenId,
                    ),
                )
            }}>
            <Link
                href={Others?.explorerResolver.nonFungibleTokenLink(
                    avatar.chainId ?? ChainId.Mainnet,
                    avatar.address,
                    avatar.tokenId,
                )}
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
                        loading || loadingWallet
                            ? 'loading...'
                            : `${formatText(name, avatar.tokenId)} ${slug.toLowerCase() === 'ens' ? 'ENS' : ''}`
                    }
                    price={loading || loadingWallet ? '' : formatPrice(amount, symbol)}
                />
            </Link>
        </div>
    )
}
