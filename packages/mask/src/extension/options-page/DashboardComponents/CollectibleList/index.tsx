import { createContext, useEffect, useMemo, useState } from 'react'
import {
    isSameAddress,
    NetworkPluginID,
    NonFungibleAsset,
    NonFungibleTokenCollection,
    SocialAddress,
    SocialAddressType,
    SourceType,
    Wallet,
} from '@masknet/web3-shared-base'
import { Box, Button, Stack, styled, Typography } from '@mui/material'
import { LoadingBase, makeStyles, useStylesExtends } from '@masknet/theme'
import { CollectibleCard } from './CollectibleCard'
import { useI18N } from '../../../../utils'
import { CollectionIcon } from './CollectionIcon'
import { uniqBy } from 'lodash-unified'
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown'
import { ElementAnchor, RetryHint, ReversedAddress } from '@masknet/shared'
import { EMPTY_LIST } from '@masknet/shared-base'
import { LoadingSkeleton } from './LoadingSkeleton'
import { useNonFungibleAssets, useTrustedNonFungibleTokens, Web3Helper } from '@masknet/plugin-infra/web3'

export const CollectibleContext = createContext<{
    collectiblesRetry: () => void
}>(null!)

const AllNetworkButton = styled(Button)(({ theme }) => ({
    display: 'inline-block',
    padding: 0,
    borderRadius: '50%',
    fontSize: 12,
    '&:hover': {
        boxShadow: 'none',
    },
    opacity: 0.5,
}))

const useStyles = makeStyles()((theme) => ({
    root: {
        display: 'grid',
        flexWrap: 'wrap',
        gridTemplateColumns: 'repeat(auto-fill, minmax(172px, 1fr))',
        gridGap: theme.spacing(1),
    },
    text: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100%',
    },
    button: {
        '&:hover': {
            border: 'solid 1px transparent',
        },
    },
    container: {
        height: 'calc(100% - 52px)',
        overflow: 'auto',
    },
    card: {
        width: 172,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        position: 'relative',
        padding: theme.spacing(1, 0),
    },
    description: {
        background: theme.palette.mode === 'light' ? '#F7F9FA' : '#2F3336',
        alignSelf: 'stretch',
    },
    name: {
        whiteSpace: 'nowrap',
        textOverflow: 'ellipsis',
        overflow: 'hidden',
        lineHeight: '36px',
        paddingLeft: '8px',
    },
    loading: {
        position: 'absolute',
        bottom: 6,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        width: '100%',
    },
    collectionWrap: {
        width: '24px',
        height: '24px',
        borderRadius: '50%',
        background: 'rgba(229,232,235,1)',
    },
    collectionImg: {
        objectFit: 'cover',
        width: '100%',
        height: '100%',
        borderRadius: '50%',
    },
    networkSelected: {
        width: 24,
        height: 24,
        minHeight: 24,
        minWidth: 24,
        lineHeight: '24px',
        background: theme.palette.primary.main,
        color: '#ffffff',
        fontSize: 10,
        opacity: 1,
        '&:hover': {
            background: theme.palette.primary.main,
        },
    },
}))

interface CollectibleItemProps {
    provider: SourceType
    wallet?: Wallet
    token: NonFungibleAsset<Web3Helper.ChainIdAll, Web3Helper.SchemaTypeAll>
    readonly?: boolean
    renderOrder: number
}

function CollectibleItem(props: CollectibleItemProps) {
    const { provider, wallet, token, readonly, renderOrder } = props
    const { classes } = useStyles()
    return (
        <div className={classes.card}>
            <CollectibleCard
                token={token}
                provider={provider}
                wallet={wallet}
                readonly={readonly}
                renderOrder={renderOrder}
            />
            <div className={classes.description}>
                <Typography className={classes.name} color="textPrimary" variant="body2">
                    {token.metadata?.name}
                </Typography>
            </div>
        </div>
    )
}

