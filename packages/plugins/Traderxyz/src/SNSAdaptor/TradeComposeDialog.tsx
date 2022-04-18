/* eslint-disable eqeqeq */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { Button, DialogActions, DialogContent, Grid, Typography } from '@mui/material'
import { makeStyles, MaskDialog, useCustomSnackbar } from '@masknet/theme'
import { useRemoteControlledDialog } from '@masknet/shared-base-ui'
import { WalletMessages } from '../../../../../packages/mask/src/plugins/Wallet/messages'

import { META_KEY } from '../constants'
import { useCompositionContext } from '@masknet/plugin-infra/content-script'
import { useChainId, useAccount } from '@masknet/plugin-infra/web3'
import { type FungibleTokenDetailed, ChainId } from '@masknet/web3-shared-evm'
import { useEffect, useState } from 'react'
// import { getNftList } from '../helpers'
import { getTraderApi } from '../apis/nftswap'
import type { SwappableAsset } from '@traderxyz/nft-swap-sdk'
import { SelectTokenView } from './SelectTokenView'
import { PreviewOrderView } from './PreviewOrderView'

export enum TokenPanelType {
    Input = 0,
    Output = 1,
}

interface orderInfo {
    [key: string]: any
    receiving_token: object
}

/** todo*/
export function isProxyENV() {
    try {
        return process.env.PROVIDER_API_ENV === 'proxy'
    } catch {
        return false
    }
}

export const OPENSEA_API_KEY = 'c38fe2446ee34f919436c32db480a2e3'

// import { OPENSEA_API_KEY, isProxyENV } from '@masknet/web3-providers'
// import { OPENSEA_API_KEY } from '../../../../web3-providers/src/opensea/constants'
// import { isProxyENV } from '../../../../web3-providers/src/helpers'

import { isDashboardPage, isPopupPage } from '@masknet/shared-base'
import NftListView from './components/NftListView'

interface Props {
    onClose: () => void
    open: boolean
}

