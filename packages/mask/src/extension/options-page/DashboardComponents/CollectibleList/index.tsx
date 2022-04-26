import { createContext, useEffect, useMemo, useState } from 'react'
import { useValueRef } from '@masknet/shared-base-ui'
import type {
    IdentityAddress,
    isSameAddress,
    NetworkPluginID,
    NonFungibleAsset,
    NonFungibleTokenContract,
} from '@masknet/web3-shared-base'
import type { ChainId, NonFungibleAssetProvider, SchemaType, Wallet } from '@masknet/web3-shared-evm'
import { Box, Button, Skeleton, Stack, styled, Typography } from '@mui/material'
import { makeStyles, useStylesExtends } from '@masknet/theme'
import { currentNonFungibleAssetDataProviderSettings } from '../../../../plugins/Wallet/settings'
import { useI18N } from '../../../../utils'
import { CollectibleCard } from './CollectibleCard'
import { WalletMessages } from '@masknet/plugin-wallet'
import { CollectionIcon } from './CollectionIcon'
import { uniqBy } from 'lodash-unified'
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown'
import { ReversedAddress } from '@masknet/shared'
import { useNonFungibleAssets } from '@masknet/plugin-infra/web3'

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
    button: {},
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
    provider: NonFungibleAssetProvider
    wallet?: Wallet
    token: NonFungibleAsset<ChainId, SchemaType>
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
    provider: NonFungibleAssetProvider
    wallet?: Wallet
    collectibles: NonFungibleAsset<ChainId, SchemaType>[]
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

    // useEffect(() => WalletMessages.events.erc721TokensUpdated.on(collectiblesRetry))

    return (
        <CollectibleContext.Provider value={{ collectiblesRetry }}>
            <Box className={classes.container}>
                {loading && (
                    <Box className={classes.root}>
                        {Array.from({ length: 3 })
                            .fill(0)
                            .map((_, i) => (
                                <Box className={classes.card} display="flex" flexDirection="column" key={i}>
                                    <Skeleton animation="wave" variant="rectangular" width={172} height={172} />
                                    <Skeleton
                                        animation="wave"
                                        variant="text"
                                        width={172}
                                        height={20}
                                        style={{ marginTop: 4 }}
                                    />
                                </Box>
                            ))}
                    </Box>
                )}
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
    collectibles: NonFungibleAsset<ChainId, SchemaType>[]
    error?: string
    loading: boolean
    retry(): void
}

