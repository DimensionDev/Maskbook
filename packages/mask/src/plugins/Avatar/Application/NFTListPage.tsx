import { Icons } from '@masknet/icons'
import { ElementAnchor, RetryHint } from '@masknet/shared'
import { LoadingBase, makeStyles } from '@masknet/theme'
import { NetworkPluginID } from '@masknet/shared-base'
import { Box, List, ListItem, Stack, Typography } from '@mui/material'
import { useEffect, useState } from 'react'
import { supportPluginIds } from '../constants.js'
import { useI18N } from '../locales/index.js'
import { NFTImage } from '../SNSAdaptor/NFTImage.js'
import type { AllChainsNonFungibleToken } from '../types.js'

const useStyles = makeStyles<{
    networkPluginID: NetworkPluginID
}>()((theme, props) => ({
    root: {
        paddingTop: props.networkPluginID === NetworkPluginID.PLUGIN_EVM ? 60 : 16,
        width: '100%',
    },
    list: {
        gridGap: '12px 17px',
        display: 'grid',
        gridTemplateColumns: 'repeat(5, 1fr)',
        padding: '8px 16px 50px',
    },

    nftItem: {
        cursor: 'pointer',
        display: 'flex',
        padding: 0,
        flexDirection: 'column',
        minHeight: 100,
        userSelect: 'none',
        justifyContent: 'center',
    },
    placeholder: {
        display: 'flex',
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column',
        rowGap: 14,
    },
    placeholderText: {
        fontSize: 14,
        lineHeight: '18px',
        color: theme.palette.maskColor.second,
    },
}))

interface NFTListPageProps {
    pluginID: NetworkPluginID
    tokenInfo?: AllChainsNonFungibleToken
    tokens: AllChainsNonFungibleToken[]
    children?: React.ReactElement
    loadFinish: boolean
    loadError?: boolean
    nextPage(): void
    onChange?: (token: AllChainsNonFungibleToken) => void
}

export function NFTListPage(props: NFTListPageProps) {
    const { onChange, tokenInfo, tokens, children, pluginID: pluginId, nextPage, loadError, loadFinish } = props
    const { classes } = useStyles({ networkPluginID: pluginId })
    const [selectedToken, setSelectedToken] = useState<AllChainsNonFungibleToken | undefined>(tokenInfo)
    const t = useI18N()

    const _onChange = (token: AllChainsNonFungibleToken) => {
        if (!token) return
        setSelectedToken(token)
        onChange?.(token)
    }

    useEffect(() => setSelectedToken(tokenInfo), [tokenInfo])

    if (!supportPluginIds.includes(pluginId)) {
        return (
            <Box className={classes.placeholder}>
                <Icons.EmptySimple variant="light" size={36} />
                <Typography className={classes.placeholderText}>{t.unsupported_network()}</Typography>
            </Box>
        )
    }
    if (!loadError && !loadFinish && !tokens.length)
        return (
            <Box className={classes.placeholder}>
                <LoadingBase size={36} />
                <Typography className={classes.placeholderText}>{t.loading()}</Typography>
            </Box>
        )

    // return empty list prompt when there is no nft in wallet
    if (children) return <>{children}</>

    return (
        <Box className={classes.root}>
            <List className={classes.list}>
                {tokens.map((token: AllChainsNonFungibleToken, i) => (
                    <ListItem key={i} className={classes.nftItem}>
                        <NFTImage
                            key={i}
                            pluginID={pluginId}
                            showBadge
                            token={token}
                            selectedToken={selectedToken}
                            onClick={(token) => _onChange(token)}
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
