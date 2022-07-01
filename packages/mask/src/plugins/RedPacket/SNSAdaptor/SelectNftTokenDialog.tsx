import classNames from 'classnames'
import { InjectedDialog, NFTCardStyledAssetPlayer } from '@masknet/shared'
import { NetworkPluginID, isSameAddress, NonFungibleToken, NonFungibleTokenContract } from '@masknet/web3-shared-base'
import { SchemaType, formatTokenId, ChainId } from '@masknet/web3-shared-evm'
import { useI18N as useBaseI18N } from '../../../utils'
import { Translate, useI18N } from '../locales'
import { DialogContent, Box, InputBase, Paper, Button, Typography, ListItem, CircularProgress } from '@mui/material'
import QuestionMarkIcon from '@mui/icons-material/QuestionMark'
import { makeStyles, ShadowRootTooltip } from '@masknet/theme'
import { useCallback, useState, useEffect } from 'react'
import { Search as SearchIcon } from '@masknet/icons'
import CheckIcon from '@mui/icons-material/Check'
import { useUpdate } from 'react-use'
import { findLastIndex } from 'lodash-unified'
import { NFT_RED_PACKET_MAX_SHARES } from '../constants'
import { useAccount, useChainId, useWeb3Connection } from '@masknet/plugin-infra/web3'

interface StyleProps {
    isSelectSharesExceed: boolean
}

