import { Icons } from '@masknet/icons'
import { AssetPreviewer, Image, NFTFallbackImage, NFTSpamBadge, ProgressiveText, useReportSpam } from '@masknet/shared'
import { NetworkPluginID, PopupRoutes } from '@masknet/shared-base'
import { LoadingBase, TextOverflowTooltip, makeStyles, usePopupCustomSnackbar } from '@masknet/theme'
import type { Web3Helper } from '@masknet/web3-helpers'
import { useAccount, useNonFungibleAsset, useWeb3State } from '@masknet/web3-hooks-base'
import { TokenType, formatBalance } from '@masknet/web3-shared-base'
import {
    SchemaType,
    formatTrait,
    isLensCollect,
    isLensFollower,
    isLensProfileAddress,
    resolveImageURL,
} from '@masknet/web3-shared-evm'
import { Button, IconButton, Skeleton, Typography } from '@mui/material'
import { memo, useContext, useEffect, useMemo } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import urlcat from 'urlcat'
import { useMaskSharedTrans } from '../../../../../utils/index.js'
import { PageTitleContext } from '../../../context.js'
import { useTitle, useTokenParams } from '../../../hooks/index.js'
import { ConfirmModal } from '../../../modals/modals.js'
import { TransferTabType } from '../type.js'

const useStyles = makeStyles()((theme) => ({
    page: {
        padding: theme.spacing(2),
        overflow: 'auto',
        paddingBottom: 74,
    },
    image: {
        width: 178,
        height: 178,
        marginLeft: 'auto',
        marginRight: 'auto',
        borderRadius: 12,
        overflow: 'hidden',
    },
    name: {
        fontSize: 16,
        fontWeight: 700,
        color: theme.palette.maskColor.main,
        textAlign: 'center',
        margin: theme.spacing(1.5, 'auto', 0),
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
    },
    collectionName: {
        fontSize: 14,
        fontWeight: 400,
        textAlign: 'center',
        marginTop: theme.spacing(1.5),
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
    },
    collectionNameLabel: {
        marginLeft: 4,
        marginRight: 4,
    },
    fallbackImage: {
        minHeight: '0 !important',
        maxWidth: 'none',
        width: '100%',
        height: '100%',
    },
    icon: {
        borderRadius: '50%',
        overflow: 'hidden',
    },
    prices: {
        display: 'flex',
        gap: theme.spacing(1.5),
        marginTop: theme.spacing(4),
    },
    price: {
        flexGrow: 1,
    },
    priceLabel: {
        fontSize: 14,
        fontWeight: 700,
        color: theme.palette.maskColor.second,
    },
    priceValue: {
        color: theme.palette.maskColor.main,
        fontWeight: 700,
        marginTop: theme.spacing(1.5),
    },
    noneValue: {
        color: theme.palette.maskColor.second,
    },
    sectionTitle: {
        fontSize: 14,
        fontWeight: 700,
        color: theme.palette.maskColor.main,
        marginTop: theme.spacing(3),
        marginBottom: theme.spacing(1.5),
    },
    text: {
        fontSize: 12,
        color: theme.palette.maskColor.second,
        fontWeight: 400,
        wordWrap: 'break-word',
    },
    traits: {
        flexWrap: 'wrap',
        gap: theme.spacing(1.5),
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
    },
    trait: {
        border: `1px solid ${theme.palette.maskColor.line}`,
        borderRadius: 8,
        padding: 6,
        overflow: 'auto',
    },
    traitType: {
        fontSize: 12,
        color: theme.palette.maskColor.primaryMain,
        textTransform: 'capitalize',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
    },
    traitValue: {
        fontSize: 13,
        fontWeight: 700,
        color: theme.palette.maskColor.primary,
        marginTop: theme.spacing(0.5),
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
    },
    sendButton: {
        position: 'fixed',
        left: 18,
        right: 18,
        bottom: 18,
        boxShadow: '0px 6px 12px 0px rgba(7, 16, 27, 0.20)',
        backdropFilter: 'blur(8px)',
    },
    iconButton: {
        padding: 0,
        minWidth: 'auto',
        width: 'auto',
    },
    reportButton: {
        color: theme.palette.maskColor.main,
        height: 20,
        width: 20,
        padding: 0,
        borderRadius: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
    },
}))

