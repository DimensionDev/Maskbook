import { useCallback, useMemo, useState } from 'react'
import { makeStyles } from '@masknet/theme'
import { Avatar, Box, CircularProgress, DialogContent, Link, List, ListItem, Typography } from '@mui/material'
import {
    ERC721ContractDetailed,
    SchemaType,
    formatEthereumAddress,
    resolveAddressLinkOnExplorer,
    SocketState,
    useAccount,
    useChainId,
    useCollections,
    useERC721ContractDetailed,
    useERC721Tokens,
} from '@masknet/web3-shared-evm'
import { useRemoteControlledDialog } from '@masknet/shared-base-ui'
import { InjectedDialog } from '@masknet/shared'
import { WalletMessages } from '../messages'
import { useI18N } from '../../../utils'
import { EthereumAddress } from 'wallet.ts'
import { SearchInput } from '../../../extension/options-page/DashboardComponents/SearchInput'
import OpenInNewIcon from '@mui/icons-material/OpenInNew'
import Fuse from 'fuse.js'
import { unionBy } from 'lodash-unified'
import type { NonFungibleTokenAPI } from '@masknet/web3-providers'

const useStyles = makeStyles()((theme) => ({
    search: {
        width: '95%',
        margin: theme.spacing(1, 0, 2, 0.8),
    },
    list: {
        scrollbarWidth: 'none',
        '&::-webkit-scrollbar': {
            display: 'none',
        },
    },
    placeholder: {
        textAlign: 'center',
        height: 288,
        paddingTop: theme.spacing(14),
        boxSizing: 'border-box',
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
    addressNoImage: {
        left: '16px !important',
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

export interface SelectNftContractDialogProps extends withClasses<never> {}

export function SelectNftContractDialog(props: SelectNftContractDialogProps) {
    const { t } = useI18N()
    const { classes } = useStyles()

    const chainId = useChainId()

    const [id, setId] = useState('')
    const [keyword, setKeyword] = useState('')
    const account = useAccount()

    // #region remote controlled dialog
    const { open, setDialog } = useRemoteControlledDialog(
        WalletMessages.events.selectNftContractDialogUpdated,
        (ev) => {
            if (!ev.open) return
            setId(ev.uuid)
        },
    )
    const onSubmit = useCallback(
        (contract: ERC721ContractDetailed) => {
            setKeyword('')
            setDialog({
                open: false,
                uuid: id,
                contract,
            })
        },
        [id, setDialog, setKeyword],
    )
    const onClose = useCallback(() => {
        setKeyword('')
        setDialog({
            open: false,
            uuid: id,
        })
    }, [id, setDialog])
    // #endregion

    const { data: assets, state: loadingCollectionState } = useCollections(account, chainId, open)

    const erc721InDb = useERC721Tokens()
    const allContractsInDb = unionBy(
        erc721InDb.map((x) => ({ ...x.contractDetailed, address: formatEthereumAddress(x.contractDetailed.address) })),
        'address',
    ).map((x) => ({ contractDetailed: x, balance: undefined }))

    const renderAssets = assets.map((x) => ({
        contractDetailed: {
            type: SchemaType.ERC721,
            address: x.address,
            chainId,
            name: x.name,
            symbol: x.symbol,
            baseURI: x.iconURL,
            iconURL: x.iconURL,
        } as ERC721ContractDetailed,
        balance: x.balance,
    }))

    const contractList = renderAssets
        ? unionBy([...renderAssets, ...allContractsInDb], 'contractDetailed.address')
        : allContractsInDb

    // #region fuse
    const fuse = useMemo(
        () =>
            new Fuse(contractList, {
                shouldSort: true,
                threshold: 0.45,
                minMatchCharLength: 3,
                keys: [
                    { name: 'contractDetailed.name', weight: 0.5 },
                    { name: 'contractDetailed.symbol', weight: 0.8 },
                    { name: 'contractDetailed.address', weight: 1 },
                ],
            }),
        [contractList],
    )

    const searchedTokenList = fuse.search(keyword).map((x) => x.item)
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
                {loadingCollectionState === SocketState.done && (
                    <SearchResultBox
                        keyword={keyword}
                        contractList={contractList}
                        searchedTokenList={searchedTokenList}
                        onSubmit={onSubmit}
                    />
                )}
                {loadingCollectionState !== SocketState.done && (
                    <Box
                        display="flex"
                        alignItems="center"
                        justifyContent="center"
                        sx={{ paddingTop: 4, paddingBottom: 4 }}>
                        <CircularProgress size={24} />
                    </Box>
                )}
            </DialogContent>
        </InjectedDialog>
    )
}

export interface SearchResultBoxProps extends withClasses<never> {
    keyword: string
    contractList: NonFungibleTokenAPI.ContractBalance[]
    searchedTokenList: NonFungibleTokenAPI.ContractBalance[]
    onSubmit: (contract: ERC721ContractDetailed) => void
}

function SearchResultBox(props: SearchResultBoxProps) {
    const { keyword, searchedTokenList, onSubmit, contractList } = props
    const { classes } = useStyles()
    const isValid = EthereumAddress.isValid(keyword)
    const { value: contractDetailed, loading } = useERC721ContractDetailed(keyword)
    const { t } = useI18N()
    return (
        <div className={classes.searchBox}>
            {keyword !== '' && searchedTokenList.length === 0 ? (
                <div>
                    {!isValid ||
                    loading ||
                    !contractDetailed ||
                    (contractDetailed.name === '' && contractDetailed.symbol === '') ? (
                        <Box className={classes.noResultBox}>
                            <Typography>
                                {loading ? t('wallet_loading_nft_contract') : t('wallet_search_contract_no_result')}
                            </Typography>
                        </Box>
                    ) : (
                        <List>
                            <ContractListItem key="0" onSubmit={onSubmit} contract={{ contractDetailed }} />
                        </List>
                    )}
                </div>
            ) : (
                <List>
                    {(keyword === '' ? contractList : searchedTokenList).map((contract, i) => (
                        <div key={i}>
                            <ContractListItem onSubmit={onSubmit} contract={contract} />
                        </div>
                    ))}
                </List>
            )}
        </div>
    )
}

interface ContractListItemProps {
    contract: NonFungibleTokenAPI.ContractBalance
    onSubmit: (contract: ERC721ContractDetailed) => void
}

function ContractListItem(props: ContractListItemProps) {
    const { onSubmit, contract } = props
    const { classes } = useStyles()
    const chainId = contract.contractDetailed.chainId

    return (
        <div style={{ position: 'relative' }}>
            <ListItem className={classes.listItem} onClick={() => onSubmit(contract.contractDetailed)}>
                <Avatar className={classes.icon} src={contract.contractDetailed.iconURL} />
                <Typography className={classes.contractName}>
                    {contract.contractDetailed.name}{' '}
                    {contract.contractDetailed.symbol && contract.contractDetailed.symbol !== 'UNKNOWN'
                        ? '(' + contract.contractDetailed.symbol + ')'
                        : ''}
                </Typography>
                {contract.balance ? <Typography className={classes.balance}>{contract.balance}</Typography> : null}
            </ListItem>
            <div className={classes.address}>
                <Typography onClick={() => onSubmit(contract.contractDetailed)} className={classes.addressText}>
                    {contract.contractDetailed.address}
                </Typography>
                <Link
                    href={resolveAddressLinkOnExplorer(chainId, contract.contractDetailed.address)}
                    target="_blank"
                    rel="noopener noreferrer">
                    <OpenInNewIcon className={classes.openIcon} fontSize="small" />
                </Link>
            </div>
        </div>
    )
}
