import { useMemo } from 'react'
import classNames from 'classnames'
import { useTheme } from '@mui/material'
import { makeStyles, useStylesExtends } from '@masknet/theme'
import { NETWORK_DESCRIPTORS } from '@masknet/web3-shared-evm'
import { useNetworkDescriptor, useNonFungibleToken, Web3Helper } from '@masknet/plugin-infra/web3'
import { NetworkPluginID, SocialAddress } from '@masknet/web3-shared-base'
import { AssetPlayer } from '../AssetPlayer'
import { useIsImageURL } from '../../../hooks'
import { ImageIcon } from '../ImageIcon'
import { Image } from '../Image'
import { useImageURL } from '../../../hooks/useImageURL'

const useStyles = makeStyles()((theme) => ({
    wrapper: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: 160,
        width: 120,
        overflow: 'hidden',
    },
    loadingPlaceholder: {
        height: 160,
        width: 120,
    },
    loadingIcon: {
        width: 30,
        height: 30,
    },
    imgWrapper: {
        width: '100%',
        height: '100%',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
    },
    networkIcon: {
        position: 'absolute',
        top: 6,
        right: 6,
    },
}))

interface Props extends withClasses<'loadingFailImage' | 'iframe' | 'wrapper' | 'loadingPlaceholder' | 'imgWrapper'> {
    chainId?: Web3Helper.ChainIdAll
    tokenId?: string
    contractAddress?: string
    url?: string
    fallbackImage?: URL
    fallbackResourceLoader?: JSX.Element
    renderOrder?: number
    isImageOnly?: boolean
    setERC721TokenName?: (name: string) => void
    setSourceType?: (type: string) => void
    showNetwork?: boolean
    address?: SocialAddress<NetworkPluginID>
}

const assetPlayerFallbackImageDark = new URL('./nft_token_fallback_dark.png', import.meta.url)
const assetPlayerFallbackImageLight = new URL('./nft_token_fallback.png', import.meta.url)

export function NFTCardStyledAssetPlayer(props: Props) {
    const {
        chainId,
        contractAddress = '',
        tokenId = '',
        isImageOnly: isNative = false,
        fallbackImage,
        fallbackResourceLoader,
        url,
        address,
        setERC721TokenName,
        renderOrder,
        setSourceType,
        showNetwork = false,
    } = props
    const classes = useStylesExtends(useStyles(), props)
    const theme = useTheme()
    const { value: tokenDetailed } = useNonFungibleToken<'all'>(
        NetworkPluginID.PLUGIN_EVM,
        contractAddress,
        url ? undefined : tokenId,
        undefined,
        {
            chainId,
        },
    )
    const urlComputed = useImageURL(url || tokenDetailed?.metadata?.imageURL || tokenDetailed?.metadata?.mediaURL)
    const { value: isImageURL } = useIsImageURL(urlComputed)

    const fallbackImageURL =
        fallbackImage ?? (theme.palette.mode === 'dark' ? assetPlayerFallbackImageDark : assetPlayerFallbackImageLight)

    const networkDescriptor = useNetworkDescriptor(address?.networkSupporterPluginID)

    const networkIcon = useMemo(() => {
        if (address?.networkSupporterPluginID === NetworkPluginID.PLUGIN_EVM) {
            return NETWORK_DESCRIPTORS.find((network) => network?.chainId === chainId)?.icon
        }
        return networkDescriptor?.icon
    }, [networkDescriptor])

    if (isImageURL || isNative) {
        return (
            <div className={classes.imgWrapper}>
                <Image width="100%" height="100%" style={{ objectFit: 'cover' }} src={urlComputed} />
                {showNetwork && <ImageIcon icon={networkIcon} size={20} classes={{ icon: classes.networkIcon }} />}
            </div>
        )
    }

    return (
        <AssetPlayer
            showIframeFromInit
            erc721Token={{
                chainId,
                contractAddress,
                tokenId,
            }}
            url={url}
            options={{
                autoPlay: true,
                controls: false,
                playsInline: true,
            }}
            setERC721TokenName={setERC721TokenName}
            setSourceType={setSourceType}
            // It would fail to render as loading too many(>200) iframe at once.
            renderTimeout={renderOrder ? 20000 * Math.floor(renderOrder / 100) : undefined}
            fallbackImage={fallbackImageURL}
            classes={{
                iframe: classNames(classes.wrapper, classes.iframe),
                errorPlaceholder: classes.wrapper,
                loadingPlaceholder: classes.wrapper,
                loadingFailImage: classes.loadingFailImage,
                loadingIcon: classes.loadingIcon,
                errorIcon: classes.loadingFailImage,
            }}
            showNetwork={showNetwork}
            networkIcon={networkIcon}
            fallbackResourceLoader={fallbackResourceLoader}
        />
    )
}
