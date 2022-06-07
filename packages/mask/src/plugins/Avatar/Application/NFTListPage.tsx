import { useImageChecker } from '@masknet/plugin-infra/web3'
import { makeStyles } from '@masknet/theme'
import type { NetworkPluginID } from '@masknet/web3-shared-base'
import { Box, Skeleton } from '@mui/material'
import { useState } from 'react'
import { NFTImage } from '../SNSAdaptor/NFTImage'
import type { AllChainsNonFungibleToken } from '../types'

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
    tokenInfo?: AllChainsNonFungibleToken
    tokens: AllChainsNonFungibleToken[]
    onChange?: (token: AllChainsNonFungibleToken) => void
    children?: React.ReactElement
    pluginId: NetworkPluginID
}

export function NFTListPage(props: NFTListPageProps) {
    const { classes } = useStyles()
    const { onChange, tokenInfo, tokens, children, pluginId } = props
    const [selectedToken, setSelectedToken] = useState<AllChainsNonFungibleToken | undefined>(tokenInfo)

    const _onChange = (token: AllChainsNonFungibleToken) => {
        if (!token) return
        setSelectedToken(token)
        onChange?.(token)
    }

    return (
        <>
            <Box className={classes.root}>
                <Box className={classes.gallery}>
                    {children ??
                        tokens.map((token: AllChainsNonFungibleToken, i) => (
                            <NFTImageCollectibleAvatar
                                pluginId={pluginId}
                                key={i}
                                token={token}
                                selectedToken={selectedToken}
                                onChange={(token) => _onChange(token)}
                            />
                        ))}
                </Box>
            </Box>
        </>
    )
}

interface NFTImageCollectibleAvatarProps {
    token: AllChainsNonFungibleToken
    onChange: (token: AllChainsNonFungibleToken) => void
    selectedToken?: AllChainsNonFungibleToken
    pluginId: NetworkPluginID
}

function NFTImageCollectibleAvatar({ token, onChange, selectedToken, pluginId }: NFTImageCollectibleAvatarProps) {
    const { classes } = useStyles()
    const { value: isImageToken, loading } = useImageChecker(token.metadata?.imageURL)

    if (loading)
        return (
            <div className={classes.skeletonBox}>
                <Skeleton animation="wave" variant="rectangular" className={classes.skeleton} />
            </div>
        )
    return isImageToken ? (
        <NFTImage pluginId={pluginId} showBadge token={token} selectedToken={selectedToken} onChange={onChange} />
    ) : null
}
