import { Icons } from '@masknet/icons'
import { EMPTY_ENTRY, EMPTY_LIST, NetworkPluginID, Sniffings } from '@masknet/shared-base'
import { MaskTextField, makeStyles } from '@masknet/theme'
import type { Web3Helper } from '@masknet/web3-helpers'
import { useAccount, useNonFungibleCollections, useWeb3State } from '@masknet/web3-hooks-base'
import { FuseNonFungibleCollection } from '@masknet/web3-providers'
import { SourceType, type NonFungibleCollection } from '@masknet/web3-shared-base'
import { SchemaType, isLensCollect, isLensFollower, isLensProfileAddress } from '@masknet/web3-shared-evm'
import { DialogContent, List, Stack, Typography } from '@mui/material'
import { Box } from '@mui/system'
import { compact } from 'lodash-es'
import { memo, useCallback, useMemo, useState } from 'react'
import { useSubscription } from 'use-subscription'
import { ContractItem } from './ContractItem.js'
import { useSharedI18N } from '../../../locales/index.js'
import { useAddCollectibles } from '../../contexts/common/index.js'
import { InjectedDialog } from '../../contexts/components/InjectedDialog.js'
import { ReloadStatus } from '../../components/ReloadStatus/index.js'
import { EmptyStatus, LoadingStatus } from '../../components/index.js'

const useStyles = makeStyles()((theme) => ({
    content: {
        display: 'flex',
        minHeight: 564,
        boxSizing: 'border-box',
        padding: theme.spacing(2, 0, 0),
        backgroundColor: theme.palette.maskColor.bottom,
        flexDirection: 'column',
        overflow: 'auto',
        msOverflowStyle: 'none',
        scrollbarWidth: 'none',
        '&::-webkit-scrollbar': {
            display: 'none',
        },
    },
    contractList: {
        overflow: 'auto',
        overscrollBehavior: 'contain',
        padding: theme.spacing(2, 2, 7),
        '&::-webkit-scrollbar': {
            display: 'none',
        },
    },
    contractItem: {
        marginBottom: theme.spacing(2),
    },
    toolbar: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: theme.spacing(7),
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        boxShadow: '0px 0px 20px rgba(0, 0, 0, 0.05)',
        backdropFilter: 'blur(16px)',
        borderRadius: theme.spacing(0, 0, 1.5, 1.5),
    },
}))

export interface SelectNonFungibleContractDialogProps<T extends NetworkPluginID = NetworkPluginID> {
    open: boolean
    pluginID: T
    chainId?: Web3Helper.Definition[T]['ChainId']
    title?: string
    onClose?(): void
    onSubmit?(
        collection: NonFungibleCollection<Web3Helper.Definition[T]['ChainId'], Web3Helper.Definition[T]['SchemaType']>,
    ): void
}

export const SelectNonFungibleContractDialog = memo(
    ({ open, pluginID, chainId, onClose, onSubmit }: SelectNonFungibleContractDialogProps) => {
        const t = useSharedI18N()
        const { classes } = useStyles()
        const [keyword, setKeyword] = useState('')

        const handleClear = () => {
            setKeyword('')
        }
        const {
            data: collections = EMPTY_LIST,
            isLoading,
            isError,
            refetch,
        } = useNonFungibleCollections(pluginID, {
            chainId,
            // TODO: remove this line, after SimpleHash can recognize ERC721 Collections.
            sourceType: SourceType.NFTScan,
        })

        const { Token } = useWeb3State(pluginID)
        const account = useAccount().toLowerCase()
        const customizedCollectionMap = useSubscription(Token?.nonFungibleCollectionMap! ?? EMPTY_ENTRY)
        // Convert StorageCollection to NonFungibleCollection
        const customizedCollections = useMemo((): Array<
            NonFungibleCollection<Web3Helper.ChainIdAll, Web3Helper.SchemaTypeAll>
        > => {
            const list = customizedCollectionMap[account]
            if (!list) return EMPTY_LIST
            const addresses = compact(collections.map((x) => x.address?.toLowerCase()))
            return list
                .filter((x) => !addresses.includes(x.contract.address))
                .map(({ contract, tokenIds }) => ({
                    chainId: contract.chainId,
                    name: contract.name,
                    address: contract.address,
                    slug: '' as string,
                    symbol: contract.symbol,
                    iconURL: contract.iconURL,
                    balance: tokenIds.length,
                    source: contract.source,
                }))
        }, [customizedCollectionMap[account], collections])

        const filteredCollections = useMemo(() => {
            const allCollections = [...customizedCollections, ...collections]
            return pluginID === NetworkPluginID.PLUGIN_EVM
                ? allCollections.filter((x) => {
                      return (
                          x.address &&
                          x.schema === SchemaType.ERC721 &&
                          !isLensCollect(x.name) &&
                          !isLensFollower(x.name) &&
                          !isLensProfileAddress(x.address)
                      )
                  })
                : allCollections
        }, [customizedCollections, collections, pluginID])
        const fuse = useMemo(() => {
            return FuseNonFungibleCollection.create(filteredCollections)
        }, [filteredCollections])
        const searchResults = useMemo(() => {
            if (!keyword) return filteredCollections
            return fuse.search(keyword).map((x) => x.item)
        }, [fuse, keyword, filteredCollections])

        const pickCollectibles = useAddCollectibles()
        const handleAddCollectibles = useCallback(async () => {
            const result = await pickCollectibles({
                pluginID,
                chainId,
            })
            if (!result) return
            const [contract, tokenIds] = result
            await Token?.addNonFungibleCollection?.(account, contract, tokenIds)
        }, [pickCollectibles, account, pluginID, chainId])

        return (
            <InjectedDialog
                titleBarIconStyle={Sniffings.is_dashboard_page ? 'close' : 'back'}
                open={open}
                onClose={onClose}
                title={t.select_collectibles()}>
                <DialogContent classes={{ root: classes.content }}>
                    <Box px={2}>
                        <MaskTextField
                            value={keyword}
                            onChange={(evt) => setKeyword(evt.target.value)}
                            placeholder={t.collectible_search_placeholder()}
                            autoFocus
                            fullWidth
                            InputProps={{
                                style: { height: 40 },
                                inputProps: { style: { paddingLeft: 4 } },
                                startAdornment: <Icons.Search size={18} />,
                                endAdornment: keyword ? <Icons.Close size={18} onClick={handleClear} /> : null,
                            }}
                        />
                    </Box>
                    {isError ? (
                        <ReloadStatus height={500} onRetry={refetch} />
                    ) : isLoading && !collections.length ? (
                        <LoadingStatus height={500} />
                    ) : !searchResults.length ? (
                        <EmptyStatus height={500}>{t.no_results()}</EmptyStatus>
                    ) : (
                        <List className={classes.contractList}>
                            {searchResults.map((collection) => (
                                <ContractItem
                                    key={collection.address}
                                    className={classes.contractItem}
                                    pluginID={pluginID}
                                    collection={collection}
                                    onSelect={onSubmit}
                                />
                            ))}
                        </List>
                    )}

                    <Stack
                        className={classes.toolbar}
                        direction="row"
                        justifyContent="center"
                        onClick={handleAddCollectibles}>
                        <Icons.Avatar size={24} />
                        <Typography ml={2} fontWeight={700}>
                            {t.add_collectibles()}
                        </Typography>
                    </Stack>
                </DialogContent>
            </InjectedDialog>
        )
    },
)
SelectNonFungibleContractDialog.displayName = 'SelectNonFungibleContractDialog'
