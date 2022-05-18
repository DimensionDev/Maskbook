import { useImageChecker } from '@masknet/plugin-infra/web3'
import { makeStyles } from '@masknet/theme'
import type { NonFungibleToken } from '@masknet/web3-shared-base'
import { ChainId, createERC721Token, SchemaType } from '@masknet/web3-shared-evm'
import { Box, Skeleton } from '@mui/material'
import { useState } from 'react'
import { NFTImage } from '../SNSAdaptor/NFTImage'
import type { TokenInfo } from '../types'

const useStyles = makeStyles()((theme) => ({
    root: {},

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
}))

interface NFTListPageProps {
    chainId: ChainId
    address: string
    tokenInfo?: TokenInfo
    tokens: NonFungibleToken<ChainId, SchemaType>[]
    onSelect?: (token: NonFungibleToken<ChainId, SchemaType>) => void
    children?: React.ReactElement
}

export function NFTListPage(props: NFTListPageProps) {
    const { classes } = useStyles()
    const { onSelect, chainId, tokenInfo, tokens, children } = props
    const [selectedToken, setSelectedToken] = useState<NonFungibleToken<ChainId, SchemaType> | undefined>(
        tokenInfo
            ? createERC721Token(
                  chainId,
                  tokenInfo.address,
                  tokenInfo.tokenId,
                  {
                      chainId,
                      name: '',
                      symbol: '',
                  },
                  {},
                  tokenInfo.tokenId,
              )
            : undefined,
    )

    const onChange = (token: NonFungibleToken<ChainId, SchemaType>) => {
        if (!token) return
        setSelectedToken(token)
        onSelect?.(token)
    }

    return (
        <>
            <Box className={classes.root}>
                <Box className={classes.gallery}>
                    {children ??
                        tokens.map((token: NonFungibleToken<ChainId, SchemaType>, i) => (
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

interface NFTImageCollectibleAvatarProps {
    token: NonFungibleToken<ChainId, SchemaType>
    onChange: (token: NonFungibleToken<ChainId, SchemaType>) => void
    selectedToken?: NonFungibleToken<ChainId, SchemaType>
}

function NFTImageCollectibleAvatar({ token, onChange, selectedToken }: NFTImageCollectibleAvatarProps) {
    const { classes } = useStyles()
    const { value: isImageToken, loading } = useImageChecker(token.metadata?.imageURL)

    if (loading)
        return (
            <div className={classes.skeletonBox}>
                <Skeleton animation="wave" variant="rectangular" className={classes.skeleton} />
            </div>
        )
    return isImageToken ? <NFTImage showBadge token={token} selectedToken={selectedToken} onChange={onChange} /> : null
}
