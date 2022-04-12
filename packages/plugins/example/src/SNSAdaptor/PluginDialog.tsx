import {
    Button,
    Container,
    DialogActions,
    DialogContent,
    Grid,
    Typography,
    Accordion,
    AccordionSummary,
    AccordionDetails,
    TextField,
    Box,
    IconButton,
    Chip,
    Backdrop,
    CircularProgress,
} from '@mui/material'
import { InjectedDialog } from '../../../../../packages/mask/src/components/shared/InjectedDialog'
import { makeStyles, MaskColorVar, getMaskColor } from '@masknet/theme'

import { useRemoteControlledDialog } from '@masknet/shared'
import { useCustomSnackbar } from '@masknet/theme'
import { useI18N } from '../locales/i18n_generated'
import { META_KEY_2 } from '../constants'
import { useCompositionContext } from '@masknet/plugin-infra'
import { getTraderApi } from '../apis/nftswap'
import type { SwappableAsset } from '@traderxyz/nft-swap-sdk'
import { useEffect, useState, useCallback, useMemo } from 'react'
import { useAccount, useChainId, isZeroAddress, CurrencyType, formatCurrency } from '@masknet/web3-shared-evm'
import { getAssetsList } from '../../../../../packages/mask/src/plugins/Wallet/apis/opensea'
// /Users/Mac/Projects/wajid/Mask.io/Maskbook/packages/mask/src/plugins/Trader/SNSAdaptor/trader/InputTokenPanel.tsx
// /Users/Mac/Projects/wajid/Mask.io/Maskbook/packages/mask/src/plugins/Wallet/apis/opensea.ts
import { TokenPanelType } from '../../../../../packages/mask/src/plugins/Trader/types'
import type { FungibleTokenDetailed } from '@masknet/web3-shared-evm'
import { noop } from 'lodash-unified'
import { SelectTokenDialogEvent, WalletMessages } from '../../../../../packages/mask/src/plugins/Wallet/messages'
//import { v4 as uuid } from 'uuid'
import { useTokenPrice } from '../../../../../packages/mask/src/plugins/Wallet/hooks/useTokenPrice'
import BigNumber from 'bignumber.js'
import TreeView from '@mui/lab/TreeView'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import ChevronRightIcon from '@mui/icons-material/ChevronRight'
import TreeItem from '@mui/lab/TreeItem'
//import IconExpansionTreeView from './CustomView'
import TestComp from './TestComp'
import { FormattedBalance, SelectTokenChip, SelectTokenChipProps } from '@masknet/shared'
import { ChevronUpIcon, DropIcon } from '@masknet/icons'
import { FormattedCurrency, TokenIcon, WalletIcon } from '@masknet/shared'
import { ArrowBack } from '@mui/icons-material'
import { WalletStatusBox } from '../../../../../packages/mask/src/components/shared/WalletStatusBox'

interface Props {
    onClose: () => void
    open: boolean
    inputTokenBalance?: string
    currencyType?: CurrencyType
    inputToken?: FungibleTokenDetailed
    outputToken?: FungibleTokenDetailed
    onTokenChipClick?: (token: TokenPanelType) => void
}

