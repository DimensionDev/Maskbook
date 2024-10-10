import { useState, useCallback, useEffect } from 'react'
import { Box, Typography, List, ListItem, Skeleton } from '@mui/material'
import { makeStyles, ActionButton, ShadowRootTooltip } from '@masknet/theme'
import { Check as CheckIcon, Close as CloseIcon, AddCircleOutline as AddCircleOutlineIcon } from '@mui/icons-material'
import {
    WalletConnectedBoundary,
    AssetPreviewer,
    PluginWalletStatusBar,
    ERC721ContractSelectPanel,
    ChainBoundary,
    EthereumERC721TokenApprovedBoundary,
    SelectGasSettingsToolbar,
    useAvailableBalance,
    useCurrentLinkedPersona,
} from '@masknet/shared'
import {
    type ChainId,
    type SchemaType,
    useNftRedPacketConstants,
    formatTokenId,
    type GasConfig,
} from '@masknet/web3-shared-evm'
import { RedpacketMessagePanel } from './RedpacketMessagePanel.js'
import { SelectNftTokenDialog, type OrderedERC721Token } from './SelectNftTokenDialog.js'
import { RedpacketNftConfirmDialog } from './RedpacketNftConfirmDialog.js'
import { NFTSelectOption } from '../types.js'
import { RED_PACKET_MAX_SHARES } from '../constants.js'
import {
    useChainContext,
    useNativeToken,
    useNativeTokenPrice,
    useWallet,
    useNonFungibleAssetsByCollectionAndOwner,
    useEnvironmentContext,
} from '@masknet/web3-hooks-base'
import { NetworkPluginID, EMPTY_LIST } from '@masknet/shared-base'
import { SourceType } from '@masknet/web3-shared-base'
import type { NonFungibleToken, NonFungibleCollection } from '@masknet/web3-shared-base'
import { SmartPayBundler } from '@masknet/web3-providers'
import { useAsync } from 'react-use'
import { useCreateNFTRedpacketGas } from './hooks/useCreateNftRedpacketGas.js'
import { useCurrentVisitingIdentity, useLastRecognizedIdentity } from '@masknet/plugin-infra/content-script'
import { useRenderPhraseCallbackOnDepsChange } from '@masknet/shared-base-ui'
import { Trans } from '@lingui/macro'

