import { memo, useCallback, useEffect, useRef } from 'react'
import { Box, Stack } from '@mui/material'
import { makeStyles } from '@masknet/theme'
import { useChainId, useCustomNonFungibleAssets, ChainId, NetworkType } from '@masknet/web3-shared-evm'
import { LoadingPlaceholder } from '../../../../components/LoadingPlaceholder'
import { EmptyPlaceholder } from '../EmptyPlaceholder'
import { CollectibleCard } from '../CollectibleCard'
import { useDashboardI18N } from '../../../../locales'
import { PluginMessages } from '../../../../API'
import { useNavigate } from 'react-router-dom'
import { DashboardRoutes } from '@masknet/shared-base'
import { TransferTab } from '../Transfer'
import {
    Web3Plugin,
    usePluginIDContext,
    NetworkPluginID,
    mergeNFTList,
    useWeb3State,
    useAccount,
    useNonFungibleAssets,
    PluginId,
    SocketState,
} from '@masknet/plugin-infra'
import type { ERC721TokenDetailed } from '@masknet/web3-shared-base'

const useStyles = makeStyles()({
    root: {
        flex: 1,
        padding: '24px 26px 0px',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, 140px)',
        gridGap: '20px',
        justifyContent: 'space-between',
    },
    card: {},
    footer: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
    },
})

interface CollectibleListProps {
    selectedNetwork: Web3Plugin.NetworkDescriptor | null
}

export const CollectibleList = memo<CollectibleListProps>(({ selectedNetwork }) => {
    const navigate = useNavigate()
    const account = useAccount()
    const chainId = useChainId()
    const { Utils } = useWeb3State()
    const customCollectibles = useCustomNonFungibleAssets(
        account,
        chainId,
        selectedNetwork?.ID === `${PluginId.EVM}_ethereum` || !selectedNetwork,
    )

    // Todo: remove after migrate `packages/mask/src/plugins/EVM` to `packages/plugins/EVM`
    const currentSupportedNFT_ApiNetworkList = [
        {
            ID: `${PluginId.EVM}_ethereum`,
            networkSupporterPluginID: PluginId.EVM,
            chainId: ChainId.Mainnet,
            type: NetworkType.Ethereum,
            name: 'Ethereum',
            isMainnet: true,
        },
        {
            ID: `${PluginId.EVM}_polygon`,
            networkSupporterPluginID: PluginId.EVM,
            chainId: ChainId.Matic,
            type: NetworkType.Polygon,
            name: 'Polygon',
            isMainnet: true,
        },
    ] as unknown as Web3Plugin.NetworkDescriptor[]

    const {
        data: _collectibles,
        state: loadingCollectibleDone,
        retry,
        error: collectiblesError,
    } = useNonFungibleAssets(account, selectedNetwork ? [selectedNetwork] : currentSupportedNFT_ApiNetworkList)

    const collectibles = (Utils?.mergeNFTList ?? mergeNFTList)([..._collectibles, ...customCollectibles])
    const isQuerying = loadingCollectibleDone !== SocketState.done
    const currentPluginId = usePluginIDContext()
    const onSend = useCallback(
        (detail: ERC721TokenDetailed) => {
            // Sending NFT is only available on EVM currently.
            if (currentPluginId !== NetworkPluginID.PLUGIN_EVM) return
            navigate(DashboardRoutes.WalletsTransfer, {
                state: {
                    type: TransferTab.Collectibles,
                    erc721Token: detail,
                },
            })
        },
        [currentPluginId],
    )

    useEffect(() => {
        PluginMessages.Wallet.events.erc721TokensUpdated.on(retry)
    }, [retry])

    const isLoading = collectibles.length === 0 && isQuerying

    return (
        <CollectibleListUI
            isLoading={isLoading}
            isEmpty={!!collectiblesError || collectibles.length === 0}
            dataSource={collectibles}
            chainId={selectedNetwork?.chainId ?? 1}
            onSend={onSend}
        />
    )
})

export interface CollectibleListUIProps {
    isLoading: boolean
    isEmpty: boolean
    chainId: number
    dataSource: ERC721TokenDetailed[]
    onSend(detail: ERC721TokenDetailed): void
}

export const CollectibleListUI = memo<CollectibleListUIProps>(({ isLoading, isEmpty, chainId, dataSource, onSend }) => {
    const t = useDashboardI18N()
    const { classes } = useStyles()
    const ref = useRef<HTMLDivElement>(null)

    return (
        <Stack flexDirection="column" justifyContent="space-between" height="100%" ref={ref}>
            {isLoading ? (
                <LoadingPlaceholder />
            ) : isEmpty ? (
                <EmptyPlaceholder children={t.wallets_empty_collectible_tip()} />
            ) : (
                <Box>
                    <div className={classes.root}>
                        {dataSource.map((x, index) => (
                            <div className={classes.card} key={index}>
                                <CollectibleCard
                                    chainId={chainId}
                                    token={x}
                                    renderOrder={index}
                                    // TODO: transfer not support multi chain, should remove is after supported
                                    onSend={() => onSend(x as unknown as any)}
                                />
                            </div>
                        ))}
                    </div>
                </Box>
            )}
        </Stack>
    )
})
