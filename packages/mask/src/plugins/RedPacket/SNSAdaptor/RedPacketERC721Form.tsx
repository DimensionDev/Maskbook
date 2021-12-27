import { Box, Typography, List, ListItem } from '@mui/material'
import { makeStyles } from '@masknet/theme'
import { useState, useCallback, useEffect, useMemo } from 'react'
import { useI18N } from '../../../utils'
import classNames from 'classnames'
import ActionButton from '../../../extension/options-page/DashboardComponents/ActionButton'
import { ERC721ContractSelectPanel } from '../../../web3/UI/ERC721ContractSelectPanel'
import { EthereumWalletConnectedBoundary } from '../../../web3/UI/EthereumWalletConnectedBoundary'
import { EthereumERC721TokenApprovedBoundary } from '../../../web3/UI/EthereumERC721TokenApprovedBoundary'
import {
    ERC721ContractDetailed,
    ERC721TokenDetailed,
    useERC721TokenDetailedOwnerList,
    useAccount,
    useChainId,
    useNftRedPacketConstants,
} from '@masknet/web3-shared-evm'
import CheckIcon from '@mui/icons-material/Check'
import CloseIcon from '@mui/icons-material/Close'
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline'
import { RedpacketMessagePanel } from './RedpacketMessagePanel'
import { SelectNftTokenDialog } from './SelectNftTokenDialog'
import { RedpacketNftConfirmDialog } from './RedpacketNftConfirmDialog'
import { NftImage } from './NftImage'
import { NFTSelectOption } from '../types'
import { NFT_RED_PACKET_MAX_SHARES } from '../constants'

