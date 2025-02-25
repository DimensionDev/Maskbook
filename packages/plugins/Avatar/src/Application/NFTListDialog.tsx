import { Trans } from '@lingui/react/macro'
import { openPopupWindow } from '@masknet/plugin-infra/dom/context'
import {
    AddCollectiblesModal,
    ChainBoundary,
    CollectionList,
    EmptyStatus,
    PluginVerifiedWalletStatusBar,
    PopupHomeTabType,
    UserAssetsProvider,
} from '@masknet/shared'
import { NetworkPluginID, PopupRoutes } from '@masknet/shared-base'
import { useRenderPhraseCallbackOnDepsChange } from '@masknet/shared-base-ui'
import { makeStyles, useCustomSnackbar } from '@masknet/theme'
import type { Web3Helper } from '@masknet/web3-helpers'
import {
    useAccount,
    useChainContext,
    useNetworkContext,
    useWallets,
    useWeb3Connection,
    useWeb3Hub,
} from '@masknet/web3-hooks-base'
import { isGreaterThan, isSameAddress } from '@masknet/web3-shared-base'
import { type ChainId } from '@masknet/web3-shared-evm'
import { Telemetry } from '@masknet/web3-telemetry'
import { EventID, EventType } from '@masknet/web3-telemetry/types'
import { Button, DialogActions, DialogContent } from '@mui/material'
import { compact, uniqBy } from 'lodash-es'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useUpdateEffect } from 'react-use'
import { supportPluginIds } from '../constants.js'
import { useAvatarManagement } from '../contexts/AvatarManagement.js'
import { emitter } from '../emitter.js'
import { PFP_TYPE, type AllChainsNonFungibleToken } from '../types.js'
import { toPNG } from '../utils/index.js'
import { RoutePaths } from './Routes.js'

const useStyles = makeStyles()((theme) => ({
    actions: {
        backgroundColor: theme.palette.maskColor.bottom,
        position: 'absolute',
        zIndex: 3,
        left: 0,
        bottom: 0,
        width: '100%',
        padding: 0,
        display: 'block',
        margin: 0,
        '&>:not(:first-of-type)': {
            margin: 0,
        },
    },
    content: {
        padding: 0,
        width: '100%',
        backgroundColor: theme.palette.maskColor.bottom,
        scrollbarWidth: 'none',
        '::-webkit-scrollbar': {
            display: 'none',
        },
        overflow: 'hidden',
        display: 'flex',
    },
}))

const gridProps = {
    columns: 'repeat(auto-fill, minmax(20%, 1fr))',
}

