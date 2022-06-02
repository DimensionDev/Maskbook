import { memo, useCallback, useEffect, useMemo, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { Box, Stack } from '@mui/material'
import { makeStyles } from '@masknet/theme'
import { NetworkPluginID, NonFungibleToken } from '@masknet/web3-shared-base'
import { LoadingPlaceholder } from '../../../../components/LoadingPlaceholder'
import { DashboardRoutes, EMPTY_LIST } from '@masknet/shared-base'
import { EmptyPlaceholder } from '../EmptyPlaceholder'
import { CollectibleCard } from '../CollectibleCard'
import { useDashboardI18N } from '../../../../locales'
import { TransferTab } from '../Transfer'
import {
    useAccount,
    useCurrentWeb3NetworkPluginID,
    useNonFungibleAssets2,
    Web3Helper,
} from '@masknet/plugin-infra/web3'
import { SchemaType } from '@masknet/web3-shared-evm'
import { uniqBy } from 'lodash-unified'
import { ElementAnchor } from '@masknet/shared'

const useStyles = makeStyles()({
    root: {
        flex: 1,
        padding: '24px 26px 0',
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
    selectedNetwork: Web3Helper.NetworkDescriptorAll | null
}

export const CollectibleList = memo<CollectibleListProps>(({ selectedNetwork }) => {
    const navigate = useNavigate()
    const account = useAccount()

    const {
        value = EMPTY_LIST,
        done,
        next,
        error,
    } = useNonFungibleAssets2(NetworkPluginID.PLUGIN_EVM, SchemaType.ERC721, { account })

    const renderCollectibles = useMemo(() => {
        const uniqCollectibles = uniqBy(value, (x) => x?.contract?.address.toLowerCase() + x?.tokenId)
        return uniqCollectibles
    }, [value.length])

    useEffect(() => {
        if (next) next()
    }, [next])

    // useEffect(() => {
    // const unsubscribeTokens = PluginMessages.Wallet.events.erc721TokensUpdated.on(() => retry())
    // }, [retry])

    const currentPluginId = useCurrentWeb3NetworkPluginID()
    const onSend = useCallback(
        (
            detail: NonFungibleToken<
                Web3Helper.Definition[NetworkPluginID]['ChainId'],
                Web3Helper.Definition[NetworkPluginID]['SchemaType']
            >,
        ) => {
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

    return (
        <CollectibleListUI
            isLoading={renderCollectibles.length === 0 && !done && !error}
            isEmpty={!error && renderCollectibles.length === 0 && done}
            dataSource={renderCollectibles}
            onSend={onSend}
            onRetry={next}
        />
    )
})

export interface CollectibleListUIProps {
    isLoading: boolean
    isEmpty: boolean
    chainId?: Web3Helper.ChainIdAll
    dataSource: Array<
        NonFungibleToken<
            Web3Helper.Definition[NetworkPluginID]['ChainId'],
            Web3Helper.Definition[NetworkPluginID]['SchemaType']
        >
    >
    onSend(
        detail: NonFungibleToken<
            Web3Helper.Definition[NetworkPluginID]['ChainId'],
            Web3Helper.Definition[NetworkPluginID]['SchemaType']
        >,
    ): void
    onRetry?: () => void
}

export const CollectibleListUI = memo<CollectibleListUIProps>(({ isEmpty, isLoading, onRetry, dataSource, onSend }) => {
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
                                    token={x}
                                    renderOrder={index}
                                    // TODO: transfer not support multi chain, should remove is after supported
                                    onSend={() => onSend(x as unknown as any)}
                                />
                            </div>
                        ))}
                    </div>
                    <ElementAnchor
                        callback={() => {
                            if (onRetry) onRetry()
                        }}>
                        <Stack />
                    </ElementAnchor>
                </Box>
            )}
        </Stack>
    )
})