export const CollectibleDetail = memo(function CollectibleDetail() {
    const { classes, cx } = useStyles()
    const { t } = useMaskSharedTrans()
    const navigate = useNavigate()
    const location = useLocation()
    const { chainId, address, params } = useTokenParams()
    const account = useAccount(NetworkPluginID.PLUGIN_EVM)
    const id = params.get('id') || ''
    const stateAsset = location.state?.asset as
        | Web3Helper.NonFungibleTokenScope<void, NetworkPluginID.PLUGIN_EVM>
        | undefined
    const { data: asset, isLoading } = useNonFungibleAsset(NetworkPluginID.PLUGIN_EVM, address, id, { chainId })

    useEffect(() => {
        if (!asset && !isLoading) navigate(-1)
    }, [!asset && !isLoading, navigate])
    useTitle(asset?.metadata?.name || t('collectible_title'))

    const availableAsset = asset || stateAsset

    const name = availableAsset?.metadata?.name
    const collectionName = availableAsset?.collection?.name
    const assetDesc = availableAsset?.metadata?.description
    const collectionDesc = availableAsset?.collection?.description
    const floorPrice = useMemo(() => {
        if (!asset?.collection?.floorPrices) return null
        return (
            asset.collection.floorPrices.find((x) => x.marketplace_id === 'opensea') || asset.collection.floorPrices[0]
        )
    }, [asset?.collection?.floorPrices])

    const { showSnackbar } = usePopupCustomSnackbar()
    const { setExtension } = useContext(PageTitleContext)
    const { Token } = useWeb3State(NetworkPluginID.PLUGIN_EVM)
    useEffect(() => {
        setExtension(
            <Button
                variant="text"
                className={classes.iconButton}
                onClick={async () => {
                    const result = await ConfirmModal.openAndWaitForClose({
                        title: t('hide_collectible', { name }),
                        message: t('hide_collectible_description', { name }),
                    })
                    if (!result || !Token?.blockToken || !availableAsset) return
                    await Token.blockToken(account, {
                        id: `${availableAsset.chainId}.${availableAsset.address}.${availableAsset.tokenId}`,
                        chainId: availableAsset.chainId,
                        type: TokenType.NonFungible,
                        schema: SchemaType.ERC721,
                        address: availableAsset.address,
                        tokenId: availableAsset.tokenId,
                    })
                    await Token.removeNonFungibleTokens?.(
                        account,
                        {
                            chainId: availableAsset.chainId,
                            name: '', // Name is not necessary but satisfies typing.
                            address: availableAsset.address,
                            schema: SchemaType.ERC721,
                        },
                        [availableAsset.tokenId],
                    )
                    showSnackbar(t('hided_token_successfully'))
                    navigate(-1)
                }}>
                <Icons.Trash size={24} />
            </Button>,
        )
        return () => setExtension(undefined)
    }, [classes.iconButton, t, name, account, navigate, showSnackbar])

    const lastSale = asset?.priceInToken
    const transferable = useMemo(() => {
        if (!availableAsset) return false
        if (isLensProfileAddress(availableAsset.address)) return false
        if (availableAsset.metadata?.name && isLensFollower(availableAsset.metadata.name)) return false
        if (availableAsset.collection?.name && isLensCollect(availableAsset.collection.name)) return false
        return true
    }, [availableAsset])

    const fallbackImage = availableAsset
        ? resolveImageURL(
              undefined,
              availableAsset.metadata?.name,
              availableAsset.collection?.name,
              availableAsset.contract?.address,
          )
        : NFTFallbackImage
    const { isReporting, isUndetermined, isSpam, promptReport } = useReportSpam(
        availableAsset?.address,
        availableAsset?.chainId,
    )
    return (
        <article className={classes.page} data-hide-scrollbar>
            {availableAsset ? (
                <AssetPreviewer
                    classes={{ root: classes.image, fallbackImage: classes.fallbackImage }}
                    url={availableAsset?.metadata?.imageURL}
                    fallbackImage={fallbackImage}
                />
            ) : (
                <Skeleton className={classes.image} />
            )}
            <ProgressiveText
                variant="h1"
                className={classes.name}
                loading={isLoading || !name}
                skeletonWidth={100}
                skeletonHeight={18}>
                {name}
            </ProgressiveText>
            <div className={classes.collectionName}>
                {availableAsset?.collection?.iconURL ? (
                    <Image size={24} classes={{ container: classes.icon }} src={availableAsset.collection.iconURL} />
                ) : null}
                <ProgressiveText
                    className={classes.collectionNameLabel}
                    loading={isLoading || !collectionName}
                    skeletonWidth={80}>
                    {collectionName}
                </ProgressiveText>
                {isSpam ? (
                    <NFTSpamBadge />
                ) : isUndetermined ? (
                    <IconButton className={classes.reportButton} onClick={promptReport} disabled={isReporting}>
                        {isReporting ? <LoadingBase size={16} /> : <Icons.Flag size={16} />}
                    </IconButton>
                ) : null}
            </div>
            <div className={classes.prices}>
                <div className={classes.price}>
                    <Typography variant="h2" className={classes.priceLabel}>
                        {t('collectible_last_sale_price')}
                    </Typography>
                    <Typography className={cx(classes.priceValue, lastSale ? '' : classes.noneValue)}>
                        {lastSale
                            ? `${formatBalance(lastSale.amount, lastSale.token.decimals)} ${lastSale.token.symbol}`
                            : t('none')}
                    </Typography>
                </div>
                <div className={classes.price}>
                    <Typography variant="h2" className={classes.priceLabel}>
                        {t('floor_price')}
                    </Typography>
                    <Typography className={cx(classes.priceValue, floorPrice ? '' : classes.noneValue)}>
                        {floorPrice
                            ? `${formatBalance(floorPrice.value, floorPrice.payment_token.decimals)} ${
                                  floorPrice.payment_token.symbol
                              }`
                            : t('none')}
                    </Typography>
                </div>
            </div>
            <Typography variant="h2" className={classes.sectionTitle}>
                {t('collectible_description')}
            </Typography>
            <Typography variant="body1" className={classes.text}>
                {assetDesc || t('none')}
            </Typography>
            {isLoading || asset?.traits?.length ? (
                <>
                    <Typography variant="h2" className={classes.sectionTitle}>
                        {t('collectible_properties')}
                    </Typography>
                    <div className={classes.traits}>
                        {asset?.traits?.map((trait, index) => {
                            const uiValue = formatTrait(trait)

                            return (
                                <div key={index} className={classes.trait}>
                                    <TextOverflowTooltip title={trait.type}>
                                        <Typography className={classes.traitType}>{trait.type}</Typography>
                                    </TextOverflowTooltip>
                                    <TextOverflowTooltip title={trait.value}>
                                        <Typography className={classes.traitValue}>{uiValue}</Typography>
                                    </TextOverflowTooltip>
                                </div>
                            )
                        })}
                    </div>
                </>
            ) : null}
            {isLoading || collectionDesc ? (
                <>
                    <Typography variant="h2" className={classes.sectionTitle}>
                        {t('about_collection', { name: collectionName })}
                    </Typography>
                    <ProgressiveText variant="body1" loading={isLoading} className={classes.text} skeletonWidth={100}>
                        {collectionDesc}
                    </ProgressiveText>
                </>
            ) : null}
            {transferable ? (
                <Button
                    className={classes.sendButton}
                    onClick={() => {
                        const path = urlcat(PopupRoutes.Contacts, {
                            tab: TransferTabType.NFT,
                            'nft:chainId': chainId,
                            'nft:address': address,
                            'nft:tokenId': availableAsset?.tokenId,
                        })
                        navigate(path)
                    }}>
                    <Icons.Send size={16} style={{ marginRight: 4 }} />
                    {t('send')}
                </Button>
            ) : null}
        </article>
    )
})
