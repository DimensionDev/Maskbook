import { memo, useCallback, useEffect, useMemo, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { uniqBy } from 'lodash-es'
import { Box, Button, Stack } from '@mui/material'
import { LoadingBase, makeStyles } from '@masknet/theme'
import { DashboardRoutes, EMPTY_LIST, NetworkPluginID } from '@masknet/shared-base'
import { isSameAddress } from '@masknet/web3-shared-base'
import { LoadingPlaceholder } from '../../../../components/LoadingPlaceholder/index.js'
import { EmptyPlaceholder } from '../EmptyPlaceholder/index.js'
import { CollectibleCard } from '../CollectibleCard/index.js'
import { useDashboardI18N } from '../../../../locales/index.js'
import { TransferTab } from '../Transfer/index.js'
import {
    useChainContext,
    useNetworkContext,
    useNonFungibleAssets,
    useTrustedNonFungibleTokens,
} from '@masknet/web3-hooks-base'
import type { ChainId } from '@masknet/web3-shared-evm'
import type { Web3Helper } from '@masknet/web3-helpers'
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
})

interface CollectibleListProps {
    selectedChain: Web3Helper.NetworkDescriptorAll | null
}

export const CollectibleList = memo<CollectibleListProps>(({ selectedChain }) => {
    const navigate = useNavigate()
    const { account } = useChainContext()
    const trustedNonFungibleTokens = useTrustedNonFungibleTokens(
        NetworkPluginID.PLUGIN_EVM,
        undefined,
        selectedChain?.chainId as ChainId,
    )

    const {
        value = EMPTY_LIST,
        done,
        next,
        error,
    } = useNonFungibleAssets(NetworkPluginID.PLUGIN_EVM, undefined, {
        account,
        chainId: selectedChain?.chainId as ChainId,
    })

    const renderCollectibles = useMemo(() => {
        const trustedOwnNonFungibleTokens = trustedNonFungibleTokens.filter((x) => isSameAddress(x.ownerId, account))
        return uniqBy(
            [...trustedOwnNonFungibleTokens, ...value],
            (x) => x.contract?.address.toLowerCase() + x.tokenId,
        ).filter((x) => (selectedChain ? x.chainId === selectedChain.chainId : true))
    }, [value.length, trustedNonFungibleTokens, selectedChain?.chainId])

    useEffect(() => {
        if (next) next()
    }, [next])

    const { pluginID: currentPluginId } = useNetworkContext()
    const onSend = useCallback(
        (detail: Web3Helper.NonFungibleTokenAll) => {
            // Sending NFT is only available on EVM currently.
            if (currentPluginId !== NetworkPluginID.PLUGIN_EVM) return
            navigate(DashboardRoutes.WalletsTransfer, {
                state: {
                    type: TransferTab.Collectibles,
                    nonFungibleToken: detail,
                },
            })
        },
        [currentPluginId],
    )

    return (
        <CollectibleListUI
            isError={!!error}
            isLoading={renderCollectibles.length === 0 && !done && !error}
            isDone={done}
            isEmpty={!error && renderCollectibles.length === 0 && done}
            dataSource={renderCollectibles}
            onSend={onSend}
            onRetry={next}
        />
    )
})

export interface CollectibleListUIProps {
    isError: boolean
    isLoading: boolean
    isDone: boolean
    isEmpty: boolean
    chainId?: Web3Helper.ChainIdAll
    dataSource: Web3Helper.NonFungibleAssetAll[]
    onSend(detail: Web3Helper.NonFungibleAssetAll): void
    onRetry?: () => void
}

export const CollectibleListUI = memo<CollectibleListUIProps>(
    ({ isEmpty, isLoading, isDone, onRetry, dataSource, onSend, isError }) => {
        const t = useDashboardI18N()
        const { classes } = useStyles()
        const ref = useRef<HTMLDivElement>(null)

        return (
            <Stack flexDirection="column" justifyContent="space-between" height="100%" ref={ref}>
                {(() => {
                    if (isLoading) return <LoadingPlaceholder />
                    if (isEmpty) return <EmptyPlaceholder children={t.wallets_empty_collectible_tip()} />
                    if (!dataSource.length && isError)
                        return (
                            <Stack flexDirection="row" justifyContent="center" height="100%" alignItems="center">
                                <Button>{t.wallets_reload()}</Button>
                            </Stack>
                        )
                    return (
                        <Box>
                            <div className={classes.root}>
                                {dataSource.map((x, index) => (
                                    <div className={classes.card} key={index}>
                                        <CollectibleCard asset={x} onSend={() => onSend(x)} />
                                    </div>
                                ))}
                            </div>
                            {!isDone && !isError && (
                                <Stack direction="row" justifyContent="center" pt={2}>
                                    <LoadingBase />
                                </Stack>
                            )}
                            {isError ? (
                                <Stack flexDirection="row" justifyContent="center" pt={3} alignItems="center">
                                    <Button>{t.wallets_reload()}</Button>
                                </Stack>
                            ) : null}
                            <ElementAnchor
                                callback={() => {
                                    if (onRetry) onRetry()
                                }}>
                                <Stack />
                            </ElementAnchor>
                        </Box>
                    )
                })()}
            </Stack>
        )
    },
)
