import { ElementAnchor, RetryHint, useImageChecker } from '@masknet/shared'
import { LoadingBase, makeStyles } from '@masknet/theme'
import type { NetworkPluginID } from '@masknet/web3-shared-base'
import { Box, Skeleton, Stack } from '@mui/material'
import { useState } from 'react'
import { NFTImage } from '../SNSAdaptor/NFTImage'
import type { AllChainsNonFungibleToken } from '../types'

const useStyles = makeStyles()((theme) => ({
    root: {
        paddingTop: 60,
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

        '::-webkit-scrollbar': {
            backgroundColor: 'transparent',
            width: 20,
        },
        '::-webkit-scrollbar-thumb': {
            borderRadius: '20px',
            width: 5,
            border: '7px solid rgba(0, 0, 0, 0)',
            backgroundColor: theme.palette.mode === 'dark' ? 'rgba(250, 250, 250, 0.2)' : 'rgba(0, 0, 0, 0.2)',
            backgroundClip: 'padding-box',
        },
    },
    skeleton: {
        width: 97,
        height: 97,
        objectFit: 'cover',
        borderRadius: '100%',
        boxSizing: 'border-box',
        padding: 4,
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
    nextPage(): void
    loadFinish: boolean
    loadError?: boolean
}

export function NFTListPage(props: NFTListPageProps) {
    const { classes } = useStyles()
    const { onChange, tokenInfo, tokens, children, pluginId, nextPage, loadError, loadFinish } = props
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
                {loadError && !loadFinish && tokens.length && (
                    <Stack py={1} style={{ gridColumnStart: 1, gridColumnEnd: 6 }}>
                        <RetryHint hint={false} retry={nextPage} />
                    </Stack>
                )}
                <ElementAnchor
                    callback={() => {
                        if (nextPage) nextPage()
                    }}>
                    {!loadFinish && tokens.length !== 0 && <LoadingBase />}
                </ElementAnchor>
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

export function NFTImageCollectibleAvatar({
    token,
    onChange,
    selectedToken,
    pluginId,
}: NFTImageCollectibleAvatarProps) {
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
