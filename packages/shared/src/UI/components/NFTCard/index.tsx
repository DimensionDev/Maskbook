import { Icons } from '@masknet/icons'
import { ImageIcon, useIsImageURL } from '@masknet/shared'
import { makeStyles, ShadowRootTooltip } from '@masknet/theme'
import { isSameAddress, NetworkPluginID, NonFungibleToken } from '@masknet/web3-shared-base'
import { ChainId, NETWORK_DESCRIPTORS, SchemaType } from '@masknet/web3-shared-evm'
import { Box, Skeleton } from '@mui/material'
import classNames from 'classnames'

const useStyles = makeStyles<{ networkPluginID: NetworkPluginID }>()((theme, props) => ({
    itemRoot: {
        position: 'relative',
    },
    itemIcon: {
        position: 'absolute',
        top: 5,
        right: 5,
        width: 20,
        height: 20,
        color: theme.palette.primary.main,
    },
    itemImage: {
        width: 126,
        height: 126,
        objectFit: 'cover',
        boxSizing: 'border-box',
        borderRadius: 12,
    },
    itemSelected: {
        border: `1px solid ${theme.palette.primary.main}`,
        borderRadius: 12,
    },
    skeleton: {
        width: 126,
        height: 126,
        objectFit: 'cover',
        boxSizing: 'border-box',
    },
    skeletonBox: {
        marginLeft: 'auto',
        marginRight: 'auto',
    },
    defaultImage: {
        background: theme.palette.maskColor.modalTitleBg,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 12,
    },
    maskIcon: {
        fontSize: 30,
    },
    networkIcon: {
        position: 'absolute',
        top: 6,
        right: 6,
    },
}))

interface NFTImageCollectibleAvatarProps {
    token: NonFungibleToken<ChainId, SchemaType>
    onChange?: (token: NonFungibleToken<ChainId, SchemaType>) => void
    selectedToken?: NonFungibleToken<ChainId, SchemaType>
    pluginId: NetworkPluginID
    size?: number
    showNetwork?: boolean
}

export function NFTImageCollectibleAvatar({
    token,
    onChange,
    selectedToken,
    pluginId,
    size = 126,
    showNetwork = false,
}: NFTImageCollectibleAvatarProps) {
    const { classes } = useStyles({ networkPluginID: pluginId })
    const { value: isImageToken, loading } = useIsImageURL(token.metadata?.imageURL)

    if (loading)
        return (
            <div className={classes.skeletonBox}>
                <Skeleton
                    animation="wave"
                    variant="rectangular"
                    style={{ width: size, height: size }}
                    className={classes.skeleton}
                />
            </div>
        )

    return isImageToken ? (
        <NFTImage
            pluginId={pluginId}
            size={size}
            showBadge
            token={token}
            selectedToken={selectedToken}
            onChange={onChange}
            showNetwork={showNetwork}
        />
    ) : (
        <ShadowRootTooltip title={token?.contract?.name ?? ''} placement="top" arrow>
            <Box sx={{ width: size, height: size }} className={classes.defaultImage}>
                <Icons.MaskAvatar className={classes.maskIcon} />
            </Box>
        </ShadowRootTooltip>
    )
}

interface NFTImageProps {
    pluginId: NetworkPluginID
    showBadge?: boolean
    token: NonFungibleToken<ChainId, SchemaType>
    selectedToken?: NonFungibleToken<ChainId, SchemaType>
    onChange?: (token: NonFungibleToken<ChainId, SchemaType>) => void
    size?: number
    showNetwork?: boolean
}

function isSameNFT(
    pluginId: NetworkPluginID,
    a: NonFungibleToken<ChainId, SchemaType>,
    b?: NonFungibleToken<ChainId, SchemaType>,
) {
    return pluginId !== NetworkPluginID.PLUGIN_SOLANA
        ? isSameAddress(a.contract?.address, b?.contract?.address) &&
              a.contract?.chainId &&
              a.contract?.chainId === b?.contract?.chainId &&
              a.tokenId === b?.tokenId
        : a.tokenId === b?.tokenId
}

export function NFTImage(props: NFTImageProps) {
    const { token, onChange, selectedToken, showBadge = false, pluginId, size = 126, showNetwork = false } = props
    const { classes } = useStyles({ networkPluginID: pluginId })
    const iconURL = NETWORK_DESCRIPTORS.find((network) => network?.chainId === token.chainId)?.icon

    return (
        <ShadowRootTooltip title={token?.contract?.name ?? ''} placement="top" arrow>
            <Box className={classes.itemRoot}>
                <img
                    onClick={() => onChange?.(token)}
                    src={token.metadata?.imageURL}
                    style={{ width: size, height: size }}
                    className={classNames(
                        classes.itemImage,
                        isSameNFT(pluginId, token, selectedToken) ? classes.itemSelected : '',
                    )}
                />
                {showNetwork && <ImageIcon classes={{ icon: classes.networkIcon }} icon={iconURL} size={20} />}

                {showBadge && isSameNFT(pluginId, token, selectedToken) ? (
                    <Icons.Selected className={classes.itemIcon} />
                ) : null}
            </Box>
        </ShadowRootTooltip>
    )
}
