import { Icons } from '@masknet/icons'
import { ImageIcon, useIsImageURL } from '@masknet/shared'
import { type NetworkPluginID } from '@masknet/shared-base'
import { ShadowRootTooltip, makeStyles } from '@masknet/theme'
import { type NonFungibleToken } from '@masknet/web3-shared-base'
import { NETWORK_DESCRIPTORS, type ChainId, type SchemaType } from '@masknet/web3-shared-evm'
import { Box, Skeleton, type TooltipProps } from '@mui/material'
import { isSameNFT } from '../../../utils/isSameNFT.js'

const useStyles = makeStyles<{ networkPluginID: NetworkPluginID }>()((theme, props) => ({
    itemRoot: {
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
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
    pluginID: NetworkPluginID
    size?: number
    showNetwork?: boolean
}

const COMMON_TOOLTIP_PROPS: Partial<TooltipProps> = {
    arrow: true,
    disableInteractive: true,
    PopperProps: {
        popperOptions: {
            strategy: 'absolute',
        },
    },
}

/**
 * @deprecated Use CollectibleItem instead.
 */
export function NFTImageCollectibleAvatar({
    token,
    onChange,
    selectedToken,
    pluginID,
    size = 126,
    showNetwork = false,
}: NFTImageCollectibleAvatarProps) {
    const { classes } = useStyles({ networkPluginID: pluginID })
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

    const title = token.collection?.name || token.contract?.name || ''
    return isImageToken ?
            <NFTImage
                title={title}
                pluginID={pluginID}
                size={size}
                showBadge
                token={token}
                selectedToken={selectedToken}
                onChange={onChange}
                showNetwork={showNetwork}
            />
        :   <ShadowRootTooltip {...COMMON_TOOLTIP_PROPS} title={title}>
                <Box sx={{ width: size, height: size }} className={classes.defaultImage}>
                    <Icons.MaskAvatar className={classes.maskIcon} />
                </Box>
            </ShadowRootTooltip>
}

interface NFTImageProps {
    title: string
    pluginID: NetworkPluginID
    showBadge?: boolean
    token: NonFungibleToken<ChainId, SchemaType>
    selectedToken?: NonFungibleToken<ChainId, SchemaType>
    onChange?: (token: NonFungibleToken<ChainId, SchemaType>) => void
    size?: number
    showNetwork?: boolean
}

export function NFTImage(props: NFTImageProps) {
    const {
        token,
        onChange,
        selectedToken,
        title,
        showBadge = false,
        pluginID,
        size = 126,
        showNetwork = false,
    } = props
    const { classes, cx } = useStyles({ networkPluginID: pluginID })
    const iconURL = NETWORK_DESCRIPTORS.find((network) => network.chainId === token.chainId)?.icon

    return (
        <ShadowRootTooltip {...COMMON_TOOLTIP_PROPS} title={title}>
            <Box className={classes.itemRoot}>
                <img
                    onClick={() => onChange?.(token)}
                    src={token.metadata?.imageURL}
                    style={{ width: size, height: size }}
                    className={cx(
                        classes.itemImage,
                        isSameNFT(pluginID, token, selectedToken) ? classes.itemSelected : '',
                    )}
                />
                {showNetwork ?
                    <ImageIcon className={classes.networkIcon} icon={iconURL} size={20} />
                :   null}

                {showBadge && isSameNFT(pluginID, token, selectedToken) ?
                    <Icons.Selected className={classes.itemIcon} />
                :   null}
            </Box>
        </ShadowRootTooltip>
    )
}
