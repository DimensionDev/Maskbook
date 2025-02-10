import { Plural, Trans, useLingui } from '@lingui/react/macro'
import { Icons } from '@masknet/icons'
import { AssetPreviewer } from '@masknet/shared'
import { EMPTY_LIST, type NetworkPluginID } from '@masknet/shared-base'
import { useRenderPhraseCallbackOnDepsChange } from '@masknet/shared-base-ui'
import { LoadingBase, ShadowRootTooltip, makeStyles } from '@masknet/theme'
import { useChainContext } from '@masknet/web3-hooks-base'
import { EVMWeb3 } from '@masknet/web3-providers'
import { SchemaType, formatTokenId } from '@masknet/web3-shared-evm'
import { Check as CheckIcon, QuestionMark as QuestionMarkIcon } from '@mui/icons-material'
import { Box, Button, DialogContent, InputBase, ListItem, Typography, useTheme } from '@mui/material'
import { findLastIndex, uniq } from 'lodash-es'
import { useCallback, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { NFT_RED_PACKET_MAX_SHARES } from '../../constants.js'
import { useRedPacket } from '../contexts/RedPacketContext.js'
import type { OrderedERC721Token } from '../../types.js'
import { useMyCollectionNfts } from '../hooks/useMyCollectionNfts.js'

interface StyleProps {
    isSelectSharesExceed: boolean
}

const useStyles = makeStyles<StyleProps>()((theme, props) => ({
    dialogContent: {
        minHeight: 380,
        display: 'flex',
        flexDirection: 'column',
        gap: theme.spacing(1.5),
    },
    dialogContentFixedHeight: {
        overflowY: 'hidden',
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
        flexGrow: 1,
        borderRadius: 12,
        padding: 10,
        minHeight: 0,
        overflow: 'hidden',
        scrollbarWidth: 'none',
        '&::-webkit-scrollbar': {
            display: 'none',
        },
        display: 'flex',
        flexDirection: 'column',
        gap: theme.spacing(1.5),
    },
    noResultBox: {
        width: 540,
        height: 180,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 16,
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
        columnGap: 16,
    },
    searchWrapperSingle: {
        display: 'flex',
        justifyContent: 'space-between',
        columnGap: 16,
        padding: 0,
    },
    textField: {
        flex: 1,
    },
    confirmButton: {
        width: '100%',
        backgroundColor: theme.palette.mode === 'dark' ? '#fff' : '#000',
        color: theme.palette.mode === 'dark' ? '#000' : '#fff',
    },
    tokenSelector: {
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: theme.spacing(1),
        width: '100%',
        flexGrow: 1,
        minHeight: 0,
        overflowY: 'auto',
        borderRadius: 12,
        padding: theme.spacing(1.5),
        boxSizing: 'border-box',
        '&::-webkit-scrollbar': {
            display: 'none',
        },
        scrollbarWidth: 'none',
    },
    selectWrapper: {
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        borderRadius: 8,
        padding: 0,
        marginBottom: theme.spacing(1),
        background: theme.palette.background.paper,
        height: 150,
        overflow: 'hidden',
    },
    selectWrapperNftNameWrapper: {
        width: '100%',
        background: theme.palette.background.paper,
        borderBottomRightRadius: 8,
        borderBottomLeftRadius: 8,
        overflow: 'hidden',
    },
    selectWrapperNftName: {
        position: 'absolute',
        bottom: 0,
        marginLeft: 8,
        minHeight: 30,
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
    fallbackImage: {
        minHeight: '0 !important',
        maxWidth: 'none',
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
        gap: theme.spacing(0.5),
        alignItems: 'center',
    },
    questionMarkIcon: {
        padding: 2,
        width: 12,
        border: `1px solid ${theme.palette.mode === 'light' ? '#0F1419' : '#D9D9D9'}`,
        borderRadius: 999,
        height: 12,
        marginLeft: 5,
        cursor: 'pointer',
    },
    selectBar: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
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
    },
    arrow: {
        color: theme.palette.mode === 'dark' ? '#fff' : '#111418',
    },
    tooltip: {
        padding: '10px 20px',
        width: 256,
        backgroundColor: theme.palette.mode === 'dark' ? '#fff' : '#111418',
    },
    tooltipText: {
        color: theme.palette.mode === 'dark' ? '#000' : '#fff',
    },
    imageWrapper: {
        height: 120,
        width: '100%',
        overflow: 'hidden',
    },
}))

export function SelectNft() {
    const { t } = useLingui()
    const navigate = useNavigate()
    // TODO Keep the original names before figuring out the logic and refactoring the code
    const {
        selectedNfts: existTokenDetailedList,
        setSelectedNfts: setExistTokenDetailedList,
        collection,
    } = useRedPacket()
    const theme = useTheme()
    const { account, chainId } = useChainContext<NetworkPluginID.PLUGIN_EVM>()
    const [searchedTokenDetailedList, setSearchedTokenDetailedList] = useState<OrderedERC721Token[]>()
    const [searched, setSearched] = useState(false)
    const [tokenDetailedSelectedList, setTokenDetailedSelectedList] = useState(existTokenDetailedList)
    const [loadingToken, setLoadingToken] = useState(false)
    const [searchTokenListInput, setSearchTokenListInput] = useState('')
    const [tokenIdListInput, setTokenIdListInput] = useState<string>('')
    const [tokenIdFilterList, setTokenIdFilterList] = useState<string[]>(EMPTY_LIST)
    const { data: tokenDetailedOwnerList } = useMyCollectionNfts()
    const isSelectSharesExceed =
        (tokenDetailedOwnerList.length === 0 ? NFT_RED_PACKET_MAX_SHARES - 1 : NFT_RED_PACKET_MAX_SHARES) <
        tokenDetailedSelectedList.length
    const { classes, cx } = useStyles({ isSelectSharesExceed })
    const [selectAll, setSelectAll] = useState(false)
    const selectAllHandler = useCallback(() => {
        setTokenDetailedSelectedList(selectAll ? [] : tokenDetailedOwnerList)
        setSelectAll(!selectAll)
    }, [selectAll, tokenDetailedOwnerList])

    useRenderPhraseCallbackOnDepsChange(() => {
        setSearchTokenListInput('')
        setTokenDetailedSelectedList(existTokenDetailedList)
        setSearched(false)
    }, [collection])

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
                        const nextTokenIndex: number = (nextToken.index ?? 0) + 1
                        nextToken = tokenDetailedSelectedListSorted.find((v) => (v.index ?? 0) === nextTokenIndex)
                    }
                    setTokenDetailedSelectedList(
                        tokenDetailedSelectedList.filter((v) => !unselectedTokenIdList.includes(v.tokenId)),
                    )
                } else {
                    const lastSelectedToken = tokenDetailedSelectedListSorted.filter((v) => (v.index ?? 0) < index)[0]

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
        if (!/^(\s?(\w+)?\s?,?\uFF0C?)+$/u.test(searchTokenListInput)) return
        const tokenIdList = uniq(searchTokenListInput.split(/,|\uFF0C/u).map((v) => v.trim()))
        setLoadingToken(true)
        const allSettled = await Promise.allSettled(
            tokenIdList.map((tokenId) =>
                EVMWeb3.getNonFungibleToken(collection?.address ?? '', tokenId, SchemaType.ERC721, {
                    account,
                    chainId,
                }),
            ),
        )

        const searchedTokenDetailedList = allSettled
            .map((x) => (x.status === 'fulfilled' ? x.value : null))
            .filter(Boolean)
            .map((x, i) => ({ ...x, index: i })) as OrderedERC721Token[]
        setSearchedTokenDetailedList(searchedTokenDetailedList)
        setSearched(true)
        setLoadingToken(false)
    }, [collection, searchTokenListInput, chainId, account])
    // #endregion

    const onFilter = useCallback(() => {
        if (!/^(\s?(\w+)?\s?,?\uFF0C?)+$/u.test(tokenIdListInput)) return
        const list = uniq(tokenIdListInput.split(/,|\uFF0C/u).map((v) => v.trim()))
        setTokenIdFilterList(list)
    }, [tokenIdListInput])

    const onSubmit = useCallback(() => {
        setExistTokenDetailedList(tokenDetailedSelectedList)
        navigate(-1)
    }, [tokenDetailedSelectedList, setExistTokenDetailedList])

    if (tokenDetailedOwnerList.length === 0)
        return (
            <DialogContent className={classes.dialogContent}>
                <Box className={classes.tokenBox}>
                    <div className={classes.searchWrapperSingle}>
                        <InputBase
                            startAdornment={<Icons.Search className={classes.iconButton} />}
                            value={searchTokenListInput}
                            placeholder="Input Token ID"
                            className={classes.textField}
                            onChange={(e) => {
                                setSearchTokenListInput(e.target.value)
                                setSearched(false)
                            }}
                        />

                        <Button disabled={!searchTokenListInput} className={classes.searchButton} onClick={onSearch}>
                            <Trans>Search</Trans>
                        </Button>
                    </div>
                    {loadingToken || !searchedTokenDetailedList || !collection ?
                        <Box className={classes.noResultBox}>
                            <Typography>
                                {loadingToken ?
                                    <Trans>Loading token...</Trans>
                                : searched ?
                                    <Trans>No results</Trans>
                                :   null}
                            </Typography>
                        </Box>
                    :   <div className={classes.tokenSelector}>
                            {searchedTokenDetailedList.map((token, i) => {
                                const findToken = tokenDetailedSelectedList.find((t) => t.tokenId === token.tokenId)
                                return (
                                    <div key={i}>
                                        <NFTCard
                                            findToken={findToken}
                                            token={token}
                                            selectToken={selectToken}
                                            isSelectSharesExceed={isSelectSharesExceed}
                                        />
                                    </div>
                                )
                            })}
                        </div>
                    }
                </Box>
                <div className={classes.selectSharesExceedBox}>
                    <Typography className={classes.selectSharesExceed}>
                        {isSelectSharesExceed ?
                            <Trans>
                                The NFT lucky drop supports up to {NFT_RED_PACKET_MAX_SHARES} NFTs selected for one
                                time.
                            </Trans>
                        :   null}
                    </Typography>
                    <Box className={classes.selectAmountBox}>
                        <Typography>
                            <Trans>
                                <span className={classes.selectedTokenAmount}>{tokenDetailedSelectedList.length}</span>{' '}
                                <Plural value={tokenDetailedSelectedList.length} one="NFT" other="NFTs" />
                            </Trans>
                        </Typography>
                        <ShadowRootTooltip
                            title={
                                <Typography className={classes.tooltipText}>
                                    {tokenDetailedSelectedList.length > NFT_RED_PACKET_MAX_SHARES ?
                                        <Trans>
                                            The NFT lucky drop supports up to {NFT_RED_PACKET_MAX_SHARES} NFTs selected
                                            for one time.
                                        </Trans>
                                    :   <Trans>
                                            The maximum number of NFTs to be sold in NFT lucky drop contract is{' '}
                                            {NFT_RED_PACKET_MAX_SHARES}.
                                        </Trans>
                                    }
                                </Typography>
                            }
                            placement="top-end"
                            classes={{ tooltip: classes.tooltip, arrow: classes.arrow }}
                            arrow>
                            <QuestionMarkIcon className={classes.questionMarkIcon} />
                        </ShadowRootTooltip>
                    </Box>
                </div>
                <Button
                    disabled={loadingToken || isSelectSharesExceed}
                    className={classes.confirmButton}
                    onClick={onSubmit}>
                    <Trans>Confirm</Trans>
                </Button>
            </DialogContent>
        )

    return (
        <DialogContent className={cx(classes.dialogContent, classes.dialogContentFixedHeight)}>
            <div className={classes.searchWrapper}>
                <InputBase
                    startAdornment={<Icons.Search className={classes.iconButton} />}
                    value={tokenDetailedOwnerList.length === 0 ? searchTokenListInput : tokenIdListInput}
                    placeholder={t`Token ID separated by comma, e.g. 1224, 7873, 8948`}
                    className={classes.textField}
                    onChange={(e) => {
                        if (tokenDetailedOwnerList.length === 0) {
                            setSearchTokenListInput(e.target.value)
                            setSearched(false)
                        } else {
                            setTokenIdListInput(e.target.value)
                            setTokenIdFilterList(EMPTY_LIST)
                        }
                    }}
                />

                <Button
                    disabled={tokenDetailedOwnerList.length === 0 ? !searchTokenListInput : !tokenIdListInput}
                    className={classes.searchButton}
                    onClick={tokenDetailedOwnerList.length === 0 ? onSearch : onFilter}>
                    <Trans>Search</Trans>
                </Button>
            </div>
            <Box className={classes.ownerTokenBox}>
                {loadingToken && searched ?
                    <Box className={classes.noResultBox}>
                        <Typography>
                            {loadingToken ?
                                <Trans>Loading token...</Trans>
                            :   <Trans>No results</Trans>}
                        </Typography>
                    </Box>
                :   <>
                        {tokenIdFilterList.length === 0 ?
                            <div className={classes.selectBar}>
                                <div className={classes.selectAll}>
                                    <div
                                        className={cx(classes.selectAllCheckBox, selectAll ? classes.checked : '')}
                                        onClick={selectAllHandler}>
                                        {selectAll ?
                                            <CheckIcon className={classes.checkIcon} />
                                        :   null}
                                    </div>
                                    <Typography className={cx(classes.selectAllCheckBoxText)}>
                                        <Trans>Select All</Trans>
                                    </Typography>
                                </div>
                                <Typography>
                                    <Trans>
                                        You can also use{' '}
                                        <span style={{ color: theme.palette.maskColor.primary }}>Shift</span> to select
                                        multiple NFTs.
                                    </Trans>
                                </Typography>
                            </div>
                        :   null}

                        <div className={classes.tokenSelector}>
                            {tokenDetailedOwnerList.map((token) => {
                                const findToken = tokenDetailedSelectedList.find((t) => t.tokenId === token.tokenId)
                                if (tokenIdFilterList.length > 0 && !tokenIdFilterList.includes(token.tokenId))
                                    return null
                                return (
                                    <NFTCard
                                        key={token.tokenId}
                                        findToken={findToken}
                                        token={token}
                                        selectToken={selectToken}
                                        isSelectSharesExceed={isSelectSharesExceed}
                                    />
                                )
                            })}
                        </div>
                    </>
                }
            </Box>
            <div className={classes.selectSharesExceedBox}>
                <Typography className={classes.selectSharesExceed}>
                    {isSelectSharesExceed ?
                        <Trans>
                            The NFT lucky drop supports up to {NFT_RED_PACKET_MAX_SHARES} NFTs selected for one time.
                        </Trans>
                    :   null}
                </Typography>

                <Box className={classes.selectAmountBox}>
                    <Typography>
                        <span className={classes.selectedTokenAmount}>{tokenDetailedSelectedList.length + ' '}</span>/
                        <span className={classes.totalAmount}>{tokenDetailedOwnerList.length}</span>
                    </Typography>
                    <LoadingBase size={18} />
                    <ShadowRootTooltip
                        title={
                            <Typography className={classes.tooltipText}>
                                {tokenDetailedSelectedList.length > NFT_RED_PACKET_MAX_SHARES ?
                                    <Trans>
                                        The NFT lucky drop supports up to {NFT_RED_PACKET_MAX_SHARES} NFTs selected for
                                        one time.
                                    </Trans>
                                :   <Trans>
                                        The maximum number of NFTs to be sold in NFT lucky drop contract is{' '}
                                        {NFT_RED_PACKET_MAX_SHARES}.
                                    </Trans>
                                }
                            </Typography>
                        }
                        placement="top-end"
                        classes={{ tooltip: classes.tooltip, arrow: classes.arrow }}
                        arrow>
                        <QuestionMarkIcon className={classes.questionMarkIcon} />
                    </ShadowRootTooltip>
                </Box>
            </div>
            <Button
                disabled={loadingToken || tokenDetailedSelectedList.length === 0 || isSelectSharesExceed}
                className={classes.confirmButton}
                onClick={onSubmit}>
                <Trans>Confirm</Trans>
            </Button>
        </DialogContent>
    )
}

