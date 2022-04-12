import { makeStyles } from '@masknet/theme'
import { Grid, Button, Box, useTheme, Typography, Chip } from '@mui/material'
import type { PollMetaData } from './types'
import { getTraderApi } from './apis/nftswap'
import type { SwappableAsset } from '@traderxyz/nft-swap-sdk'
import { useAccount } from '@masknet/web3-shared-evm'
import { usePostInfo } from '../../../../packages/mask/src/components/DataSource/usePostInfo'
import { usePostLink } from '../../../../packages/mask/src/components/DataSource/usePostInfo'
import { useCustomSnackbar } from '@masknet/theme'

import { useI18N } from '../../../../packages/mask/src/utils/i18n-next-ui'
import { activatedSocialNetworkUI } from '../../../mask/src/social-network'
import { isTwitter } from '../../../mask/src/social-network-adaptor/twitter.com/base'
import { isFacebook } from '../../../mask/src/social-network-adaptor/facebook.com/base'

const useStyles = makeStyles()((theme, props) => ({
    actions: {
        alignSelf: 'center',
    },
    mainWrapper: {
        height: 400,
        borderRadius: 10,
        border: 1,
        borderColor: ` blue !important`,
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
// const { classes } = useStyles()
/* we will sign order */
/**
 * This page we use to fullfill order
 */

export function HelloWorld({ info }: { info: PollMetaData }) {
    const nftSwapSdk = getTraderApi()
    const account = useAccount()
    const { classes } = useStyles()
    const { t } = useI18N()
    const theme = useTheme()
    const { showSnackbar } = useCustomSnackbar()

    const p = usePostInfo()
    const l = usePostLink()

    const sharePost = () => {
        console.log('usePostInfo=', p)
        console.log('usePostLink=', l)
        console.log('postBy=', p?.url.getCurrentValue())
        showSnackbar('Order is Signed', { variant: 'success' })
        // activatedSocialNetworkUI.automation.nativeCompositionDialog?.appendText?.('text' + l, {
        //     recover: true,
        // })

        const shareLink = activatedSocialNetworkUI.utils
            .getShareLinkURL?.(
                [
                    `I just claimed.${
                        isTwitter(activatedSocialNetworkUI) || isFacebook(activatedSocialNetworkUI)
                            ? `Follow @${
                                  isTwitter(activatedSocialNetworkUI) ? t('twitter_account') : t('facebook_account')
                              } (mask.io) to claim airdrop.`
                            : ''
                    }`,
                    '#mask_io',
                    l,
                ].join('\n'),
            )
            .toString()
        console.log('usePostshareLink=', shareLink)
    }

    const signOrder = async () => {
        //WE CAN SET GAS LIMIT IF WE WANT
        const TransactionOverrides = {
            gasLimit: 10000000,
            gasPrice: 10000000000,
        }

        const approvalTxReceipt: any = ''

        const normalizeSignedOrder = nftSwapSdk.normalizeSignedOrder(info.signedOrder)

        console.log('normalizeSignedOrder=', normalizeSignedOrder)
        console.log('normalizeSignedOrder-assetsInfo=', info.assetsInfo)

        const MY_NFT = {
            tokenAddress: '0xee897a2c8637f27f9b8fb324e36361ef03ec7ae4', //MEOCAT3 NFT ON rinkeby
            tokenId: '2',
            type: 'ERC721',
        }

        const MY_NFT1 = {
            tokenAddress: '0xeE897A2c8637f27F9B8FB324E36361ef03ec7Ae4', //MEOCAT3 NFT ON rinkeby
            tokenId: '3',
            type: 'ERC721',
        }

        const RECEIVING_TOKEN = {
            tokenAddress: info.assetsInfo.receiving_token.tokenAddress, // WETH contract address
            amount: info.assetsInfo.receiving_token.amount, // 0.0001 WETH (WETH is 6 digits)
            type: info.assetsInfo.receiving_token.type,
        }

        // User A Trade Data
        // const walletAddressUserA = '0x3e4000C9e0f2F9CA5F26710360C06eC64E7a5Fd7'
        //const assetsToSwapUserA = [RECEIVING_TOKEN, MY_NFT, MY_NFT1]

        const walletAddressUserA = account
        const assetsToSwapUserA = [info.assetsInfo.receiving_token, ...info.assetsInfo.nfts]

        ///Check order status

        // Invalid = 0,
        // InvalidMakerAssetAmount = 1,
        // InvalidTakerAssetAmount = 2,
        // Fillable = 3,
        // Expired = 4,
        // FullyFilled = 5,
        // Cancelled = 6

        const orderStatus = await nftSwapSdk.getOrderStatus(normalizeSignedOrder)
        console.log('getOrderStatus1', orderStatus)

        if (orderStatus == 3) {
            //Fillable
            // Check if we need to approve the NFT for swapping
            const approvalStatusForUserA = await nftSwapSdk.loadApprovalStatus(
                assetsToSwapUserA[0] as SwappableAsset,
                walletAddressUserA,
            )

            console.log('swap-approved:', approvalStatusForUserA)
            //Check if buyer needs to approve the sell token contract or no
            if (!approvalStatusForUserA.contractApproved) {
                //If not approved
                const approvalTx = await nftSwapSdk.approveTokenOrNftByAsset(
                    assetsToSwapUserA[0] as SwappableAsset,
                    walletAddressUserA,
                )

                await approvalTx.wait().then(
                    (msg) =>
                        console.log(
                            `Approved ${assetsToSwapUserA[0].tokenAddress} contract to swap with 0x (txHash: ${approvalTxReceipt.transactionHash})`,
                        ),
                    (error) => console.log('swap error ', error),
                )
            }
            // fill order
            const fillTx = await nftSwapSdk
                .fillSignedOrder(normalizeSignedOrder, undefined, {
                    // HACK(johnnrjj) - Rinkeby still has protocol fees, so we give it a little bit of ETH so its happy.
                    value: '1000000000000000',
                })
                .then(
                    async (fillTx) => {
                        console.log('fillTx=', fillTx)
                        const fillTxReceipt = await nftSwapSdk.awaitTransactionHash(fillTx?.hash).then(
                            (fillTxReceipt) => {
                                console.log('fillTxReceipt=', fillTxReceipt)
                                if (fillTxReceipt.status != 0) {
                                    console.log(`🎉 🥳 Order filled. TxHash: ${fillTxReceipt?.transactionHash}`)
                                } else {
                                    console.log(`${fillTxReceipt?.transactionHash} failed`)
                                }
                            },
                            (error) => console.log('fillTxReceipterror=', error),
                        )
                    },
                    (error) => console.log('error=', error),
                )
        }

        if (orderStatus == 5) {
            //FullyFilled
            alert('Order is filled already')
        }

        if (orderStatus == 4) {
            //Expired
            alert('Order is Expired')
        }

        if (orderStatus == 6) {
            //Cancelled
            alert('Order is Cancelled')
        }

        if (orderStatus == 6) {
            //Cancelled
            alert('Order is Cancelled')
        }

        if (orderStatus == 0) {
            //Cancelled
            alert('Invalid Order')
        }

        if (orderStatus == 1) {
            //Cancelled
            alert('Invalid Maker Asset Amount')
        }

        if (orderStatus == 2) {
            //Cancelled
            alert('Invalid Taker Asset Amount')
        }
    }

    const previewArea = () => {
        const s = info.assetsInfo.preview_info

        const nftList = s.nftMediaUrls
        const previewImages = nftList.map((item: any, index: any) => {
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

        var labelString = ''

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
                        <Typography
                            paddingTop={1}
                            variant="subtitle1"
                            className={classes.previewBoxInnerGridFooterTitle1}>
                            {labelString}
                        </Typography>
                    </Grid>
                </Grid>
                <Grid
                    container
                    rowSpacing={1}
                    columnSpacing={{ xs: 1, sm: 2, md: 3 }}
                    className={classes.buttonWrapper}>
                    <Grid item xs={6}>
                        <Button
                            className={classes.button}
                            onClick={sharePost}
                            fullWidth
                            size="small"
                            variant="contained">
                            Share
                        </Button>
                    </Grid>
                    <Grid item xs={6}>
                        <Button
                            className={classes.button}
                            onClick={signOrder}
                            fullWidth
                            size="small"
                            variant="contained">
                            Swap
                        </Button>
                    </Grid>
                </Grid>
            </Box>
        )
    }
    return <>{previewArea()}</>
}

export function GlobalComponent() {
    return <Box position="fixed" top={233} left={233} children="Example Plugin" bgcolor="white" color="black" />
}

export function PluginDialog(props: { open: boolean; onClose: () => void }) {
    if (!props.open) return null
    // TODO: the ShadowRoot related items are in the shared package
    // TODO: but plugins should only rely on the plugin-infra package
    // TODO: so it's not possible to display a proper dialog in an isolated package
    return <h1 onClick={props.onClose}>Hi~</h1>
}