const useStyles = makeStyles<{ isDashboard: boolean }>()((theme, { isDashboard }) => {
    return {
        filledInput: {
            borderRadius: 12,
            padding: 12,
            background: isDashboard ? MaskColorVar.primaryBackground2 : MaskColorVar.twitterInputBackground,
            border: `1px solid ${isDashboard ? MaskColorVar.lineLight : MaskColorVar.twitterBorderLine}`,
            position: 'relative',
        },
        input: {
            textAlign: 'right',
            fontWeight: 500,
            color: theme.palette.text.primary,
            lineHeight: '30px',
            fontSize: 24,
        },
        price: {
            fontSize: 14,
            lineHeight: '20px',
            position: 'absolute',
            top: 18,
            right: 12,
            color: isDashboard ? MaskColorVar.normalText : MaskColorVar.twitterSecond,
        },
        actions: {
            alignSelf: 'center',
        },
        root: {
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
        },
        reverseIcon: {
            cursor: 'pointer',
            color: isDashboard ? `${theme.palette.text.primary}!important` : undefined,
        },
        card: {
            backgroundColor: isDashboard ? MaskColorVar.primaryBackground2 : MaskColorVar.twitterInputBackground,
            border: `1px solid ${isDashboard ? MaskColorVar.lineLight : MaskColorVar.twitterBorderLine}`,
            borderRadius: 12,
            padding: 12,
        },
        balance: {
            fontSize: 14,
            lineHeight: '20px',
            color: theme.palette.text.primary,
        },
        amount: {
            marginLeft: 10,
        },

        reverse: {
            backgroundColor: isDashboard ? MaskColorVar.lightBackground : MaskColorVar.twitterInputBackground,
            width: 32,
            height: 32,
            borderRadius: 16,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            margin: '20px 0 16px 0',
        },
        chevron: {
            fill: 'none',
            stroke: theme.palette.text.primary,
            transition: 'all 300ms',
            cursor: 'pointer',
        },
        reverseChevron: {
            transform: `rotate(-180deg)`,
            transition: 'all 300ms',
        },
        status: {
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: 20,
        },
        label: {
            flex: 1,
            textAlign: 'left',
        },
        icon: {
            marginLeft: theme.spacing(0.5),
        },
        section: {
            width: '100%',
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
        selectedTokenChip: {
            borderRadius: `22px!important`,
            height: 'auto',
            backgroundColor: isDashboard ? MaskColorVar.input : MaskColorVar.twitterInput,
        },
        chipTokenIcon: {
            width: '28px!important',
            height: '28px!important',
        },
        controller: {
            width: '100%',
            paddingBottom: 16,
            // Just for design
            backgroundColor: isDashboard ? MaskColorVar.mainBackground : theme.palette.background.paper,
            position: 'sticky',
            bottom: -20,
        },
        noToken: {
            borderRadius: `18px !important`,
            backgroundColor: theme.palette.primary.main,
        },
        tooltip: {
            backgroundColor: theme.palette.mode === 'dark' ? '#ffffff' : '#000000',
            color: theme.palette.mode === 'dark' ? '#7B8192' : '#ffffff',
            borderRadius: 8,
            padding: 16,
            textAlign: 'left',
            fontSize: 16,
            lineHeight: '22px',
            fontWeight: 500,
        },
        tooltipArrow: {
            color: theme.palette.mode === 'dark' ? '#ffffff' : '#000000',
        },
        mainTitle: {
            color: theme.palette.mode === 'dark' ? '#ffffff' : '#000000',
        },
        walletInfo: {
            color: theme.palette.mode === 'dark' ? '#ffffff' : '#000000',
        },
        dropIcon: {
            width: 20,
            height: 24,
            fill: isDashboard ? theme.palette.text.primary : MaskColorVar.twitterButton,
        },
        connectWallet: {
            marginTop: 0,
        },
        slippageValue: {
            fontSize: 12,
            lineHeight: '16px',
            color: theme.palette.text.secondary,
        },
        paper: {
            width: '100%',
            color: theme.palette.mode === 'dark' ? '#ffffff' : '#000000',
            backgroundColor: `${getMaskColor(theme).twitterBackground} !important`,
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
        backBtn: {
            borderRadius: 99,
        },
        walletStatusBox: {
            margin: '0px auto',
        },
    }
})

// export function itemListComp() {
//     console.log('SetOfferFormOpen' + open)
//     return <div>hellp</div>
// }

interface Props2 {
    preparing: boolean

    startedAt: number
    fileSize: number
    sendSize: number
}

interface orderInfo {
    [key: string]: any // 👈️ index signature
    receiving_token: object
}

const PluginDialog: React.FC<Props> = ({
    onClose,
    open,
    inputToken,
    outputToken,
    inputTokenBalance,
    onTokenChipClick = noop,
    currencyType = CurrencyType.USD,
}) => {
    const chainId = useChainId()
    const t = useI18N()

    const { classes } = useStyles({ isDashboard: false })
    const { showSnackbar } = useCustomSnackbar()
    const [uploading, setUploading] = useState(false)
    const [count, setCount] = useState(0)
    const { attachMetadata, dropMetadata } = useCompositionContext()
    const { closeDialog: closeWalletStatusDialog } = useRemoteControlledDialog(
        WalletMessages.events.walletStatusDialogUpdated,
    )
    const nftSwapSdk = getTraderApi()
    const [signedOrderData, setSignedOrderData] = useState({})
    const account = useAccount()
    let nftList: any
    let setNftList: any
    ;[nftList, setNftList] = useState([])

    let setCollectionNftList: any
    let collectionNftList: any
    ;[collectionNftList, setCollectionNftList] = useState([])

    const [selectedAssets, setSelectedAssets] = useState([])
    const [orderInfo, setOrderInfo] = useState<orderInfo>()
    const [step1, setState1] = useState(true)
    const [step2, setState2] = useState(false)
    const [step3, setState3] = useState(false)
    const [openBd, setBdOpen] = useState(false)

    const [token, setToken] = useState<FungibleTokenDetailed>()
    const [id] = ''
    let approvalTxReceipt: any = ''
    const [inputAmount, setinputAmount] = useState('0')

    const { setDialog: setSelectTokenDialog } = useRemoteControlledDialog(
        WalletMessages.events.selectTokenDialogUpdated,
        useCallback(
            (ev: SelectTokenDialogEvent) => {
                if (ev.open || !ev.token) return
                setToken(ev.token)
            },
            [id],
        ),
    )

    const staticNftList: any = []

    const excludeTokens = [inputToken, outputToken].filter(Boolean).map((x) => x?.address) as string[]
    const [focusedTokenPanelType, setFocusedTokenPanelType] = useState(TokenPanelType.Input)

    const onTokenChipClick1 = useCallback(
        (type: TokenPanelType) => {
            setFocusedTokenPanelType(type)
            setSelectTokenDialog({
                chainId,
                open: true,
                uuid: String(type),
                disableNativeToken: false,
                FungibleTokenListProps: {
                    selectedTokens: excludeTokens,
                },
            })
        },
        [excludeTokens.join(), chainId],
    )

    ///TOKEN PRICE SET

    const tokenPrice = useTokenPrice(
        chainId,
        !isZeroAddress(token?.address) ? token?.address.toLowerCase() : undefined,
        currencyType,
    )

    console.log('useTokenPrice-chainId=', chainId)
    console.log('useTokenPrice-address=', token?.address)
    console.log('useTokenPrice-addressisZeroAddress=', isZeroAddress(token?.address))
    console.log('useTokenPrice-tokenPrice=', tokenPrice)

    // if (!token?.address && tokenPrice > 0) {
    //     var tokenPrice = 0
    // }

    const tokenValueUSD = useMemo(
        () => (inputAmount ? new BigNumber(inputAmount).times(tokenPrice).toFixed(2).toString() : '0'),
        [inputAmount, tokenPrice],
    )
    console.log('useTokenPrice-tokenValueUSD=', tokenValueUSD)

    useEffect(() => {
        function getERC721Tokens() {
            const c = getAssetsList(account, { chainId: 4 }).then(
                (result: any) => {
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
                                image_exist: any
                                asset_contract: any
                            }) {
                                return {
                                    id: ele2.id,
                                    token_id: ele2.token_id,
                                    name: ele2.name,
                                    image_preview_url: ele2.image_preview_url,
                                    image_thumbnail_url: ele2.image_thumbnail_url,
                                    is_selected: false,
                                    image_exist: false,
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

                    setCollectionNftList(final)
                },
                function (error) {
                    alert(error)
                },
            )
        }
        //to
        getERC721Tokens()
    }, [])

    function checkImage(url: any) {
        return new Promise((resolve, reject) => {
            resolve(true)
        })

        // var request = new XMLHttpRequest()
        // request.open('GET', url, true)
        // request.send()
        // request.onload = function () {
        //     console.log('request.status=', request.status)
        //     if (request.status == 200) {
        //     } else {
        //         url = 'https://trader.xyz/images/missing-img-lg.png'
        //     }
        // }

        // return url

        // if (url== null) {
        //     return 'https://trader.xyz/images/missing-img-lg.png'
        // } else {
        //     var request = new XMLHttpRequest()
        //     request.open('GET', url, true)
        //     request.send()
        //     request.onload = function () {
        //         console.log('request.status=', request.status)
        //         if (request.status == 200) {
        //             //if(statusText == OK)
        //             console.log('request.status-url=', url)

        //             return url
        //         } else {
        //             return 'https://trader.xyz/images/missing-img-lg.png'
        //         }
        //     }
        // }
    }

    const onInsert = () => {
        // var d = {
        //     assetsInfo: {
        //         nfts: [
        //             {
        //                 tokenAddress: '0x6dfcce32a12e11f08023050fd836c4de1ec201ed',
        //                 tokenId: '3',
        //                 type: 'ERC721',
        //             },
        //             {
        //                 tokenAddress: '0x6dfcce32a12e11f08023050fd836c4de1ec201ed',
        //                 tokenId: '1',
        //                 type: 'ERC721',
        //             },
        //         ],
        //         receiving_token: {
        //             tokenAddress: '0xc778417e063141139fce010982780140aa0cd5ab',
        //             amount: '100000000000000',
        //             type: 'ERC20',
        //         },
        //         preview_info: {
        //             nftMediaUrls: [
        //                 {
        //                     image_preview_url: null,
        //                     image_thumbnail_url: null,
        //                     nft_name: null,
        //                     nft_id: 6894604,
        //                 },
        //                 {
        //                     image_preview_url: null,
        //                     image_thumbnail_url: null,
        //                     nft_name: null,
        //                     nft_id: 6894602,
        //                 },
        //             ],
        //             receivingSymbol: {
        //                 symbol: 'WETH',
        //                 amount: '0.0001',
        //             },
        //         },
        //     },
        //     signedOrder: {
        //         makerAddress: '0xa896742137d98f4c89e68c5c7abaee147e711e4f',
        //         makerAssetAmount: '1',
        //         makerAssetData:
        //             '0x94cfcdd7000000000000000000000000000000000000000000000000000000000000004000000000000000000000000000000000000000000000000000000000000000a00000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000000000000000000000000000000000000000100000000000000000000000000000000000000000000000000000000000000010000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000000000000000000000000000000000000004000000000000000000000000000000000000000000000000000000000000000c00000000000000000000000000000000000000000000000000000000000000044025717920000000000000000000000006dfcce32a12e11f08023050fd836c4de1ec201ed0000000000000000000000000000000000000000000000000000000000000003000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000044025717920000000000000000000000006dfcce32a12e11f08023050fd836c4de1ec201ed000000000000000000000000000000000000000000000000000000000000000100000000000000000000000000000000000000000000000000000000',
        //         takerAddress: '0x0000000000000000000000000000000000000000',
        //         takerAssetAmount: '1',
        //         takerAssetData:
        //             '0x94cfcdd700000000000000000000000000000000000000000000000000000000000000400000000000000000000000000000000000000000000000000000000000000080000000000000000000000000000000000000000000000000000000000000000100000000000000000000000000000000000000000000000000005af3107a4000000000000000000000000000000000000000000000000000000000000000000100000000000000000000000000000000000000000000000000000000000000200000000000000000000000000000000000000000000000000000000000000024f47261b0000000000000000000000000c778417e063141139fce010982780140aa0cd5ab00000000000000000000000000000000000000000000000000000000',
        //         expirationTimeSeconds: '2524604400',
        //         senderAddress: '0x0000000000000000000000000000000000000000',
        //         feeRecipientAddress: '0xBCC02a155c374263321155555Ccf41070017649e',
        //         salt: '1647693998',
        //         makerFeeAssetData: '0x',
        //         takerFeeAssetData: '0x',
        //         makerFee: '0',
        //         takerFee: '0',
        //         signature:
        //             '0x1b291a050be50099f98b09d18de0de328830e7f2ab801203d91b303b74313c022c6018f0ba7509048f02bc57e1e9fbd976a81d13b4dbdb1ddecf7a11c4395cf1c402',
        //     },
        // }

        //we need to store the maker and taker assets along with info

        const d = {
            assetsInfo: orderInfo,
            signedOrder: signedOrderData,
        }
        attachMetadata(META_KEY_2, d)
        onClose()
    }

    const signOrder1 = async () => {
        //setBdOpen(false)
        showSnackbar('Order is Signed', { variant: 'success' })
        const d = {
            assetsInfo: orderInfo,
            signedOrder: signedOrderData,
        }
        attachMetadata(META_KEY_2, d)
        closeWalletStatusDialog()
        onClose()
        //setSignedOrderData(result)
        //handleClose()
    }

    const signOrder = async () => {
        // console.log('orderInfo=', orderInfo)

        // const MY_NFT = {
        //     tokenAddress: '0xeE897A2c8637f27F9B8FB324E36361ef03ec7Ae4', //MEOCAT2 NFT ON rinkeby
        //     tokenId: '2',
        //     type: 'ERC721',
        // }

        // const MY_NFT1 = {
        //     tokenAddress: '0xee897a2c8637f27f9b8fb324e36361ef03ec7ae4', //MEOCAT2 NFT ON rinkeby
        //     tokenId: '3',
        //     type: 'ERC721',
        // }

        // const SIXTY_NINE_USDC = {
        //     tokenAddress: '0xc778417e063141139fce010982780140aa0cd5ab', // WETH contract address
        //     amount: '100000000000000', // 0.0001 WETH (WETH is 6 digits)
        //     type: 'ERC20',
        // }

        // User A Trade Data
        //const walletAddressUserA = '0xa896742137d98F4C89E68C5c7aBaEe147e711E4F'
        const walletAddressUserA = account
        //const assetsToSwapUserA = [MY_NFT, MY_NFT1, SIXTY_NINE_USDC]

        const assetsToSwapUserA = [...orderInfo?.nfts, orderInfo?.receiving_token]

        console.log('assetsToSwapUser[0]=', assetsToSwapUserA)

        // Check if we need to approve the NFT for swapping
        const approvalStatusForUserA = await nftSwapSdk
            .loadApprovalStatus(assetsToSwapUserA[0] as SwappableAsset, walletAddressUserA)
            .then(
                async (result: { contractApproved: any }) => {
                    //             alert('fine')
                    console.log('approvalStatusForUserA=', result)
                    if (!result.contractApproved) {
                        const approvalTx = await nftSwapSdk.approveTokenOrNftByAsset(
                            assetsToSwapUserA[0] as SwappableAsset,
                            walletAddressUserA,
                        )
                        approvalTxReceipt = await approvalTx.wait()
                        // console.log(
                        //     `Approved ${assetsToSwapUserA[0].tokenAddress} contract to swap with 0x (txHash: ${approvalTxReceipt?.transactionHash})`,
                        // )
                    }
                    if (result.contractApproved) {
                        const order = nftSwapSdk.buildOrder(
                            [...orderInfo?.nfts] as SwappableAsset[], // Maker asset(s) to swap
                            [orderInfo?.receiving_token] as SwappableAsset[], // Taker asset(s) to swap
                            walletAddressUserA,
                        )
                        setBdOpen(true)
                        const signedOrder = await nftSwapSdk.signOrder(order, walletAddressUserA).then(
                            (result: any) => {
                                setBdOpen(false)
                                showSnackbar('Order is Signed', { variant: 'success' })
                                //console.log('Order is Signed=', result) //
                                //setSignedOrderData(result)
                                const d = {
                                    assetsInfo: orderInfo,
                                    signedOrder: result,
                                }
                                attachMetadata(META_KEY_2, d)
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

        // Check if we need to approve the NFT for swapping
        // const approvalStatusForUserA = await nftSwapSdk
        //     .loadApprovalStatus(assetsToSwapUserA[0] as SwappableAsset, walletAddressUserA)
        //     .then(
        //         async (result: { contractApproved: any }) => {
        //             alert('fine')
        //             console.log(result)
        //             // If we do need to approve User A's CryptoPunk for swapping, let's do that now
        //             if (!result.contractApproved) {
        //                 const approvalTx = await nftSwapSdk.approveTokenOrNftByAsset(
        //                     assetsToSwapUserA[0] as SwappableAsset,
        //                     walletAddressUserA,
        //                 )
        //                 const approvalTxReceipt = await approvalTx.wait()
        //                 console.log(
        //                     `Approved ${assetsToSwapUserA[0].tokenAddress} contract to swap with 0x (txHash: ${approvalTxReceipt.transactionHash})`,
        //                 )

        //                 const order = nftSwapSdk.buildOrder(
        //                     [MY_NFT] as SwappableAsset[], // Maker asset(s) to swap
        //                     [SIXTY_NINE_USDC] as SwappableAsset[], // Taker asset(s) to swap
        //                     walletAddressUserA,
        //                 )
        //                 const signedOrder = await nftSwapSdk.signOrder(order, walletAddressUserA).then(
        //                     (result: any) => {
        //                         alert('Singend')
        //                         console.log(result) //
        //                         setSignedOrderData(result)
        //                         //here we will encode the string to the data to the scema and ecrypt and share it on the social media
        //                     },
        //                     function (error: any) {
        //                         alert(error)
        //                     },
        //                 )
        //             }
        //         },
        //         function (error: any) {
        //             alert(error)
        //         },
        //     )

        // If we do need to approve User A's CryptoPunk for swapping, let's do that now
        // if (!approvalStatusForUserA.contractApproved) {
        //     // const approvalTx = await nftSwapSdk.approveTokenOrNftByAsset(
        //     //     assetsToSwapUserA[0] as SwappableAsset,
        //     //     walletAddressUserA,
        //     // )
        //     // const approvalTxReceipt = await approvalTx.wait()
        //     // console.log(
        //     //     `Approved ${assetsToSwapUserA[0].tokenAddress} contract to swap with 0x (txHash: ${approvalTxReceipt.transactionHash})`,
        //     // )
        // }

        // Create the order (Remember, User A initiates the trade, so User A creates the order)
        //const order = nftSwapSdk.buildOrder(assetsToSwapUserA, assetsToSwapUserB, walletAddressUserA)
    }

    const getSelectedAssetStatus = (item: any) => {
        const s: any = selectedAssets.filter((x: any) => x.id == item.id)
        console.log('s=', s)
        return s.id
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
        //IN PREVIEW WE WILL GET LIST OF ALL SELECTED ASSETS AND SET THE FINAL ARRAY FOR SELL

        const nfts = collectionNftList
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

        const nftMediaInfo = collectionNftList
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
        setNftList(nftMediaInfo)

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

    const handleSelection = (collection_index: number, item_index: number, type: string) => {
        if (type != 'image') {
            collectionNftList[collection_index].tokens[item_index].is_selected =
                !collectionNftList[collection_index].tokens[item_index].is_selected
        }

        if (type == 'image') {
            collectionNftList[collection_index].tokens[item_index].image_exist = false
            console.log('collection_index=', collection_index, 'item_index=', item_index, 'image_exist=', false)
        }
        setCollectionNftList(collectionNftList)
        setCount(count + 1)
    }

    const setDisplaySection = (step1: boolean, step2: boolean, step3: boolean) => {
        setState1(step1)
        setState2(step2)
        setState3(step3)
    }

    const nextButtonSection = () => {
        ///fist we show continue section on step1

        if (step1) {
            const c = collectionNftList
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
                    // disabled={tokenValueUSD == '0.00' || chainId == 4}
                >
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
                        signOrder()
                    }}
                    // disabled={tokenValueUSD == '0.00' || chainId == 4}
                >
                    Approve your NFT
                </Button>
            )
        }

        return ''
    }

    const previewArea = () => {
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

        var labelString = ''

        if (nftList.length > 0) {
            labelString = `Buy ${nftList[0].nft_name} (#${nftList[0].nft_id})`

            if (nftList.length == 2) {
                labelString += ` and ${nftList[1].nft_name} (#${nftList[1].nft_id})`
            }

            if (nftList.length > 2) {
                labelString += ' and Others'
            }
        }

        return (
            <Box className={classes.previewBoxOuter} padding={1}>
                <Box className={classes.previewBoxInner}>
                    <Grid className={classes.previewBoxInnerGridContainer} padding={0}>
                        {previewImages}
                    </Grid>
                    <Chip
                        className={classes.previewBoxInnerGridContainerChip}
                        label={formatCurrency(tokenValueUSD, '$')}
                    />
                </Box>
                <Grid container direction="column" justifyContent="center" alignItems="flex-start">
                    <Grid item>
                        <Typography
                            paddingTop={1}
                            variant="subtitle1"
                            className={classes.previewBoxInnerGridFooterTitle1}>
                            {labelString}
                        </Typography>
                        <Typography
                            paddingBottom={1}
                            variant="subtitle2"
                            className={classes.previewBoxInnerGridFooterTitle2}>
                            Waiting for your confirmation
                        </Typography>
                    </Grid>
                </Grid>
            </Box>
        )
    }

    const handleClose = () => {
        setBdOpen(false)
        showSnackbar('Order is Signed', { variant: 'success' })
    }
    const handleToggle = () => {
        setBdOpen(!openBd)
    }

    const onDecline = () => {
        onClose()

        dropMetadata(META_KEY_2)
        setCollectionNftList([])
        setNftList([])
        setOrderInfo({ receiving_token: [] })
        setState1(true)
        setState2(false)
        setState3(false)
        setinputAmount('0')
    }

    return (
        <InjectedDialog open={open} title={t.__display_name()} onClose={onDecline}>
            <DialogContent style={{ minWidth: 250, height: 'inherit', minHeight: 420 }}>
                {/* <pre>{JSON.stringify(collectionNftList, null, 2)}</pre> */}
                <Container maxWidth="sm">
                    <Button onClick={handleToggle}>Show backdrop</Button>
                    <Backdrop
                        sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }}
                        open={openBd}
                        onClick={handleClose}>
                        <CircularProgress color="inherit" />
                    </Backdrop>
                    <Grid
                        container
                        spacing={5}
                        direction="column"
                        justifyContent="space-between"
                        alignItems="stretch"
                        style={{ display: step1 ? 'block' : 'none' }}>
                        <Grid item className={classes.walletStatusBox}>
                            <WalletStatusBox />
                        </Grid>
                        <Grid item style={{ paddingTop: '10px' }}>
                            <Typography variant="h4" className={classes.mainTitle}>
                                What do you want to sell??
                            </Typography>
                        </Grid>
                        <Grid item style={{ paddingTop: '10px' }}>
                            <TestComp nftList={collectionNftList} handleSelection={handleSelection} />
                        </Grid>
                    </Grid>

                    {/* ///Section for the asset that user want to receive in exachange of NFT  */}
                    <Grid
                        container
                        spacing={5}
                        direction="column"
                        justifyContent="space-between"
                        alignItems="stretch"
                        style={{ display: step2 ? 'block' : 'none' }}>
                        <Grid item>
                            <Grid container spacing={2} direction="row" justifyContent="flex-start" alignItems="center">
                                <Grid item>
                                    <IconButton
                                        size="large"
                                        color="inherit"
                                        sx={{ marginRight: '8px' }}
                                        aria-label="back"
                                        className={classes.backBtn}
                                        onClick={() => {
                                            setDisplaySection(true, false, false)
                                        }}>
                                        <ArrowBack />
                                    </IconButton>
                                </Grid>
                                <Grid item xs={10}>
                                    <Typography variant="h4" className={classes.mainTitle}>
                                        What do you want to receive?
                                    </Typography>
                                </Grid>
                            </Grid>
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                type="text"
                                variant="filled"
                                value={inputAmount}
                                onChange={(a: any) => {
                                    console.log(a)
                                    setinputAmount(a.target.value)
                                }}
                                InputProps={{
                                    className: classes.filledInput,
                                    disableUnderline: true,
                                    startAdornment: (
                                        <Box
                                            sx={{
                                                display: 'flex',
                                                flexDirection: 'column',
                                                justifyContent: 'center',
                                                alignItems: 'flex-start',
                                            }}>
                                            <SelectTokenChip
                                                classes={{
                                                    chip: classes.selectedTokenChip,
                                                    tokenIcon: classes.chipTokenIcon,
                                                    noToken: classes.noToken,
                                                }}
                                                token={token}
                                                ChipProps={{
                                                    onClick: () => onTokenChipClick1(TokenPanelType.Output),
                                                    deleteIcon: (
                                                        <DropIcon
                                                            className={classes.dropIcon}
                                                            style={{ fill: !outputToken ? '#ffffff' : undefined }}
                                                        />
                                                    ),
                                                    onDelete: noop,
                                                }}
                                            />
                                        </Box>
                                    ),
                                    endAdornment: (
                                        <Typography className={classes.price}>
                                            ≈{' '}
                                            <FormattedCurrency
                                                value={tokenValueUSD}
                                                sign="$"
                                                formatter={formatCurrency}
                                            />
                                        </Typography>
                                    ),
                                }}
                                inputProps={{ className: classes.input }}
                            />
                        </Grid>
                    </Grid>

                    {/* ///Preview section  */}
                    <Grid
                        container
                        spacing={5}
                        direction="column"
                        justifyContent="space-between"
                        alignItems="stretch"
                        style={{ display: step3 ? 'block' : 'none' }}>
                        <Grid item>
                            <Grid container spacing={2} direction="row" justifyContent="flex-start" alignItems="center">
                                <Grid item>
                                    <IconButton
                                        aria-label="go back"
                                        className={classes.backBtn}
                                        onClick={() => {
                                            setDisplaySection(false, true, false)
                                        }}>
                                        <ArrowBack />
                                    </IconButton>
                                </Grid>
                                <Grid item xs={10}>
                                    <Typography variant="h4" className={classes.mainTitle}>
                                        Confirm and Share
                                    </Typography>
                                </Grid>
                                <Grid item xs={12}>
                                    <Typography variant="h6" className={classes.mainTitle}>
                                        Ready to checkout! Take a final look to confirm your order?
                                    </Typography>
                                </Grid>
                            </Grid>
                        </Grid>
                        <Grid item xs={12}>
                            {previewArea()}
                        </Grid>
                    </Grid>
                </Container>
            </DialogContent>

            <DialogActions classes={{ root: classes.actions }}>
                {nextButtonSection()}
                <Button onClick={signOrder}>Sign Order Me</Button>
                {/* <Button variant="contained" classes={{ root: classes.button }} onClick={onInsert}>
                    {t.on_insert()}
                </Button> */}
            </DialogActions>
        </InjectedDialog>
    )
}

export default PluginDialog
