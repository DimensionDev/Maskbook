import { makeStyles, useStylesExtends } from '@masknet/theme'
import { AllProviderTradeContext } from '../../trader/useAllProviderTradeContext'
// import { useChainId } from '@masknet/plugin-infra'
import { Typography, Button, Card } from '@mui/material'
import { NetworkType } from '@masknet/public-api'
import { useAsync, useUnmount, useUpdateEffect } from 'react-use'
import Services from '../../../../extension/service'
import { useEffect, useState, useCallback, useRef } from 'react'
import type { SwappableAsset } from '@traderxyz/nft-swap-sdk'
import { first, uniqBy } from 'lodash-unified'
import { JsonRpcProvider, JsonRpcSigner, Web3Provider } from '@ethersproject/providers'
import { useProvider } from '../../../EVM/hooks/useProvider'
import { getAssetsList } from '../../../Wallet/apis/opensea'
import { usePostLink } from '../../../../components/DataSource/usePostInfo'
import { useLastRecognizedIdentity } from '../../../../components/DataSource/useActivatedUI'
import type { TypedMessage } from '@masknet/shared-base'
import { ProfileIdentifier } from '@masknet/shared-base'
import { unreachable } from '@dimensiondev/kit'
import { MaskMessages, useI18N } from '../../../../utils'

import { isFacebook } from '../../../../social-network-adaptor/facebook.com/base'
import { isTwitter } from '../../../../social-network-adaptor/twitter.com/base'
import { useCompositionContext } from '@masknet/plugin-infra'

import {
    getRPCConstants,
    ChainId,
    createERC20Token,
    createNativeToken,
    EthereumTokenType,
    formatBalance,
    formatGweiToWei,
    FungibleTokenDetailed,
    GasOptionConfig,
    getNetworkTypeFromChainId,
    isSameAddress,
    TransactionStateType,
    useChainId,
    useERC721Tokens,
    useChainIdValid,
    useFungibleTokenBalance,
    useProviderType,
    useTokenConstants,
    useAccount,
    useWallet,
    useERC20Tokens,
    getChainRPC,
    useWeb3,
} from '@masknet/web3-shared-evm'
import { WalletRPC } from '../../../Wallet/messages'
import { getTraderApi } from '../../apis/nftswap'
import type { SubmitComposition, CompositionRef } from '../../../../components/CompositionDialog/CompositionUI'
import { activatedSocialNetworkUI, globalUIState } from '../../../../social-network'
import { InjectedDialog } from '../../../../components/shared/InjectedDialog'

// import { createExternalProvider } from '../../../web3/helpers'
// import { ExternalProvider, Web3Provider } from '@ethersproject/providers'

// const provider = new Web3Provider(createExternalProvider() as unknown as ExternalProvider)
// const signer = provider.getSigner()
// const swap = new NftSwap(provider, signer)

const useStyles = makeStyles()((theme) => {
    return {
        root: {
            width: '100%',
            maxWidth: 450,
            margin: '0 auto',
            padding: theme.spacing(2.5, 3),
            position: 'relative',
            boxSizing: 'border-box',
        },
        actions: {},
        settings: {
            zIndex: 1,
            top: 0,
            right: theme.spacing(3),
            bottom: 0,
            left: theme.spacing(3),
            position: 'absolute',
        },
    }
})

