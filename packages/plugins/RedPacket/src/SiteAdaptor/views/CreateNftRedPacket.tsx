import { t } from '@lingui/core/macro'
import { Trans } from '@lingui/react/macro'
import {
    ChainBoundary,
    EthereumERC721TokenApprovedBoundary,
    PluginWalletStatusBar,
    SelectGasSettingsToolbar,
    useAvailableBalance,
    WalletConnectedBoundary,
} from '@masknet/shared'
import { EMPTY_LIST, NetworkPluginID } from '@masknet/shared-base'
import { useRenderPhraseCallbackOnDepsChange } from '@masknet/shared-base-ui'
import { ActionButton, makeStyles, ShadowRootTooltip } from '@masknet/theme'
import type { Web3Helper } from '@masknet/web3-helpers'
import {
    useChainContext,
    useEnvironmentContext,
    useNativeToken,
    useNativeTokenPrice,
    useSmartPayChainId,
    useWallet,
} from '@masknet/web3-hooks-base'
import type { NonFungibleCollection } from '@masknet/web3-shared-base'
import { useNftRedPacketConstants, type ChainId, type SchemaType } from '@masknet/web3-shared-evm'
import { Box, Typography } from '@mui/material'
import { useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { RoutePaths } from '../../constants.js'
import { NFTSelectOption, type OrderedERC721Token } from '../../types.js'
import { CollectionSelectPanel } from '../components/CollectionSelectPanel.js'
import { MessageInput } from '../components/MessageInput.js'
import { NFTCard } from '../components/NFTCard.js'
import { useRedPacket } from '../contexts/RedPacketContext.js'
import { useCreateNFTRedpacketGas } from '../hooks/useCreateNftRedpacketGas.js'
import { useMyCollectionNfts } from '../hooks/useMyCollectionNfts.js'

const useStyles = makeStyles()((theme) => {
    return {
        fields: {
            display: 'flex',
            flexDirection: 'column',
            padding: theme.spacing(2),
            gap: theme.spacing(2),
            paddingBottom: 88,
        },
        approveAllTip: {
            color: '#FF5F5F',
            margin: '8px 4px 8px 4px',
        },
        toolbar: {
            marginTop: 0,
        },
        approveButton: {
            height: 40,
            margin: 0,
            padding: 0,
        },

        assets: {
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(86px, 1fr))',
            gap: 10,
        },
        card: {
            position: 'relative',
            borderRadius: 8,
            overflow: 'hidden',
            backgroundColor: theme.palette.maskColor.input,
        },
        moreAssets: {
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: theme.palette.maskColor.input,
            color: theme.palette.maskColor.main,
            fontWeight: 700,
            fontSize: 12,
        },
    }
})
export function CreateNftRedPacket() {
    const { classes, cx } = useStyles()
    const navigate = useNavigate()
    const { account, chainId } = useChainContext<NetworkPluginID.PLUGIN_EVM>()
    const { pluginID } = useEnvironmentContext()

    const {
        nftGasOption: gasOption,
        setNftGasOption: setGasOption,
        selectOption,
        setSelectOption,
        collection,
        setCollection,
        message,
        setMessage,
        creator,
        selectedNfts,
        setSelectedNfts,
    } = useRedPacket()
    const wallet = useWallet()
    const { data: nativeTokenDetailed } = useNativeToken(NetworkPluginID.PLUGIN_EVM)
    const { data: nativeTokenPrice } = useNativeTokenPrice(NetworkPluginID.PLUGIN_EVM)
    const smartPayChainId = useSmartPayChainId()

    const { data: gasLimit = '0' } = useCreateNFTRedpacketGas(
        message,
        creator,
        collection?.address ?? '',
        selectedNfts.map((value) => value.tokenId),
    )

    const { isGasSufficient, isGasFeeGreaterThanOneETH } = useAvailableBalance(
        NetworkPluginID.PLUGIN_EVM,
        '',
        gasOption,
        { chainId },
    )

    const { data: assets_ = EMPTY_LIST } = useMyCollectionNfts()

    const assets = collection?.assets?.length ? collection.assets : assets_
    const tokenDetailedOwnerList = assets.map((v, index) => ({ ...v, index }) as OrderedERC721Token)

    const balance = collection?.balance ?? tokenDetailedOwnerList.length
    const removeToken = useCallback((token: Web3Helper.NonFungibleAssetAll) => {
        setSelectedNfts((list) => list.filter((t) => t.tokenId !== token.tokenId))
    }, [])

    useRenderPhraseCallbackOnDepsChange(() => {
        if (!selectOption) setSelectOption(NFTSelectOption.Partial)
    }, [tokenDetailedOwnerList.map((x) => x.address).join(','), selectOption])

    useRenderPhraseCallbackOnDepsChange(() => {
        setSelectedNfts(EMPTY_LIST)
        setSelectOption(NFTSelectOption.Partial)
    }, [collection, account])

    useRenderPhraseCallbackOnDepsChange(() => {
        setCollection(undefined)
    }, [chainId])

    const { RED_PACKET_NFT_ADDRESS } = useNftRedPacketConstants(chainId)

    const validationMessage = (() => {
        if (!balance) return t`Insufficient Balance`
        if (selectedNfts.length === 0) return t`Select a Token`
        return undefined
    })()

    const gasValidationMessage = (() => {
        if (!isGasSufficient) return t`Insufficient Balance for Gas Fee`
        if (isGasFeeGreaterThanOneETH) return t`Create the Lucky Drop`
        return undefined
    })()

    return (
        <>
            <Box className={classes.fields}>
                <MessageInput message={message} onChange={setMessage} />
                <CollectionSelectPanel collection={collection} balance={balance} chainId={chainId} />

                <Box className={classes.assets}>
                    {selectedNfts.slice(0, 5).map((nft) => (
                        <NFTCard key={nft.tokenId} token={nft} onRemove={removeToken} />
                    ))}
                    {selectedNfts.length > 5 ?
                        <Typography className={cx(classes.moreAssets, classes.card)} component="div">
                            +{selectedNfts.length - 5}
                        </Typography>
                    :   null}
                </Box>
                {collection && balance ?
                    <Typography className={classes.approveAllTip}>
                        <Trans>
                            Note: When you "Unlock All", all of the NFTs in the collection will be by default authorized
                            for sale. This includes the NFTs transferred afterwards.
                        </Trans>
                    </Typography>
                :   null}
                {nativeTokenDetailed && nativeTokenPrice ?
                    <SelectGasSettingsToolbar
                        className={classes.toolbar}
                        nativeToken={nativeTokenDetailed}
                        nativeTokenPrice={nativeTokenPrice}
                        supportMultiCurrency={!!wallet?.owner && chainId === smartPayChainId}
                        gasConfig={gasOption}
                        gasLimit={Number.parseInt(gasLimit, 10)}
                        onChange={setGasOption}
                    />
                :   null}
            </Box>

            <Box style={{ position: 'absolute', bottom: 0, width: '100%' }}>
                <PluginWalletStatusBar
                    expectedPluginID={NetworkPluginID.PLUGIN_EVM}
                    expectedChainId={chainId}
                    actualPluginID={pluginID}>
                    <ChainBoundary
                        expectedPluginID={NetworkPluginID.PLUGIN_EVM}
                        expectedChainId={chainId}
                        forceShowingWrongNetworkButton>
                        <WalletConnectedBoundary expectedChainId={chainId}>
                            <EthereumERC721TokenApprovedBoundary
                                validationMessage={validationMessage}
                                owner={account}
                                chainId={chainId}
                                collection={collection as NonFungibleCollection<ChainId, SchemaType>}
                                classes={{ approveButton: classes.approveButton }}
                                operator={RED_PACKET_NFT_ADDRESS}>
                                <ShadowRootTooltip
                                    title={
                                        isGasFeeGreaterThanOneETH ?
                                            <Trans>
                                                When selecting too many NFTs, the total gas fee may exceed the MetaMask
                                                limit of {nativeTokenDetailed?.symbol || 'ETH'}. Please reduce the
                                                number of NFTs selected.
                                            </Trans>
                                        :   ''
                                    }
                                    arrow
                                    disableInteractive
                                    placement="top"
                                    PopperProps={{
                                        disablePortal: true,
                                        placement: 'top',
                                    }}>
                                    <div style={{ width: '100%' }}>
                                        <ActionButton
                                            style={{ height: 40, padding: 0, margin: 0 }}
                                            size="large"
                                            disabled={!!validationMessage || !!gasValidationMessage}
                                            fullWidth
                                            onClick={() => navigate(RoutePaths.ConfirmNftRedPacket)}>
                                            {gasValidationMessage || <Trans>Create the Lucky Drop</Trans>}
                                        </ActionButton>
                                    </div>
                                </ShadowRootTooltip>
                            </EthereumERC721TokenApprovedBoundary>
                        </WalletConnectedBoundary>
                    </ChainBoundary>
                </PluginWalletStatusBar>
            </Box>
        </>
    )
}
