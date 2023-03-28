import { makeStyles } from '@masknet/theme'
import { AssetPreviewer, NetworkIcon } from '../index.js'
import type { Web3Helper } from '@masknet/web3-helpers'
import type { NetworkPluginID } from '@masknet/shared-base'
import { isENSContractAddress } from '@masknet/web3-shared-evm'

const useStyles = makeStyles()((theme) => ({
    fallbackImage: {
        minHeight: '0 !important',
        maxWidth: 'none',
        width: '100%',
        height: '100%',
    },
}))

interface TokenImageProps extends withClasses<'root' | 'fallbackImage' | 'container'> {
    asset: Web3Helper.NonFungibleAssetAll
    pluginID?: NetworkPluginID
    fallbackImage?: JSX.Element | URL
}
export function TokenImage(props: TokenImageProps) {
    const { asset, pluginID, fallbackImage } = props
    const { classes } = useStyles()
    const imageURL = asset.metadata?.imageURL ?? asset.metadata?.mediaURL
    return (
        <AssetPreviewer
            classes={{
                fallbackImage: classes.fallbackImage,
                root: props.classes?.root,
                container: props.classes?.container,
            }}
            url={asset.metadata?.imageURL ?? asset.metadata?.mediaURL}
            icon={pluginID ? <NetworkIcon pluginID={pluginID} chainId={asset.chainId} /> : null}
            fallbackImage={
                !imageURL && asset.collection?.name.includes('.lens')
                    ? new URL('./assets/lens.svg', import.meta.url)
                    : !imageURL && isENSContractAddress(asset.contract?.address || '')
                    ? new URL('./assets/ens.svg', import.meta.url)
                    : fallbackImage
            }
        />
    )
}
