import { useCallback, useState, useMemo } from 'react'
import { makeStyles } from '@masknet/theme'
import { DialogContent, List, ListItem, Typography, Box, Link } from '@mui/material'
import {
    ChainId,
    ERC721ContractDetailed,
    resolveAddressLinkOnExplorer,
    useChainId,
    useAccount,
    useERC721Tokens,
    formatEthereumAddress,
    useERC721ContractDetailed,
} from '@masknet/web3-shared-evm'
import { InjectedDialog } from '../../../components/shared/InjectedDialog'
import { WalletMessages } from '../messages'
import { useI18N } from '../../../utils'
import { useRemoteControlledDialog } from '@masknet/shared'
import { EthereumAddress } from 'wallet.ts'
import { SearchInput } from '../../../extension/options-page/DashboardComponents/SearchInput'
import OpenInNewIcon from '@mui/icons-material/OpenInNew'
import Fuse from 'fuse.js'
import classNames from 'classnames'
import { unionBy } from 'lodash-unified'
import { useNFTBalance } from '../../EVM/hooks'
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
    addressNoImage: {
        left: '16px !important',
    },
    dialogContent: {
        height: 560,
    },
    noResultBox: {
        background: theme.palette.mode === 'light' ? 'rgba(247, 249, 250, 1)' : 'rgba(23, 25, 29, 1)',
        height: 431,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 16,
    },
    contractName: {
        marginBottom: 20,
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

    const { value: assets } = useNFTBalance(account, !open)

    const erc721InDb = useERC721Tokens()
    const allContractsInDb = unionBy(
        erc721InDb.map((x) => ({ ...x.contractDetailed, address: formatEthereumAddress(x.contractDetailed.address) })),
        'address',
    ).map((x) => ({ contractDetailed: x, balance: undefined }))

    const contractList =
        chainId === ChainId.Mainnet && assets
            ? unionBy([...assets, ...allContractsInDb], 'contractDetailed.address')
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
        <InjectedDialog open={open} onClose={onClose} title={t('plugin_wallet_select_a_nft_contract')} maxWidth="xs">
            <DialogContent className={classes.dialogContent}>
                <div className={classes.search}>
                    <SearchInput
                        label={t('add_nft_contract_search_hint')}
                        onChange={(keyword) => {
                            setKeyword(keyword)
                        }}
                    />
                </div>
                <SearchResultBox
                    keyword={keyword}
                    contractList={contractList}
                    searchedTokenList={searchedTokenList}
                    onSubmit={onSubmit}
                />
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
    const chainId = useChainId()

    return (
        <div style={{ position: 'relative' }}>
            <ListItem className={classes.listItem} onClick={() => onSubmit(contract.contractDetailed)}>
                {contract.contractDetailed.iconURL ? (
                    <img className={classes.icon} src={contract.contractDetailed.iconURL} />
                ) : null}
                <Typography className={classes.contractName}>
                    {contract.contractDetailed.name}{' '}
                    {contract.contractDetailed.symbol ? '(' + contract.contractDetailed.symbol + ')' : ''}
                </Typography>
                {contract.balance ? <Typography className={classes.balance}>{contract.balance}</Typography> : null}
            </ListItem>
            <div
                className={classNames(
                    classes.address,
                    contract.contractDetailed.iconURL ? '' : classes.addressNoImage,
                )}>
                <span onClick={() => onSubmit(contract.contractDetailed)}>{contract.contractDetailed.address}</span>
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
