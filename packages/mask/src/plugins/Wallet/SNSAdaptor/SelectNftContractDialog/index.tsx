import { useCallback, useState } from 'react'
import { LoadingBase, makeStyles } from '@masknet/theme'
import { Avatar, Box, DialogContent, Link, List, ListItem, Typography } from '@mui/material'
import { SchemaType, explorerResolver, type ChainId } from '@masknet/web3-shared-evm'
import { useRemoteControlledDialog } from '@masknet/shared-base-ui'
import { InjectedDialog } from '@masknet/shared'
import { NetworkPluginID } from '@masknet/shared-base'
import { OpenInNew as OpenInNewIcon } from '@mui/icons-material'
import type { NonFungibleCollection } from '@masknet/web3-shared-base'
import { useChainContext, useNonFungibleCollections } from '@masknet/web3-hooks-base'
import { WalletMessages } from '@masknet/plugin-wallet'
import { FuseNonFungibleCollection } from '@masknet/web3-providers'
import { useI18N } from '../../../../utils/index.js'
import { SearchInput } from '../../../../extension/options-page/DashboardComponents/SearchInput.js'

const useStyles = makeStyles()((theme) => ({
    search: {
        width: '95%',
        margin: theme.spacing(1, 0, 2, 0.8),
    },
    searchBox: {
        height: 400,
        width: '100%',
    },
    listItem: {
        cursor: 'pointer',
        display: 'flex',
        width: '100%',
        height: 63,
        borderRadius: 12,
        '&:hover': {
            background: theme.palette.mode === 'light' ? '#F7F9FA' : '#17191D',
        },
        position: 'relative',
    },
    icon: {
        borderRadius: 1000,
        width: 36,
        height: 36,
        marginRight: 8,
    },
    openIcon: {
        display: 'flex',
        color: theme.palette.mode === 'light' ? 'rgba(123, 129, 146, 1)' : 'rgba(111, 118, 124, 1)',
        width: 16,
        height: 16,
        marginLeft: 2,
    },

    address: {
        color: theme.palette.mode === 'light' ? 'rgba(123, 129, 146, 1)' : 'rgba(111, 118, 124, 1)',
        display: 'flex',
        textDecoration: 'none',
        alignItems: 'center',
        position: 'absolute',
        left: 59,
        bottom: 10,
        cursor: 'pointer',
        fontSize: 12,
        '&:hover': {
            textDecoration: 'none',
        },
    },
    addressText: {
        fontSize: 12,
    },
    dialogContent: {
        height: 560,
    },
    noResultBox: {
        background: theme.palette.background.default,
        height: 431,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 16,
    },
    contractName: {
        marginBottom: 20,
        paddingRight: 30,
        textOverflow: 'ellipsis',
        overflow: 'hidden',
        whiteSpace: 'nowrap',
    },
    balance: {
        position: 'absolute',
        right: 25,
    },
}))

export interface SelectNftContractDialogProps {}

export function SelectNftContractDialog(props: SelectNftContractDialogProps) {
    const { t } = useI18N()
    const { classes } = useStyles()

    const [keyword, setKeyword] = useState('')
    const { chainId, setChainId } = useChainContext<NetworkPluginID.PLUGIN_EVM>()

    // #region remote controlled dialog
    const { open, setDialog } = useRemoteControlledDialog(
        WalletMessages.events.selectNftContractDialogUpdated,
        (ev) => {
            if (!ev.open) return
            if (ev.chainId) setChainId(ev.chainId)
        },
    )
    const onSubmit = useCallback(
        (collection: NonFungibleCollection<ChainId, SchemaType>, balance?: number) => {
            setKeyword('')
            setDialog({
                open: false,
                balance,
                collection,
            })
        },
        [setDialog, setKeyword],
    )
    const onClose = useCallback(() => {
        setKeyword('')
        setDialog({
            open: false,
        })
    }, [setDialog])
    // #endregion

    const { value: collections = [], loading } = useNonFungibleCollections(NetworkPluginID.PLUGIN_EVM, {
        chainId,
    })

    const collectionsFiltered = collections.filter((x) => x.schema === SchemaType.ERC721)

    // #region fuse
    const searchedTokenList = FuseNonFungibleCollection.create(
        collections.filter((x) => x.schema === SchemaType.ERC721),
    )
        .search(keyword)
        .map((x) => x.item)

    // #endregion
    return (
        <InjectedDialog open={open} onClose={onClose} title={t('plugin_wallet_select_a_nft_contract')}>
            <DialogContent className={classes.dialogContent}>
                <div className={classes.search}>
                    <SearchInput
                        label={t('add_nft_contract_search_hint')}
                        onChange={(keyword) => {
                            setKeyword(keyword)
                        }}
                    />
                </div>

                {loading ? (
                    <Box
                        display="flex"
                        alignItems="center"
                        justifyContent="center"
                        sx={{ paddingTop: 4, paddingBottom: 4 }}>
                        <LoadingBase size={24} />
                    </Box>
                ) : (
                    <SearchResultBox
                        keyword={keyword}
                        contractList={collectionsFiltered}
                        searchedTokenList={searchedTokenList}
                        onSubmit={onSubmit}
                    />
                )}
            </DialogContent>
        </InjectedDialog>
    )
}

export interface SearchResultBoxProps {
    keyword: string
    contractList: Array<NonFungibleCollection<ChainId, SchemaType>>
    searchedTokenList: Array<NonFungibleCollection<ChainId, SchemaType>>
    onSubmit: (collection: NonFungibleCollection<ChainId, SchemaType>, balance?: number) => void
}

export function SearchResultBox(props: SearchResultBoxProps) {
    const { keyword, searchedTokenList, onSubmit, contractList } = props
    const { t } = useI18N()
    const { classes } = useStyles()
    return (
        <div className={classes.searchBox}>
            {(keyword !== '' && searchedTokenList.length === 0) || (keyword === '' && contractList.length === 0) ? (
                <Box className={classes.noResultBox}>
                    <Typography>{t('wallet_search_contract_no_result')}</Typography>
                </Box>
            ) : (
                <List>
                    {(keyword === '' ? contractList : searchedTokenList).map((collection, i) => (
                        <div key={i}>
                            <ContractListItem onSubmit={onSubmit} collection={collection} />
                        </div>
                    ))}
                </List>
            )}
        </div>
    )
}

interface ContractListItemProps {
    collection: NonFungibleCollection<ChainId, SchemaType>
    onSubmit: (collection: NonFungibleCollection<ChainId, SchemaType>, balance?: number) => void
}

function ContractListItem(props: ContractListItemProps) {
    const { onSubmit, collection } = props
    const { classes } = useStyles()
    return (
        <div style={{ position: 'relative' }}>
            <ListItem className={classes.listItem} onClick={() => onSubmit(collection, collection.balance)}>
                <Avatar className={classes.icon} src={collection.iconURL || ''} />
                <Typography className={classes.contractName}>
                    {collection.name}{' '}
                    {collection.symbol && collection.symbol !== 'UNKNOWN' ? '(' + collection.symbol + ')' : ''}
                </Typography>
                {collection.balance ? <Typography className={classes.balance}>{collection.balance}</Typography> : null}
            </ListItem>
            <div className={classes.address}>
                <Typography onClick={() => onSubmit(collection, collection.balance)} className={classes.addressText}>
                    {collection.address}
                </Typography>
                <Link
                    href={explorerResolver.addressLink(collection.chainId, collection.address ?? '')}
                    target="_blank"
                    rel="noopener noreferrer">
                    <OpenInNewIcon className={classes.openIcon} fontSize="small" />
                </Link>
            </div>
        </div>
    )
}
