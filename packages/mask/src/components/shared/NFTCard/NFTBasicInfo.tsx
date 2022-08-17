import { NFTCardStyledAssetPlayer } from '@masknet/shared'
import { makeStyles, MaskColorVar } from '@masknet/theme'
import { Typography } from '@mui/material'
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser'
import { SourceType } from '@masknet/web3-shared-base'
import { CollectibleProviderIcon } from '../../../plugins/Collectible/SNSAdaptor/CollectibleProviderIcon'
import type { Web3Helper } from '@masknet/plugin-infra/src/web3-helpers'
import type { NetworkPluginID } from '@masknet/web3-shared-base'
import { getEnumAsArray } from '@dimensiondev/kit'

const useStyles = makeStyles()((theme) => ({
    layout: {
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
    },
    body: {
        position: 'relative',
        width: '100%',
        marginBottom: 36,
        minHeight: 300,
    },
    errorPlaceholder: {
        padding: '82px 0',
        backgroundColor: theme.palette.background.default,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 12,
        width: '100%',
    },
    loadingPlaceholder: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        width: '100%',
        height: '100%',
        padding: '74px 0',
    },
    wrapper: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100% !important',
        width: '100% !important',
        overflow: 'hidden',
    },

    loadingIcon: {
        width: 36,
        height: 52,
    },
    errorIcon: {
        width: 36,
        height: 36,
    },
    iframe: {
        minWidth: 300,
        minHeight: 300,
        width: '100%',
        height: '100%',
    },
    imgWrapper: {
        minWidth: 300,
        minHeight: 300,
        width: '100%',
        height: '100%',
        background: 'black',
        borderRadius: 20,
        boxShadow: `0px 28px 56px -28px ${MaskColorVar.primary.alpha(0.5)}`,
        '& > img': {
            borderRadius: 20,
        },
    },
    nameSm: {
        fontSize: 16,
        fontWeight: 700,
        color: theme.palette.maskColor.publicMain,
    },
    nameLg: {
        fontSize: 20,
        fontWeight: 700,
    },
    nameLgBox: {
        display: 'flex',
        placeSelf: 'center',
        gap: 6,
        marginTop: 12,
    },
    absoluteProvider: {
        top: 16,
        right: '5%',
        position: 'absolute',
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        zIndex: 99,
    },
    providerIcon: {
        cursor: 'pointer',
    },
    loadingFailImage: {
        height: 300,
    },
}))

interface NFTBasicInfoProps {
    hideSubTitle?: boolean
    asset: Web3Helper.NonFungibleAssetScope<void, NetworkPluginID.PLUGIN_EVM>
    onChangeProvider: (v: SourceType) => void
    providers: SourceType[]
    currentProvider: SourceType
}

export function NFTBasicInfo(props: NFTBasicInfoProps) {
    const { asset, hideSubTitle, onChangeProvider, providers, currentProvider } = props
    const { classes } = useStyles()

    const collectibleProviderOptions = getEnumAsArray(SourceType).filter((x) => providers.includes(x.value))
    const fallbackImgURL = new URL('../assets/fallbackImg.svg', import.meta.url)
    const resourceUrl = asset.metadata?.imageURL ?? asset.metadata?.mediaURL
    return (
        <div className={classes.layout}>
            <div className={classes.body}>
                <div className={classes.absoluteProvider}>
                    {collectibleProviderOptions.map((x) => {
                        return (
                            <div className={classes.providerIcon} key={x.key} onClick={() => onChangeProvider(x.value)}>
                                <CollectibleProviderIcon active={currentProvider === x.value} provider={x.value} />
                            </div>
                        )
                    })}
                </div>
                <NFTCardStyledAssetPlayer
                    fallbackImage={fallbackImgURL}
                    url={resourceUrl}
                    classes={{
                        iframe: classes.iframe,
                        wrapper: classes.wrapper,
                        loadingPlaceholder: classes.loadingPlaceholder,
                        loadingFailImage: classes.loadingFailImage,
                    }}
                    isNative={false}
                />
            </div>
            <Typography className={classes.nameSm}>{asset.metadata?.name ?? '-'}</Typography>
            {!hideSubTitle && (
                <div className={classes.nameLgBox}>
                    <Typography className={classes.nameLg}>{asset.metadata?.name}</Typography>
                    {asset.collection?.verified && <VerifiedUserIcon color="primary" fontSize="small" />}
                </div>
            )}
        </div>
    )
}
