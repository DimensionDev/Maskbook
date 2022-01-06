import classNames from 'classnames'
import type { ChainId } from '@masknet/web3-shared-evm'
import { makeStyles, useStylesExtends } from '@masknet/theme'
import { AssetPlayer } from '@masknet/shared'

const useStyles = makeStyles()((theme) => ({
    wrapper: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '160px !important',
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

interface NFTLuckyDropStyledAssetPlayerProps extends withClasses<'loadingFailImage' | 'iframe'> {
    chainId: ChainId
    contractAddress: string
    tokenId: string
    fallbackImage: URL
}
export function NFTCardStyledAssetPlayer(props: NFTLuckyDropStyledAssetPlayerProps) {
    const { chainId, contractAddress, tokenId, fallbackImage } = props
    const classes = useStylesExtends(useStyles(), props)
    return (
        <AssetPlayer
            erc721Token={{
                chainId,
                contractAddress,
                tokenId: tokenId,
            }}
            fallbackImage={fallbackImage}
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
