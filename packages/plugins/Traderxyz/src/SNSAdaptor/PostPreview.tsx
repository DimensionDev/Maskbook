import { Box, Button, Chip, Grid, Typography, useTheme } from '@mui/material'
import { makeStyles, useCustomSnackbar } from '@masknet/theme'
import { useI18N } from '../locales/i18n_generated'
import { usePluginWrapper, usePostInfo } from '@masknet/plugin-infra/content-script'
import { useAccount, useChainId, useGasLimit, useGasPrice } from '@masknet/web3-shared-evm'
import { getTraderApi } from '../apis/nftswap'
import type { TradeMetaData, nftData } from '../types'
import type { SwappableAsset } from '@traderxyz/nft-swap-sdk'

const useStyles = makeStyles()((theme, props) => ({
    actions: {
        alignSelf: 'center',
    },
    mainWrapper: {
        height: 400,
        borderRadius: 10,
        border: 1,
        borderColor: ' blue !important',
    },

    bodyContent: {
        height: 400,
        background: '#cddc39',
        color: '#000000',
        borderRadius: 10,
    },

    button: {
        borderRadius: 99,
        marginTop: 0,
        fontSize: 14,
        fontWeight: 400,
        lineHeight: 19.6,
        height: 40,
        paddingTop: 8,
        paddingLeft: 16,
        paddingBottom: 8,
        paddingRight: 16,
        backgroundColor: theme.palette.mode === 'dark' ? '#EFF3F4' : '#111418',
        color: theme.palette.mode === 'dark' ? '#0F1419' : '#FFFFFF',
    },
    buttonWrapper: {
        marginTop: 10,
        marginBottom: 10,
    },
    img: {
        borderRadius: 10,
    },
    previewBoxOuter: {
        boxShadow: 'rgb(0 0 0 / 4%) 0px 6px 40px, rgb(0 0 0 / 2%) 0px 3px 6px',
        background: theme.palette.mode === 'dark' ? '#1D2933' : 'rgb(255, 255, 255)',
        width: '100%',
        border: '0px solid blue',
        borderRadius: 16,
        height: '310px',
    },

    previewBoxInner: {
        background: theme.palette.mode === 'dark' ? '#000000' : 'rgb(245, 245, 247)',
        width: '100%',
        border: '0px solid blue',
        borderRadius: 10,
        height: '190px',
    },

    previewBoxInnerGridContainer: {
        display: 'flex',
        borderCollapse: 'collapse',
        width: '100%',
        border: '0px solid green',
        alignItems: 'center',
        justifyContent: 'space-evenly',
        borderRadius: 15,
    },

    previewBoxInnerGridContainerItem: {
        display: 'table-cell',
        height: '190px',
        border: '0px solid green',
    },
    previewBoxInnerGridContainerItemImg: {
        height: '100%',
        maxWidth: '100%',
        objectFit: 'cover',
        borderRadius: '10px',
        userSelect: 'none',
    },
    previewBoxInnerGridContainerChip: {
        position: 'relative',
        left: '65%',
        top: '-35px',
        background: theme.palette.mode === 'dark' ? '#1D2933' : 'rgb(23, 23, 23)',
        color: 'white',
        fontSize: '18px',
        border: '1px solid rgb(0, 0, 0)',
        padding: '10px 5px 10px',
    },
    previewBoxInnerGridFooterTitle1: {
        fontWeight: 500,
        fontSize: '18px',
        color: theme.palette.mode === 'dark' ? '#ffffff' : '#000000',
    },
    previewBoxInnerGridFooterTitle2: {
        fontWeight: 'normal',
        fontSize: '14px',
        color: theme.palette.mode === 'dark' ? '#ffffff' : '#000000',
    },
}))

/**
 * This page we use to full fill order
 */

