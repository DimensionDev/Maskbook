import { Button, DialogActions, DialogContent, Grid, Typography } from '@mui/material'
import { makeStyles, MaskDialog, useCustomSnackbar } from '@masknet/theme'
import { useRemoteControlledDialog } from '@masknet/shared-base-ui'
import { WalletMessages } from '@masknet/plugin-wallet'
import { META_KEY } from '../constants'
import { useCompositionContext } from '@masknet/plugin-infra/content-script'
import { useChainId, useAccount } from '@masknet/plugin-infra/web3'
import { type FungibleTokenDetailed, ChainId } from '@masknet/web3-shared-evm'
import { useState } from 'react'
import { useAsync } from 'react-use'
import { amountToWei } from '../helpers'
import { getTraderApi } from '../apis/nftswap'
import type { SwappableAsset } from '@traderxyz/nft-swap-sdk'
import { SelectTokenView } from './SelectTokenView'
import { PreviewOrderView } from './PreviewOrderView'
import NftListView from './components/NftListView'
import { useI18N } from '../locales/i18n_generated'
import urlcat from 'urlcat'
import { OPENSEA_API_KEY, isProxyENV } from '@masknet/web3-providers'

import type { OpenSeaToken, OpenSeaCollection, Token, AssetContract, PreviewNftList, nftData } from '../types'

import { isDashboardPage, isPopupPage } from '@masknet/shared-base'

interface nfts {
    tokenAddress: string
    tokenId: string
    type: string
}
interface orderInfo {
    nfts: nfts[] | undefined | null
    receiving_token: {
        tokenAddress: string | undefined
        amount: string
        type: string
    }
    preview_info: {
        nftMediaUrls: nftData[] | undefined
        receivingSymbol: {
            symbol: string | undefined
            amount: string
        }
    }
}

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
            background: theme.palette.mode === 'dark' ? '##D9D9D9' : '0F1419',
            marginTop: 24,
            fontSize: 14,
            fontWeight: 400,
            lineHeight: 2.5,
            paddingLeft: 35,
            color: theme.palette.mode === 'dark' ? '#0F1419' : '#ffffff',
            paddingRight: 35,
            width: '100%',
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
        paper: {
            width: '600px !important',
            maxWidth: 'none',
            boxShadow: 'none',
            backgroundImage: 'none',
            [`@media (max-width: ${theme.breakpoints.values.sm}px)`]: {
                display: 'block !important',
                margin: 12,
            },
        },
    }
})