const useStyles = makeStyles<{ isDashboard: boolean; isPopup: boolean }>()((theme, { isDashboard, isPopup }) => {
    return {
        mainTitle: {
            color: theme.palette.mode === 'dark' ? '#ffffff' : '#000000',
        },
        dropIcon: {
            width: 20,
            height: 24,
            fill: isDashboard ? theme.palette.text.primary : theme.palette.text.secondary,
        },
        button: {
            borderRadius: 26,
            background: '#D9D9D9',
            marginTop: 24,
            fontSize: 14,
            fontWeight: 400,
            lineHeight: 2.5,
            paddingLeft: 35,
            color: '#0F1419',
            paddingRight: 35,
            width: '563px',
        },
        disabledButton: {
            borderRadius: 26,
            width: '563px',
            background: '#D9D9D9',
            color: '#0F1419',
            opacity: '0.5',
            marginTop: 24,
            fontSize: 14,
            fontWeight: 400,
            lineHeight: 2.5,
            paddingLeft: 35,
            paddingRight: 35,
        },
        backBtn: {
            borderRadius: 99,
        },
        previewBoxOuter: {
            boxShadow: 'rgb(0 0 0 / 4%) 0px 6px 40px, rgb(0 0 0 / 2%) 0px 3px 6px',
            background: theme.palette.mode === 'dark' ? '#1D2933' : 'rgb(255, 255, 255)',
            width: '100%',
            border: '0px solid blue',
            borderRadius: 16,
            height: '250px',
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
            height: '172px',
            border: '0px solid green',
            background: 'transparent',
            borderRadius: '10px',
            width: 'inherit',
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
            left: '74%',
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
    }
})

// const { onClose, open } = props
// const { onClose, open } = props
const TradeComposeDialog: React.FC<Props> = ({ onClose, open }) => {
    // APP BASE VARS
    const isDashboard = isDashboardPage()
    const isPopup = isPopupPage()
    const { classes } = useStyles({ isDashboard, isPopup })
    const { showSnackbar } = useCustomSnackbar()

    /// SET PREVIEW STATES
    const [step1, setState1] = useState(true)
    const [step2, setState2] = useState(false)
    const [step3, setState3] = useState(false)
    let setPreviewNftList: any
    let previewNftList: any
    ;[previewNftList, setPreviewNftList] = useState([])
    const [count, setCount] = useState(0)
    const [openBd, setBdOpen] = useState(false)

    const selectedChainId = useChainId()
    // console.log('selectedChainId=', selectedChainId)
    const [token, setToken] = useState<FungibleTokenDetailed | null>()
    const [inputAmount, setInputAmount] = useState<string>('0')
    const [orderInfo, setOrderInfo] = useState<orderInfo>()
    const nftSwapSdk = getTraderApi()
    const account = useAccount()
    const { attachMetadata, dropMetadata } = useCompositionContext()
    const { closeDialog: closeWalletStatusDialog } = useRemoteControlledDialog(
        WalletMessages.events.walletStatusDialogUpdated,
    )
    // #endregion

    useEffect(() => {
        // // declare the data fetching function
        const fetchData1 = async () => {
            const headers: HeadersInit =
                ChainId.Rinkeby === selectedChainId
                    ? { Accept: 'application/json' }
                    : { 'x-api-key': OPENSEA_API_KEY, Accept: 'application/json' }

            // eslint-disable-next-line no-return-await
            return await fetch(
                `https://${
                    selectedChainId === ChainId.Rinkeby ? 'rinkeby-' : ''
                }api.opensea.io/api/v1/assets?format=json&limit=50&offset=0&owner=${account}`,
                {
                    method: 'GET',
                    headers: headers,
                    ...(!isProxyENV() && { mode: 'cors' }),
                },
            )
        }

        // call the function
        fetchData1()
            .then(async (response) => {
                if (response.ok) {
                    const result = await response.json()
                    console.log('result=', result)

                    const asset_contract = [
                        ...new Set(
                            result.assets.map(
                                (ele: { asset_contract: { address: any } }) => ele.asset_contract.address,
                            ),
                        ),
                    ]

                    const final = asset_contract.map((ele: any) => {
                        const t = result.assets
                            .filter((ele1: { asset_contract: { address: any } }) => ele1.asset_contract.address == ele)
                            .map(function (ele2: {
                                id: any
                                token_id: any
                                name: any
                                image_preview_url: any
                                image_thumbnail_url: any
                                is_selected: any
                                asset_contract: any
                            }) {
                                return {
                                    id: ele2.id,
                                    token_id: ele2.token_id,
                                    name: ele2.name,
                                    image_preview_url: ele2.image_preview_url,
                                    image_thumbnail_url: ele2.image_thumbnail_url,
                                    is_selected: false,
                                    asset_contract: ele2.asset_contract,
                                }
                            })

                        const r = result.assets
                            .filter((ele1: { asset_contract: { address: any } }) => ele1.asset_contract.address == ele)
                            .map(function (ele2: { collection: { name: any }; asset_contract: { address: any } }) {
                                return {
                                    collection_name: ele2.collection.name,
                                    contract_address: ele2.asset_contract.address,
                                }
                            })

                        const rBoj = {
                            ...r[0],
                            tokens: t,
                        }
                        return rBoj
                    })

                    setPreviewNftList(final)
                }
                return true
            })
            .catch(console.error)
    }, [selectedChainId])

    const onAmountChange = (token: FungibleTokenDetailed, amount: string) => {
        setToken(token)
        setInputAmount(amount)
        console.log('onAmountChange-token=', token)
        console.log('onAmountChange-amount=', amount)
    }

    const handleSelection = (collection_index: number, item_index: number, type: string) => {
        previewNftList[collection_index].tokens[item_index].is_selected =
            !previewNftList[collection_index].tokens[item_index].is_selected

        console.log('collection_index=', collection_index, 'item_index=', item_index)

        setPreviewNftList(previewNftList)
        setCount(count + 1)
    }

    const setDisplaySection = (step1: boolean, step2: boolean, step3: boolean) => {
        setState1(step1)
        setState2(step2)
        setState3(step3)
    }

    const submitOrder = async () => {
        const assetsToSwapUserA = [...orderInfo?.nfts, orderInfo?.receiving_token]

        console.log('assetsToSwapUser[0]=', assetsToSwapUserA)

        // Check if we need to approve the NFT for swapping
        const approvalStatusForUserA = await nftSwapSdk
            .loadApprovalStatus(assetsToSwapUserA[0] as SwappableAsset, account)
            .then(
                async (result: { contractApproved: any }) => {
                    //             alert('fine')
                    console.log('approvalStatusForUserA=', result)
                    if (!result.contractApproved) {
                        const approvalTx = await nftSwapSdk.approveTokenOrNftByAsset(
                            assetsToSwapUserA[0] as SwappableAsset,
                            account,
                        )
                        const approvalTxReceipt = await approvalTx.wait()
                        showSnackbar(
                            `Approved ${assetsToSwapUserA[0].tokenAddress} contract to swap with 0x (txHash: ${approvalTxReceipt?.transactionHash})`,
                            { variant: 'success' },
                        )
                        // console.log(
                        //     `Approved ${assetsToSwapUserA[0].tokenAddress} contract to swap with 0x (txHash: ${approvalTxReceipt?.transactionHash})`,
                        // )
                    }
                    if (result.contractApproved) {
                        const order = nftSwapSdk.buildOrder(
                            [...orderInfo?.nfts] as SwappableAsset[], // Maker asset(s) to swap
                            [orderInfo?.receiving_token] as SwappableAsset[], // Taker asset(s) to swap
                            account,
                        )
                        setBdOpen(true)
                        const signedOrder = await nftSwapSdk.signOrder(order, account).then(
                            (result: any) => {
                                setBdOpen(false)
                                showSnackbar('Order is Signed', { variant: 'success' })
                                // console.log('Order is Signed=', result) //
                                // setSignedOrderData(result)
                                const d = {
                                    assetsInfo: orderInfo,
                                    signedOrder: result,
                                }
                                attachMetadata(META_KEY, d)
                                closeWalletStatusDialog()
                                onClose()
                            },
                            function (error: any) {
                                setBdOpen(false)
                                showSnackbar('Order has error:' + error, { variant: 'error' })
                            },
                        )
                    }
                },
                function (error) {
                    showSnackbar('Order has error:' + error, { variant: 'error' })
                },
            )
    }

    function strtodec(amount: any, dec: any) {
        let i = 0
        if (amount.toString().indexOf('.') != -1) {
            i = amount.toString().length - (amount.toString().indexOf('.') + 1)
        }
        let stringf = (amount.toString().split('.').join('') * 1).toString()

        if (dec < i) {
            console.warn('strtodec: amount was truncated')
            stringf = stringf.substring(0, stringf.length - (i - dec))
        } else {
            stringf = stringf + '0'.repeat(dec - i)
        }
        return stringf
    }

    const setPreviewOrderData = () => {
        // IN PREVIEW WE WILL GET LIST OF ALL SELECTED ASSETS AND SET THE FINAL ARRAY FOR SELL

        const nfts = previewNftList
            .map((x: { tokens: any }) => x.tokens)
            .flat()
            .filter((p: { is_selected: any }) => p.is_selected)
            .map((y: { asset_contract: { address: any; schema_name: any }; token_id: any }) => {
                return {
                    tokenAddress: y.asset_contract.address,
                    tokenId: y.token_id,
                    type: y.asset_contract.schema_name,
                }
            })

        const nftMediaInfo = previewNftList
            .map((x: { tokens: any }) => x.tokens)
            .flat()
            .filter((p: { is_selected: any }) => p.is_selected)
            .map((y: { image_preview_url: string; image_thumbnail_url: string; name: string; token_id: number }) => {
                return {
                    image_preview_url: y.image_preview_url,
                    image_thumbnail_url: y.image_thumbnail_url,
                    nft_name: y.name,
                    nft_id: y.token_id,
                }
            })

        console.log('previewOrder-nfts=', nfts)

        const am = strtodec(inputAmount, token?.decimals)

        const previewInfo = {
            nftMediaUrls: nftMediaInfo,
            receivingSymbol: {
                symbol: token?.symbol,
                amount: inputAmount,
            },
        }

        const receivingToken = {
            tokenAddress: token?.address.toLowerCase(), // WETH contract address
            amount: am, // 0.0001 WETH (WETH is 6 digits)
            type: 'ERC20',
        }

        const orderInfo = {
            nfts: nfts,
            receiving_token: receivingToken,
            preview_info: previewInfo,
        }

        setOrderInfo(orderInfo)

        console.log('previewOrder-tokens=', receivingToken)
        console.log('previewOrder-orderInfo=', orderInfo)
    }

    const nextButtonSection = () => {
        /// fist we show continue section on step1

        if (step1) {
            const c = previewNftList
                .map((x: { tokens: any }) => x.tokens)
                .flat()
                .filter((p: { is_selected: any }) => p.is_selected)

            return (
                <Button
                    variant="contained"
                    classes={{ root: classes.button }}
                    onClick={() => {
                        setDisplaySection(false, true, false)
                    }}
                    disabled={c.length == 0}>
                    Continue
                </Button>
            )
        }

        if (step2) {
            return (
                <Button
                    variant="contained"
                    classes={{ root: classes.button }}
                    onClick={() => {
                        setDisplaySection(false, false, true), setPreviewOrderData()
                    }}
                    disabled={inputAmount == '0' || token?.address == null}>
                    Preview
                </Button>
            )
        }

        if (step3) {
            return (
                <Button
                    variant="contained"
                    classes={{ root: classes.button }}
                    onClick={() => {
                        submitOrder()
                    }}
                    // disabled={tokenValueUSD == '0.00' || chainId == 4}
                >
                    Approve your NFT
                </Button>
            )
        }

        return ''
    }

    const selectNftSection = () => {
        return (
            <Grid
                container
                spacing={0}
                direction="column"
                justifyContent="space-between"
                alignItems="stretch"
                style={{ display: step1 ? 'block' : 'none' }}>
                <Grid item style={{ paddingTop: '10px' }}>
                    <Typography variant="h5" className={classes.mainTitle}>
                        What do you want to sell??
                    </Typography>
                </Grid>
                <Grid item style={{ paddingTop: '10px' }}>
                    {/* <pre>{JSON.stringify(previewNftList, null, 2)}</pre> */}
                    <NftListView nftList={previewNftList} handleSelection={handleSelection} />
                </Grid>
            </Grid>
        )
    }

    const selecTokenSection = () => {
        return (
            <Grid
                container
                spacing={0}
                direction="column"
                justifyContent="space-between"
                alignItems="stretch"
                style={{ display: step2 ? 'block' : 'none' }}>
                <Grid item style={{ paddingTop: '10px' }}>
                    <SelectTokenView
                        classes={classes}
                        chainId={selectedChainId}
                        setDisplaySection={setDisplaySection}
                        inputToken={token}
                        inputTokenAmount={inputAmount}
                        onAmountChange={onAmountChange}
                    />
                </Grid>
            </Grid>
        )
    }

    const previewOrderSection = () => {
        if (!step3) return
        const amountLabel =
            orderInfo?.preview_info?.receivingSymbol?.amount + ' ' + orderInfo?.preview_info?.receivingSymbol?.symbol
        const m = orderInfo?.preview_info?.nftMediaUrls
        console.log('nftList=', m)
        return (
            <Grid
                container
                spacing={0}
                direction="column"
                justifyContent="space-between"
                alignItems="stretch"
                style={{ display: step3 ? 'block' : 'none' }}>
                <Grid item style={{ paddingTop: '10px' }}>
                    <PreviewOrderView
                        classes={classes}
                        setDisplaySection={setDisplaySection}
                        nftList={m}
                        amountLabel={amountLabel}
                    />
                </Grid>
            </Grid>
        )
    }

    return (
        <MaskDialog open={open} title="Traderxyz" onClose={onClose}>
            <DialogContent>
                {selectNftSection()}
                {selecTokenSection()}
                {previewOrderSection()}
            </DialogContent>
            <DialogActions>{nextButtonSection()}</DialogActions>
        </MaskDialog>
    )
}

export default TradeComposeDialog
