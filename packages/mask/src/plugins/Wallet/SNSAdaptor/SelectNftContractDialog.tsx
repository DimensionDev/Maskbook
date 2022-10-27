import { useCallback, useMemo, useState } from 'react'
import { EthereumAddress } from 'wallet.ts'
import Fuse from 'fuse.js'
import { LoadingBase, makeStyles } from '@masknet/theme'
import { Avatar, Box, DialogContent, Link, List, ListItem, Typography } from '@mui/material'
import { SchemaType, explorerResolver, ChainId } from '@masknet/web3-shared-evm'
import { useRemoteControlledDialog } from '@masknet/shared-base-ui'
import { InjectedDialog } from '@masknet/shared'
import { NetworkPluginID } from '@masknet/shared-base'
import OpenInNewIcon from '@mui/icons-material/OpenInNew'
import type { NonFungibleTokenContract } from '@masknet/web3-shared-base'
import { WalletMessages } from '../messages.js'
import { useI18N } from '../../../utils/index.js'
import { SearchInput } from '../../../extension/options-page/DashboardComponents/SearchInput.js'
import {
    useChainContext,
    useNonFungibleCollections,
    useNonFungibleTokenContract,
    useNonFungibleTokenBalance,
} from '@masknet/web3-hooks-base'

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

export interface SelectNftContractDialogProps extends withClasses<never> {}

export function SelectNftContractDialog(props: SelectNftContractDialogProps) {
    const { t } = useI18N()
    const { classes } = useStyles()

    const [id, setId] = useState('')
    const [keyword, setKeyword] = useState('')
    const { chainId: _chainId } = useChainContext<NetworkPluginID.PLUGIN_EVM>()
    const [chainId, setChainId] = useState(_chainId)
    // #region remote controlled dialog
    const { open, setDialog } = useRemoteControlledDialog(
        WalletMessages.events.selectNftContractDialogUpdated,
        (ev) => {
            if (!ev.open) return
            if (ev.chainId) setChainId(ev.chainId)
            setId(ev.uuid)
        },
    )
    const onSubmit = useCallback(
        (balance: string, contract: NonFungibleTokenContract<ChainId, SchemaType>) => {
            setKeyword('')
            setDialog({
                open: false,
                uuid: id,
                balance,
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

    const { value: assets = [], loading } = useNonFungibleCollections(NetworkPluginID.PLUGIN_EVM, {
        chainId,
    })

    const contractList = assets
        .filter((x) => x.schema === SchemaType.ERC721)
        .map(
            (x) =>
                ({
                    address: x.address,
                    chainId,
                    schema: SchemaType.ERC721,
                    name: x.name,
                    symbol: x.symbol,
                    baseURI: x.iconURL,
                    iconURL: x.iconURL,
                    balance: x.tokensTotal,
                } as NonFungibleTokenContract<ChainId, SchemaType>),
        )

    // #region fuse
    const fuse = useMemo(
        () =>
            new Fuse(contractList, {
                shouldSort: true,
                threshold: 0.45,
                minMatchCharLength: 3,
                keys: [
                    { name: 'name', weight: 0.5 },
                    { name: 'symbol', weight: 0.8 },
                    { name: 'address', weight: 1 },
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
                        contractList={contractList}
                        searchedTokenList={searchedTokenList}
                        onSubmit={onSubmit}
                    />
                )}
            </DialogContent>
        </InjectedDialog>
    )
}

export interface SearchResultBoxProps extends withClasses<never> {
    keyword: string
    contractList: Array<NonFungibleTokenContract<ChainId, SchemaType>>
    searchedTokenList: Array<NonFungibleTokenContract<ChainId, SchemaType>>
    onSubmit: (balance: string, contract: NonFungibleTokenContract<ChainId, SchemaType>) => void
}

function SearchResultBox(props: SearchResultBoxProps) {
    const { keyword, searchedTokenList, onSubmit, contractList } = props
    const { t } = useI18N()
    const { classes } = useStyles()
    const { account } = useChainContext<NetworkPluginID.PLUGIN_EVM>()
    const isValid = EthereumAddress.isValid(keyword)
    const { value: contractDetailed = null, loading } = useNonFungibleTokenContract(
        NetworkPluginID.PLUGIN_EVM,
        keyword,
        undefined,
        { account },
    )
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
                            <ContractListItem key="0" onSubmit={onSubmit} contract={contractDetailed} />
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
    contract: NonFungibleTokenContract<ChainId, SchemaType>
    onSubmit: (balance: string, contract: NonFungibleTokenContract<ChainId, SchemaType>) => void
}

function ContractListItem(props: ContractListItemProps) {
    const { onSubmit, contract } = props
    const { classes } = useStyles()
    const { value: balance = '0' } = useNonFungibleTokenBalance(NetworkPluginID.PLUGIN_EVM, contract.address, {
        chainId: contract.chainId,
    })
    return balance === '0' ? null : (
        <div style={{ position: 'relative' }}>
            <ListItem className={classes.listItem} onClick={() => onSubmit(balance, contract)}>
                <Avatar className={classes.icon} src={contract.iconURL} />
                <Typography className={classes.contractName}>
                    {contract.name}{' '}
                    {contract.symbol && contract.symbol !== 'UNKNOWN' ? '(' + contract.symbol + ')' : ''}
                </Typography>
                {balance ? <Typography className={classes.balance}>{balance}</Typography> : null}
            </ListItem>
            <div className={classes.address}>
                <Typography onClick={() => onSubmit(balance, contract)} className={classes.addressText}>
                    {contract.address}
                </Typography>
                <Link
                    href={explorerResolver.addressLink(contract.chainId, contract.address)}
                    target="_blank"
                    rel="noopener noreferrer">
                    <OpenInNewIcon className={classes.openIcon} fontSize="small" />
                </Link>
            </div>
        </div>
    )
}
