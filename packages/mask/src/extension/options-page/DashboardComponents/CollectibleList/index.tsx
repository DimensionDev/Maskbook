import { Icons } from '@masknet/icons'
import { useNonFungibleAssets, useTrustedNonFungibleTokens, Web3Helper, useWeb3State } from '@masknet/plugin-infra/web3'
import { ElementAnchor, RetryHint, useWeb3ProfileHiddenSetting } from '@masknet/shared'
import { EMPTY_LIST } from '@masknet/shared-base'
import { LoadingBase, makeStyles, useStylesExtends } from '@masknet/theme'
import { CollectionType } from '@masknet/web3-providers'
import {
    isSameAddress,
    NetworkPluginID,
    NonFungibleAsset,
    NonFungibleTokenCollection,
    SocialAddress,
    SocialIdentity,
    SourceType,
    Wallet,
} from '@masknet/web3-shared-base'
import { Box, Button, Stack, styled, Typography } from '@mui/material'
import { differenceWith, uniqBy } from 'lodash-unified'
import { createContext, useEffect, useMemo, useState } from 'react'
import { useI18N } from '../../../../utils'
import { CollectibleItem } from './CollectibleItem'
import { CollectionIcon } from './CollectionIcon'
import { LoadingSkeleton } from './LoadingSkeleton'

export const CollectibleContext = createContext<{
    collectiblesRetry: () => void
}>(null!)

const AllButton = styled(Button)(({ theme }) => ({
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
        width: '100%',
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gridGap: theme.spacing(2),
    },
    collectibleItem: {
        overflowX: 'hidden',
    },
    container: {
        paddingLeft: theme.spacing(1),
        boxSizing: 'border-box',
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
    list: {
        height: 'calc(100% - 52px)',
        overflow: 'auto',
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
    collectionButton: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: '8px',
        marginBottom: '12px',
        minWidth: 30,
        maxHeight: 24,
    },
}))

interface CollectibleListUIProps extends withClasses<'empty' | 'button' | 'text'> {
    provider: SourceType
    wallet?: Wallet
    collectibles: Array<NonFungibleAsset<Web3Helper.ChainIdAll, Web3Helper.SchemaTypeAll>>
    loading: boolean
    collectiblesRetry: () => void
    error: string | undefined
    readonly?: boolean
    hasRetry?: boolean
    address?: SocialAddress<NetworkPluginID>
}
function CollectibleListUI(props: CollectibleListUIProps) {
    const {
        provider,
        wallet,
        collectibles,
        loading,
        collectiblesRetry,
        error,
        readonly,
        hasRetry = true,
        address,
    } = props
    const { t } = useI18N()
    const classes = useStylesExtends(useStyles(), props)

    return (
        <CollectibleContext.Provider value={{ collectiblesRetry }}>
            <Box className={classes.list}>
                {loading && <LoadingSkeleton className={classes.root} />}
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
                                className={classes.collectibleItem}
                                renderOrder={index}
                                asset={token}
                                provider={provider}
                                wallet={wallet}
                                readonly={readonly}
                                key={index}
                                address={address}
                            />
                        ))}
                    </Box>
                )}
            </Box>
        </CollectibleContext.Provider>
    )
}

export interface CollectibleListProps extends withClasses<'empty' | 'button'> {
    address: SocialAddress<NetworkPluginID>
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
            address={address}
            hasRetry={!!address}
        />
    )
}

export function CollectionList({
    addressName,
    persona,
    profile,
}: {
    addressName: SocialAddress<NetworkPluginID>
    persona?: string
    profile?: SocialIdentity
}) {
    const { t } = useI18N()
    const { classes } = useStyles()
    const { Storage } = useWeb3State()
    const [selectedCollection, setSelectedCollection] = useState<
        NonFungibleTokenCollection<Web3Helper.ChainIdAll, Web3Helper.SchemaTypeAll> | undefined
    >()
    const { address: account } = addressName

    useEffect(() => {
        setSelectedCollection(undefined)
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

    const userId = profile?.identifier?.userId.toLowerCase()

    const { isHiddenAddress, hiddenList } = useWeb3ProfileHiddenSetting(userId, persona, {
        address: account,
        hiddenAddressesKey: 'NFTs',
        collectionKey: CollectionType.NFTs,
    })

    const unHiddenCollectibles = useMemo(() => {
        if (!hiddenList.length) return collectibles

        return differenceWith(
            collectibles,
            hiddenList,
            (collection, id) => `${collection.id}_${collection.tokenId}`.toLowerCase() === id.toLowerCase(),
        )
    }, [hiddenList, collectibles])

    const allCollectibles = [
        ...trustedNonFungibleTokens.filter((x) => isSameAddress(x.contract?.owner, account)),
        ...unHiddenCollectibles,
    ]

    const renderCollectibles = useMemo(() => {
        if (!selectedCollection) return allCollectibles
        const uniqCollectibles = uniqBy(allCollectibles, (x) => x?.contract?.address.toLowerCase() + x?.tokenId)
        if (!selectedCollection) return uniqCollectibles.filter((x) => !x.collection)
        return uniqCollectibles.filter(
            (x) =>
                selectedCollection.name === x.collection?.name ||
                isSameAddress(selectedCollection.address, x.collection?.address),
        )
    }, [selectedCollection, allCollectibles.length])

    const collectionsWithName = useMemo(() => {
        const collections = uniqBy(allCollectibles, (x) => x?.contract?.address.toLowerCase())
            .map((x) => x?.collection)
            .filter((x) => x?.name.length) as Array<
            NonFungibleTokenCollection<Web3Helper.ChainIdAll, Web3Helper.SchemaTypeAll>
        >
        return collections
    }, [allCollectibles.length])

    if (!allCollectibles.length && !done && !error && account)
        return (
            <Box className={classes.container}>
                <Stack spacing={1} direction="row" mt={1.5}>
                    <LoadingSkeleton className={classes.root} />
                    <Box width="30px" />
                </Stack>
            </Box>
        )

    if (!allCollectibles.length && error && account) return <RetryHint retry={nextPage} />

    if ((done && !allCollectibles.length) || !account || isHiddenAddress)
        return (
            <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" height={400}>
                <Icons.EmptySimple size={32} />
                <Typography color={(theme) => theme.palette.maskColor.second} fontSize="14px" marginTop="12px">
                    {t('no_NFTs_found')}
                </Typography>
            </Box>
        )

    return (
        <Box className={classes.container}>
            <Stack spacing={1} direction="row" mt={1.5}>
                <Box sx={{ flexGrow: 1 }}>
                    <Box>
                        {selectedCollection && (
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
                            address={addressName}
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
                <Box width="30px">
                    {collectionsWithName.length ? (
                        <Box>
                            <Box className={classes.collectionButton}>
                                <AllButton
                                    className={classes.networkSelected}
                                    onClick={() => setSelectedCollection(undefined)}>
                                    ALL
                                </AllButton>
                            </Box>
                            {collectionsWithName.map((x, i) => (
                                <Box key={i} className={classes.collectionButton}>
                                    <CollectionIcon
                                        selectedCollection={selectedCollection?.address}
                                        collection={x}
                                        onClick={() => {
                                            setSelectedCollection(x)
                                        }}
                                    />
                                </Box>
                            ))}
                        </Box>
                    ) : null}
                </Box>
            </Stack>
        </Box>
    )
}