export function CollectibleList(props: CollectibleListProps) {
    const { address, collectibles, error, loading, retry } = props
    const provider = useValueRef(currentNonFungibleAssetDataProviderSettings)
    const classes = props.classes ?? {}

    return (
        <CollectibleListUI
            classes={classes}
            provider={provider}
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
    addressName: IdentityAddress
    onSelectAddress: (event: React.MouseEvent<HTMLButtonElement>) => void
}) {
    return null
    // const chainId = ChainId.Mainnet
    // const { t } = useI18N()
    // const { classes } = useStyles()
    // const [selectedCollection, setSelectedCollection] = useState<NonFungibleAsset<ChainId, SchemaType> | 'all' | undefined>('all')
    // const { resolvedAddress: address } = addressName

    // useEffect(() => {
    //     setSelectedCollection('all')
    // }, [address])

    // const { data: collectionsFormRemote } = useNonFungibleAssets(NetworkPluginID.PLUGIN_EVM, address, chainId)
    // const {
    //     data: collectibles,
    //     state: loadingCollectibleDone,
    //     retry: retryFetchCollectible,
    // } = useNonFungibleAssets(NetworkPluginID.PLUGIN_EVM, address, chainId)

    // const isLoading = loadingCollectibleDone !== SocketState.done

    // const renderWithRarible = useMemo(() => {
    //     if (isLoading) return []
    //     return collectibles.filter((item) => !item.collection)
    // }, [collectibles?.length])

    // const renderCollectibles = useMemo(() => {
    //     if (selectedCollection === 'all') return collectibles
    //     if (!selectedCollection) return collectibles.filter((x) => !x.collection)

    //     return (collectibles ?? []).filter((x) => {
    //         return isSameAddress(selectedCollection.address, x.contractDetailed.address)
    //     })
    // }, [selectedCollection, collectibles.length])

    // const collections = useMemo(() => {
    //     return uniqBy(
    //         collectibles.map((x) => x.contractDetailed),
    //         (x) => x.address.toLowerCase(),
    //     ).map((x) => {
    //         const item = collectionsFormRemote.find((c) => isSameAddress(c.address, x.address))
    //         if (item) {
    //             return {
    //                 id: item.address,
    //                 name: item.name,
    //                 symbol: item.name,
    //                 baseURI: item.iconURL,
    //                 logoURL: item.iconURL,
    //                 address: item.address,
    //             } as NonFungibleTokenContract<ChainId, SchemaType>
    //         }
    //         return x
    //     })
    // }, [collectibles.length, collectionsFormRemote.length])

    // if (!isLoading && !collectibles.length)
    //     return (
    //         <>
    //             {addressName && (
    //                 <Stack direction="row" height={42} justifyContent="flex-end" alignItems="center" px={2}>
    //                     <Box display="flex" alignItems="center" justifyContent="flex-end" flexWrap="wrap">
    //                         <Button
    //                             onClick={onSelectAddress}
    //                             className={classes.button}
    //                             variant="outlined"
    //                             size="small">
    //                             <ReversedAddress address={addressName.resolvedAddress} />
    //                             <KeyboardArrowDownIcon />
    //                         </Button>
    //                     </Box>
    //                 </Stack>
    //             )}
    //             <Box display="flex" alignItems="center" justifyContent="center">
    //                 <Typography color="textPrimary" sx={{ paddingTop: 4, paddingBottom: 4 }}>
    //                     {t('dashboard_no_collectible_found')}
    //                 </Typography>
    //             </Box>
    //         </>
    //     )

    // return (
    //     <Box>
    //         <Stack direction="row" justifyContent="space-between" alignItems="center" px={2}>
    //             <Stack display="inline-flex">
    //                 <AllNetworkButton className={classes.networkSelected} onClick={() => setSelectedCollection('all')}>
    //                     ALL
    //                 </AllNetworkButton>
    //                 <Typography align="center" color={(theme) => theme.palette.primary.main} fontSize="12px">
    //                     {t('dashboard_collectible_menu_all', {
    //                         count: collectibles.length,
    //                     })}
    //                 </Typography>
    //             </Stack>
    //             <Box display="flex" alignItems="center" justifyContent="flex-end" flexWrap="wrap">
    //                 <Button onClick={onSelectAddress} className={classes.button} variant="outlined" size="small">
    //                     <ReversedAddress address={addressName.resolvedAddress} />
    //                     <KeyboardArrowDownIcon />
    //                 </Button>
    //             </Box>
    //         </Stack>
    //         <Stack spacing={1} direction="row" mt={1.5}>
    //             <Box sx={{ flexGrow: 1 }}>
    //                 <Box>
    //                     {!selectedCollection && selectedCollection !== 'all' && (
    //                         <Box display="flex" alignItems="center">
    //                             <Typography
    //                                 className={classes.name}
    //                                 color="textPrimary"
    //                                 variant="body2"
    //                                 sx={{ fontSize: '16px' }}>
    //                                 Other
    //                                 {loadingCollectibleDone && renderCollectibles.length
    //                                     ? `(${renderCollectibles.length})`
    //                                     : null}
    //                             </Typography>
    //                         </Box>
    //                     )}
    //                     {selectedCollection && selectedCollection !== 'all' && (
    //                         <Box display="flex" alignItems="center">
    //                             <CollectionIcon collection={selectedCollection} />
    //                             <Typography
    //                                 className={classes.name}
    //                                 color="textPrimary"
    //                                 variant="body2"
    //                                 sx={{ fontSize: '16px' }}>
    //                                 {selectedCollection.metadata?.name}
    //                                 {loadingCollectibleDone && renderCollectibles.length
    //                                     ? `(${renderCollectibles.length})`
    //                                     : null}
    //                             </Typography>
    //                         </Box>
    //                     )}
    //                     <CollectibleList
    //                         address={address}
    //                         retry={retryFetchCollectible}
    //                         collectibles={renderCollectibles}
    //                         // loading={loadingCollectibleDone !== SocketState.done && renderCollectibles.length === 0}
    //                         loading={renderCollectibles.length === 0}
    //                     />
    //                 </Box>
    //             </Box>
    //             <Box>
    //                 {collections.map((x, i) => {
    //                     return (
    //                         <Box
    //                             display="flex"
    //                             key={i}
    //                             alignItems="center"
    //                             justifyContent="center"
    //                             sx={{ marginTop: '8px', marginBottom: '12px', minWidth: 30, maxHeight: 24 }}>
    //                             <CollectionIcon
    //                                 selectedCollection={
    //                                     selectedCollection === 'all' ? undefined : selectedCollection?.address
    //                                 }
    //                                 collection={x}
    //                                 onClick={() => setSelectedCollection(x)}
    //                             />
    //                         </Box>
    //                     )
    //                 })}
    //                 {!!renderWithRarible.length && (
    //                     <Box
    //                         key="other"
    //                         display="flex"
    //                         alignItems="center"
    //                         justifyContent="center"
    //                         sx={{ marginTop: '8px', marginBottom: '12px', minWidth: 30, maxHeight: 24 }}>
    //                         <CollectionIcon
    //                             selectedCollection={
    //                                 selectedCollection === 'all' ? undefined : selectedCollection?.address
    //                             }
    //                             onClick={() => setSelectedCollection(undefined)}
    //                         />
    //                     </Box>
    //                 )}
    //             </Box>
    //         </Stack>
    //     </Box>
    // )
}