interface CollectibleListUIProps extends withClasses<'empty' | 'button' | 'text'> {
    provider: SourceType
    wallet?: Wallet
    collectibles: Array<NonFungibleAsset<Web3Helper.ChainIdAll, Web3Helper.SchemaTypeAll>>
    loading: boolean
    collectiblesRetry: () => void
    error: string | undefined
    readonly?: boolean
    hasRetry?: boolean
}
function CollectibleListUI(props: CollectibleListUIProps) {
    const { provider, wallet, collectibles, loading, collectiblesRetry, error, readonly, hasRetry = true } = props
    const { t } = useI18N()
    const classes = useStylesExtends(useStyles(), props)

    return (
        <CollectibleContext.Provider value={{ collectiblesRetry }}>
            <Box className={classes.container}>
                {loading && <LoadingSkeleton />}
                {error || (collectibles.length === 0 && !loading) ? (
                    <Box className={classes.text}>
                        <Typography color="textSecondary">{t('dashboard_no_collectible_found')}</Typography>
                        {hasRetry ? (
                            <Button className={classes.button} variant="text" onClick={() => collectiblesRetry()}>
                                {t('plugin_collectible_retry')}
                            </Button>
                        ) : null}
                    </Box>
                ) : (
                    <Box className={classes.root}>
                        {collectibles.map((token, index) => (
                            <CollectibleItem
                                renderOrder={index}
                                token={token}
                                provider={provider}
                                wallet={wallet}
                                readonly={readonly}
                                key={index}
                            />
                        ))}
                    </Box>
                )}
            </Box>
        </CollectibleContext.Provider>
    )
}

export interface CollectibleListProps extends withClasses<'empty' | 'button'> {
    address: string
    collectibles: Array<NonFungibleAsset<Web3Helper.ChainIdAll, Web3Helper.SchemaTypeAll>>
    error?: string
    loading: boolean
    retry(): void
}

export function CollectibleList(props: CollectibleListProps) {
    const { address, collectibles, error, loading, retry } = props
    const classes = props.classes ?? {}

    return (
        <CollectibleListUI
            provider={SourceType.OpenSea}
            classes={classes}
            collectibles={collectibles}
            loading={loading}
            collectiblesRetry={retry}
            error={error}
            readonly
            hasRetry={!!address}
        />
    )
}

