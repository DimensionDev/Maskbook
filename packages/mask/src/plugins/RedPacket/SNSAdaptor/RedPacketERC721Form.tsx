import { Box, Typography, List, ListItem, CircularProgress } from '@mui/material'
import { makeStyles } from '@masknet/theme'
import { useState, useCallback, useEffect, useMemo } from 'react'
import { useI18N } from '../locales'
import classNames from 'classnames'
import { ERC721ContractSelectPanel } from '../../../web3/UI/ERC721ContractSelectPanel'
import { WalletConnectedBoundary } from '../../../web3/UI/WalletConnectedBoundary'
import { EthereumERC721TokenApprovedBoundary } from '../../../web3/UI/EthereumERC721TokenApprovedBoundary'
import { ChainId, SchemaType, useNftRedPacketConstants, formatTokenId } from '@masknet/web3-shared-evm'
import CheckIcon from '@mui/icons-material/Check'
import CloseIcon from '@mui/icons-material/Close'
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline'
import { RedpacketMessagePanel } from './RedpacketMessagePanel'
import { SelectNftTokenDialog, OrderedERC721Token } from './SelectNftTokenDialog'
import { RedpacketNftConfirmDialog } from './RedpacketNftConfirmDialog'
import { NFTCardStyledAssetPlayer } from '@masknet/shared'
import { NFTSelectOption } from '../types'
import { NFT_RED_PACKET_MAX_SHARES } from '../constants'
import { useAccount, useChainId } from '@masknet/plugin-infra/web3'
import { useNonFungibleOwnerTokens } from '@masknet/plugin-infra/web3-evm'
import { NetworkPluginID, NonFungibleTokenContract, NonFungibleToken } from '@masknet/web3-shared-base'
import { EMPTY_LIST } from '@masknet/shared-base'
import { PluginWalletStatusBar } from '../../../utils'
import ActionButton from '../../../extension/options-page/DashboardComponents/ActionButton'

