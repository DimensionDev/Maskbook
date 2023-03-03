import { useEffect, useMemo, useState } from 'react'
import { differenceWith, uniqBy } from 'lodash-es'
import { Icons } from '@masknet/icons'
import { ElementAnchor, RetryHint, useWeb3ProfileHiddenSettings } from '@masknet/shared'
import { useNonFungibleAssets, useTrustedNonFungibleTokens } from '@masknet/web3-hooks-base'
import type { Web3Helper } from '@masknet/web3-helpers'
import { EMPTY_LIST, EMPTY_OBJECT } from '@masknet/shared-base'
import { LoadingBase, makeStyles } from '@masknet/theme'
import { CollectionType } from '@masknet/web3-providers/types'
import { isSameAddress, type SocialAccount, type SocialIdentity } from '@masknet/web3-shared-base'
import { Box, Button, Stack, Typography, styled } from '@mui/material'
import { CollectibleList } from './CollectibleList.js'
import { CollectionIcon } from './CollectionIcon.js'
import { LoadingSkeleton } from './LoadingSkeleton.js'
import type { CollectibleGridProps } from '../../types.js'
import { useI18N } from '../../locales/i18n_generated.js'

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

export const useStyles = makeStyles<CollectibleGridProps>()((theme, { columns = 3, gap = 2 }) => {
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
        container: {
            boxSizing: 'border-box',
            paddingTop: gapIsNumber ? theme.spacing(gap) : gap,
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
        networkSelected: {
            width: 24,
            height: 24,
            minHeight: 24,
            minWidth: 24,
            lineHeight: '24px',
            background: theme.palette.maskColor.primary,
            color: '#ffffff',
            fontSize: 10,
            opacity: 1,
            '&:hover': {
                background: theme.palette.maskColor.primary,
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

export interface CollectionListProps {
    socialAccount: SocialAccount<Web3Helper.ChainIdAll>
    persona?: string
    profile?: SocialIdentity
    gridProps?: CollectibleGridProps
}

export function CollectionList({ socialAccount, persona, profile, gridProps = EMPTY_OBJECT }: CollectionListProps) {
    const { address: account } = socialAccount
    const t = useI18N()
    const { classes } = useStyles(gridProps)
    const [selectedCollection, setSelectedCollection] = useState<Web3Helper.NonFungibleCollectionAll | undefined>()

    useEffect(() => {
        setSelectedCollection(undefined)
    }, [account])

    const trustedNonFungibleTokens = useTrustedNonFungibleTokens()

    const {
        value: collectibles = EMPTY_LIST,
        done,
        next: nextPage,
        error,
        retry: retryFetchCollectible,
    } = useNonFungibleAssets(socialAccount.pluginID, undefined, { account })

    const { isHiddenAddress, hiddenList } = useWeb3ProfileHiddenSettings(
        profile?.identifier?.userId.toLowerCase(),
        persona,
        {
            address: account,
            hiddenAddressesKey: 'NFTs',
            collectionKey: CollectionType.NFTs,
        },
    )

    const unHiddenCollectibles = useMemo(() => {
        if (!hiddenList.length) return collectibles

        return differenceWith(
            collectibles,
            hiddenList,
            (collection, key) => [collection.address, collection.tokenId].join('_').toLowerCase() === key.toLowerCase(),
        )
    }, [hiddenList, collectibles])

    const allCollectibles = useMemo(
        () => [
            ...trustedNonFungibleTokens.filter((x) => isSameAddress(x.contract?.owner, account)),
            ...unHiddenCollectibles,
        ],
        [trustedNonFungibleTokens, unHiddenCollectibles],
    )

    const renderCollectibles = useMemo(() => {
        const uniqCollectibles = uniqBy(allCollectibles, (x) => x.contract?.address.toLowerCase() + x?.tokenId)
        if (!selectedCollection) return uniqCollectibles
        if (!selectedCollection) return uniqCollectibles.filter((x) => !x.collection)
        return uniqCollectibles.filter(
            (x) =>
                selectedCollection.name === x.collection?.name ||
                isSameAddress(selectedCollection.address, x.collection?.address),
        )
    }, [selectedCollection, allCollectibles])

    const collectionsWithName = useMemo(() => {
        const collections = uniqBy(allCollectibles, (x) => x.contract?.address.toLowerCase())
            .map((x) => x.collection)
            .filter((x) => x?.name)
        return collections as Web3Helper.NonFungibleCollectionAll[]
    }, [allCollectibles])

    if (!allCollectibles.length && !done && !error && account)
        return (
            <Box className={classes.container}>
                <Stack spacing={1} direction="row" mb={1.5}>
                    <LoadingSkeleton className={classes.root} />
                    <div className={classes.sidebar} />
                </Stack>
            </Box>
        )

    if (!allCollectibles.length && error && account)
        return (
            <Box className={classes.container}>
                <Box mt="200px" color={(theme) => theme.palette.maskColor.main}>
                    <RetryHint retry={nextPage} />
                </Box>
            </Box>
        )

    if ((done && !allCollectibles.length) || !account || isHiddenAddress)
        return (
            <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" height={400}>
                <Icons.EmptySimple size={32} />
                <Typography color={(theme) => theme.palette.maskColor.second} fontSize="14px" marginTop="12px">
                    {t.no_NFTs_found()}
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
                            pluginID={socialAccount.pluginID}
                            retry={retryFetchCollectible}
                            collectibles={renderCollectibles}
                            loading={renderCollectibles.length === 0}
                            {...gridProps}
                        />
                    </Box>
                    {error && done && <RetryHint hint={false} retry={nextPage} />}
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
