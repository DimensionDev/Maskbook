import { useCallback, useState, useMemo } from 'react'
import { makeStyles } from '@masknet/theme'
import { DialogContent, List, ListItem, Typography, Box, Link } from '@material-ui/core'
import { ChainId, ERC721ContractDetailed, resolveAddressLinkOnExplorer, useChainId } from '@masknet/web3-shared'
import { InjectedDialog } from '../../../components/shared/InjectedDialog'
import { WalletMessages } from '../messages'
import { useI18N } from '../../../utils'
import { useRemoteControlledDialog } from '@masknet/shared'
import { EthereumAddress } from 'wallet.ts'
import { SearchInput } from '../../../extension/options-page/DashboardComponents/SearchInput'
import OpenInNewIcon from '@material-ui/icons/OpenInNew'
import Fuse from 'fuse.js'
import { useERC721ContractDetailed } from '@masknet/web3-shared'
import classNames from 'classnames'
import { ERC721_CONTRACT_LIST } from './ERC721ContractList'

const useStyles = makeStyles()((theme) => ({
    search: {
        width: '100%',
        margin: theme.spacing(1, 0, 2),
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
        '&:hover': {
            textDecoration: 'none',
        },
    },
    addressNoImage: {
        left: theme.spacing(2),
    },
    dialogContent: {
        height: 560,
    },
    noResultBox: {
        background: theme.palette.mode === 'light' ? 'rgba(247, 249, 250, 1)' : 'rgba(23, 25, 29, 1)',
        width: 540,
        height: 431,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 16,
    },
    contractName: {
        marginBottom: 20,
    },
}))

export interface SelectNftContractDialogProps extends withClasses<never> {}

export function SelectNftContractDialog(props: SelectNftContractDialogProps) {
    const { t } = useI18N()
    const { classes } = useStyles()

    const chainId = useChainId()

    const [id, setId] = useState('')
    const [keyword, setKeyword] = useState('')

    const contractList = chainId === ChainId.Mainnet ? ERC721_CONTRACT_LIST : []

    //#region remote controlled dialog
    const { open, setDialog } = useRemoteControlledDialog(
        WalletMessages.events.selectNftContractDialogUpdated,
        (ev) => {
            if (!ev.open) return
            setId(ev.uuid)
        },
    )
    const onSubmit = useCallback(
        (contract: ERC721ContractDetailed) => {
            console.log({ contract })
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
    //#endregion

    //#region fuse
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
    //#endregion

    return (
        <InjectedDialog open={open} onClose={onClose} title={t('plugin_wallet_select_a_nft_contract')} maxWidth="xs">
            <DialogContent className={classes.dialogContent}>
                <SearchInput
                    label={t('add_nft_contract_search_hint')}
                    onChange={(keyword) => {
                        setKeyword(keyword)
                    }}
                />
                <SearchResultBox keyword={keyword} searchedTokenList={searchedTokenList} onSubmit={onSubmit} />
            </DialogContent>
        </InjectedDialog>
    )
}

export interface SearchResultBoxProps extends withClasses<never> {
    keyword: string
    searchedTokenList: ERC721ContractDetailed[]
    onSubmit: (contract: ERC721ContractDetailed) => void
}

function SearchResultBox(props: SearchResultBoxProps) {
    const { keyword, searchedTokenList, onSubmit } = props
    const { classes } = useStyles()
    const isValid = EthereumAddress.isValid(keyword)
    const chainId = useChainId()
    const contractList = chainId === ChainId.Mainnet ? ERC721_CONTRACT_LIST : []
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
                            <ContractListItem key="0" onSubmit={onSubmit} contract={contractDetailed} />
                        </List>
                    )}
                </div>
            ) : (
                <List>
                    {(keyword === '' ? contractList : searchedTokenList).map((contract, i) => (
                        <div key={i.toString()}>
                            <ContractListItem key={i.toString()} onSubmit={onSubmit} contract={contract} />
                        </div>
                    ))}
                </List>
            )}
        </div>
    )
}

interface ContractListItemProps {
    contract: ERC721ContractDetailed
    onSubmit: (contract: ERC721ContractDetailed) => void
}

function ContractListItem(props: ContractListItemProps) {
    const { onSubmit, contract } = props
    const { classes } = useStyles()
    const chainId = useChainId()

    return (
        <div style={{ position: 'relative' }}>
            <ListItem className={classes.listItem} onClick={() => onSubmit(contract)}>
                {contract.iconURL ? <img className={classes.icon} src={contract.iconURL} /> : null}
                <Typography className={classes.contractName}>
                    {contract.name} ({contract.symbol})
                </Typography>
            </ListItem>
            <Typography>
                <div className={classNames(classes.address, contract.iconURL ? '' : classes.addressNoImage)}>
                    <span onClick={() => onSubmit(contract)}>{contract.address}</span>
                    <Link
                        href={resolveAddressLinkOnExplorer(chainId, contract.address)}
                        target="_blank"
                        rel="noopener noreferrer">
                        <OpenInNewIcon className={classes.openIcon} fontSize="small" />
                    </Link>
                </div>
            </Typography>
        </div>
    )
}
