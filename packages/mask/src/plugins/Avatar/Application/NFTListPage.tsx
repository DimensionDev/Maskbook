import { makeStyles } from '@masknet/theme'
import {
    ChainId,
    createERC721Token,
    ERC721TokenDetailed,
    EthereumTokenType,
    useImageChecker,
} from '@masknet/web3-shared-evm'
import { Box, Skeleton } from '@mui/material'
import { useState } from 'react'
import { useI18N } from '../locales'
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

    button: {
        textAlign: 'center',
        paddingTop: theme.spacing(1),
        display: 'flex',
        justifyContent: 'space-around',
        flexDirection: 'row',
        color: '#1D9BF0',
    },
    gallery: {
        display: 'flex',
        flexFlow: 'row wrap',
        overflowY: 'auto',
        '&::-webkit-scrollbar': {
            display: 'none',
        },
    },
}))

interface NFTListPageProps {
    chainId: ChainId.Mainnet | ChainId.Matic
    tokenInfo?: TokenInfo
    tokens: ERC721TokenDetailed[]
    onSelect?: (token: ERC721TokenDetailed) => void
}

export function NFTListPage(props: NFTListPageProps) {
    const { classes } = useStyles()
    const { onSelect, chainId, tokenInfo, tokens } = props
    const t = useI18N()

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

    return (
        <>
            <Box className={classes.root}>
                {tokens.map((token_: ERC721TokenDetailed, i) => (
                    <NFTImageCollectibleAvatar
                        key={i}
                        token={token_}
                        selectedToken={selectedToken}
                        onChange={() => onChange(token_)}
                    />
                ))}
            </Box>
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