export function NFTListDialog() {
    const { classes } = useStyles()
    const { pfpType, proofs, tokenInfo, targetAccount, setTargetAccount, setSelectedTokenInfo, proof } =
        useAvatarManagement()

    const navigate = useNavigate()

    const { pluginID } = useNetworkContext()
    const originAccount = useAccount()
    const { account, chainId, setChainId, setAccount } = useChainContext()
    const [assetChainId, setAssetChainId] = useState<ChainId>()
    const wallets = useWallets()
    const [selectedPluginId, setSelectedPluginId] = useState(pluginID)
    const [selectedToken, setSelectedToken] = useState(tokenInfo)
    const [disabled, setDisabled] = useState(false)
    const [pendingTokenCount, setPendingTokenCount] = useState(0)
    const [tokens, setTokens] = useState<AllChainsNonFungibleToken[]>([])

    useRenderPhraseCallbackOnDepsChange(() => setSelectedToken(undefined), [chainId])

    const { showSnackbar } = useCustomSnackbar()
    const onChangeWallet = (address: string, pluginID: NetworkPluginID, chainId: Web3Helper.ChainIdAll) => {
        setAccount(address)
        setTargetAccount(address)
        setSelectedPluginId(pluginID)
        setChainId(chainId as ChainId)
        setSelectedToken(undefined)
    }

    const onSave = useCallback(async () => {
        if (!selectedToken?.metadata?.imageURL) return
        setDisabled(true)
        Telemetry.captureEvent(EventType.Access, EventID.EntryAppNFT_PFP_Setting)
        try {
            const image = await toPNG(selectedToken.metadata.imageURL)
            if (!image) {
                showSnackbar(<Trans>Failed to download image</Trans>, { variant: 'error' })
                return
            }
            setSelectedTokenInfo({
                image: URL.createObjectURL(image),
                account: targetAccount,
                token: selectedToken,
                pluginID: selectedPluginId,
            })
            navigate(RoutePaths.Upload)
        } catch (error) {
            showSnackbar(String(error), { variant: 'error' })
            return
        } finally {
            setDisabled(false)
        }
    }, [selectedToken, targetAccount, selectedPluginId, navigate, proof, proofs])

    const Web3 = useWeb3Connection(pluginID)
    const Hub = useWeb3Hub(pluginID)
    const handleAddCollectibles = useCallback(async () => {
        const results = await AddCollectiblesModal.openAndWaitForClose({
            pluginID,
            chainId: assetChainId || chainId,
            account: targetAccount,
        })
        if (!results || !assetChainId) return
        const [contract, tokenIds] = results
        const address = contract.address
        setPendingTokenCount((count) => count + tokenIds.length)
        const allSettled = await Promise.allSettled(
            tokenIds.map(async (tokenId) => {
                const [asset, token, isOwner] = await Promise.all([
                    Hub.getNonFungibleAsset(address, tokenId, {
                        chainId: assetChainId,
                        account: targetAccount,
                    }),
                    Web3.getNonFungibleToken(address, tokenId, undefined, {
                        chainId: assetChainId,
                    }),
                    Web3.getNonFungibleTokenOwnership(address, tokenId, targetAccount, undefined, {
                        chainId: assetChainId,
                    }),
                ])

                if (!asset?.contract?.chainId || !token.chainId || token.contract?.chainId !== assetChainId) return
                if (!isOwner) return
                return { ...token, ...asset } as AllChainsNonFungibleToken
            }),
        )

        setPendingTokenCount((count) => Math.max(count - tokenIds.length, 0))
        const tokens = compact(allSettled.map((x) => (x.status === 'fulfilled' ? x.value : null)))
        if (!tokens.length) return
        setTokens((originalTokens) => {
            return uniqBy([...originalTokens, ...tokens], (x) => `${x.contract?.address}.${x.tokenId}`)
        })
    }, [pluginID, assetChainId, chainId, targetAccount])

    useEffect(() => {
        const unsubscribe = emitter.on('add', handleAddCollectibles)
        return () => {
            unsubscribe()
        }
    }, [handleAddCollectibles])

    useRenderPhraseCallbackOnDepsChange(() => setSelectedPluginId(pluginID), [pluginID])

    useUpdateEffect(() => {
        if (account) setTargetAccount(account)
    }, [account])

    useUpdateEffect(() => {
        if (originAccount) setAccount(originAccount)
    }, [originAccount])

    const targetWallet = wallets.find((x) => isSameAddress(targetAccount, x.address))
    const walletItems = useMemo(() => {
        return [...proofs].sort((a, z) => {
            return isGreaterThan(a.last_checked_at, z.last_checked_at) ? -1 : 1
        })
    }, [proofs])

    return (
        <>
            <DialogContent className={classes.content}>
                {account || proofs.length ?
                    <UserAssetsProvider
                        pluginID={selectedPluginId}
                        account={targetAccount}
                        selectMode
                        selectedAsset={selectedToken}>
                        <CollectionList
                            height={479}
                            gridProps={gridProps}
                            disableWindowScroll
                            additionalAssets={tokens}
                            pendingAdditionalAssetCount={pendingTokenCount}
                            onChainChange={setAssetChainId as (chainId?: Web3Helper.ChainIdAll) => void}
                            onItemClick={setSelectedToken}
                        />
                    </UserAssetsProvider>
                :   <EmptyStatus width="100%" height={479}>
                        <Trans>No valid wallet detected. Please connect wallet or verify wallet firstly.</Trans>
                    </EmptyStatus>
                }
            </DialogContent>

            <DialogActions className={classes.actions} disableSpacing>
                <PluginVerifiedWalletStatusBar
                    openPopupWindow={() =>
                        openPopupWindow(PopupRoutes.Personas, {
                            tab: PopupHomeTabType.ConnectedWallets,
                        })
                    }
                    verifiedWallets={walletItems}
                    onChange={onChangeWallet}
                    expectedAddress={targetAccount}>
                    <ChainBoundary
                        expectedChainId={chainId}
                        predicate={supportPluginIds.includes(selectedPluginId) ? () => true : undefined}
                        expectedAccount={targetAccount}
                        expectedPluginID={
                            !supportPluginIds.includes(selectedPluginId) ? NetworkPluginID.PLUGIN_EVM : selectedPluginId
                        }>
                        <Button
                            onClick={onSave}
                            disabled={disabled || !selectedToken || !!targetWallet?.owner}
                            fullWidth>
                            {targetWallet?.owner ?
                                <Trans>Coming soon</Trans>
                            : pfpType === PFP_TYPE.PFP ?
                                <Trans>Set NFT PFP</Trans>
                            :   <Trans>Set NFT NFT Background</Trans>}
                        </Button>
                    </ChainBoundary>
                </PluginVerifiedWalletStatusBar>
            </DialogActions>
        </>
    )
}
