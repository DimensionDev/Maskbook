import { useCallback, useMemo, useState } from 'react'
import { makeStyles } from '@masknet/theme'
import { Avatar, Box, DialogContent, Link, List, ListItem, Typography } from '@mui/material'
import { useERC721ContractDetailed } from '@masknet/web3-shared-evm'
import { useRemoteControlledDialog } from '@masknet/shared-base-ui'
import { InjectedDialog } from '@masknet/shared'
import { WalletMessages } from '../messages'
import { useI18N } from '../../../utils'
import { EthereumAddress } from 'wallet.ts'
import { SearchInput } from '../../../extension/options-page/DashboardComponents/SearchInput'
import OpenInNewIcon from '@mui/icons-material/OpenInNew'
import Fuse from 'fuse.js'
import { unionBy } from 'lodash-unified'
import {
    useNonFungibleTokenList,
    useNonFungibleTokens,
    Web3Plugin,
    useWeb3State,
    useAccount,
} from '@masknet/plugin-infra/web3'

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
        (contract?: Web3Plugin.NonFungibleTokenContract) => {
            if (!contract) return
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

    const assets = useNonFungibleTokenList()

    const erc721InDb = useNonFungibleTokens()
    const contractList = assets ? unionBy([...assets, ...erc721InDb], 'contract.address') : erc721InDb

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

    const searchedTokenList = fuse.search<Web3Plugin.NonFungibleToken>(keyword).map((x) => x.item)
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
                <SearchResultBox
                    keyword={keyword}
                    contractList={contractList}
                    searchedTokenList={searchedTokenList}
                    onSubmit={onSubmit}
                />
                {/* TODO: double check should have loading status */}
                {/* {loadingCollectionState !== IteratorCollectorStatus.done && ( */}
                {/*     <Box */}
                {/*         display="flex" */}
                {/*         alignItems="center" */}
                {/*         justifyContent="center" */}
                {/*         sx={{ paddingTop: 4, paddingBottom: 4 }}> */}
                {/*         <CircularProgress size={24} /> */}
                {/*     </Box> */}
                {/* )} */}
            </DialogContent>
        </InjectedDialog>
    )
}

export interface SearchResultBoxProps extends withClasses<never> {
    keyword: string
    // TODO: remove this
    contractList: Web3Plugin.NonFungibleToken[]
    searchedTokenList: Web3Plugin.NonFungibleToken[]
    onSubmit: (contract?: Web3Plugin.NonFungibleTokenContract) => void
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
                            {/* // TODO: migrate useERC721ContractDetailed */}
                            <ContractListItem key="0" onSubmit={onSubmit} nonFungibleToken={{ contractDetailed }} />
                        </List>
                    )}
                </div>
            ) : (
                <List>
                    {(keyword === '' ? contractList : searchedTokenList).map((contract, i) => (
                        <div key={i}>
                            <ContractListItem onSubmit={onSubmit} nonFungibleToken={contract} />
                        </div>
                    ))}
                </List>
            )}
        </div>
    )
}

interface ContractListItemProps {
    nonFungibleToken: Web3Plugin.NonFungibleToken
    onSubmit: (contract?: Web3Plugin.NonFungibleTokenContract) => void
}

function ContractListItem(props: ContractListItemProps) {
    const { onSubmit, nonFungibleToken } = props
    const { classes } = useStyles()
    const chainId = nonFungibleToken.contract?.chainId
    const { Utils } = useWeb3State()

    return (
        <div style={{ position: 'relative' }}>
            <ListItem className={classes.listItem} onClick={() => onSubmit(nonFungibleToken.contract)}>
                <Avatar className={classes.icon} src={nonFungibleToken.contract?.iconURL} />
                <Typography className={classes.contractName}>
                    {nonFungibleToken.contract?.name}{' '}
                    {nonFungibleToken.contract?.symbol && nonFungibleToken.contract?.symbol !== 'UNKNOWN'
                        ? '(' + nonFungibleToken.contract?.symbol + ')'
                        : ''}
                </Typography>
                {nonFungibleToken.contract?.balance ? (
                    <Typography className={classes.balance}>{nonFungibleToken.contract?.balance}</Typography>
                ) : null}
            </ListItem>
            <div className={classes.address}>
                <Typography onClick={() => onSubmit(nonFungibleToken.contract)} className={classes.addressText}>
                    {nonFungibleToken.contract?.address}
                </Typography>
                <Link
                    href={Utils?.resolveAddressLink?.(chainId ?? 1, nonFungibleToken.contract?.address ?? '')}
                    target="_blank"
                    rel="noopener noreferrer">
                    <OpenInNewIcon className={classes.openIcon} fontSize="small" />
                </Link>
            </div>
        </div>
    )
}
