import { Trans, useLingui } from '@lingui/react/macro'
import { Icons } from '@masknet/icons'
import { EMPTY_ENTRY, EMPTY_LIST, NetworkPluginID, Sniffings } from '@masknet/shared-base'
import { MaskTextField, makeStyles } from '@masknet/theme'
import type { Web3Helper } from '@masknet/web3-helpers'
import { useAccount, useNetworks, useNonFungibleCollections, useWeb3State } from '@masknet/web3-hooks-base'
import { isSameAddress, type NonFungibleCollection, type ReasonableNetwork } from '@masknet/web3-shared-base'
import {
    CHAIN_DESCRIPTORS,
    ChainId,
    type NetworkType,
    SchemaType,
    isLensCollect,
    isLensFollower,
    isLensProfileAddress,
} from '@masknet/web3-shared-evm'
import { Button, DialogActions, DialogContent, List, Stack, Typography } from '@mui/material'
import { Box } from '@mui/system'
import Fuse from 'fuse.js'
import { compact, sortBy } from 'lodash-es'
import { memo, useCallback, useMemo, useState } from 'react'
import { useSubscription } from 'use-subscription'
import { ReloadStatus } from '../../components/ReloadStatus/index.js'
import { EmptyStatus, LoadingStatus, SelectNetworkSidebar } from '../../components/index.js'
import { InjectedDialog } from '../../contexts/components/InjectedDialog.js'
import { AddCollectiblesModal } from '../modals.js'
import { ContractItem } from './ContractItem.js'
import { SimpleHashSupportedChains } from '../../../constants.js'

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
    columns: {
        display: 'flex',
        minHeight: 0,
    },
    sidebar: {
        paddingLeft: theme.spacing(1.5),
        paddingBottom: theme.spacing(10),
    },
    main: {
        display: 'flex',
        flexDirection: 'column',
        flexGrow: 1,
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
        scrollbarWidth: 'none',
        '&::-webkit-scrollbar': {
            display: 'none',
        },
    },
    contractItem: {
        marginBottom: theme.spacing(2),
    },
    dialogActions: {
        padding: 16,
        boxSizing: 'border-box',
        boxShadow: '0px 0px 20px rgba(0, 0, 0, 0.05)',
        position: 'absolute',
        bottom: 0,
        width: '100%',
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

interface SelectNonFungibleContractDialogProps<T extends NetworkPluginID = NetworkPluginID> {
    open: boolean
    pluginID: T
    chainId?: Web3Helper.Definition[T]['ChainId']
    schemaType?: SchemaType
    title?: string
    initialCollections?: Array<NonFungibleCollection<Web3Helper.ChainIdAll, Web3Helper.SchemaTypeAll>>
    selectedCollections?: Array<NonFungibleCollection<Web3Helper.ChainIdAll, Web3Helper.SchemaTypeAll>>
    multiple?: boolean
    maxCollections?: number
    onClose?(): void
    onSubmit?(
        collection:
            | NonFungibleCollection<Web3Helper.Definition[T]['ChainId'], Web3Helper.Definition[T]['SchemaType']>
            | Array<NonFungibleCollection<Web3Helper.Definition[T]['ChainId'], Web3Helper.Definition[T]['SchemaType']>>,
    ): void
}

export const SelectNonFungibleContractDialog = memo(
    ({
        open,
        pluginID,
        chainId: propChainId,
        schemaType,
        initialCollections,
        selectedCollections = EMPTY_LIST,
        multiple,
        maxCollections,
        onClose,
        onSubmit,
    }: SelectNonFungibleContractDialogProps) => {
        const { t } = useLingui()
        const { classes } = useStyles()
        const [keyword, setKeyword] = useState('')

        const handleClear = () => {
            setKeyword('')
        }
        const [chainId = propChainId, setChainId] = useState<Web3Helper.Definition[NetworkPluginID]['ChainId']>()
        const {
            data: collections = EMPTY_LIST,
            isPending,
            isError,
            refetch,
        } = useNonFungibleCollections(pluginID, {
            chainId,
            schemaType,
        })

        const { Token } = useWeb3State(pluginID)
        const account = useAccount().toLowerCase()
        const customizedCollectionMap = useSubscription(Token?.nonFungibleCollectionMap ?? EMPTY_ENTRY)
        const list = customizedCollectionMap[account]
        // Convert StorageCollection to NonFungibleCollection
        const customizedCollections = useMemo((): Array<
            NonFungibleCollection<Web3Helper.ChainIdAll, Web3Helper.SchemaTypeAll>
        > => {
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
        }, [list, collections])

        const filteredCollections = useMemo(() => {
            const allCollections = [...customizedCollections, ...collections]
            const result =
                pluginID === NetworkPluginID.PLUGIN_EVM ?
                    allCollections.filter((x) => {
                        return (
                            x.address &&
                            x.schema === SchemaType.ERC721 &&
                            !isLensCollect(x.name) &&
                            !isLensFollower(x.name) &&
                            !isLensProfileAddress(x.address)
                        )
                    })
                :   allCollections

            return [...result, ...(initialCollections ?? [])]
        }, [customizedCollections, collections, pluginID, initialCollections])
        const fuse = useMemo(() => {
            return new Fuse(filteredCollections, {
                keys: [
                    { name: 'name', weight: 0.5 },
                    { name: 'symbol', weight: 0.8 },
                    { name: 'address', weight: 1 },
                ],
                shouldSort: true,
                threshold: 0.45,
                minMatchCharLength: 3,
            })
        }, [filteredCollections])
        const searchResults = useMemo(() => {
            if (!keyword) return filteredCollections
            return fuse.search(keyword).map((x) => x.item)
        }, [fuse, keyword, filteredCollections])

        const handleAddCollectibles = useCallback(async () => {
            const results = await AddCollectiblesModal.openAndWaitForClose({
                pluginID,
                chainId,
            })
            if (!results) return
            const [contract, tokenIds] = results
            await Token?.addNonFungibleTokens?.(account, contract, tokenIds)
        }, [account, pluginID, chainId])

        const [pendingSelectedCollections, setPendingSelectedCollections] = useState(selectedCollections ?? EMPTY_LIST)
        const noChanges = useMemo(() => {
            const selectedSet = new Set(selectedCollections.map((x) => [x.chainId, x.address].join(':').toLowerCase()))
            const pendingSet = new Set(
                pendingSelectedCollections.map((x) => [x.chainId, x.address].join(':').toLowerCase()),
            )
            return pendingSet.size === selectedSet.size && pendingSet.difference(selectedSet).size === 0
        }, [pendingSelectedCollections, selectedCollections])
        const handleSelectCollection = useCallback(
            (collection: NonFungibleCollection<Web3Helper.ChainIdAll, Web3Helper.SchemaTypeAll>) => {
                // onSubmit?.(collection)
                if (multiple) {
                    setPendingSelectedCollections((collections) => {
                        const selected = collections.find(
                            (x) => isSameAddress(x.address, collection.address) && x.chainId === collection.chainId,
                        )
                        if (selected) return collections.filter((x) => x !== selected)
                        return maxCollections && collections.length >= maxCollections ?
                                collections
                            :   [...collections, collection]
                    })
                } else {
                    onSubmit?.(collection)
                    onClose?.()
                }
            },
            [onClose, multiple, maxCollections],
        )
        const allNetworks = useNetworks(NetworkPluginID.PLUGIN_EVM, true)

        const networks = useMemo(() => {
            const supported = SimpleHashSupportedChains[pluginID]
            const networks = allNetworks.filter(
                (x) => (x.network === 'mainnet' || x.isCustomized) && supported.includes(x.chainId),
            )
            // hard-coded for Zora
            if (pluginID === NetworkPluginID.PLUGIN_EVM) {
                const zora = CHAIN_DESCRIPTORS.find((x) => x.chainId === ChainId.Zora)
                if (zora) networks.push(zora as ReasonableNetwork<ChainId, SchemaType, NetworkType>)
            }
            return sortBy(networks, (x) => supported.indexOf(x.chainId))
        }, [allNetworks, pluginID])

        return (
            <InjectedDialog
                titleBarIconStyle={Sniffings.is_dashboard_page ? 'close' : 'back'}
                open={open}
                onClose={onClose}
                title={<Trans>Select Collection</Trans>}>
                <DialogContent classes={{ root: classes.content }}>
                    <div className={classes.columns}>
                        <SelectNetworkSidebar
                            className={classes.sidebar}
                            hideAllButton
                            chainId={chainId}
                            onChainChange={(chainId) => setChainId(chainId ?? ChainId.Mainnet)}
                            networks={networks}
                            pluginID={NetworkPluginID.PLUGIN_EVM}
                        />
                        <div className={classes.main}>
                            <Box px={2}>
                                <MaskTextField
                                    value={keyword}
                                    onChange={(evt) => setKeyword(evt.target.value)}
                                    placeholder={t`Name or contract address eg. PUNK or 0x234...`}
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
                            {isError ?
                                <ReloadStatus height={500} onRetry={refetch} />
                            : isPending && !collections.length ?
                                <LoadingStatus height={500} />
                            : !searchResults.length ?
                                <EmptyStatus height={500}>
                                    <Trans>No results</Trans>
                                </EmptyStatus>
                            :   <List className={classes.contractList}>
                                    {searchResults.map((collection) => {
                                        const selected = pendingSelectedCollections.some(
                                            (x) =>
                                                isSameAddress(x.address, collection.address) &&
                                                x.chainId === collection.chainId,
                                        )
                                        return (
                                            <ContractItem
                                                key={collection.address}
                                                className={classes.contractItem}
                                                pluginID={pluginID}
                                                selected={selected}
                                                enabledSelect={multiple}
                                                disabled={
                                                    !!maxCollections &&
                                                    pendingSelectedCollections.length >= maxCollections
                                                }
                                                collection={collection}
                                                onSelect={handleSelectCollection}
                                            />
                                        )
                                    })}
                                </List>
                            }
                        </div>
                    </div>
                    {multiple ?
                        <DialogActions className={classes.dialogActions}>
                            <Button
                                variant="contained"
                                disabled={noChanges}
                                fullWidth
                                onClick={() => {
                                    onSubmit?.(pendingSelectedCollections)
                                    onClose?.()
                                }}>
                                <Trans>Confirm</Trans>
                            </Button>
                        </DialogActions>
                    :   <Stack
                            className={classes.toolbar}
                            direction="row"
                            justifyContent="center"
                            onClick={handleAddCollectibles}>
                            <Icons.Avatar size={24} />
                            <Typography ml={2} fontWeight={700}>
                                <Trans>Add NFTs</Trans>
                            </Typography>
                        </Stack>
                    }
                </DialogContent>
            </InjectedDialog>
        )
    },
)
SelectNonFungibleContractDialog.displayName = 'SelectNonFungibleContractDialog'