export function CollectionList({
    addressName,
    onSelectAddress,
}: {
    addressName: SocialAddress<NetworkPluginID>
    onSelectAddress: (event: React.MouseEvent<HTMLButtonElement>) => void
}) {
    const { t } = useI18N()
    const { classes } = useStyles()
    const [selectedCollection, setSelectedCollection] = useState<
        NonFungibleTokenCollection<Web3Helper.ChainIdAll> | 'all' | undefined
    >('all')
    const { address: account } = addressName

    useEffect(() => {
        setSelectedCollection('all')
    }, [account])

    const trustedNonFungibleTokens = useTrustedNonFungibleTokens() as Array<
        NonFungibleAsset<Web3Helper.ChainIdAll, Web3Helper.SchemaTypeAll>
    >

    const {
        value: collectibles = EMPTY_LIST,
        done,
        next: nextPage,
        error,
        retry: retryFetchCollectible,
    } = useNonFungibleAssets(addressName.networkSupporterPluginID, undefined, { account })

    const allCollectibles = [
        ...trustedNonFungibleTokens.filter((x) => isSameAddress(x.contract?.owner, account)),
        ...collectibles,
    ]

    const renderCollectibles = useMemo(() => {
        if (selectedCollection === 'all') return allCollectibles
        const uniqCollectibles = uniqBy(allCollectibles, (x) => x?.contract?.address.toLowerCase() + x?.tokenId)
        if (!selectedCollection) return uniqCollectibles.filter((x) => !x.collection)

        return uniqCollectibles.filter((x) => isSameAddress(selectedCollection.address, x.collection?.address))
    }, [selectedCollection, allCollectibles.length])

    const collections = useMemo(() => {
        return uniqBy(allCollectibles, (x) => x?.contract?.address.toLowerCase())
            .map((x) => x?.collection)
            .filter(Boolean) as Array<NonFungibleTokenCollection<Web3Helper.ChainIdAll>>
    }, [allCollectibles.length])

    if (!allCollectibles.length && !done && !error && account) return <LoadingSkeleton />

    if (!allCollectibles.length && error && account) return <RetryHint retry={nextPage} />

    if ((done && !allCollectibles.length) || !account)
        return (
            <>
                {addressName && (
                    <Stack direction="row" height={42} justifyContent="flex-end" alignItems="center" px={2}>
                        <Box display="flex" alignItems="center" justifyContent="flex-end" flexWrap="wrap">
                            <Button
                                onClick={onSelectAddress}
                                className={classes.button}
                                variant="outlined"
                                size="small">
                                {addressName.type === SocialAddressType.ADDRESS ? (
                                    <ReversedAddress
                                        address={addressName.address}
                                        pluginId={addressName.networkSupporterPluginID}
                                    />
                                ) : (
                                    addressName.label
                                )}
                                <KeyboardArrowDownIcon />
                            </Button>
                        </Box>
                    </Stack>
                )}
                <Box display="flex" alignItems="center" justifyContent="center">
                    <Typography color="textPrimary" sx={{ paddingTop: 4, paddingBottom: 4 }}>
                        {t('dashboard_no_collectible_found')}
                    </Typography>
                </Box>
            </>
        )

    return (
        <Box>
            <Stack direction="row" justifyContent="space-between" alignItems="center" px={2}>
                <Stack display="inline-flex" />
                <Box display="flex" alignItems="center" justifyContent="flex-end" flexWrap="wrap">
                    <Button onClick={onSelectAddress} className={classes.button} variant="outlined" size="small">
                        {addressName.type === SocialAddressType.ADDRESS ? (
                            <ReversedAddress
                                address={addressName.address}
                                pluginId={addressName.networkSupporterPluginID}
                            />
                        ) : (
                            addressName.label
                        )}
                        <KeyboardArrowDownIcon />
                    </Button>
                </Box>
            </Stack>
            <Stack spacing={1} direction="row" mt={1.5}>
                <Box sx={{ flexGrow: 1 }}>
                    <Box>
                        {!selectedCollection && selectedCollection !== 'all' && (
                            <Box display="flex" alignItems="center">
                                <Typography
                                    className={classes.name}
                                    color="textPrimary"
                                    variant="body2"
                                    sx={{ fontSize: '16px' }}>
                                    Other
                                    {renderCollectibles.length ? `(${renderCollectibles.length})` : null}
                                </Typography>
                            </Box>
                        )}
                        {selectedCollection && selectedCollection !== 'all' && (
                            <Box display="flex" alignItems="center">
                                <CollectionIcon collection={selectedCollection} />
                                <Typography
                                    className={classes.name}
                                    color="textPrimary"
                                    variant="body2"
                                    sx={{ fontSize: '16px' }}>
                                    {selectedCollection?.name}
                                    {renderCollectibles.length ? `(${renderCollectibles.length})` : null}
                                </Typography>
                            </Box>
                        )}
                        <CollectibleList
                            address={account}
                            retry={retryFetchCollectible}
                            collectibles={renderCollectibles}
                            loading={renderCollectibles.length === 0}
                        />
                    </Box>
                    {error && !done && <RetryHint hint={false} retry={nextPage} />}
                    <ElementAnchor
                        callback={() => {
                            if (nextPage) nextPage()
                        }}>
                        {!done && <LoadingBase />}
                    </ElementAnchor>
                </Box>
                <Box>
                    <Box
                        display="flex"
                        alignItems="center"
                        justifyContent="center"
                        sx={{ marginTop: '8px', marginBottom: '12px', minWidth: 30, maxHeight: 24 }}>
                        <AllNetworkButton
                            className={classes.networkSelected}
                            onClick={() => setSelectedCollection('all')}>
                            ALL
                        </AllNetworkButton>
                    </Box>
                    {collections.map((x, i) => {
                        return (
                            <Box
                                display="flex"
                                key={i}
                                alignItems="center"
                                justifyContent="center"
                                sx={{ marginTop: '8px', marginBottom: '12px', minWidth: 30, maxHeight: 24 }}>
                                <CollectionIcon
                                    selectedCollection={
                                        selectedCollection === 'all' ? undefined : selectedCollection?.address
                                    }
                                    collection={x}
                                    onClick={() => {
                                        setSelectedCollection(x)
                                    }}
                                />
                            </Box>
                        )
                    })}
                </Box>
            </Stack>
        </Box>
    )
}