const useStyles = makeStyles()((theme) => {
    return {
        root: {
            display: 'flex',
            alignItems: 'stretch',
            flexDirection: 'column',
            padding: '0 16px',
        },
        line: {
            display: 'flex',
            margin: theme.spacing(1, 0, 2, 0),
        },
        nftNameWrapper: {
            width: '100%',
            background: theme.palette.background.paper,
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
            overflowY: 'auto',
            height: 200,
            background: theme.palette.background.default,
            borderRadius: 12,
            padding: theme.spacing(1.5, 1.5, 1, 1),
            boxSizing: 'border-box',
        },
        tokenSelectorWrapper: {
            position: 'relative',
            display: 'flex',
            flexDirection: 'column',
            borderRadius: 8,
            padding: 0,
            marginBottom: theme.spacing(2.5),
            background: theme.palette.background.paper,
            width: 120,
            height: 180,
            overflow: 'hidden',
        },
        tokenSelectorParent: {
            background: theme.palette.background.default,
            borderRadius: 12,
            paddingBottom: 5,
            marginTop: theme.spacing(1.5),
            marginBottom: theme.spacing(1.5),
        },
        addWrapper: {
            cursor: 'pointer',
            alignItems: 'center',
            background: `${theme.palette.background.default} !important`,
            justifyContent: 'center',
            border: `1px solid ${theme.palette.divider}`,
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
            minHeight: '0 !important',
            maxWidth: 'none',
            transform: 'translateY(10px)',
            width: 64,
            height: 64,
        },
        selectWrapper: {
            display: 'flex',
            alignItems: 'center',
            margin: '16px 0 8px 0',
        },
        option: {
            display: 'flex',
            alignItems: 'center',
            cursor: 'pointer',
        },
        optionLeft: {
            marginRight: '16px',
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
            margin: '16px 4px 24px 4px',
        },
        unapprovedTip: {
            color: theme.palette.grey[500],
        },
        disabledSelector: {
            opacity: 0.5,
            pointerEvents: 'none',
        },
        loadingOwnerList: {
            margin: '24px auto 16px',
        },
        iframe: {
            minHeight: 147,
        },
        assetImgWrapper: {
            maxHeight: 155,
        },
    }
})
interface RedPacketERC721FormProps {
    onClose: () => void
    setERC721DialogHeight?: (height: number) => void
}
export function RedPacketERC721Form(props: RedPacketERC721FormProps) {
    const t = useI18N()
    const { onClose, setERC721DialogHeight } = props
    const { classes } = useStyles()
    const [open, setOpen] = useState(false)
    const [balance, setBalance] = useState(0)
    const [selectOption, setSelectOption] = useState<NFTSelectOption | undefined>(undefined)
    const [openConfirmDialog, setOpenConfirmDialog] = useState(false)
    const account = useAccount(NetworkPluginID.PLUGIN_EVM)
    const chainId = useChainId(NetworkPluginID.PLUGIN_EVM)
    const [contract, setContract] = useState<NonFungibleTokenContract<ChainId, SchemaType.ERC721>>()
    const [manualSelectedTokenDetailedList, setExistTokenDetailedList] = useState<OrderedERC721Token[]>(EMPTY_LIST)
    const [onceAllSelectedTokenDetailedList, setAllTokenDetailedList] = useState<OrderedERC721Token[]>(EMPTY_LIST)
    const tokenDetailedList =
        selectOption === NFTSelectOption.Partial ? manualSelectedTokenDetailedList : onceAllSelectedTokenDetailedList
    const [message, setMessage] = useState('Best Wishes!')
    const {
        asyncRetry: { loading: loadingOwnerList },
        tokenDetailedOwnerList: _tokenDetailedOwnerList = [],
        clearTokenDetailedOwnerList,
    } = useNonFungibleOwnerTokens(contract?.address ?? '', account, chainId, balance)
    const tokenDetailedOwnerList = _tokenDetailedOwnerList.map((v, index) => ({ ...v, index } as OrderedERC721Token))
    const removeToken = useCallback(
        (token: NonFungibleToken<ChainId, SchemaType.ERC721>) => {
            ;(selectOption === NFTSelectOption.Partial ? setExistTokenDetailedList : setAllTokenDetailedList)((list) =>
                list.filter((t) => t.tokenId !== token.tokenId),
            )

            setSelectOption(NFTSelectOption.Partial)
        },
        [selectOption, setSelectOption, setExistTokenDetailedList, setAllTokenDetailedList],
    )

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
        if (loadingOwnerList) {
            setSelectOption(undefined)
        } else if (!selectOption) {
            setSelectOption(NFTSelectOption.Partial)
        }
    }, [tokenDetailedOwnerList, selectOption, loadingOwnerList])

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
        if (!balance) return t.erc721_insufficient_balance()
        if (tokenDetailedList.length === 0) return t.select_a_token()
        return ''
    }, [tokenDetailedList.length, balance, t])

    setERC721DialogHeight?.(balance > 0 ? 690 : 350)

    return (
        <>
            <Box className={classes.root}>
                <ERC721ContractSelectPanel
                    contract={contract}
                    onContractChange={setContract}
                    balance={balance}
                    onBalanceChange={setBalance}
                />
                {contract && balance ? (
                    loadingOwnerList ? (
                        <CircularProgress size={24} className={classes.loadingOwnerList} />
                    ) : (
                        <Box className={classes.selectWrapper}>
                            <div
                                className={classNames(
                                    classes.optionLeft,
                                    classes.option,
                                    tokenDetailedOwnerList.length === 0 ? classes.disabledSelector : null,
                                )}
                                onClick={() => {
                                    setSelectOption(NFTSelectOption.All)
                                    setAllTokenDetailedList(tokenDetailedOwnerList.slice(0, maxSelectShares))
                                }}>
                                <div
                                    className={classNames(
                                        classes.checkIconWrapper,
                                        selectOption === NFTSelectOption.All ? classes.checked : '',
                                    )}>
                                    <CheckIcon className={classes.checkIcon} />
                                </div>
                                <Typography color="textPrimary">
                                    {tokenDetailedOwnerList.length === 0
                                        ? 'All'
                                        : t.nft_select_all_option({
                                              total: Math.min(
                                                  NFT_RED_PACKET_MAX_SHARES,
                                                  tokenDetailedOwnerList.length,
                                              ).toString(),
                                          })}
                                </Typography>
                            </div>
                            <div className={classes.option} onClick={() => setSelectOption(NFTSelectOption.Partial)}>
                                <div
                                    className={classNames(
                                        classes.checkIconWrapper,
                                        selectOption === NFTSelectOption.Partial ? classes.checked : '',
                                    )}>
                                    <CheckIcon className={classes.checkIcon} />
                                </div>
                                <Typography color="textPrimary">{t.nft_select_partially_option()}</Typography>
                            </div>
                        </Box>
                    )
                ) : null}
                {contract && balance && !loadingOwnerList ? (
                    <div className={classes.tokenSelectorParent}>
                        <List className={classes.tokenSelector}>
                            {tokenDetailedList.map((value, i) => (
                                <div key={i}>
                                    <NFTCard token={value} removeToken={removeToken} renderOrder={i} />
                                </div>
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
                {contract && balance && !loadingOwnerList ? (
                    <>
                        <Typography className={classes.unapprovedTip}>{t.nft_unapproved_tip()}</Typography>
                        <Typography className={classes.approveAllTip}>{t.nft_approve_all_tip()}</Typography>
                    </>
                ) : null}
            </Box>
            <PluginWalletStatusBar>
                <WalletConnectedBoundary>
                    <EthereumERC721TokenApprovedBoundary
                        validationMessage={validationMessage}
                        owner={account}
                        contractDetailed={contract}
                        operator={RED_PACKET_NFT_ADDRESS}>
                        <ActionButton
                            size="large"
                            disabled={!!validationMessage}
                            fullWidth
                            onClick={() => setOpenConfirmDialog(true)}>
                            {t.next()}
                        </ActionButton>
                    </EthereumERC721TokenApprovedBoundary>
                </WalletConnectedBoundary>
            </PluginWalletStatusBar>
            {open ? (
                <SelectNftTokenDialog
                    open={open}
                    onClose={() => setOpen(false)}
                    contract={contract}
                    existTokenDetailedList={tokenDetailedList}
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
                    tokenList={tokenDetailedList}
                    onBack={() => setOpenConfirmDialog(false)}
                    onClose={onClose}
                />
            ) : null}
        </>
    )
}

interface NFTCardProps {
    token: OrderedERC721Token
    removeToken: (token: NonFungibleToken<ChainId, SchemaType.ERC721>) => void
    renderOrder: number
}

function NFTCard(props: NFTCardProps) {
    const { token, removeToken, renderOrder } = props
    const { classes } = useStyles()
    const [name, setName] = useState(formatTokenId(token.tokenId, 2))
    return (
        <ListItem className={classNames(classes.tokenSelectorWrapper)}>
            <NFTCardStyledAssetPlayer
                contractAddress={token.contract?.address}
                chainId={token.chainId}
                url={token.metadata?.mediaURL || token.metadata?.imageURL}
                tokenId={token.tokenId}
                renderOrder={renderOrder}
                setERC721TokenName={setName}
                classes={{
                    loadingFailImage: classes.loadingFailImage,
                    iframe: classes.iframe,
                    imgWrapper: classes.assetImgWrapper,
                }}
            />
            <div className={classes.nftNameWrapper}>
                <Typography className={classes.nftName} color="textSecondary">
                    {name}
                </Typography>
            </div>
            <div className={classes.closeIconWrapperBack} onClick={() => removeToken(token)}>
                <div className={classes.closeIconWrapper}>
                    <CloseIcon className={classes.closeIcon} />
                </div>
            </div>
        </ListItem>
    )
}
