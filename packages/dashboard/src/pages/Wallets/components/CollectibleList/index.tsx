import { memo, useCallback, useEffect, useMemo, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { Box, Button, Stack } from '@mui/material'
import { LoadingBase, makeStyles } from '@masknet/theme'
import { isSameAddress, NetworkPluginID, NonFungibleToken } from '@masknet/web3-shared-base'
import { LoadingPlaceholder } from '../../../../components/LoadingPlaceholder'
import { DashboardRoutes, EMPTY_LIST } from '@masknet/shared-base'
import { EmptyPlaceholder } from '../EmptyPlaceholder'
import { CollectibleCard } from '../CollectibleCard'
import { useDashboardI18N } from '../../../../locales'
import { TransferTab } from '../Transfer'
import {
    useAccount,
    useCurrentWeb3NetworkPluginID,
    useNonFungibleAssets,
    useTrustedNonFungibleTokens,
    Web3Helper,
} from '@masknet/plugin-infra/web3'
import type { ChainId } from '@masknet/web3-shared-evm'
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
    selectedChain: Web3Helper.NetworkDescriptorAll | null
}

export const CollectibleList = memo<CollectibleListProps>(({ selectedChain }) => {
    const navigate = useNavigate()
    const account = useAccount()
    const trustedNonFungibleTokens = useTrustedNonFungibleTokens()

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
        const trustedOwnNonFungibleTokens = trustedNonFungibleTokens.filter((x) =>
            isSameAddress(x.contract?.owner, account),
        )
        return uniqBy(
            [...trustedOwnNonFungibleTokens, ...value],
            (x) => x?.contract?.address.toLowerCase() + x?.tokenId,
        ).filter((x) => (selectedChain ? x.chainId === selectedChain.chainId : true))
    }, [value.length, trustedNonFungibleTokens.length, selectedChain?.chainId])

    useEffect(() => {
        if (next) next()
    }, [next])

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
                                        <CollectibleCard token={x} renderOrder={index} onSend={() => onSend(x)} />
                                    </div>
                                ))}
                            </div>
                            {!isDone && !isError && (
                                <Stack direction="row" justifyContent="center" pt={2}>
                                    <LoadingBase />
                                </Stack>
                            )}
                            {isError && (
                                <Stack flexDirection="row" justifyContent="center" pt={3} alignItems="center">
                                    <Button>{t.wallets_reload()}</Button>
                                </Stack>
                            )}
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
