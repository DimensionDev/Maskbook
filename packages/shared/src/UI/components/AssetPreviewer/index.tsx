import { useTheme } from '@mui/material'
import { makeStyles, useStylesExtends } from '@masknet/theme'
import { useWeb3State } from '@masknet/plugin-infra/web3'
import type { Web3Helper } from '@masknet/web3-helpers'
import type { NetworkPluginID } from '@masknet/web3-shared-base'
import { ImageIcon } from '../ImageIcon/index.js'
import { Image } from '../Image/index.js'

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
    pluginID: NetworkPluginID
    chainId: Web3Helper.ChainIdAll
    url?: string
    fallbackImage?: URL
}

const ASSET_PLAYER_FALLBACK_DARK = new URL('../Image/nft_token_fallback_dark.png', import.meta.url)
const ASSET_PLAYER_FALLBACK_LIGHT = new URL('../Image/nft_token_fallback.png', import.meta.url)

export function AssetPreviewer(props: AssetPreviewerProps) {
    const { pluginID, chainId, fallbackImage, url } = props

    const classes = useStylesExtends(useStyles(), props)
    const theme = useTheme()

    const fallbackImageURL =
        fallbackImage ?? (theme.palette.mode === 'dark' ? ASSET_PLAYER_FALLBACK_DARK : ASSET_PLAYER_FALLBACK_LIGHT)

    const { Others } = useWeb3State(pluginID)
    const networkType = Others?.chainResolver.networkType(chainId)
    const networkIcon = networkType ? Others?.networkResolver.networkIcon(networkType) : undefined

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
                fallback={fallbackImageURL}
            />
            {networkIcon && <ImageIcon classes={{ icon: classes.networkIcon }} icon={networkIcon} size={20} />}
        </div>
    )
}
