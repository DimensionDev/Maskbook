import { useNetworkDescriptor, useNonFungibleToken } from '@masknet/web3-hooks-base'
import { makeStyles, useStylesExtends } from '@masknet/theme'
import type { Web3Helper } from '@masknet/web3-helpers'
import { NetworkPluginID } from '@masknet/shared-base'
import { NETWORK_DESCRIPTORS } from '@masknet/web3-shared-evm'
import { useTheme } from '@mui/material'
import classNames from 'classnames'
import { useMemo } from 'react'
import { useIsImageURL } from '../../../hooks/index.js'
import { AssetPlayer } from '../AssetPlayer/index.js'
import { Image } from '../Image/index.js'
import { ImageIcon } from '../ImageIcon/index.js'

const useStyles = makeStyles()((theme) => ({
    wrapper: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: 160,
        width: 120,
        overflow: 'hidden',
    },
    imageContainer: {
        height: '100%',
    },
    loadingPlaceholder: {
        height: 160,
        width: 120,
    },
    fallbackImage: {
        height: 64,
        width: 64,
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
        left: 6,
    },
}))

interface Props extends withClasses<'fallbackImage' | 'iframe' | 'wrapper' | 'loadingPlaceholder' | 'imgWrapper'> {
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
    pluginID?: NetworkPluginID
}

const assetPlayerFallbackImageDark = new URL('../Image/nft_token_fallback_dark.png', import.meta.url)
const assetPlayerFallbackImageLight = new URL('../Image/nft_token_fallback.png', import.meta.url)

export function NFTCardStyledAssetPlayer(props: Props) {
    const {
        chainId,
        contractAddress = '',
        tokenId = '',
        isImageOnly = false,
        fallbackImage,
        fallbackResourceLoader,
        url,
        pluginID,
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
    const urlComputed = url || tokenDetailed?.metadata?.imageURL || tokenDetailed?.metadata?.mediaURL
    const { value: isImageURL = true } = useIsImageURL(urlComputed)

    const fallbackImageURL =
        fallbackImage ?? (theme.palette.mode === 'dark' ? assetPlayerFallbackImageDark : assetPlayerFallbackImageLight)

    const networkDescriptor = useNetworkDescriptor(pluginID)

    const networkIcon = useMemo(() => {
        if (pluginID === NetworkPluginID.PLUGIN_EVM) {
            return NETWORK_DESCRIPTORS.find((network) => network?.chainId === chainId)?.icon
        }
        return networkDescriptor?.icon
    }, [networkDescriptor?.icon, pluginID])

    if (isImageURL || isImageOnly) {
        return (
            <div className={classes.imgWrapper}>
                <Image
                    classes={{
                        fallbackImage: classes.fallbackImage,
                        container: classes.imageContainer,
                    }}
                    width="100%"
                    height="100%"
                    style={{ objectFit: 'cover' }}
                    src={urlComputed}
                    fallback={fallbackImageURL}
                />
                {showNetwork && <ImageIcon icon={networkIcon} size={24} classes={{ icon: classes.networkIcon }} />}
            </div>
        )
    }

    if (!isImageURL) return null

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
                fallbackImage: classes.fallbackImage,
                loadingIcon: classes.loadingIcon,
                errorIcon: classes.fallbackImage,
            }}
            showNetwork={showNetwork}
            networkIcon={networkIcon}
            fallbackResourceLoader={fallbackResourceLoader}
        />
    )
}