const useStyles = makeStyles<StyleProps>()((theme, props) => ({
    dialogContent: {
        minHeight: 380,
    },
    dialogContentFixedHeight: {
        height: 610,
    },
    tokenBox: {
        background: theme.palette.background.default,
        width: 530,
        minHeight: 270,
        borderRadius: 12,
        margin: '16px auto',
        padding: 10,
    },
    ownerTokenBox: {
        background: theme.palette.background.default,
        width: '96%',
        height: 480,
        borderRadius: 12,
        margin: '14px auto',
        padding: 10,
    },
    ownerList: {
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: '16px 0',
        width: 528,
        height: 188,
        overflowY: 'auto',
        borderRadius: 12,
        marginTop: theme.spacing(1.5),
        marginBottom: theme.spacing(1.5),
        padding: theme.spacing(1, 1.5, 1, 1),
    },
    noResultBox: {
        width: 540,
        height: 180,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 16,
    },
    search: {
        width: 405,
        padding: 5,
        border: '1px solid #EBEEF0',
        borderRadius: 6,
        display: 'flex',
        alignItems: 'center',
    },
    iconButton: {
        color: '#7B8192',
        padding: theme.spacing(0.5),
    },
    searchButton: {
        borderRadius: 6,
        width: 100,
    },
    searchWrapper: {
        display: 'flex',
        justifyContent: 'space-between',
        padding: 0,
    },
    searchWrapperSingle: {
        display: 'flex',
        justifyContent: 'space-between',
        padding: 0,
    },
    textField: {
        width: 394,
    },
    wrapper: {
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        borderRadius: 8,
        padding: 0,
        marginBottom: theme.spacing(2.5),
        background: theme.palette.background.paper,
        width: 120,
        height: 180,
        minHeight: 153,
        overflow: 'hidden',
    },
    iframe: {
        minHeight: 147,
    },
    nftNameWrapper: {
        width: '100%',
        background: theme.palette.mode === 'light' ? 'none' : '#2F3336',
        borderBottomRightRadius: 8,
        borderBottomLeftRadius: 8,
    },
    nftImg: {
        margin: '0 auto',
        height: 160,
        width: 'auto',
        minWidth: 120,
    },
    nftName: {
        marginLeft: 8,
        minHeight: 30,
    },
    nftWrapper: {
        justifyContent: 'center',
    },
    confirmButton: {
        width: '100%',
        backgroundColor: theme.palette.mode === 'dark' ? '#fff' : '#000',
        color: theme.palette.mode === 'dark' ? '#000' : '#fff',
    },
    tokenSelector: {
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: 16,
        width: '100%',
        height: 388,
        overflowY: 'auto',
        borderRadius: 12,
        marginTop: theme.spacing(1.5),
        marginBottom: theme.spacing(1.5),
        padding: theme.spacing(1, 1.5, 1, 1),
        boxSizing: 'border-box',
        '&::-webkit-scrollbar': {
            display: 'none',
        },
    },
    selectWrapper: {
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
    hide: {
        display: 'none !important',
    },
    loadingWrapper: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'transparent',
    },
    selectWrapperNftNameWrapper: {
        width: '100%',
        background: theme.palette.background.paper,
        borderBottomRightRadius: 8,
        borderBottomLeftRadius: 8,
        overflow: 'hidden',
    },
    selectWrapperNftName: {
        marginLeft: 8,
        minHeight: 35,
        whiteSpace: 'nowrap',
        textOverflow: 'ellipsis',
        overflow: 'hidden',
    },
    checkbox: {
        position: 'absolute',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        cursor: 'pointer',
        top: 8,
        right: 6,
        width: 17,
        height: 17,
        borderRadius: 6,
        border: '2px solid #6E748E',
        backgroundColor: 'white',
    },
    checked: {
        borderColor: '#1C68F3 !important',
    },
    checkIcon: {
        width: 15,
        height: 15,
        color: '#1C68F3',
    },
    loadingFailImage: {
        minHeight: '0 !important',
        maxWidth: 'none',
        transform: 'translateY(10px)',
        width: 64,
        height: 64,
    },
    selectedTokenAmount: {
        color: props.isSelectSharesExceed ? '#FF5F5F' : '#1C68F3',
    },
    totalAmount: {
        paddingLeft: 1,
    },
    selectAmountBox: {
        display: 'flex',
        flexDirection: 'row-reverse',
        alignItems: 'center',
    },
    questionMarkIcon: {
        padding: 2,
        width: 12,
        border: `1px solid ${theme.palette.mode === 'light' ? '#0F1419' : '#D9D9D9'}`,
        borderRadius: 999,
        transform: 'translateY(-1px)',
        height: 12,
        marginLeft: 5,
        cursor: 'pointer',
    },
    selectBar: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginTop: 12,
        padding: '0 8px',
    },
    selectAll: {
        display: 'flex',
        alignItems: 'center',
        fontSize: 14,
    },
    selectAllCheckBox: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        cursor: 'pointer',
        width: 17,
        height: 17,
        borderRadius: 6,
        marginRight: 5,
        border: '2px solid #6E748E',
        backgroundColor: 'white',
    },
    selectAllCheckBoxText: {
        pointerEvents: 'none',
    },
    selectSharesExceed: {
        color: '#FF5F5F',
    },
    selectSharesExceedBox: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        margin: '14px 4px',
    },
    arrow: {
        color: theme.palette.mode === 'dark' ? '#fff' : '#111418',
        transform: 'translateX(260px) !important',
    },
    tooltip: {
        transform: 'translateX(20px) !important',
        padding: '10px 20px',
        width: 256,
        backgroundColor: theme.palette.mode === 'dark' ? '#fff' : '#111418',
    },
    tooltipText: {
        color: theme.palette.mode === 'dark' ? '#000' : '#fff',
    },
    tokenId: {
        color: '#1D9BF0',
    },
    nonExistedTokenBox: {
        height: 388,
        width: '100%',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
    },
    assetImgWrapper: {
        maxHeight: 155,
    },
}))

export type OrderedERC721Token = NonFungibleToken<ChainId, SchemaType.ERC721> & { index: number }

export interface SelectNftTokenDialogProps extends withClasses<never> {
    open: boolean
    loadingOwnerList: boolean
    onClose: () => void
    contract: NonFungibleTokenContract<ChainId, SchemaType.ERC721> | null | undefined
    existTokenDetailedList: OrderedERC721Token[]
    tokenDetailedOwnerList: OrderedERC721Token[]
    setExistTokenDetailedList: React.Dispatch<React.SetStateAction<OrderedERC721Token[]>>
}