const TradeComposeDialog: React.FC<Props> = ({ onClose, open }) => {
    const t = useI18N()

    // APP BASE VARS
    const isDashboard = isDashboardPage()
    const isPopup = isPopupPage()
    const { classes } = useStyles({ isDashboard, isPopup })
    const { showSnackbar } = useCustomSnackbar()

    /// SET PREVIEW STATES
    const [step1, setState1] = useState(true)
    const [step2, setState2] = useState(false)
    const [step3, setState3] = useState(false)
    const [previewNftList, setPreviewNftList] = useState<PreviewNftList[] | null>()
    const [count, setCount] = useState(0)
    const [openBd, setBdOpen] = useState(false)

    const selectedChainId = useChainId()
    const [token, setToken] = useState<FungibleTokenDetailed | null>()
    const [inputAmount, setInputAmount] = useState<string>('0')
    const [orderInfo, setOrderInfo] = useState<orderInfo>()
    const nftSwapSdk = getTraderApi(selectedChainId)
    const account = useAccount()
    const { attachMetadata, dropMetadata } = useCompositionContext()
    const { closeDialog: closeWalletStatusDialog } = useRemoteControlledDialog(
        WalletMessages.events.walletStatusDialogUpdated,
    )
    // #endregion

    useAsync(async () => {
        // declare the data fetching function
        const fetchNftData = async () => {
            const headers: HeadersInit =
                ChainId.Rinkeby === selectedChainId
                    ? { Accept: 'application/json' }
                    : { 'x-api-key': OPENSEA_API_KEY, Accept: 'application/json' }

            const url = urlcat(
                `https://${selectedChainId === ChainId.Rinkeby ? 'testnets-' : ''}api.opensea.io/api/v1/assets`,
                {
                    format: 'json',
                    limit: '50',
                    offset: 0,
                    owner: account,
                },
            )

            return fetch(url, {
                method: 'GET',
                headers: headers,
                ...(!isProxyENV() && { mode: 'cors' }),
            })
        }

        // call the function
        fetchNftData()
            .then(async (response) => {
                if (response.ok) {
                    const result = await response.json()

                    const asset_contract = [
                        ...new Set(
                            result.assets.map((ele: { asset_contract: AssetContract }) => ele.asset_contract.address),
                        ),
                    ]

                    const final = asset_contract.map((filteredAddress) => {
                        const t = result.assets
                            .filter((ele1: OpenSeaToken) => ele1.asset_contract.address === filteredAddress)
                            .map(function (ele2: Token) {
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
                            .filter(
                                (ele1: { asset_contract: AssetContract }) =>
                                    ele1.asset_contract.address === filteredAddress,
                            )
                            .map(function (ele2: { collection: OpenSeaCollection; asset_contract: AssetContract }) {
                                return {
                                    collection_name: ele2.collection.name,
                                    contract_address: ele2.asset_contract.address,
                                }
                            })

                        const rBoj: PreviewNftList = {
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
    }, [selectedChainId, account])

    //  on amount change in select token area
    const onAmountChange = (token: FungibleTokenDetailed, amount: string) => {
        setToken(token)
        setInputAmount(amount)
    }

    //  on NFT image click to select
    const handleSelection = (collection_index: number, item_index: number, type: string) => {
        const p = previewNftList
        p
            ? (p[collection_index].tokens[item_index].is_selected = !p[collection_index].tokens[item_index].is_selected)
            : p
        setPreviewNftList(p)
        setCount(count + 1) // This is the heck to re-render the whole view
    }

    //  Enable dynamic view section
    const setDisplaySection = (step1: boolean, step2: boolean, step3: boolean) => {
        setState1(step1)
        setState2(step2)
        setState3(step3)
    }

    //  Submit order to traderXYZ sdk
    const submitOrder = async () => {
        const assetsToSwapUserA = [orderInfo?.nfts, orderInfo?.receiving_token].flat(1)

        // Check if we need to approve the NFT for swapping
        const approvalStatusForUserA = await nftSwapSdk
            .loadApprovalStatus(assetsToSwapUserA[0] as SwappableAsset, account)
            .then(
                async (result) => {
                    if (!result.contractApproved) {
                        const approvalTx = await nftSwapSdk.approveTokenOrNftByAsset(
                            assetsToSwapUserA[0] as SwappableAsset,
                            account,
                        )
                        const approvalTxReceipt = await approvalTx.wait()
                        showSnackbar(
                            `Approved ${assetsToSwapUserA[0]?.tokenAddress} contract to swap with 0x (txHash: ${approvalTxReceipt?.transactionHash})`,
                            { variant: 'success' },
                        )
                    }
                    if (result.contractApproved) {
                        const order = nftSwapSdk.buildOrder(
                            orderInfo?.nfts as SwappableAsset[], // Maker asset(s) to swap
                            [orderInfo?.receiving_token] as SwappableAsset[], // Taker asset(s) to swap
                            account,
                        )
                        setBdOpen(true)
                        const signedOrder = await nftSwapSdk.signOrder(order, account).then(
                            (result) => {
                                setBdOpen(false)
                                showSnackbar(t.submit_order_signed_message(), { variant: 'success' })
                                const d = {
                                    assetsInfo: orderInfo,
                                    signedOrder: result,
                                }
                                attachMetadata(META_KEY, d)
                                closeWalletStatusDialog()
                                onClose()
                            },
                            function (error) {
                                setBdOpen(false)
                                showSnackbar(t.submit_order_submit_error_message() + error, { variant: 'error' })
                            },
                        )
                    }
                },
                function (error) {
                    showSnackbar(t.submit_order_submit_error_message() + error, { variant: 'error' })
                },
            )
    }

    const setPreviewOrderData = () => {
        // IN PREVIEW WE WILL GET LIST OF ALL SELECTED ASSETS AND SET THE FINAL ARRAY FOR SELL

        const selectedTokens = previewNftList
            ?.map((x) => x.tokens)
            .flat()
            .filter((p) => p?.is_selected)

        const nfts = selectedTokens?.map((y) => {
            return {
                tokenAddress: y?.asset_contract.address,
                tokenId: y?.token_id,
                type: y?.asset_contract.schema_name,
            }
        })

        const nftMediaInfo = selectedTokens?.map((y) => {
            return {
                image_preview_url: y?.image_preview_url,
                image_thumbnail_url: y?.image_thumbnail_url,
                nft_name: y?.name,
                nft_id: y?.token_id,
            }
        })

        const am = amountToWei(inputAmount, token ? token.decimals : 0)

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
    }

    const nextButtonSection = () => {
        /// fist we show continue section on step1

        if (step1) {
            const c = previewNftList
                ?.map((x) => x.tokens)
                .flat()
                .filter((p) => p?.is_selected).length

            return (
                <Button
                    variant="contained"
                    classes={{ root: classes.button }}
                    onClick={() => {
                        setDisplaySection(false, true, false)
                    }}
                    disabled={c === 0}>
                    {t.continue_btn()}
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
                    disabled={inputAmount === '0' || token?.address === null}>
                    {t.preview_btn()}
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
                    {t.approve_nft_btn()}
                </Button>
            )
        }

        return ''
    }

    const selectNftSection = () => {
        if (!step1) return
        return (
            <Grid container spacing={0} direction="column" justifyContent="space-between" alignItems="stretch">
                <Grid item style={{ paddingTop: '10px' }}>
                    <Typography variant="h5" className={classes.mainTitle}>
                        {t.select_nft_heading()}
                    </Typography>
                </Grid>
                <Grid item style={{ paddingTop: '10px' }}>
                    {/* <pre>{JSON.stringify(previewNftList, null, 2)}</pre> */}
                    <NftListView nftList={previewNftList} handleSelection={handleSelection} />
                </Grid>
            </Grid>
        )
    }

    const selectTokenSection = () => {
        if (!step2) return
        return (
            <Grid container spacing={0} direction="column" justifyContent="space-between" alignItems="stretch">
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
        return (
            <Grid container spacing={0} direction="column" justifyContent="space-between" alignItems="stretch">
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

    const onDecline = () => {
        dropMetadata(META_KEY)
        onClose()
    }

    return (
        <MaskDialog
            DialogProps={{ scroll: 'paper', classes: { paper: classes.paper } }}
            open={open}
            title={t.display_name()}
            onClose={onDecline}>
            <DialogContent>
                {selectNftSection()}
                {selectTokenSection()}
                {previewOrderSection()}
            </DialogContent>
            <DialogActions>{nextButtonSection()}</DialogActions>
        </MaskDialog>
    )
}

export default TradeComposeDialog
