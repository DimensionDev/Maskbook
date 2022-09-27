import { useTheme } from '@mui/material'
import { makeStyles, useStylesExtends } from '@masknet/theme'
import { useChainId, useCurrentWeb3NetworkPluginID } from '@masknet/plugin-infra/web3'
import { Image } from '../Image/index.js'
import { NetworkIcon, NetworkIconProps } from '../NetworkIcon/index.js'

const useStyles = makeStyles()((theme) => ({
    root: {
        width: '100%',
        height: '100%',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
    },
    imageContainer: {
        height: '100%',
    },
    fallbackImage: {
        height: 64,
        width: 64,
    },
    networkIcon: {
        position: 'absolute',
        top: 6,
        right: 6,
    },
}))

export interface AssetPreviewerProps extends withClasses<'root' | 'fallbackImage'> {
    url?: string
    fallbackImage?: URL
    NetworkIconProps?: Partial<NetworkIconProps>
}

const ASSET_PLAYER_FALLBACK_DARK = new URL('../Image/nft_token_fallback_dark.png', import.meta.url)
const ASSET_PLAYER_FALLBACK_LIGHT = new URL('../Image/nft_token_fallback.png', import.meta.url)

export function AssetPreviewer(props: AssetPreviewerProps) {
    const { fallbackImage, url, NetworkIconProps } = props

    const classes = useStylesExtends(useStyles(), props)
    const theme = useTheme()

    const pluginID = useCurrentWeb3NetworkPluginID(NetworkIconProps?.pluginID)
    const chainId = useChainId(NetworkIconProps?.pluginID, NetworkIconProps?.chainId)

    return (
        <div className={classes.root}>
            <Image
                classes={{
                    container: classes.imageContainer,
                    fallbackImage: classes.fallbackImage,
                }}
                width="100%"
                height="100%"
                style={{ objectFit: 'cover' }}
                src={url}
                fallback={
                    fallbackImage ??
                    (theme.palette.mode === 'dark' ? ASSET_PLAYER_FALLBACK_DARK : ASSET_PLAYER_FALLBACK_LIGHT)
                }
            />
            {pluginID && chainId ? (
                <NetworkIcon
                    pluginID={pluginID}
                    chainId={chainId}
                    ImageIconProps={{
                        classes: { icon: classes.networkIcon },
                    }}
                />
            ) : null}
        </div>
    )
}
