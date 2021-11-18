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
import { makeStyles } from '@masknet/theme'
import { useCallback, useState, useEffect, useRef } from 'react'
import { SearchIcon } from '@masknet/icons'
import CheckIcon from '@mui/icons-material/Check'
import { useScrollBottomEvent } from '@masknet/shared'
import { useUpdate } from 'react-use'

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
        backgroundColor: '#1C68F3',
        '&:hover': {
            backgroundColor: '#1854c4',
        },
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
        backgroundColor: '#1C68F3',
        '&:hover': {
            backgroundColor: '#1854c4',
        },
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
        width: 120,
    },
    loadingWrapper: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'transparent',
    },
    imgWrapper: {
        height: 160,
        width: '100%',
        overflow: 'hidden',
    },
    selectWrapperImg: {
        maxWidth: '100%',
        minHeight: 160,
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
}))

export interface SelectNftTokenDialogProps extends withClasses<never> {
    open: boolean
    loadingOwnerList: boolean
    onClose: () => void
    contract: ERC721ContractDetailed | undefined
    existTokenDetailedList: ERC721TokenDetailed[]
    tokenDetailedOwnerList: ERC721TokenDetailed[]
    setExistTokenDetailedList: React.Dispatch<React.SetStateAction<ERC721TokenDetailed[]>>
    addOffset: () => void
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
        addOffset,
        loadingOwnerList,
    } = props
    const { t } = useI18N()
    const account = useAccount()
    const [tokenDetailed, setTokenDetailed] = useState<ERC721TokenDetailed>()
    const [searched, setSearched] = useState(false)
    const [tokenDetailedSelectedList, setTokenDetailedSelectedList] =
        useState<ERC721TokenDetailed[]>(existTokenDetailedList)
    const [loadingToken, setLoadingToken] = useState(false)
    const [tokenId, setTokenId, erc721TokenDetailedCallback] = useERC721TokenDetailedCallback(contract)
    const containerRef = useRef<HTMLDivElement>(null)

    useScrollBottomEvent(containerRef, addOffset)
    useEffect(() => {
        setTokenDetailed(undefined)
        setTokenId('')
        setTokenDetailedSelectedList(existTokenDetailedList)
        setSearched(false)
    }, [contract])

    const update = useUpdate()
    useEffect(() => {
        update()
    }, [tokenDetailedOwnerList])

    const selectToken = useCallback(
        (token: ERC721TokenDetailed, findToken: ERC721TokenDetailed | undefined) => {
            if (findToken) {
                setTokenDetailedSelectedList(tokenDetailedSelectedList.filter((v) => v.tokenId !== findToken.tokenId))
            } else {
                setTokenDetailedSelectedList(tokenDetailedSelectedList.concat(token))
            }
        },
        [tokenDetailedSelectedList, setTokenDetailedSelectedList],
    )
    //#region fetch token detail
    const onSearch = useCallback(async () => {
        setLoadingToken(true)
        const _tokenDetailed = await erc721TokenDetailedCallback()
        setTokenDetailed(_tokenDetailed?.info.owner ? _tokenDetailed : undefined)
        setSearched(true)
        setLoadingToken(false)
    }, [erc721TokenDetailedCallback])

    useEffect(() => {
        setTokenDetailed(undefined)
        setSearched(false)
    }, [tokenId])

    const isOwner = isSameAddress(account, tokenDetailed?.info.owner) || tokenDetailedSelectedList.length > 0
    const isAdded = existTokenDetailedList.map((t) => t.tokenId).includes(tokenDetailed?.tokenId ?? '')
    //#endregion

    const onSubmit = useCallback(() => {
        setExistTokenDetailedList(
            tokenDetailed ? [tokenDetailed, ...existTokenDetailedList] : tokenDetailedSelectedList,
        )
        onClose()
    }, [tokenDetailed, tokenDetailedSelectedList, setExistTokenDetailedList, onClose])

    return (
        <InjectedDialog open={open} onClose={onClose} title={t('plugin_wallet_select_a_token')} maxWidth="xs">
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
                                <img className={classes.nftImg} src={tokenDetailed.info.image} />
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
                        {(loadingToken || !tokenDetailed) && searched ? (
                            <Box className={classes.noResultBox}>
                                <Typography>
                                    {loadingToken ? t('wallet_loading_token') : t('wallet_search_no_result')}
                                </Typography>
                            </Box>
                        ) : tokenDetailed?.info.name ? (
                            <Box className={classNames(classes.wrapper, classes.nftWrapper)}>
                                <img className={classes.nftImg} src={tokenDetailed?.info.image} />
                                <div className={classes.nftNameWrapper}>
                                    <Typography className={classes.nftName} color="textSecondary">
                                        {tokenDetailed?.info.name}
                                    </Typography>
                                </div>
                            </Box>
                        ) : (
                            <div className={classes.tokenSelector} ref={containerRef}>
                                {tokenDetailedOwnerList.map((token, i) => {
                                    const findToken = tokenDetailedSelectedList.find((t) => t.tokenId === token.tokenId)

                                    return (
                                        <ListItem className={classes.selectWrapper} key={i.toString()}>
                                            <div className={classes.imgWrapper}>
                                                <img className={classes.selectWrapperImg} src={token?.info.image} />
                                            </div>
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
                                                onClick={() => selectToken(token, findToken)}>
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