export function SetOfferForm() {
    console.log('SetOfferFormOpen' + open)

    const chainId = useChainId()

    const currentProvider = useProviderType()
    const erc721Tokens = useERC721Tokens()
    const network = getNetworkTypeFromChainId(chainId)
    const wallet = useWallet()
    const account = useAccount()

    //const provider = createExternalProvider()
    const [planets, setPlanets] = useState({})

    const nftSwapSdk = getTraderApi()

    // const getERC721Tokens = async () => {
    //     const c = getCollections(account, { chainId: 4 })
    //     console.log('getCollections=' + c)
    //     return { test: 'test' }
    // }

    useEffect(() => {
        function getERC721Tokens() {
            const c = getAssetsList(account, { chainId: 4 }).then(
                (result) => {
                    alert('collection get')
                    console.log(result)
                    setPlanets(result)
                },
                function (error) {
                    alert(error)
                },
            )
        }
        //to
        getERC721Tokens()
    }, [])

    const postLink = 'https://trader.xyz/t/scruffy-salmon-tent'
    const shareSuccessLink = activatedSocialNetworkUI.utils.getShareLinkURL?.(
        `I just claimed a #MaskBox with @realMaskNetwork. Install mask.io and create your own NFT mystery box! \n ${postLink}`,
    )

    const whoAmI = useLastRecognizedIdentity()
    const network1 = activatedSocialNetworkUI.networkIdentifier
    const currentProfile = new ProfileIdentifier(
        network1,
        ProfileIdentifier.getUserName(globalUIState.profiles.value[0].identifier) ||
            unreachable('Cannot figure out current profile' as never),
    )

    const onShare = useCallback(() => {
        window.open(shareSuccessLink, '_blank', 'noopener noreferrer')
    }, [shareSuccessLink])

    const { attachMetadata, dropMetadata } = useCompositionContext()

    const encryptAndPaste = async () => {
        const c = {
            content: 'Content to display when decrypted',
            serializable: true,
            meta: {
                key: 'meta',
                value: {
                    type: 'file',
                    provider: 'arweave',
                    id: 'wNC8ossC7oAer4T0GLXK6LD+fgnIHS+SyZyWi4p7RSU=',
                    name: 'Landscape tutorial.jpg',
                    size: 5134043,
                    createdAt: '2022-01-13T12:24:05.961Z',
                    key: 'avwJhKYYKeD7PmdX',
                    payloadTxID: 'mW_-59_E-bnJfWyucYr5O_Raww8Kfk2nCTHnpN3Op_c',
                    landingTxID: 'T8zTjJDwFw0XEmPaGQNM4vfp2F63a0QsbXrJLminn-M',
                },
            },
            type: 'text',
            version: 1,
        }

        //attachMetadata('com.maskbook.example:2', JSON.parse(JSON.stringify({ to_sell: 'wajid' })))
        //console.log('content=', c)
        const [encrypted, token] = await Services.Crypto.encryptTo(
            c as unknown as TypedMessage,
            [],
            whoAmI?.identifier ?? currentProfile,
            true,
        )

        const redPacketPreText =
            isTwitter(activatedSocialNetworkUI) || isFacebook(activatedSocialNetworkUI)
                ? t('additional_post_box__encrypted_post_pre_red_packet_twitter_official_account', {
                      encrypted,
                      account: isTwitter(activatedSocialNetworkUI) ? t('twitter_account') : t('facebook_account'),
                  })
                : t('additional_post_box__encrypted_post_pre_red_packet', { encrypted })

        activatedSocialNetworkUI.automation.nativeCompositionDialog?.appendText?.(redPacketPreText, {
            recover: true,
        })
        //onClose()
    }

    const signOrder = async () => {
        const CRYPTOPUNK_420 = {
            tokenAddress: '0x6dfcce32a12e11f08023050fd836c4de1ec201ed',
            tokenId: '1',
            type: 'ERC721',
        }

        const BORED_APE_69 = {
            tokenAddress: '0xBC4CA0EdA7647A8aB7C2061c2E118A18a936f13D', // BAYC contract address
            amount: '69', // Token Id of the BoredApe we want to swap
            type: 'ERC721',
        }

        const SIXTY_NINE_USDC = {
            tokenAddress: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48', // USDC contract address
            amount: '69000000', // 69 USDC (USDC is 6 digits)
            type: 'ERC20',
        }

        // User A Trade Data
        const walletAddressUserA = '0x3e4000C9e0f2F9CA5F26710360C06eC64E7a5Fd7'
        const assetsToSwapUserA = [CRYPTOPUNK_420, SIXTY_NINE_USDC]

        // User B Trade Data
        const walletAddressUserB = '0x3e4000C9e0f2F9CA5F26710360C06eC64E7a5Fd7'
        const assetsToSwapUserB = [SIXTY_NINE_USDC, CRYPTOPUNK_420]

        // Check if we need to approve the NFT for swapping
        const approvalStatusForUserA = await nftSwapSdk
            .loadApprovalStatus(assetsToSwapUserA[0] as SwappableAsset, walletAddressUserA)
            .then(
                async (result) => {
                    alert('fine')
                    console.log(result)
                    // If we do need to approve User A's CryptoPunk for swapping, let's do that now
                    if (!result.contractApproved) {
                        const approvalTx = await nftSwapSdk.approveTokenOrNftByAsset(
                            assetsToSwapUserA[0] as SwappableAsset,
                            walletAddressUserA,
                        )
                        const approvalTxReceipt = await approvalTx.wait()
                        console.log(
                            `Approved ${assetsToSwapUserA[0].tokenAddress} contract to swap with 0x (txHash: ${approvalTxReceipt.transactionHash})`,
                        )

                        const order = nftSwapSdk.buildOrder(
                            [CRYPTOPUNK_420] as SwappableAsset[], // Maker asset(s) to swap
                            [SIXTY_NINE_USDC] as SwappableAsset[], // Taker asset(s) to swap
                            walletAddressUserA,
                        )
                        const signedOrder = await nftSwapSdk.signOrder(order, walletAddressUserA).then(
                            (result) => {
                                alert('Singend')
                                console.log(result) //
                                //here we will encode the string to the data to the scema and ecrypt and share it on the social media
                            },
                            function (error) {
                                alert(error)
                            },
                        )
                    }
                },
                function (error) {
                    alert(error)
                },
            )

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

    const greetUser1 = () => {
        console.log('Hi there, user!')

        //swapSdk.buildOrder();
    }
    //#region Open
    const [open2, setOpen] = useState(false)
    // const onClose = useCallback(() => {
    //     setOpen(false)
    //     UI.current?.reset()
    // }, [])
    const { t } = useI18N()

    const UI = useRef<CompositionRef>(null)

    return (
        <div>
            <AllProviderTradeContext.Provider>
                <Typography>What do you want to sell1?</Typography>
                <Typography>
                    Chain Id is {chainId}? Provider is {currentProvider} wallet is {account} new network is {network}
                </Typography>
                <div>
                    <pre>New data1={JSON.stringify(planets, null, 7)}</pre>
                </div>
                {/* <SimpleList list={erc721tokens}></SimpleList> */}
                {/* <Trader {...TraderProps} chainId={chainId} /> */}
                <Button onClick={signOrder}>Click Me</Button>
                <Button size="medium" fullWidth variant="contained" onClick={onShare}>
                    Share
                </Button>
                <Button size="medium" fullWidth variant="contained" onClick={encryptAndPaste}>
                    encrypted and paste test
                </Button>
            </AllProviderTradeContext.Provider>
        </div>
    )
}