const useStyles = makeStyles()((theme) => {
    return {
        root: {
            display: 'flex',
            alignItems: 'stretch',
            flexDirection: 'column',
        },
        line: {
            display: 'flex',
            margin: theme.spacing(1, 0, 2, 0),
        },
        nftNameWrapper: {
            width: '100%',
            background: theme.palette.mode === 'light' ? 'none' : '#2F3336',
            borderBottomRightRadius: 8,
            borderBottomLeftRadius: 8,
            paddingTop: 2,
            paddingBottom: 1,
        },
        nftName: {
            minHeight: 30,
            marginLeft: 8,
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
        },
        inputShrinkLabel: {
            transform: 'translate(17px, -3px) scale(0.75) !important',
        },
        input: {
            flex: 1,
            padding: theme.spacing(0.5),
        },
        tip: {
            fontSize: 17,
            marginBottom: theme.spacing(2),
        },
        nftImg: {
            maxWidth: '100%',
        },
        tokenSelector: {
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: 16,
            width: '100%',
            height: 200,
            overflowY: 'auto',
            background: theme.palette.mode === 'light' ? '#F7F9FA' : '#17191D',
            borderRadius: 12,
            padding: theme.spacing(1.5, 1.5, 1, 1),
            boxSizing: 'border-box',
        },
        tokenSelectorWrapper: {
            position: 'relative',
            display: 'flex',
            flexDirection: 'column',
            borderRadius: 6,
            padding: 0,
            marginBottom: theme.spacing(2.5),
            background: theme.palette.mode === 'light' ? '#fff' : '#2F3336',
            width: 120,
            height: 180,
            overflow: 'hidden',
        },
        tokenSelectorParent: {
            background: theme.palette.mode === 'light' ? '#F7F9FA' : '#17191D',
            borderRadius: 12,
            paddingBottom: 5,
            marginTop: theme.spacing(1.5),
            marginBottom: theme.spacing(1.5),
        },
        addWrapper: {
            cursor: 'pointer',
            alignItems: 'center',
            justifyContent: 'center',
        },
        addIcon: {
            color: '#AFC3E1',
        },
        closeIconWrapperBack: {
            position: 'absolute',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            top: 5,
            right: 5,
            width: 18,
            height: 18,
            background: 'rgba(255, 255, 255, 0.8)',
            borderRadius: 500,
            overflow: 'hidden',
        },
        closeIconWrapper: {
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            width: 18,
            height: 18,
            background: 'rgba(255, 95, 95, 0.3)',
        },
        closeIcon: {
            width: 14,
            height: 14,
            cursor: 'pointer',
            color: 'rgba(255, 95, 95, 1)',
        },
        loadingFailImage: {
            minHeight: '0px !important',
            maxWidth: 'none',
            transform: 'translateY(10px)',
            width: 64,
            height: 64,
        },
        selectWrapper: {
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            width: 250,
            margin: '16px 0 8px 0',
        },
        option: {
            display: 'flex',
            alignItems: 'center',
            cursor: 'pointer',
        },
        checkIcon: {
            width: 15,
            height: 15,
            color: '#fff',
        },
        checkIconWrapper: {
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            cursor: 'pointer',
            width: 17,
            height: 17,
            borderRadius: 999,
            marginRight: 5,
            border: '1px solid #6E748E',
            backgroundColor: 'white',
        },
        checked: {
            borderColor: '#1D9BF0 !important',
            background: '#1D9BF0 !important',
        },
        approveAllTip: {
            color: '#FF5F5F',
            margin: '0px 4px 24px 4px',
        },
    }
})
interface RedPacketERC721FormProps {
    onClose: () => void
}
export function RedPacketERC721Form(props: RedPacketERC721FormProps) {
    const { t } = useI18N()
    const { onClose } = props
    const { classes } = useStyles()
    const [open, setOpen] = useState(false)
    const [balance, setBalance] = useState(0)
    const [selectOption, setSelectOption] = useState(NFTSelectOption.Partial)
    const [openConfirmDialog, setOpenConfirmDialog] = useState(false)
    const account = useAccount()
    const chainId = useChainId()
    const [contract, setContract] = useState<ERC721ContractDetailed>()
    const [existTokenDetailedList, setExistTokenDetailedList] = useState<(ERC721TokenDetailed & { index: number })[]>(
        [],
    )
    const [message, setMessage] = useState('Best Wishes!')
    const {
        asyncRetry: { loading: loadingOwnerList },
        tokenDetailedOwnerList: _tokenDetailedOwnerList = [],
        clearTokenDetailedOwnerList,
    } = useERC721TokenDetailedOwnerList(contract, account)
    const tokenDetailedOwnerList = _tokenDetailedOwnerList.map(
        (v, index) => ({ ...v, index } as ERC721TokenDetailed & { index: number }),
    )
    const removeToken = useCallback((token: ERC721TokenDetailed) => {
        setExistTokenDetailedList((list) => list.filter((t) => t.tokenId !== token.tokenId))
    }, [])

    const maxSelectShares = Math.min(NFT_RED_PACKET_MAX_SHARES, tokenDetailedOwnerList.length)

    const clearToken = useCallback(() => {
        setExistTokenDetailedList([])
        clearTokenDetailedOwnerList()
        setOpenConfirmDialog(false)
    }, [clearTokenDetailedOwnerList])

    const clearContract = useCallback(() => {
        setContract(undefined)
    }, [])

    useEffect(() => {
        clearToken()
        setOpen(false)
    }, [contract, account])

    useEffect(() => {
        setOpen(false)
        clearContract()
    }, [chainId])

    const { RED_PACKET_NFT_ADDRESS } = useNftRedPacketConstants()

    const validationMessage = useMemo(() => {
        if (!balance) return t('plugin_red_packet_erc721_insufficient_balance')
        if (existTokenDetailedList.length === 0) return t('plugin_wallet_select_a_token')
        return ''
    }, [existTokenDetailedList.length, balance])

    return (
        <>
            <Box className={classes.root}>
                <ERC721ContractSelectPanel
                    contract={contract}
                    onContractChange={setContract}
                    onBalanceChange={setBalance}
                />
                {tokenDetailedOwnerList.length > 0 ? (
                    <Box className={classes.selectWrapper}>
                        <div
                            className={classes.option}
                            onClick={() => {
                                setSelectOption(NFTSelectOption.All)
                                setExistTokenDetailedList(tokenDetailedOwnerList.slice(0, maxSelectShares))
                            }}>
                            <div
                                className={classNames(
                                    classes.checkIconWrapper,
                                    selectOption === NFTSelectOption.All ? classes.checked : '',
                                )}>
                                <CheckIcon className={classes.checkIcon} />
                            </div>
                            <Typography color="textPrimary">
                                {t('plugin_red_packet_nft_select_all_option', {
                                    total: Math.min(NFT_RED_PACKET_MAX_SHARES, tokenDetailedOwnerList.length),
                                })}
                            </Typography>
                        </div>
                        <div
                            className={classes.option}
                            onClick={() => {
                                setSelectOption(NFTSelectOption.Partial)
                                setExistTokenDetailedList([])
                            }}>
                            <div
                                className={classNames(
                                    classes.checkIconWrapper,
                                    selectOption === NFTSelectOption.Partial ? classes.checked : '',
                                )}>
                                <CheckIcon className={classes.checkIcon} />
                            </div>
                            <Typography color="textPrimary">
                                {t('plugin_red_packet_nft_select_partially_option')}
                            </Typography>
                        </div>
                    </Box>
                ) : null}
                {contract &&
                balance &&
                tokenDetailedOwnerList.length > 0 &&
                selectOption === NFTSelectOption.Partial ? (
                    <div className={classes.tokenSelectorParent}>
                        <List className={classes.tokenSelector}>
                            {existTokenDetailedList.map((value, i) => (
                                <ListItem key={i.toString()} className={classNames(classes.tokenSelectorWrapper)}>
                                    <NftImage
                                        token={value}
                                        classes={{
                                            loadingFailImage: classes.loadingFailImage,
                                        }}
                                        fallbackImage={new URL('./assets/nft_token_fallback.png', import.meta.url)}
                                    />
                                    <div className={classes.nftNameWrapper}>
                                        <Typography className={classes.nftName} color="textSecondary">
                                            {value.info.name}
                                        </Typography>
                                    </div>
                                    <div className={classes.closeIconWrapperBack} onClick={() => removeToken(value)}>
                                        <div className={classes.closeIconWrapper}>
                                            <CloseIcon className={classes.closeIcon} />
                                        </div>
                                    </div>
                                </ListItem>
                            ))}
                            <ListItem
                                onClick={() => setOpen(true)}
                                className={classNames(classes.tokenSelectorWrapper, classes.addWrapper)}>
                                <AddCircleOutlineIcon className={classes.addIcon} onClick={() => void 0} />
                            </ListItem>
                        </List>
                    </div>
                ) : null}
                <div className={classes.line}>
                    <RedpacketMessagePanel onChange={(val: string) => setMessage(val)} message={message} />
                </div>
                {tokenDetailedOwnerList.length > 0 ? (
                    <Typography className={classes.approveAllTip}>
                        {t('plugin_red_packet_nft_approve_all_tip')}
                    </Typography>
                ) : null}
                <EthereumWalletConnectedBoundary>
                    <EthereumERC721TokenApprovedBoundary
                        validationMessage={validationMessage}
                        owner={account}
                        contractDetailed={contract}
                        operator={RED_PACKET_NFT_ADDRESS}>
                        <ActionButton
                            variant="contained"
                            size="large"
                            disabled={!!validationMessage}
                            fullWidth
                            onClick={() => setOpenConfirmDialog(true)}>
                            {t('plugin_red_packet_next')}
                        </ActionButton>
                    </EthereumERC721TokenApprovedBoundary>
                </EthereumWalletConnectedBoundary>
            </Box>
            {open ? (
                <SelectNftTokenDialog
                    open={open}
                    onClose={() => setOpen(false)}
                    contract={contract}
                    existTokenDetailedList={existTokenDetailedList}
                    setExistTokenDetailedList={setExistTokenDetailedList}
                    tokenDetailedOwnerList={tokenDetailedOwnerList}
                    loadingOwnerList={loadingOwnerList}
                />
            ) : null}
            {openConfirmDialog && contract ? (
                <RedpacketNftConfirmDialog
                    message={message}
                    contract={contract}
                    open={openConfirmDialog}
                    tokenList={existTokenDetailedList}
                    onBack={() => setOpenConfirmDialog(false)}
                    onClose={onClose}
                />
            ) : null}
        </>
    )
}
