import { ElementAnchor, RetryHint, useImageChecker } from '@masknet/shared'
import { LoadingBase, makeStyles } from '@masknet/theme'
import { NetworkPluginID } from '@masknet/web3-shared-base'
import { Box, List, ListItem, Skeleton, Stack, useTheme } from '@mui/material'
import { range } from 'lodash-unified'
import { useState } from 'react'
import { NFTImage } from '../SNSAdaptor/NFTImage'
import type { AllChainsNonFungibleToken } from '../types'

const useStyles = makeStyles<{ networkPluginID: NetworkPluginID }>()((theme, props) => ({
    root: {
        paddingTop: props.networkPluginID === NetworkPluginID.PLUGIN_EVM ? 60 : 16,
    },

    button: {
        textAlign: 'center',
        paddingTop: theme.spacing(1),
        display: 'flex',
        justifyContent: 'space-around',
        flexDirection: 'row',
        color: '#1D9BF0',
    },
    list: {
        gridGap: 13,
        display: 'grid',
        gridTemplateColumns: 'repeat(5, 1fr)',
        padding: '0 16px 50px 16px',
    },

    nftItem: {
        position: 'relative',
        cursor: 'pointer',
        display: 'flex',
        overflow: 'hidden',
        padding: 0,
        flexDirection: 'column',
        borderRadius: 12,
        userSelect: 'none',
        justifyContent: 'center',
        lineHeight: 0,
    },
    skeleton: {
        width: 100,
        height: 100,
        objectFit: 'cover',
        boxSizing: 'border-box',
    },
    skeletonBox: {
        marginLeft: 'auto',
        marginRight: 'auto',
    },
    image: {
        width: 100,
        height: 100,
        objectFit: 'cover',
        boxSizing: 'border-box',
        '&:hover': {
            border: `1px solid ${theme.palette.primary.main}`,
        },
        borderRadius: 12,
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
    const { onChange, tokenInfo, tokens, children, pluginId, nextPage, loadError, loadFinish } = props
    const { classes } = useStyles({ networkPluginID: pluginId })
    const [selectedToken, setSelectedToken] = useState<AllChainsNonFungibleToken | undefined>(tokenInfo)

    const _onChange = (token: AllChainsNonFungibleToken) => {
        if (!token) return
        setSelectedToken(token)
        onChange?.(token)
    }

    if (!loadError && !loadFinish && !tokens.length)
        return (
            <Box className={classes.root}>
                <List className={classes.list}>
                    {range(8).map((i) => (
                        <ListItem key={i} className={classes.nftItem}>
                            <Skeleton key={i} animation="wave" variant="rectangular" className={classes.skeleton} />
                        </ListItem>
                    ))}
                </List>
            </Box>
        )
    if (children) return <>{children}</>
    return (
        <Box className={classes.root}>
            <List className={classes.list}>
                {children ??
                    tokens.map((token: AllChainsNonFungibleToken, i) => (
                        <ListItem key={i} className={classes.nftItem}>
                            <NFTImageCollectibleAvatar
                                pluginId={pluginId}
                                key={i}
                                token={token}
                                selectedToken={selectedToken}
                                onChange={(token) => _onChange(token)}
                            />
                        </ListItem>
                    ))}
            </List>
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
    const { classes } = useStyles({ networkPluginID: pluginId })
    const { value: isImageToken, loading } = useImageChecker(token.metadata?.imageURL)
    const theme = useTheme()

    const assetPlayerFallbackImageDark = new URL('../assets/nft_token_fallback_dark.png', import.meta.url)
    const assetPlayerFallbackImageLight = new URL('../assets/nft_token_fallback.png', import.meta.url)

    if (loading)
        return (
            <div className={classes.skeletonBox}>
                <Skeleton animation="wave" variant="rectangular" className={classes.skeleton} />
            </div>
        )

    return isImageToken ? (
        <NFTImage pluginId={pluginId} showBadge token={token} selectedToken={selectedToken} onChange={onChange} />
    ) : (
        <img
            className={classes.image}
            src={
                theme.palette.mode === 'dark'
                    ? assetPlayerFallbackImageDark.toString()
                    : assetPlayerFallbackImageLight.toString()
            }
        />
    )
}
