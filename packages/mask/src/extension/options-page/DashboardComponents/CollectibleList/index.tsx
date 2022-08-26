import { Icons } from '@masknet/icons'
import { PluginId } from '@masknet/plugin-infra'
import { useNonFungibleAssets, useTrustedNonFungibleTokens, useWeb3State, Web3Helper } from '@masknet/plugin-infra/web3'
import { ElementAnchor, RetryHint } from '@masknet/shared'
import { EMPTY_LIST, NextIDPlatform } from '@masknet/shared-base'
import { LoadingBase, makeStyles } from '@masknet/theme'
import { CollectionType } from '@masknet/web3-providers'
import {
    isSameAddress,
    NetworkPluginID,
    NonFungibleAsset,
    NonFungibleCollection,
    SocialAddress,
    SocialIdentity,
    SourceType,
} from '@masknet/web3-shared-base'
import { Box, Button, Stack, styled, Tooltip, Typography } from '@mui/material'
import { uniqBy } from 'lodash-unified'
import { createContext, useEffect, useMemo, useState } from 'react'
import { useI18N } from '../../../../utils'
import { useAvailableCollections } from '../../hooks'
import { useKV } from '../../hooks/useKV'
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

export interface CollectibleGridProps {
    columns?: number
    gap?: string | number
}

const useStyles = makeStyles<CollectibleGridProps>()((theme, { columns = 3, gap = 2 }) => {
    const gapIsNumber = typeof gap === 'number'
    return {
        root: {
            width: '100%',
            display: 'grid',
            gridTemplateColumns: `repeat(${columns}, 1fr)`,
            gridGap: gapIsNumber ? theme.spacing(gap) : gap,
            padding: gapIsNumber ? theme.spacing(0, gap, 0) : `0 ${gap} 0`,
            boxSizing: 'border-box',
        },
        collectibleItem: {
            overflowX: 'hidden',
        },
        container: {
            boxSizing: 'border-box',
            paddingTop: gapIsNumber ? theme.spacing(gap) : gap,
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
        sidebar: {
            width: 30,
            flexShrink: 0,
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
            marginBottom: '12px',
            minWidth: 30,
            maxHeight: 24,
        },
    }
})

export interface CollectibleListProps extends withClasses<'empty' | 'button'>, CollectibleGridProps {
    address: SocialAddress<NetworkPluginID>
    collectibles: Array<NonFungibleAsset<Web3Helper.ChainIdAll, Web3Helper.SchemaTypeAll>>
    error?: string
    loading: boolean
    retry(): void
    readonly?: boolean
    hasRetry?: boolean
}

export function CollectibleList(props: CollectibleListProps) {
    const { address, collectibles, columns, gap, loading, retry, error, readonly, hasRetry = true } = props
    const { t } = useI18N()
    const { classes } = useStyles({ columns, gap }, { props: { classes: props.classes } })
    const { Others } = useWeb3State()

    return (
        <CollectibleContext.Provider value={{ collectiblesRetry: retry }}>
            <Box className={classes.list}>
                {loading && <LoadingSkeleton className={classes.root} />}
                {error || (collectibles.length === 0 && !loading) ? (
                    <Box className={classes.text}>
                        <Typography color="textSecondary">{t('dashboard_no_collectible_found')}</Typography>
                        {hasRetry ? (
                            <Button className={classes.button} variant="text" onClick={retry}>
                                {t('plugin_collectible_retry')}
                            </Button>
                        ) : null}
                    </Box>
                ) : (
                    <Box className={classes.root}>
                        {collectibles.map((token, index) => {
                            const name = token.collection?.name || token.contract?.name
                            const title = `${name} ${Others?.formatTokenId(token.tokenId, 2)}`
                            return (
                                <Tooltip
                                    key={index}
                                    title={title}
                                    placement="top"
                                    disableInteractive
                                    PopperProps={{
                                        disablePortal: true,
                                        popperOptions: {
                                            strategy: 'absolute',
                                        },
                                    }}
                                    arrow>
                                    <CollectibleItem
                                        className={classes.collectibleItem}
                                        renderOrder={index}
                                        asset={token}
                                        provider={SourceType.OpenSea}
                                        readonly={readonly}
                                        address={address}
                                    />
                                </Tooltip>
                            )
                        })}
                    </Box>
                )}
            </Box>
        </CollectibleContext.Provider>
    )
}

interface CollectionListProps {
    addressName: SocialAddress<NetworkPluginID>
    persona?: string
    profile?: SocialIdentity
    gridProps?: CollectibleGridProps
}

export function CollectionList({ addressName, persona, profile, gridProps }: CollectionListProps) {
    const { t } = useI18N()
    const { classes } = useStyles({})
    const [selectedCollection, setSelectedCollection] = useState<
        NonFungibleCollection<Web3Helper.ChainIdAll, Web3Helper.SchemaTypeAll> | undefined
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

    const { value: kvValue } = useKV(persona)
    const userId = profile?.identifier?.userId.toLowerCase()
    const isHiddenAddress = useMemo(() => {
        return kvValue?.proofs
            .find((proof) => proof?.platform === NextIDPlatform.Twitter && proof?.identity === userId)
            ?.content?.[PluginId.Web3Profile]?.hiddenAddresses?.NFTs?.some((x) =>
                isSameAddress(x.address, addressName.address),
            )
    }, [userId, addressName.address, kvValue?.proofs])

    const unHiddenCollectibles = useAvailableCollections(
        kvValue?.proofs ?? EMPTY_LIST,
        collectibles,
        CollectionType.NFTs,
        userId,
        account?.toLowerCase(),
    )

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
            NonFungibleCollection<Web3Helper.ChainIdAll, Web3Helper.SchemaTypeAll>
        >
        return collections
    }, [allCollectibles.length])

    if (!allCollectibles.length && !done && !error && account)
        return (
            <Box className={classes.container}>
                <Stack spacing={1} direction="row" mb={1.5}>
                    <LoadingSkeleton className={classes.root} />
                    <div className={classes.sidebar} />
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

    const showSidebar = collectionsWithName.length > 0

    return (
        <Box className={classes.container}>
            <Stack direction="row">
                <Box sx={{ flexGrow: 1 }}>
                    <Box>
                        {selectedCollection && (
                            <Box display="flex" alignItems="center" ml={2}>
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
                            {...gridProps}
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
                {showSidebar ? (
                    <div className={classes.sidebar}>
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
                    </div>
                ) : null}
            </Stack>
        </Box>
    )
}
