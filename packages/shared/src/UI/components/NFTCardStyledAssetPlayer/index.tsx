import { useMemo } from 'react'
import { useNetworkDescriptor, useNonFungibleAsset } from '@masknet/web3-hooks-base'
import { makeStyles, LoadingBase } from '@masknet/theme'
import type { Web3Helper } from '@masknet/web3-helpers'
import { NetworkPluginID } from '@masknet/shared-base'
import { NETWORK_DESCRIPTORS } from '@masknet/web3-shared-evm'
import { useTheme } from '@mui/material'
import { useIsImageURL } from '../../../hooks/index.js'
import { Image } from '../Image/index.js'
import { ImageIcon } from '../ImageIcon/index.js'

const useStyles = makeStyles()((theme) => ({
    fallbackImage: {
        height: 64,
        width: 64,
    },
    imgWrapper: {
        width: '100%',
        height: 180,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingWrapper: {
        width: '100%',
        height: 180,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
    },
    networkIcon: {
        position: 'absolute',
        top: 6,
        left: 6,
    },
    container: {
        background: 'unset !important',
    },
}))

interface Props extends withClasses<'fallbackImage' | 'imgWrapper'> {
    chainId?: Web3Helper.ChainIdAll
    tokenId?: string
    contractAddress?: string
    url?: string
    fallbackImage?: URL
    isImageOnly?: boolean
    disableQueryNonFungibleAsset?: boolean
    hideLoadingIcon?: boolean
    showNetwork?: boolean
    pluginID?: NetworkPluginID
    objectFit?: 'contain' | 'cover'
    objectFitForFallback?: 'contain' | 'cover'
}

const fallbackImageDark = new URL('../Image/mask-dark.png', import.meta.url)
const fallbackImageLight = new URL('../Image/mask-light.png', import.meta.url)

export function NFTCardStyledAssetPlayer(props: Props) {
    const {
        chainId,
        contractAddress = '',
        tokenId = '',
        isImageOnly = false,
        disableQueryNonFungibleAsset = false,
        fallbackImage,
        hideLoadingIcon = false,
        url,
        pluginID,
        showNetwork = false,
        objectFit = 'contain',
        objectFitForFallback = 'contain',
    } = props
    const { classes, cx } = useStyles(undefined, { props })
    const theme = useTheme()
    const { value: tokenDetailed, loading: loadingAsset } = useNonFungibleAsset<'all'>(
        NetworkPluginID.PLUGIN_EVM,
        disableQueryNonFungibleAsset ? '' : contractAddress,
        tokenId,
        {
            chainId,
        },
    )
    const urlComputed = url || tokenDetailed?.metadata?.imageURL || tokenDetailed?.metadata?.mediaURL
    const { value: isImageURL = true, loading: loadingIsImageURL } = useIsImageURL(urlComputed)

    const fallbackImageURL = fallbackImage ?? (theme.palette.mode === 'dark' ? fallbackImageDark : fallbackImageLight)

    const networkDescriptor = useNetworkDescriptor(pluginID)

    const networkIcon = useMemo(() => {
        if (pluginID === NetworkPluginID.PLUGIN_EVM) {
            return NETWORK_DESCRIPTORS.find((network) => network?.chainId === chainId)?.icon
        }
        return networkDescriptor?.icon
    }, [networkDescriptor?.icon, pluginID])

    if (loadingIsImageURL || (!url && loadingAsset))
        return hideLoadingIcon ? null : (
            <div className={classes.loadingWrapper}>
                <LoadingBase color="primary" size={25} />
            </div>
        )

    const imageURL = isImageURL || isImageOnly || !urlComputed ? urlComputed : fallbackImageURL.toString()

    return (
        <div className={classes.imgWrapper}>
            <Image
                classes={{
                    fallbackImage: classes.fallbackImage,
                }}
                containerProps={{ className: classes.container }}
                size="100%"
                style={{ objectFit: imageURL === fallbackImageURL.toString() ? objectFitForFallback : objectFit }}
                src={imageURL}
                fallback={fallbackImageURL}
            />
            {showNetwork && <ImageIcon icon={networkIcon} size={24} classes={{ icon: classes.networkIcon }} />}
        </div>
    )
}