export function SelectNftTokenDialog(props: SelectNftTokenDialogProps) {
    const {
        open,
        contract,
        existTokenDetailedList,
        tokenDetailedOwnerList,
        setExistTokenDetailedList,
        onClose,
        loadingOwnerList,
    } = props
    const { t: tr } = useBaseI18N()
    const t = useI18N()
    const account = useAccount(NetworkPluginID.PLUGIN_EVM)
    const [tokenDetailed, setTokenDetailed] = useState<OrderedERC721Token>()
    const [searched, setSearched] = useState(false)
    const [tokenDetailedSelectedList, setTokenDetailedSelectedList] =
        useState<OrderedERC721Token[]>(existTokenDetailedList)
    const [loadingToken, setLoadingToken] = useState(false)
    const [tokenId, setTokenId] = useState('')
    const chainId = useChainId(NetworkPluginID.PLUGIN_EVM)
    const connection = useWeb3Connection(NetworkPluginID.PLUGIN_EVM)
    const [tokenIdListInput, setTokenIdListInput] = useState<string>('')
    const [tokenIdFilterList, setTokenIdFilterList] = useState<string[]>([])
    const [nonExistedTokenIdList, setNonExistedTokenIdList] = useState<string[]>([])
    const isSelectSharesExceed =
        (tokenDetailedOwnerList.length === 0 ? NFT_RED_PACKET_MAX_SHARES - 1 : NFT_RED_PACKET_MAX_SHARES) <
        tokenDetailedSelectedList.length
    const { classes } = useStyles({ isSelectSharesExceed })
    const [selectAll, setSelectAll] = useState(false)
    const selectAllHandler = useCallback(() => {
        setTokenDetailedSelectedList(selectAll ? [] : tokenDetailedOwnerList)
        setSelectAll(!selectAll)
    }, [selectAll, tokenDetailedOwnerList])

    useEffect(() => {
        setTokenDetailed(undefined)
        setTokenId('')
        setTokenDetailedSelectedList(existTokenDetailedList)
        setSearched(false)
    }, [contract])

    useEffect(() => {
        setTokenIdFilterList([])
        setNonExistedTokenIdList([])
    }, [tokenIdListInput])

    const update = useUpdate()
    useEffect(update, [tokenDetailedOwnerList])

    const selectToken = useCallback(
        (token: OrderedERC721Token, findToken: OrderedERC721Token | undefined, shiftKey: boolean, index: number) => {
            if (!shiftKey || tokenIdFilterList.length > 0) {
                if (findToken) {
                    setTokenDetailedSelectedList(
                        tokenDetailedSelectedList.filter((v) => v.tokenId !== findToken.tokenId),
                    )
                } else {
                    setTokenDetailedSelectedList(tokenDetailedSelectedList.concat({ ...token, index }))
                }
            } else {
                const tokenDetailedSelectedListSorted = tokenDetailedSelectedList.sort(
                    (a, b) => (b.index ?? 0) - (a.index ?? 0),
                )
                if (findToken) {
                    const unselectedTokenIdList: string[] = []
                    let nextToken: OrderedERC721Token | undefined = findToken
                    while (nextToken) {
                        unselectedTokenIdList.push(nextToken.tokenId)
                        const nextTokenIndex: number = (nextToken?.index ?? 0) + 1
                        nextToken = tokenDetailedSelectedListSorted.find((v) => (v.index ?? 0) === nextTokenIndex)
                    }
                    setTokenDetailedSelectedList(
                        tokenDetailedSelectedList.filter((v) => !unselectedTokenIdList.includes(v.tokenId)),
                    )
                } else {
                    const lastSelectedToken = tokenDetailedSelectedListSorted.filter((v) => (v?.index ?? 0) < index)[0]

                    const lastSelectedTokenIndex = findLastIndex(
                        tokenDetailedOwnerList,
                        (v, i) => v.tokenId === lastSelectedToken?.tokenId && i < index,
                    )
                    setTokenDetailedSelectedList(
                        tokenDetailedSelectedList.concat(
                            tokenDetailedOwnerList.slice(lastSelectedTokenIndex + 1, index + 1),
                        ),
                    )
                }
            }
        },
        [tokenDetailedSelectedList, setTokenDetailedSelectedList, tokenIdFilterList],
    )
    // #region fetch token detail
    const onSearch = useCallback(async () => {
        setLoadingToken(true)
        const _tokenDetailed = (await connection?.getNonFungibleToken(
            contract?.address ?? '',
            tokenId,
            SchemaType.ERC721,
            {
                account,
                chainId,
            },
        )) as NonFungibleToken<ChainId, SchemaType.ERC721>
        setTokenDetailed(_tokenDetailed?.ownerId ? { ..._tokenDetailed, index: 0 } : undefined)
        setSearched(true)
        setLoadingToken(false)
    }, [connection, contract, tokenId, chainId, account])

    useEffect(() => {
        setTokenDetailed(undefined)
        setSearched(false)
    }, [tokenId])

    useEffect(() => {
        if (tokenDetailedOwnerList.length > 0) setTokenDetailed(undefined)
    }, [tokenDetailedOwnerList.length])

    const isOwner = isSameAddress(account, tokenDetailed?.ownerId) || tokenDetailedSelectedList.length > 0
    const isAdded = existTokenDetailedList.map((t) => t.tokenId).includes(tokenDetailed?.tokenId ?? '')
    // #endregion

    const onFilter = useCallback(() => {
        if (!/^(\s?(\d+)?\s?,?)+$/.test(tokenIdListInput)) return
        const list = tokenIdListInput.split(',').map((v) => Number(v).toString())
        setTokenIdFilterList(list)
        setNonExistedTokenIdList(list.filter((v) => !tokenDetailedOwnerList.map((t) => t.tokenId).includes(v)))
    }, [tokenIdListInput])

    const onSubmit = useCallback(() => {
        setExistTokenDetailedList(
            tokenDetailed ? [tokenDetailed, ...existTokenDetailedList] : tokenDetailedSelectedList,
        )
        onClose()
    }, [tokenDetailed, tokenDetailedSelectedList, setExistTokenDetailedList, onClose])

    const NonExistedTokenList = () => (
        <Translate.nft_non_existed_tip
            components={{
                tokenIdList: (
                    <span>
                        {nonExistedTokenIdList.map((id, i) => (
                            <span key={i}>
                                <span className={classes.tokenId}> #{id}</span>
                                {i < nonExistedTokenIdList.length - 1 ? ', ' : ' '}
                            </span>
                        ))}
                    </span>
                ),
            }}
        />
    )

    const maxSharesOptions = { amount: NFT_RED_PACKET_MAX_SHARES.toString() }

    return (
        <InjectedDialog open={open} onClose={onClose} title={t.nft_select_collection()} maxWidth="xs">
            {tokenDetailedOwnerList.length === 0 ? (
                <DialogContent className={classes.dialogContent}>
                    <Box className={classes.tokenBox}>
                        <div className={classes.searchWrapperSingle}>
                            <Paper className={classes.search} elevation={0}>
                                <SearchIcon className={classes.iconButton} />
                                <InputBase
                                    value={tokenId}
                                    placeholder="Input Token ID"
                                    className={classes.textField}
                                    onChange={(e) => setTokenId(e.target.value)}
                                />
                            </Paper>
                            <Button disabled={!tokenId} className={classes.searchButton} onClick={onSearch}>
                                {t.search()}
                            </Button>
                        </div>
                        {loadingToken || !tokenDetailed || !contract ? (
                            <Box className={classes.noResultBox}>
                                <Typography>
                                    {loadingToken ? t.loading_token() : searched ? t.search_no_result() : null}
                                </Typography>
                            </Box>
                        ) : (
                            <Box className={classNames(classes.wrapper, classes.nftWrapper)}>
                                <NFTCardStyledAssetPlayer
                                    contractAddress={contract.address}
                                    chainId={contract.chainId}
                                    url={tokenDetailed.metadata?.mediaURL || tokenDetailed.metadata?.imageURL}
                                    tokenId={tokenId}
                                    classes={{
                                        loadingFailImage: classes.loadingFailImage,
                                        iframe: classes.iframe,
                                        imgWrapper: classes.assetImgWrapper,
                                    }}
                                />
                                <div className={classes.selectWrapperNftNameWrapper}>
                                    <Typography className={classes.selectWrapperNftName} color="textSecondary">
                                        {tokenDetailed.contract?.name}
                                    </Typography>
                                </div>
                            </Box>
                        )}
                    </Box>
                    <div className={classes.selectSharesExceedBox}>
                        <Typography className={classes.selectSharesExceed}>
                            {isSelectSharesExceed ? t.nft_max_shares_tip(maxSharesOptions) : null}
                        </Typography>
                        <Box className={classes.selectAmountBox}>
                            <ShadowRootTooltip
                                title={
                                    <Typography className={classes.tooltipText}>
                                        {tokenDetailedSelectedList.length > NFT_RED_PACKET_MAX_SHARES
                                            ? t.nft_max_shares_tip(maxSharesOptions)
                                            : t.nft_max_shares(maxSharesOptions)}
                                    </Typography>
                                }
                                placement="top-end"
                                classes={{ tooltip: classes.tooltip, arrow: classes.arrow }}
                                arrow>
                                <QuestionMarkIcon className={classes.questionMarkIcon} />
                            </ShadowRootTooltip>
                            <Typography>
                                <span className={classes.selectedTokenAmount}>{tokenDetailedSelectedList.length}</span>{' '}
                                NFTs
                            </Typography>
                        </Box>
                    </div>
                    <Button
                        disabled={loadingToken || !tokenDetailed || !isOwner || isAdded || isSelectSharesExceed}
                        className={classes.confirmButton}
                        onClick={onSubmit}>
                        {tokenDetailed && !isOwner
                            ? t.nft_invalid_owner()
                            : isAdded
                            ? t.nft_already_added()
                            : tr('confirm')}
                    </Button>
                </DialogContent>
            ) : (
                <DialogContent className={classNames(classes.dialogContent, classes.dialogContentFixedHeight)}>
                    <Box className={classes.ownerTokenBox}>
                        <div className={classes.searchWrapper}>
                            <Paper className={classes.search} elevation={0}>
                                <SearchIcon className={classes.iconButton} />
                                <InputBase
                                    value={tokenDetailedOwnerList.length === 0 ? tokenId : tokenIdListInput}
                                    placeholder="Token ID separated by comma, e.g. 1224, 7873, 8948"
                                    className={classes.textField}
                                    onChange={(e) =>
                                        tokenDetailedOwnerList.length === 0
                                            ? setTokenId(e.target.value)
                                            : setTokenIdListInput(e.target.value)
                                    }
                                />
                            </Paper>
                            <Button
                                disabled={tokenDetailedOwnerList.length === 0 ? !tokenId : !tokenIdListInput}
                                className={classes.searchButton}
                                onClick={tokenDetailedOwnerList.length === 0 ? onSearch : onFilter}>
                                {t.search()}
                            </Button>
                        </div>
                        {(loadingToken || !tokenDetailed) && searched ? (
                            <Box className={classes.noResultBox}>
                                <Typography>{loadingToken ? t.loading_token() : t.search_no_result()}</Typography>
                            </Box>
                        ) : tokenDetailed?.contract?.name ? (
                            <Box className={classNames(classes.wrapper, classes.nftWrapper)}>
                                <img className={classes.nftImg} src={tokenDetailed?.metadata?.mediaURL} />
                                <div className={classes.nftNameWrapper}>
                                    <Typography className={classes.nftName} color="textSecondary">
                                        {tokenDetailed?.contract.name}
                                    </Typography>
                                </div>
                            </Box>
                        ) : (
                            <>
                                {tokenIdFilterList.length === 0 ? (
                                    <div className={classes.selectBar}>
                                        <div className={classes.selectAll}>
                                            <div
                                                className={classNames(
                                                    classes.selectAllCheckBox,
                                                    selectAll ? classes.checked : '',
                                                )}
                                                onClick={selectAllHandler}>
                                                {selectAll ? <CheckIcon className={classes.checkIcon} /> : null}
                                            </div>
                                            <Typography className={classNames(classes.selectAllCheckBoxText)}>
                                                {tr('select_all')}
                                            </Typography>
                                        </div>
                                        <Typography>
                                            <Translate.nft_shift_select_tip
                                                components={{
                                                    text: <span style={{ color: '#1C68F3' }} />,
                                                }}
                                                values={{
                                                    text: 'Shift',
                                                }}
                                            />
                                        </Typography>
                                    </div>
                                ) : null}
                                {nonExistedTokenIdList.length > 0 &&
                                nonExistedTokenIdList.length === tokenIdFilterList.length ? (
                                    <div className={classes.nonExistedTokenBox}>
                                        <Typography color="textPrimary">
                                            <NonExistedTokenList />
                                        </Typography>
                                    </div>
                                ) : (
                                    <div className={classes.tokenSelector}>
                                        {tokenDetailedOwnerList.map((token, i) => {
                                            const findToken = tokenDetailedSelectedList.find(
                                                (t) => t.tokenId === token.tokenId,
                                            )

                                            return tokenIdFilterList.length > 0 &&
                                                !tokenIdFilterList.includes(token.tokenId) ? null : (
                                                <div key={i}>
                                                    <NFTCard
                                                        findToken={findToken}
                                                        renderOrder={i}
                                                        token={token}
                                                        tokenIdFilterList={tokenIdFilterList}
                                                        selectToken={selectToken}
                                                        isSelectSharesExceed={isSelectSharesExceed}
                                                    />
                                                </div>
                                            )
                                        })}
                                        {loadingOwnerList ? (
                                            <ListItem
                                                className={classNames(classes.selectWrapper, classes.loadingWrapper)}>
                                                <CircularProgress size={25} />
                                            </ListItem>
                                        ) : null}
                                    </div>
                                )}
                            </>
                        )}
                    </Box>
                    <div className={classes.selectSharesExceedBox}>
                        <div>
                            <Typography color="textPrimary">
                                {nonExistedTokenIdList.length > 0 &&
                                nonExistedTokenIdList.length !== tokenIdFilterList.length ? (
                                    <NonExistedTokenList />
                                ) : null}
                            </Typography>
                            <Typography className={classes.selectSharesExceed}>
                                {isSelectSharesExceed ? t.nft_max_shares_tip(maxSharesOptions) : null}
                            </Typography>
                        </div>

                        <Box className={classes.selectAmountBox}>
                            <ShadowRootTooltip
                                title={
                                    <Typography className={classes.tooltipText}>
                                        {tokenDetailedSelectedList.length > NFT_RED_PACKET_MAX_SHARES
                                            ? t.nft_max_shares_tip(maxSharesOptions)
                                            : t.nft_max_shares(maxSharesOptions)}
                                    </Typography>
                                }
                                placement="top-end"
                                classes={{ tooltip: classes.tooltip, arrow: classes.arrow }}
                                arrow>
                                <QuestionMarkIcon className={classes.questionMarkIcon} />
                            </ShadowRootTooltip>
                            <Typography>
                                <span className={classes.selectedTokenAmount}>
                                    {tokenDetailedSelectedList.length + ' '}
                                </span>
                                /<span className={classes.totalAmount}>{tokenDetailedOwnerList.length}</span>
                            </Typography>
                        </Box>
                    </div>
                    <Button
                        disabled={
                            loadingToken ||
                            (!tokenDetailed && tokenDetailedSelectedList.length === 0) ||
                            !isOwner ||
                            isAdded ||
                            isSelectSharesExceed
                        }
                        className={classes.confirmButton}
                        onClick={onSubmit}>
                        {tokenDetailed && !isOwner
                            ? t.nft_invalid_owner()
                            : isAdded
                            ? t.nft_already_added()
                            : tr('confirm')}
                    </Button>
                </DialogContent>
            )}
        </InjectedDialog>
    )
}

