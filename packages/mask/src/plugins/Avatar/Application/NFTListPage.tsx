import { makeStyles } from '@masknet/theme'
import {
    ChainId,
    createERC721Token,
    ERC721TokenDetailed,
    EthereumTokenType,
    SocketState,
    useCollectibles,
    useImageChecker,
} from '@masknet/web3-shared-evm'
import { Box, Button, Skeleton, Typography } from '@mui/material'
import { uniqBy } from 'lodash-unified'
import { useCallback, useState } from 'react'
import { useI18N } from '../locales'
import { AddNFT } from '../SNSAdaptor/AddNFT'
import { NFTImage } from '../SNSAdaptor/NFTImage'
import type { TokenInfo } from '../types'

const useStyles = makeStyles()((theme) => ({
    root: {},
    skeleton: {
        width: 97,
        height: 97,
        objectFit: 'cover',
        borderRadius: '100%',
        boxSizing: 'border-box',
        padding: 6,
        margin: theme.spacing(0.5, 1),
    },
    skeletonBox: {
        marginLeft: 'auto',
        marginRight: 'auto',
    },
    error: {
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        margin: 'auto',
    },
    button: {
        textAlign: 'center',
        paddingTop: theme.spacing(1),
        display: 'flex',
        justifyContent: 'space-around',
        flexDirection: 'row',
    },
    gallery: {
        display: 'flex',
        flexFlow: 'row wrap',
        overflowY: 'auto',
        '&::-webkit-scrollbar': {
            display: 'none',
        },
        justifyContent: 'space-between',
    },
}))

interface NFTListPageProps {
    chainId: ChainId
    address: string
    tokenInfo?: TokenInfo
    tokens: ERC721TokenDetailed[]
    onSelect?: (token: ERC721TokenDetailed) => void
}

export function NFTListPage(props: NFTListPageProps) {
    const { classes } = useStyles()
    const { address, onSelect, chainId, tokenInfo } = props
    const t = useI18N()
    const { data: collectibles, error, retry, state } = useCollectibles(address, chainId)
    const [selectedToken, setSelectedToken] = useState<ERC721TokenDetailed | undefined>(
        tokenInfo
            ? createERC721Token(
                  {
                      name: '',
                      address: tokenInfo.address,
                      chainId,
                      symbol: '',
                      type: EthereumTokenType.ERC721,
                  },
                  {},
                  tokenInfo.tokenId,
              )
            : undefined,
    )

    const onChange = (token: ERC721TokenDetailed) => {
        if (!token) return
        setSelectedToken(token)
        onSelect?.(token)
    }

    const LoadStatus = Array.from({ length: 8 })
        .fill(0)
        .map((_, i) => (
            <div key={i} className={classes.skeletonBox}>
                <Skeleton animation="wave" variant="rectangular" className={classes.skeleton} />
            </div>
        ))
    const Retry = (
        <Box className={classes.error}>
            <Typography color="textSecondary">{t.no_collectible_found()}</Typography>
            <Button className={classes.button} variant="text" onClick={retry}>
                {t.retry()}
            </Button>
        </Box>
    )
    return (
        <>
            <Box className={classes.root}>
                <Box className={classes.gallery}>
                    {state !== SocketState.done && collectibles.length === 0
                        ? LoadStatus
                        : error || collectibles.length === 0
                        ? Retry
                        : collectibles.map((token: ERC721TokenDetailed, i) => (
                              <NFTImageCollectibleAvatar
                                  key={i}
                                  token={token}
                                  selectedToken={selectedToken}
                                  onChange={(token) => onChange(token)}
                              />
                          ))}
                </Box>
            </Box>
        </>
    )
}

export function NFTListPagePolygon(props: NFTListPageProps) {
    const { classes } = useStyles()
    const { address, onSelect, chainId, tokenInfo, tokens = [] } = props
    const t = useI18N()
    const [tokens_, setTokens_] = useState<ERC721TokenDetailed[]>(tokens)
    const [open, setOpen] = useState(false)
    const [selectedToken, setSelectedToken] = useState<ERC721TokenDetailed | undefined>(
        tokenInfo
            ? createERC721Token(
                  {
                      name: '',
                      address: tokenInfo.address,
                      chainId,
                      symbol: '',
                      type: EthereumTokenType.ERC721,
                  },
                  {},
                  tokenInfo.tokenId,
              )
            : undefined,
    )

    const onChange = (token: ERC721TokenDetailed) => {
        if (!token) return
        setSelectedToken(token)
        onSelect?.(token)
    }

    const onAddClick = useCallback(
        (token: ERC721TokenDetailed) =>
            setTokens_((tokens) => uniqBy([token, ...tokens], (x) => x.contractDetailed.address && x.tokenId)),
        [tokens_],
    )

    const AddCollectible = (
        <Box className={classes.error}>
            <Typography color="textSecondary">{t.collectible_on_polygon()}</Typography>
            <Button className={classes.button} variant="text" onClick={() => setOpen(true)}>
                {t.add_collectible()}
            </Button>
        </Box>
    )
    return (
        <>
            <Box className={classes.root}>
                <Box className={classes.gallery}>
                    {tokens_.length === 0
                        ? AddCollectible
                        : tokens_.map((token: ERC721TokenDetailed, i) => (
                              <NFTImageCollectibleAvatar
                                  key={i}
                                  token={token}
                                  selectedToken={selectedToken}
                                  onChange={(token) => onChange(token)}
                              />
                          ))}
                </Box>
            </Box>
            <AddNFT title={t.add_collectible()} open={open} onClose={() => setOpen(false)} onAddClick={onAddClick} />
        </>
    )
}

interface NFTImageCollectibleAvatarProps {
    token: ERC721TokenDetailed
    onChange: (token: ERC721TokenDetailed) => void
    selectedToken?: ERC721TokenDetailed
}

function NFTImageCollectibleAvatar({ token, onChange, selectedToken }: NFTImageCollectibleAvatarProps) {
    const { classes } = useStyles()
    const { value: isImageToken, loading } = useImageChecker(token.info?.imageURL)
    if (loading)
        return (
            <div className={classes.skeletonBox}>
                <Skeleton animation="wave" variant="rectangular" className={classes.skeleton} />
            </div>
        )
    return isImageToken ? <NFTImage haveBadge token={token} selectedToken={selectedToken} onChange={onChange} /> : null
}
