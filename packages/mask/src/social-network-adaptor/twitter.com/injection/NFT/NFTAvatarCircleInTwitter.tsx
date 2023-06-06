import { searchTwitterCircleAvatarSelector } from '../../utils/selector.js'
import { makeStyles } from '@masknet/theme'
import { useMemo } from 'react'
import { useCurrentVisitingIdentity } from '../../../../components/DataSource/useActivatedUI.js'
import { NFTBadge, useNFT, useNFTContainerAtTwitter } from '@masknet/plugin-avatar'
import { useLocation, useWindowSize } from 'react-use'
import { useChainContext } from '@masknet/web3-hooks-base'
import { NetworkPluginID } from '@masknet/shared-base'
import { ChainId } from '@masknet/web3-shared-evm'
import { useInjectedCSS } from './useInjectedCSS.js'
import { useUpdatedAvatar } from './useUpdatedAvatar.js'

const useStyles = makeStyles()(() => ({
    root: {
        transform: 'scale(1.022)',
        position: 'absolute',
        textAlign: 'center',
        color: 'white',
        zIndex: 2,
        width: '100%',
        height: '100%',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
    },
    text: {
        fontSize: '20px !important',
        fontWeight: 700,
    },
    icon: {
        width: '19px !important',
        height: '19px !important',
    },
}))

export function NFTCircleAvatarInTwitter() {
    const windowSize = useWindowSize()
    const _location = useLocation()
    const { classes } = useStyles()

    const size = useMemo(() => {
        const ele = searchTwitterCircleAvatarSelector().evaluate()?.querySelector('img')
        if (ele) {
            const style = window.getComputedStyle(ele)
            return Number.parseInt(style.width.replace('px', '') ?? 0, 10)
        }
        return 0
    }, [windowSize, _location])

    const { showAvatar, nftInfo, nftAvatar } = useCircleAvatarFromTwitter(size)

    useInjectedCSS(showAvatar, true)
    useUpdatedAvatar(showAvatar, nftAvatar)

    if (!showAvatar) return null
    return (
        <NFTBadge
            nftInfo={nftInfo}
            borderSize={5}
            hasRainbow
            size={size}
            width={15}
            classes={{ root: classes.root, text: classes.text, icon: classes.icon }}
        />
    )
}

function useCircleAvatarFromTwitter(size: number) {
    const identity = useCurrentVisitingIdentity()
    const { loading, value: avatarMetadata } = useNFTContainerAtTwitter(identity.identifier?.userId || '')
    const { account } = useChainContext()
    const { value = { amount: '0', symbol: 'ETH', name: '', slug: '', tokenId: '' }, loading: loadingNFT } = useNFT(
        account,
        avatarMetadata?.address,
        avatarMetadata?.token_id,
        NetworkPluginID.PLUGIN_EVM,
        ChainId.Mainnet,
    )

    return {
        showAvatar: Boolean(
            size && value && !loading && !loadingNFT && avatarMetadata?.address && avatarMetadata.token_id,
        ),
        nftInfo: value,
        nftAvatar: undefined,
    }
}
