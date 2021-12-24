import classNames from 'classnames'
import { InjectedDialog } from '../../../components/shared/InjectedDialog'
import {
    ERC721TokenDetailed,
    ERC721ContractDetailed,
    useERC721TokenDetailedCallback,
    useAccount,
    isSameAddress,
} from '@masknet/web3-shared-evm'
import { useI18N } from '../../../utils'
import { DialogContent, Box, InputBase, Paper, Button, Typography, ListItem, CircularProgress } from '@mui/material'
import QuestionMarkIcon from '@mui/icons-material/QuestionMark'
import { makeStyles } from '@masknet/theme'
import { useCallback, useState, useEffect } from 'react'
import { SearchIcon } from '@masknet/icons'
import CheckIcon from '@mui/icons-material/Check'
import { useUpdate } from 'react-use'
import { NftImage } from './NftImage'
import { findLastIndex } from 'lodash-unified'

const useStyles = makeStyles()((theme) => ({
    dialogContent: {
        minHeight: 380,
    },
    dialogContentFixedHeight: {
        height: 550,
    },
    tokenBox: {
        background: theme.palette.mode === 'light' ? '#F7F9FA' : '#17191D',
        width: 530,
        minHeight: 270,
        borderRadius: 12,
        margin: '16px auto',
        padding: 10,
    },
    ownerTokenBox: {
        background: theme.palette.mode === 'light' ? '#F7F9FA' : '#17191D',
        width: '96%',
        height: 450,
        borderRadius: 12,
        margin: '16px auto',
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
        padding: '0',
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
        display: 'flex',
        overflow: 'hidden',
        flexDirection: 'column',
        marginTop: theme.spacing(2),
        marginBottom: theme.spacing(2.5),
        background: theme.palette.mode === 'light' ? '#fff' : '#2F3336',
        width: 120,
        borderRadius: 8,
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
    },
    selectWrapper: {
        background: theme.palette.mode === 'light' ? '#fff' : '#2F3336',
        display: 'flex',
        overflow: 'hidden',
        padding: 0,
        flexDirection: 'column',
        borderRadius: 6,
        height: 180,
        userSelect: 'none',
        width: 120,
    },
    hide: {
        display: 'none',
    },
    loadingWrapper: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'transparent',
    },
    selectWrapperNftNameWrapper: {
        width: '100%',
        background: theme.palette.mode === 'light' ? 'none' : '#2F3336',
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
        borderColor: '#1C68F3',
    },
    checkIcon: {
        width: 15,
        height: 15,
        color: '#1C68F3',
    },
    loadingFailImage: {
        minHeight: '0px !important',
        maxWidth: 'none',
        transform: 'translateY(10px)',
        width: 64,
        height: 64,
    },
    selectedTokenAmount: {
        color: '#1C68F3',
    },
    totalAmount: {
        paddingLeft: 1,
    },
    selectAmountBox: {
        display: 'flex',
        flexDirection: 'row-reverse',
    },
    questionMarkIcon: {
        padding: 2,
        width: 12,
        border: '1px solid white',
        borderRadius: 999,
        height: 12,
        marginLeft: 5,
    },
}))

export interface SelectNftTokenDialogProps extends withClasses<never> {
    open: boolean
    loadingOwnerList: boolean
    onClose: () => void
    contract: ERC721ContractDetailed | undefined
    existTokenDetailedList: (ERC721TokenDetailed & { index: number })[]
    tokenDetailedOwnerList: (ERC721TokenDetailed & { index: number })[]
    setExistTokenDetailedList: React.Dispatch<React.SetStateAction<(ERC721TokenDetailed & { index: number })[]>>
}