export function PostPreview({ info }: { info: TradeMetaData }) {
    const selectedChainId = useChainId()
    const nftSwapSdk = getTraderApi(selectedChainId)
    const account = useAccount()
    const { classes } = useStyles()
    const t = useI18N()
    const theme = useTheme()
    const { showSnackbar } = useCustomSnackbar()
    const gasLimit = useGasLimit()
    const gasPrice = useGasPrice()

    const p = usePostInfo()
    // const l = usePostLink()

    const sharePost = () => {
        // console.log('usePostInfo=', p)
        // console.log('usePostLink=', l)
        // console.log('postBy=', p?.url.getCurrentValue())
        // showSnackbar('Order is Signed', { variant: 'success' })
        // // activatedSocialNetworkUI.automation.nativeCompositionDialog?.appendText?.('text' + l, {
        // //     recover: true,
        // // })
        // const shareLink = activatedSocialNetworkUI.utils
        //     .getShareLinkURL?.(
        //         [
        //             `I just claimed.${
        //                 isTwitter(activatedSocialNetworkUI) || isFacebook(activatedSocialNetworkUI)
        //                     ? `Follow @${
        //                           isTwitter(activatedSocialNetworkUI) ? t('twitter_account') : t('facebook_account')
        //                       } (mask.io) to claim airdrop.`
        //                     : ''
        //             }`,
        //             '#mask_io',
        //             l,
        //         ].join('\n'),
        //     )
        //     .toString()
        // console.log('use-Post-shareLink=', shareLink)
    }

    const signOrder = async () => {
        // WE CAN SET GAS LIMIT IF WE WANT

        console.log(gasLimit, gasPrice)

        const TransactionOverrides = {
            gasLimit: 10000000,
            gasPrice: 10000000000,
        }

        const normalizeSignedOrder = nftSwapSdk.normalizeSignedOrder(info.signedOrder)

        // User A Trade Data
        // const walletAddressUserA = '0x3e4000C9e0f2F9CA5F26710360C06eC64E7a5Fd7'
        // const assetsToSwapUserA = [RECEIVING_TOKEN, MY_NFT, MY_NFT1]

        const walletAddressUserA = account
        const assetsToSwapUserA = [info.assetsInfo.receiving_token, ...info.assetsInfo.nfts]

        /// Check order status

        // Invalid = 0,
        // InvalidMakerAssetAmount = 1,
        // InvalidTakerAssetAmount = 2,
        // Fillable = 3,
        // Expired = 4,
        // FullyFilled = 5,
        // Cancelled = 6

        const orderStatus = await nftSwapSdk.getOrderStatus(normalizeSignedOrder)

        if (orderStatus === 3) {
            // Fillable
            // Check if we need to approve the NFT for swapping
            const approvalStatusForUserA = await nftSwapSdk.loadApprovalStatus(
                assetsToSwapUserA[0] as SwappableAsset,
                walletAddressUserA,
            )

            // Check if buyer needs to approve the sell token contract or no
            if (!approvalStatusForUserA.contractApproved) {
                // If not approved
                const approvalTx = await nftSwapSdk.approveTokenOrNftByAsset(
                    assetsToSwapUserA[0] as SwappableAsset,
                    walletAddressUserA,
                )

                await approvalTx.wait().then(
                    (msg) =>
                        showSnackbar(
                            `Approved ${assetsToSwapUserA[0]?.tokenAddress} contract to swap with 0x (txHash: ${msg.transactionHash})`,
                            { variant: 'success' },
                        ),
                    (error) => showSnackbar(t.submit_order_submit_error_message() + error, { variant: 'error' }),
                )
            }
            // fill order
            const fillTx = await nftSwapSdk.fillSignedOrder(normalizeSignedOrder, undefined, TransactionOverrides).then(
                async (fillTx) => {
                    const fillTxReceipt = await nftSwapSdk.awaitTransactionHash(fillTx?.hash).then(
                        (fillTxReceipt) => {
                            if (fillTxReceipt.status !== 0) {
                                showSnackbar(
                                    `\u{1F389} \u{1F973} ${t.submit_order_filled_message()} ${
                                        fillTxReceipt?.transactionHash
                                    }`,
                                    { variant: 'success' },
                                )
                            } else {
                                showSnackbar(
                                    t.submit_order_submit_error_message() + fillTxReceipt?.transactionHash + ' failed',
                                    { variant: 'error' },
                                )
                            }
                        },
                        (error) =>
                            showSnackbar(t.submit_order_submit_error_message() + ' fillTxReceipt error :' + error, {
                                variant: 'error',
                            }),
                    )
                },
                (error) => showSnackbar(t.submit_order_submit_error_message() + error, { variant: 'error' }),
            )
        }

        if (orderStatus === 5) {
            // FullyFilled
            showSnackbar(t.order_filled(), { variant: 'error' })
        }

        if (orderStatus === 4) {
            // Expired
            showSnackbar(t.order_expired(), { variant: 'error' })
        }

        if (orderStatus === 6) {
            // Cancelled
            showSnackbar(t.order_cancelled(), { variant: 'error' })
        }

        if (orderStatus === 6) {
            // Cancelled
            showSnackbar(t.order_cancelled(), { variant: 'error' })
        }

        if (orderStatus === 0) {
            // Cancelled
            showSnackbar(t.order_invalid(), { variant: 'error' })
        }

        if (orderStatus === 1) {
            // Invalid
            showSnackbar(t.order_invalid_maker(), { variant: 'error' })
        }

        if (orderStatus === 2) {
            // Invalid
            showSnackbar(t.order_invalid_taker(), { variant: 'error' })
        }
    }

    const s = info.assetsInfo.preview_info

    const nftList = s.nftMediaUrls
    const previewImages = nftList.map((item: nftData) => {
        return (
            <>
                <Grid className={classes.previewBoxInnerGridContainerItem} padding={1}>
                    <img
                        className={classes.previewBoxInnerGridContainerItemImg}
                        alt={item.nft_name}
                        src={item.image_preview_url}
                    />
                </Grid>
            </>
        )
    })

    const chipTitle = s.receivingSymbol.amount + ' ' + s.receivingSymbol.symbol

    let labelString = ''

    if (nftList.length > 0) {
        labelString = `Buy ${nftList[0]?.nft_name} (#${nftList[0]?.nft_id})`

        if (nftList.length > 1) {
            labelString += ` and ${nftList[1]?.nft_name} (#${nftList[1]?.nft_id})`
        }

        if (nftList.length > 2) {
            labelString += ' and Others'
        }

        labelString += ' for ' + chipTitle
    }
    usePluginWrapper(true)
    return (
        <Box className={classes.previewBoxOuter} padding={1}>
            <Box className={classes.previewBoxInner}>
                <Grid className={classes.previewBoxInnerGridContainer} padding={0}>
                    {previewImages}
                </Grid>
                <Chip className={classes.previewBoxInnerGridContainerChip} label={chipTitle} />
            </Box>
            <Grid container direction="column" justifyContent="center" alignItems="flex-start">
                <Grid item>
                    <Typography paddingTop={1} variant="subtitle1" className={classes.previewBoxInnerGridFooterTitle1}>
                        {labelString}
                    </Typography>
                </Grid>
            </Grid>
            <Grid container rowSpacing={1} columnSpacing={{ xs: 1, sm: 2, md: 3 }} className={classes.buttonWrapper}>
                <Grid item xs={6}>
                    <Button className={classes.button} onClick={sharePost} fullWidth size="small" variant="contained">
                        Share
                    </Button>
                </Grid>
                <Grid item xs={6}>
                    <Button className={classes.button} onClick={signOrder} fullWidth size="small" variant="contained">
                        Swap
                    </Button>
                </Grid>
            </Grid>
        </Box>
    )
}