interface NFTCardProps {
    findToken: OrderedERC721Token | undefined
    token: OrderedERC721Token
    isSelectSharesExceed: boolean
    selectToken: (
        token: OrderedERC721Token,
        findToken: OrderedERC721Token | undefined,
        shiftKey: boolean,
        index: number,
    ) => void
}

function NFTCard(props: NFTCardProps) {
    const { findToken, token, isSelectSharesExceed, selectToken } = props
    const { classes, cx } = useStyles({ isSelectSharesExceed })
    return (
        <ListItem className={classes.selectWrapper}>
            <div className={classes.imageWrapper}>
                <AssetPreviewer
                    url={token.metadata?.mediaURL || token.metadata?.imageURL}
                    classes={{
                        fallbackImage: classes.fallbackImage,
                    }}
                />
            </div>
            <div className={classes.selectWrapperNftNameWrapper}>
                <Typography className={classes.selectWrapperNftName} color="textSecondary">
                    {formatTokenId(token.tokenId, 2)}
                </Typography>
            </div>

            <div
                className={cx(classes.checkbox, findToken ? classes.checked : '')}
                onClick={(event) => selectToken(token, findToken, event.shiftKey, token.index)}>
                {findToken ?
                    <CheckIcon className={classes.checkIcon} />
                :   null}
            </div>
        </ListItem>
    )
}
