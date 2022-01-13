import classNames from 'classnames'
import { CircularProgress } from '@mui/material'
import type { ChainId } from '@masknet/web3-shared-evm'
import { makeStyles, useStylesExtends } from '@masknet/theme'
import { AssetPlayer } from '../AssetPlayer'

const useStyles = makeStyles()((theme) => ({
    wrapper: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: 160,
        width: 120,
        overflow: 'hidden',
    },
    loadingNftImg: {
        marginTop: 20,
    },
    loadingPlaceholder: {
        height: 160,
        width: 120,
    },
    loadingIcon: {
        width: 36,
        height: 52,
    },
}))

interface NFTLuckyDropStyledAssetPlayerProps
    extends withClasses<'loadingFailImage' | 'iframe' | 'wrapper' | 'loadingPlaceholder'> {
    chainId: ChainId
    contractAddress: string
    tokenId: string
    url?: string
    fallbackImage?: URL
    renderOrder?: number
    setERC721TokenName?: (name: string) => void
    setSourceType?: (type: string) => void
}
export function NFTCardStyledAssetPlayer(props: NFTLuckyDropStyledAssetPlayerProps) {
    const { chainId, contractAddress, tokenId, fallbackImage, url, setERC721TokenName, renderOrder, setSourceType } =
        props
    const classes = useStylesExtends(useStyles(), props)
    return (
        <AssetPlayer
            erc721Token={{
                chainId,
                contractAddress,
                tokenId: tokenId,
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
            fallbackImage={fallbackImage ?? new URL('./nft_token_fallback.png', import.meta.url)}
            loadingIcon={<CircularProgress size={20} className={classes.loadingNftImg} />}
            classes={{
                iframe: classNames(classes.wrapper, classes.iframe),
                errorPlaceholder: classes.wrapper,
                loadingPlaceholder: classes.wrapper,
                loadingFailImage: classes.loadingFailImage,
                loadingIcon: classes.loadingIcon,
            }}
        />
    )
}