interface NFTCardProps {
    findToken: OrderedERC721Token | undefined
    token: OrderedERC721Token
    tokenIdFilterList: string[]
    isSelectSharesExceed: boolean
    renderOrder: number
    selectToken: (
        token: OrderedERC721Token,
        findToken: OrderedERC721Token | undefined,
        shiftKey: boolean,
        index: number,
    ) => void
}

function NFTCard(props: NFTCardProps) {
    const { findToken, token, tokenIdFilterList, isSelectSharesExceed, renderOrder, selectToken } = props
    const { classes } = useStyles({ isSelectSharesExceed })
    return (
        <ListItem className={classes.selectWrapper}>
            <NFTCardStyledAssetPlayer
                url={token.metadata?.mediaURL || token.metadata?.imageURL}
                contractAddress={token.contract?.address}
                tokenId={token.tokenId}
                renderOrder={renderOrder}
                chainId={token.contract?.chainId}
                classes={{
                    loadingFailImage: classes.loadingFailImage,
                    iframe: classes.iframe,
                    imgWrapper: classes.assetImgWrapper,
                }}
            />
            <div className={classes.selectWrapperNftNameWrapper}>
                <Typography className={classes.selectWrapperNftName} color="textSecondary">
                    {formatTokenId(token.tokenId, 2)}
                </Typography>
            </div>

            <div
                className={classNames(classes.checkbox, findToken ? classes.checked : '')}
                onClick={(event) => selectToken(token, findToken, event.shiftKey, token.index)}>
                {findToken ? <CheckIcon className={classes.checkIcon} /> : null}
            </div>
        </ListItem>
    )
}