export function SelectNftTokenDialog(props: SelectNftTokenDialogProps) {
    const { classes } = useStyles()
    const {
        open,
        contract,
        existTokenDetailedList,
        tokenDetailedOwnerList,
        setExistTokenDetailedList,
        onClose,
        loadingOwnerList,
    } = props
    const { t } = useI18N()
    const account = useAccount()
    const [tokenDetailed, setTokenDetailed] = useState<ERC721TokenDetailed & { index: number }>()
    const [searched, setSearched] = useState(false)
    const [tokenDetailedSelectedList, setTokenDetailedSelectedList] =
        useState<(ERC721TokenDetailed & { index: number })[]>(existTokenDetailedList)
    const [loadingToken, setLoadingToken] = useState(false)
    const [tokenId, setTokenId, erc721TokenDetailedCallback] = useERC721TokenDetailedCallback(contract)
    const [tokenIdListInput, setTokenIdListInput] = useState<string>('')
    const [tokenIdFilterList, setTokenIdFilterList] = useState<string[]>([])

    useEffect(() => {
        setTokenDetailed(undefined)
        setTokenId('')
        setTokenDetailedSelectedList(existTokenDetailedList)
        setSearched(false)
    }, [contract])

    useEffect(() => {
        setTokenIdFilterList([])
    }, [tokenIdListInput])

    const update = useUpdate()
    useEffect(update, [tokenDetailedOwnerList])

    const selectToken = useCallback(
        (
            token: ERC721TokenDetailed & { index: number },
            findToken: (ERC721TokenDetailed & { index: number }) | undefined,
            shiftKey: boolean,
            index: number,
        ) => {
            if (!shiftKey) {
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
                    let nextToken: (ERC721TokenDetailed & { index: number }) | undefined = findToken
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
        [tokenDetailedSelectedList, setTokenDetailedSelectedList],
    )
    //#region fetch token detail
    const onSearch = useCallback(async () => {
        setLoadingToken(true)
        const _tokenDetailed = await erc721TokenDetailedCallback()
        setTokenDetailed(_tokenDetailed?.info.owner ? { ..._tokenDetailed, index: 0 } : undefined)
        setSearched(true)
        setLoadingToken(false)
    }, [erc721TokenDetailedCallback])

    useEffect(() => {
        setTokenDetailed(undefined)
        setSearched(false)
    }, [tokenId])

    useEffect(() => {
        if (tokenDetailedOwnerList.length > 0) setTokenDetailed(undefined)
    }, [tokenDetailedOwnerList])

    const isOwner = isSameAddress(account, tokenDetailed?.info.owner) || tokenDetailedSelectedList.length > 0
    const isAdded = existTokenDetailedList.map((t) => t.tokenId).includes(tokenDetailed?.tokenId ?? '')
    //#endregion

    const r = /^(\s?(\d+)\s?,?)+$/.test(tokenIdListInput)

    const onFilter = useCallback(() => {
        if (!/^(\s?(\d+)?\s?,?)+$/.test(tokenIdListInput)) return
        setTokenIdFilterList(tokenIdListInput.split(',').map((v) => Number(v).toString()))
    }, [tokenIdListInput])

    const onSubmit = useCallback(() => {
        setExistTokenDetailedList(
            tokenDetailed ? [tokenDetailed, ...existTokenDetailedList] : tokenDetailedSelectedList,
        )
        onClose()
    }, [tokenDetailed, tokenDetailedSelectedList, setExistTokenDetailedList, onClose])

    return (
        <InjectedDialog
            open={open}
            onClose={onClose}
            title={t('plugin_red_packet_nft_select_collection')}
            maxWidth="xs">
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
                            <Button
                                disabled={!tokenId}
                                className={classes.searchButton}
                                variant="contained"
                                onClick={onSearch}>
                                {t('search')}
                            </Button>
                        </div>
                        {loadingToken || !tokenDetailed ? (
                            <Box className={classes.noResultBox}>
                                <Typography>
                                    {loadingToken
                                        ? t('wallet_loading_token')
                                        : searched
                                        ? t('wallet_search_no_result')
                                        : null}
                                </Typography>
                            </Box>
                        ) : (
                            <Box className={classNames(classes.wrapper, classes.nftWrapper)}>
                                <img className={classes.nftImg} src={tokenDetailed.info.mediaUrl} />
                                <div className={classes.nftNameWrapper}>
                                    <Typography className={classes.nftName} color="textSecondary">
                                        {tokenDetailed.info.name}
                                    </Typography>
                                </div>
                            </Box>
                        )}
                    </Box>
                    <Button
                        disabled={loadingToken || !tokenDetailed || !isOwner || isAdded}
                        className={classes.confirmButton}
                        variant="contained"
                        onClick={onSubmit}>
                        {tokenDetailed && !isOwner
                            ? t('wallet_add_nft_invalid_owner')
                            : isAdded
                            ? t('wallet_add_nft_already_added')
                            : t('confirm')}
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
                                variant="contained"
                                onClick={tokenDetailedOwnerList.length === 0 ? onSearch : onFilter}>
                                {t('search')}
                            </Button>
                        </div>
                        {(loadingToken || !tokenDetailed) && searched ? (
                            <Box className={classes.noResultBox}>
                                <Typography>
                                    {loadingToken ? t('wallet_loading_token') : t('wallet_search_no_result')}
                                </Typography>
                            </Box>
                        ) : tokenDetailed?.info.name ? (
                            <Box className={classNames(classes.wrapper, classes.nftWrapper)}>
                                <img className={classes.nftImg} src={tokenDetailed?.info.mediaUrl} />
                                <div className={classes.nftNameWrapper}>
                                    <Typography className={classes.nftName} color="textSecondary">
                                        {tokenDetailed?.info.name}
                                    </Typography>
                                </div>
                            </Box>
                        ) : (
                            <div className={classes.tokenSelector}>
                                {tokenDetailedOwnerList.map((token, i) => {
                                    const findToken = tokenDetailedSelectedList.find((t) => t.tokenId === token.tokenId)

                                    return (
                                        <ListItem
                                            className={classNames(
                                                classes.selectWrapper,
                                                tokenIdFilterList.length > 0 &&
                                                    !tokenIdFilterList.includes(token.tokenId)
                                                    ? classes.hide
                                                    : '',
                                            )}
                                            key={i.toString()}>
                                            <NftImage
                                                token={token}
                                                classes={{
                                                    loadingFailImage: classes.loadingFailImage,
                                                }}
                                                fallbackImage={
                                                    new URL('./assets/nft_token_fallback.png', import.meta.url)
                                                }
                                            />
                                            <div className={classes.selectWrapperNftNameWrapper}>
                                                <Typography
                                                    className={classes.selectWrapperNftName}
                                                    color="textSecondary">
                                                    {token?.info.name}
                                                </Typography>
                                            </div>
                                            <div
                                                className={classNames(
                                                    classes.checkbox,
                                                    findToken ? classes.checked : '',
                                                )}
                                                onClick={(event) =>
                                                    selectToken(token, findToken, event.shiftKey, token.index)
                                                }>
                                                {findToken ? <CheckIcon className={classes.checkIcon} /> : null}
                                            </div>
                                        </ListItem>
                                    )
                                })}
                                {loadingOwnerList ? (
                                    <ListItem className={classNames(classes.selectWrapper, classes.loadingWrapper)}>
                                        <CircularProgress size={25} />
                                    </ListItem>
                                ) : null}
                            </div>
                        )}
                    </Box>
                    <Box className={classes.selectAmountBox}>
                        <QuestionMarkIcon className={classes.questionMarkIcon} />
                        <Typography>
                            <span className={classes.selectedTokenAmount}>
                                {tokenDetailedSelectedList.length + ' '}
                            </span>
                            /<span className={classes.totalAmount}>{tokenDetailedOwnerList.length}</span>
                        </Typography>
                    </Box>
                    <Button
                        disabled={
                            loadingToken ||
                            (!tokenDetailed && tokenDetailedSelectedList.length === 0) ||
                            !isOwner ||
                            isAdded
                        }
                        className={classes.confirmButton}
                        variant="contained"
                        onClick={onSubmit}>
                        {tokenDetailed && !isOwner
                            ? t('wallet_add_nft_invalid_owner')
                            : isAdded
                            ? t('wallet_add_nft_already_added')
                            : t('confirm')}
                    </Button>
                </DialogContent>
            )}
        </InjectedDialog>
    )
}
