import classNames from 'classnames'
import { CircularProgress, useTheme } from '@mui/material'
import { ChainId, useImageChecker, useERC721TokenDetailed, ERC721ContractDetailed } from '@masknet/web3-shared-evm'
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
    loadingPlaceholder: {
        height: 160,
        width: 120,
    },
    loadingIcon: {
        width: 36,
        height: 52,
    },
    imgWrapper: {
        width: '100%',
        height: '100%',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
    },
}))

interface Props extends withClasses<'loadingFailImage' | 'iframe' | 'wrapper' | 'loadingPlaceholder' | 'imgWrapper'> {
    chainId?: ChainId
    contractAddress?: string
    tokenId?: string
    url?: string
    fallbackImage?: URL
    fallbackResourceLoader?: JSX.Element
    renderOrder?: number
    isNative?: boolean
    setERC721TokenName?: (name: string) => void
    setSourceType?: (type: string) => void
}

const assetPlayerFallbackImageDark = new URL('./nft_token_fallback_dark.png', import.meta.url)
const assetPlayerFallbackImageLight = new URL('./nft_token_fallback.png', import.meta.url)

export function NFTCardStyledAssetPlayer(props: Props) {
    const {
        chainId = ChainId.Mainnet,
        contractAddress = '',
        tokenId = '',
        isNative = false,
        fallbackImage,
        fallbackResourceLoader,
        url,
        setERC721TokenName,
        renderOrder,
        setSourceType,
    } = props
    const classes = useStylesExtends(useStyles(), props)
    const theme = useTheme()
    const { tokenDetailed } = useERC721TokenDetailed(
        { address: contractAddress, chainId } as ERC721ContractDetailed,
        tokenId,
    )
    const { value: isImageToken } = useImageChecker(url || tokenDetailed?.info.imageURL || tokenDetailed?.info.mediaUrl)

    const fallbackImageURL =
        theme.palette.mode === 'dark' ? assetPlayerFallbackImageDark : assetPlayerFallbackImageLight

    return isImageToken || isNative ? (
        <div className={classes.imgWrapper}>
            <img
                width="100%"
                style={{ objectFit: 'cover' }}
                src={url || tokenDetailed?.info.imageURL || tokenDetailed?.info.mediaUrl}
                onError={(event) => {
                    const target = event.currentTarget as HTMLImageElement
                    target.src = fallbackImageURL.toString()
                    target.classList.add(classes.loadingFailImage ?? '')
                }}
            />
        </div>
    ) : (
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
            fallbackImage={fallbackImage ?? fallbackImageURL}
            loadingIcon={<CircularProgress size={20} />}
            classes={{
                iframe: classNames(classes.wrapper, classes.iframe),
                errorPlaceholder: classes.wrapper,
                loadingPlaceholder: classes.wrapper,
                loadingFailImage: classes.loadingFailImage,
                loadingIcon: classes.loadingIcon,
            }}
            fallbackResourceLoader={fallbackResourceLoader}
        />
    )
}