const useStyles = makeStyles()((theme) => {
    return {
        root: {
            display: 'flex',
            alignItems: 'stretch',
            flexDirection: 'column',
            padding: '0 16px 72px',
        },
        line: {
            display: 'flex',
            margin: theme.spacing(1, 0, 2, 0),
        },
        nftNameWrapper: {
            position: 'absolute',
            bottom: 0,
            width: '100%',
            background: theme.palette.background.paper,
            borderBottomRightRadius: 8,
            borderBottomLeftRadius: 8,
            paddingTop: 2,
            paddingBottom: 1,
        },
        nftName: {
            minHeight: 30,
            marginLeft: 8,
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
        },
        tokenSelector: {
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: 16,
            width: '100%',
            overflowY: 'auto',
            overflowX: 'hidden',
            height: 200,
            background: theme.palette.background.default,
            borderRadius: 12,
            padding: theme.spacing(1.5, 1.5, 1, 1),
            boxSizing: 'border-box',
            '::-webkit-scrollbar': {
                backgroundColor: 'transparent',
                width: 20,
            },
            '::-webkit-scrollbar-thumb': {
                borderRadius: '20px',
                width: 5,
                border: '7px solid rgba(0, 0, 0, 0)',
                backgroundColor: theme.palette.mode === 'dark' ? 'rgba(250, 250, 250, 0.2)' : 'rgba(0, 0, 0, 0.2)',
                backgroundClip: 'padding-box',
            },
        },
        tokenSelectorWrapper: {
            position: 'relative',
            display: 'flex',
            flexDirection: 'column',
            borderRadius: 8,
            padding: 0,
            marginBottom: theme.spacing(2.5),
            background: theme.palette.background.paper,
            width: 120,
            height: 150,
            overflow: 'hidden',
        },
        tokenSelectorParent: {
            background: theme.palette.background.default,
            borderRadius: 12,
            paddingBottom: 5,
            marginTop: theme.spacing(1.5),
            marginBottom: theme.spacing(1.5),
        },
        addWrapper: {
            cursor: 'pointer',
            alignItems: 'center',
            background: `${theme.palette.background.default} !important`,
            justifyContent: 'center',
            border: `1px solid ${theme.palette.divider}`,
        },
        addIcon: {
            color: '#AFC3E1',
        },
        closeIconWrapperBack: {
            position: 'absolute',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            top: 5,
            right: 5,
            width: 18,
            height: 18,
            background: 'rgba(255, 255, 255, 0.8)',
            borderRadius: 500,
            overflow: 'hidden',
        },
        closeIconWrapper: {
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            width: 18,
            height: 18,
            background: 'rgba(255, 95, 95, 0.3)',
        },
        closeIcon: {
            width: 14,
            height: 14,
            cursor: 'pointer',
            color: 'rgba(255, 95, 95, 1)',
        },
        fallbackImage: {
            minHeight: '0 !important',
            maxWidth: 'none',
            width: 64,
            height: 64,
        },
        selectWrapper: {
            display: 'flex',
            alignItems: 'center',
            margin: 0,
        },
        option: {
            display: 'flex',
            alignItems: 'center',
            cursor: 'pointer',
        },
        optionLeft: {
            marginRight: '16px',
        },
        checkIcon: {
            width: 15,
            height: 15,
            color: '#fff',
        },
        checkIconWrapper: {
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            cursor: 'pointer',
            width: 17,
            height: 17,
            borderRadius: 999,
            marginRight: 5,
            border: '1px solid #6E748E',
            backgroundColor: 'white',
        },
        checked: {
            borderColor: '#1D9BF0 !important',
            background: '#1D9BF0 !important',
        },
        approveAllTip: {
            color: '#FF5F5F',
            margin: '8px 4px 8px 4px',
        },
        toolbar: {
            marginTop: 0,
        },
        disabledSelector: {
            opacity: 0.5,
            pointerEvents: 'none',
        },
        assetImgWrapper: {
            maxHeight: 120,
            overflow: 'hidden',
        },
        approveButton: {
            height: 40,
            margin: 0,
            padding: 0,
        },
        skeleton: {
            display: 'flex',
            marginBottom: 12,
        },
        rectangle: {
            borderRadius: 8,
            marginRight: 12,
        },
    }
})
interface RedPacketERC721FormProps {
    onClose: () => void
    openNFTConfirmDialog: boolean
    openSelectNFTDialog: boolean
    setOpenSelectNFTDialog: (x: boolean) => void
    setOpenNFTConfirmDialog: (x: boolean) => void
    setIsNFTRedPacketLoaded?: (x: boolean) => void
    gasOption?: GasConfig
    onGasOptionChange?: (config: GasConfig) => void
}
export function RedPacketERC721Form(props: RedPacketERC721FormProps) {
    const {
        onClose,
        setIsNFTRedPacketLoaded,
        openNFTConfirmDialog,
        setOpenNFTConfirmDialog,
        openSelectNFTDialog,
        setOpenSelectNFTDialog,
        gasOption,
        onGasOptionChange,
    } = props
    const { classes, cx } = useStyles()
    const [selectOption, setSelectOption] = useState<NFTSelectOption | undefined>(undefined)
    const { account, chainId } = useChainContext<NetworkPluginID.PLUGIN_EVM>()
    const { pluginID } = useEnvironmentContext()
    const [collection, setCollection] = useState<NonFungibleCollection<ChainId, SchemaType>>()
    const [manualSelectedTokenDetailedList, setExistTokenDetailedList] = useState<OrderedERC721Token[]>(EMPTY_LIST)
    const [onceAllSelectedTokenDetailedList, setAllTokenDetailedList] = useState<OrderedERC721Token[]>(EMPTY_LIST)
    const tokenDetailedList =
        selectOption === NFTSelectOption.Partial ? manualSelectedTokenDetailedList : onceAllSelectedTokenDetailedList
    const [message, setMessage] = useState('Best Wishes!')
    const wallet = useWallet()
    const { data: nativeTokenDetailed } = useNativeToken(NetworkPluginID.PLUGIN_EVM)
    const { data: nativeTokenPrice } = useNativeTokenPrice(NetworkPluginID.PLUGIN_EVM)
    const { value: smartPayChainId } = useAsync(async () => SmartPayBundler.getSupportedChainId(), [])

    const currentIdentity = useCurrentVisitingIdentity()
    const linkedPersona = useCurrentLinkedPersona()
    const lastRecognized = useLastRecognizedIdentity()
    const senderName =
        lastRecognized?.identifier?.userId ??
        currentIdentity?.identifier?.userId ??
        linkedPersona?.nickname ??
        'Unknown User'

    const { data: gasLimit = '0' } = useCreateNFTRedpacketGas(
        message,
        senderName,
        collection?.address ?? '',
        tokenDetailedList.map((value) => value.tokenId),
    )

    const { isGasSufficient, isGasFeeGreaterThanOneETH } = useAvailableBalance(
        NetworkPluginID.PLUGIN_EVM,
        '',
        gasOption,
        { chainId },
    )

    const {
        value: assets_ = EMPTY_LIST,
        next,
        done,
    } = useNonFungibleAssetsByCollectionAndOwner(
        collection?.assets?.length ? ''
        : collection?.source === SourceType.SimpleHash ? collection.id
        : collection?.address,
        account,
        NetworkPluginID.PLUGIN_EVM,
        {
            chainId,
            size: 50,
        },
    )
    useEffect(() => {
        next()
    }, [assets_.length])

    const assets = collection?.assets?.length ? collection.assets : assets_

    const tokenDetailedOwnerList = assets.map((v, index) => ({ ...v, index }) as OrderedERC721Token)

    const balance = collection?.balance ?? tokenDetailedOwnerList.length
    const removeToken = useCallback(
        (token: NonFungibleToken<ChainId, SchemaType.ERC721>) => {
            setExistTokenDetailedList((list) => list.filter((t) => t.tokenId !== token.tokenId))
            setAllTokenDetailedList(EMPTY_LIST)
            setSelectOption(NFTSelectOption.Partial)
        },
        [selectOption, setSelectOption, setExistTokenDetailedList, setAllTokenDetailedList],
    )

    const maxSelectShares = Math.min(RED_PACKET_MAX_SHARES, balance)

    useRenderPhraseCallbackOnDepsChange(() => {
        if (!selectOption) setSelectOption(NFTSelectOption.Partial)
    }, [tokenDetailedOwnerList.map((x) => x.address).join(','), selectOption])

    useRenderPhraseCallbackOnDepsChange(() => {
        setCollection(undefined)
    }, [account])

    useRenderPhraseCallbackOnDepsChange(() => {
        setExistTokenDetailedList(EMPTY_LIST)
        setAllTokenDetailedList(EMPTY_LIST)
        setSelectOption(undefined)
        Promise.resolve(() => {
            setOpenNFTConfirmDialog(false)
            setOpenSelectNFTDialog(false)
        })
    }, [collection, account])

    useRenderPhraseCallbackOnDepsChange(() => {
        setCollection(undefined)
        Promise.resolve(() => {
            setOpenSelectNFTDialog(false)
        })
    }, [chainId])

    const { RED_PACKET_NFT_ADDRESS } = useNftRedPacketConstants(chainId)

    const validationMessage = (() => {
        if (!balance) return <Trans>Insufficient Balance</Trans>
        if (tokenDetailedList.length === 0) return <Trans>Select a Token</Trans>
        return undefined
    })()

    const gasValidationMessage = (() => {
        if (!isGasSufficient) return <Trans>Insufficient Balance for Gas Fee</Trans>
        if (isGasFeeGreaterThanOneETH) return <Trans>Create the Lucky Drop</Trans>
        return undefined
    })()

    useRenderPhraseCallbackOnDepsChange(() => {
        Promise.resolve().then(() => setIsNFTRedPacketLoaded?.(balance > 0))
    }, [balance > 0])

    const handleClose = useCallback(() => setOpenSelectNFTDialog(false), [])

    if (openSelectNFTDialog) {
        return (
            <SelectNftTokenDialog
                onClose={handleClose}
                contract={collection}
                existTokenDetailedList={tokenDetailedList}
                setExistTokenDetailedList={setExistTokenDetailedList}
                tokenDetailedOwnerList={tokenDetailedOwnerList}
            />
        )
    }

    if (openNFTConfirmDialog && collection) {
        return (
            <RedpacketNftConfirmDialog
                message={message}
                contract={collection}
                tokenList={tokenDetailedList}
                onBack={handleClose}
                onClose={onClose}
                senderName={senderName}
                gasOption={gasOption}
            />
        )
    }

    return (
        <>
            <Box className={classes.root}>
                <Box style={{ margin: '16px 0' }}>
                    <ERC721ContractSelectPanel
                        collection={collection}
                        onContractChange={setCollection}
                        balance={balance}
                        chainId={chainId}
                    />
                </Box>
                {collection && balance ?
                    done ?
                        <>
                            <Box className={classes.selectWrapper}>
                                <div
                                    className={cx(
                                        classes.optionLeft,
                                        classes.option,
                                        balance === 0 ? classes.disabledSelector : null,
                                    )}
                                    onClick={() => {
                                        setSelectOption(NFTSelectOption.All)
                                        setExistTokenDetailedList(tokenDetailedOwnerList.slice(0, maxSelectShares))
                                        setAllTokenDetailedList(tokenDetailedOwnerList.slice(0, maxSelectShares))
                                    }}>
                                    <div
                                        className={cx(
                                            classes.checkIconWrapper,
                                            selectOption === NFTSelectOption.All ? classes.checked : '',
                                        )}>
                                        <CheckIcon className={classes.checkIcon} />
                                    </div>
                                    <Typography color="textPrimary">
                                        {balance === 0 ?
                                            <Trans>ALL</Trans>
                                        :   <Trans>ALL ({Math.min(RED_PACKET_MAX_SHARES, balance)} NFT)</Trans>}
                                    </Typography>
                                </div>
                                <div
                                    className={classes.option}
                                    onClick={() => setSelectOption(NFTSelectOption.Partial)}>
                                    <div
                                        className={cx(
                                            classes.checkIconWrapper,
                                            selectOption === NFTSelectOption.Partial ? classes.checked : '',
                                        )}>
                                        <CheckIcon className={classes.checkIcon} />
                                    </div>
                                    <Typography color="textPrimary">
                                        <Trans>Select partially</Trans>
                                    </Typography>
                                </div>
                            </Box>
                            <div className={classes.tokenSelectorParent}>
                                <List className={classes.tokenSelector}>
                                    {tokenDetailedList.map((value, i) => (
                                        <div key={i}>
                                            <NFTCard token={value} removeToken={removeToken} />
                                        </div>
                                    ))}
                                    <ListItem
                                        onClick={() => setOpenSelectNFTDialog(true)}
                                        className={cx(classes.tokenSelectorWrapper, classes.addWrapper)}>
                                        <AddCircleOutlineIcon className={classes.addIcon} onClick={() => void 0} />
                                    </ListItem>
                                </List>
                            </div>
                        </>
                    :   <>
                            <div className={classes.skeleton}>
                                <Skeleton className={classes.rectangle} height={24} variant="rectangular" width={140} />
                                <Skeleton className={classes.rectangle} height={24} variant="rectangular" width={140} />
                            </div>
                            <Skeleton className={classes.rectangle} height={180} variant="rectangular" width="100%" />
                        </>

                :   null}

                <div className={classes.line}>
                    <RedpacketMessagePanel onChange={(val: string) => setMessage(val)} message={message} />
                </div>
                {collection && balance ?
                    <Typography className={classes.approveAllTip}>
                        <Trans>
                            Note: When you "Unlock All", all of the NFTs in the collection will be by default authorized
                            for sale. This includes the NFTs transferred afterwards.
                        </Trans>
                    </Typography>
                :   null}
                {nativeTokenDetailed && nativeTokenPrice ?
                    <Box mx={2}>
                        <SelectGasSettingsToolbar
                            className={classes.toolbar}
                            nativeToken={nativeTokenDetailed}
                            nativeTokenPrice={nativeTokenPrice}
                            supportMultiCurrency={!!wallet?.owner && chainId === smartPayChainId}
                            gasConfig={gasOption}
                            gasLimit={Number.parseInt(gasLimit, 10)}
                            onChange={onGasOptionChange}
                        />
                    </Box>
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
                                collection={collection}
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
                                            onClick={() => setOpenNFTConfirmDialog(true)}>
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

interface NFTCardProps {
    token: OrderedERC721Token
    removeToken: (token: NonFungibleToken<ChainId, SchemaType.ERC721>) => void
}

function NFTCard(props: NFTCardProps) {
    const { token, removeToken } = props
    const { classes, cx } = useStyles()
    return (
        <ListItem className={cx(classes.tokenSelectorWrapper)}>
            <AssetPreviewer
                url={token.metadata?.mediaURL || token.metadata?.imageURL}
                classes={{
                    fallbackImage: classes.fallbackImage,
                    root: classes.assetImgWrapper,
                }}
            />
            <div className={classes.nftNameWrapper}>
                <Typography className={classes.nftName} color="textSecondary">
                    {formatTokenId(token.tokenId, 2)}
                </Typography>
            </div>
            <div className={classes.closeIconWrapperBack} onClick={() => removeToken(token)}>
                <div className={classes.closeIconWrapper}>
                    <CloseIcon className={classes.closeIcon} />
                </div>
            </div>
        </ListItem>
    )
}
