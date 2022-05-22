import { useCallback, useState } from 'react'
import { uniqBy } from 'lodash-unified'
import { WalletMessages } from '@masknet/plugin-wallet'
import { useRemoteControlledDialog } from '@masknet/shared-base-ui'
import { makeStyles, useStylesExtends } from '@masknet/theme'
import type { ChainId, SchemaType } from '@masknet/web3-shared-evm'
import { Box, Button, Skeleton, Typography } from '@mui/material'
import { useI18N } from '../../../utils'
import { AddNFT } from './AddNFT'
import { NFTImage } from './NFTImage'
import { useAccount, useChainId, useImageChecker } from '@masknet/plugin-infra/web3'
import { ReversedAddress } from '@masknet/shared'
import { NetworkPluginID, NonFungibleToken } from '@masknet/web3-shared-base'
import { ChainBoundary } from '../../../web3/UI/ChainBoundary'
import { useCollectibles } from '../hooks/useCollectibles'

const useStyles = makeStyles()((theme) => ({
    root: {},
    title: {
        padding: 0,
        display: 'flex',
        justifyContent: 'space-between',
        fontSize: 14,
        alignItems: 'center',
    },
    account: {
        display: 'flex',
        alignItems: 'center',
    },
    galleryItem: {
        border: `1px solid ${theme.palette.divider}`,
        borderRadius: 4,
        padding: theme.spacing(1),
    },
    gallery: {
        display: 'flex',
        flexFlow: 'row wrap',
        height: 150,
        overflowY: 'auto',
        '&::-webkit-scrollbar': {
            display: 'none',
        },
    },
    button: {
        textAlign: 'center',
        paddingTop: theme.spacing(1),
        display: 'flex',
        justifyContent: 'space-around',
        flexDirection: 'row',
    },
    setNFTAvatar: {},
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
    changeButton: {
        fontSize: 14,
    },
    buttons: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'row',
        marginTop: theme.spacing(1),
        gap: 16,
    },
}))

export interface NFTAvatarProps extends withClasses<'root'> {
    onChange: (token: NonFungibleToken<ChainId, SchemaType>) => void
    hideWallet?: boolean
}

export function NFTAvatar(props: NFTAvatarProps) {
    const { onChange, hideWallet } = props
    const classes = useStylesExtends(useStyles(), props)
    const account = useAccount(NetworkPluginID.PLUGIN_EVM)
    const chainId = useChainId(NetworkPluginID.PLUGIN_EVM)
    const [selectedToken, setSelectedToken] = useState<NonFungibleToken<ChainId, SchemaType> | undefined>()
    const [open_, setOpen_] = useState(false)
    const [collectibles_, setCollectibles_] = useState<NonFungibleToken<ChainId, SchemaType>[]>([])
    const { t } = useI18N()
    const { collectibles, error, retry, loading } = useCollectibles()

    const onClick = useCallback(async () => {
        if (!selectedToken) return
        onChange(selectedToken)
        setSelectedToken(undefined)
    }, [onChange, selectedToken])

    const onAddClick = useCallback((token: NonFungibleToken<ChainId, SchemaType>) => {
        setSelectedToken(token)
        setCollectibles_((tokens) => uniqBy([token, ...tokens], (x) => x.contract?.address && x.tokenId))
    }, [])

    const { openDialog: openSelectProviderDialog } = useRemoteControlledDialog(
        WalletMessages.events.selectProviderDialogUpdated,
    )

    const LoadStatus = Array.from({ length: 8 })
        .fill(0)
        .map((_, i) => (
            <div key={i} className={classes.skeletonBox}>
                <Skeleton animation="wave" variant="rectangular" className={classes.skeleton} />
            </div>
        ))
    const Retry = (
        <Box className={classes.error}>
            <Typography color="textSecondary">{t('dashboard_no_collectible_found')}</Typography>
            <Button className={classes.button} variant="text" onClick={retry}>
                {t('plugin_collectible_retry')}
            </Button>
        </Box>
    )
    return (
        <>
            <Box className={classes.root}>
                <Box className={classes.title}>
                    <Typography variant="body1" color="textPrimary">
                        {t('nft_list_title')}
                    </Typography>
                    {account ? (
                        <Typography variant="body1" color="textPrimary" className={classes.account}>
                            {t('nft_wallet_label')}: <ReversedAddress address={account} size={4} />
                            {!hideWallet ? (
                                <Button
                                    variant="text"
                                    onClick={openSelectProviderDialog}
                                    size="small"
                                    className={classes.changeButton}>
                                    {t('nft_wallet_change')}
                                </Button>
                            ) : null}
                        </Typography>
                    ) : null}
                </Box>
                <ChainBoundary expectedPluginID={NetworkPluginID.PLUGIN_EVM} expectedChainId={chainId}>
                    <Box className={classes.galleryItem}>
                        <Box className={classes.gallery}>
                            {loading && !collectibles?.length
                                ? LoadStatus
                                : error || (!collectibles?.length && !collectibles_.length)
                                ? Retry
                                : uniqBy(
                                      [...collectibles_, ...(collectibles ?? [])],
                                      (x) => x.contract?.address && x.tokenId,
                                  ).map((token: NonFungibleToken<ChainId, SchemaType>, i) => (
                                      <NFTImageCollectibleAvatar
                                          key={i}
                                          token={token}
                                          selectedToken={selectedToken}
                                          setSelectedToken={setSelectedToken}
                                      />
                                  ))}
                        </Box>
                        <Box className={classes.buttons}>
                            <Button variant="outlined" size="small" onClick={() => setOpen_(true)}>
                                {t('nft_button_add_collectible')}
                            </Button>

                            <Button variant="contained" size="small" onClick={onClick} disabled={!selectedToken}>
                                {t('nft_button_set_avatar')}
                            </Button>
                        </Box>
                    </Box>
                </ChainBoundary>
            </Box>
            <AddNFT open={open_} onClose={() => setOpen_(false)} onAddClick={onAddClick} />
        </>
    )
}
interface NFTImageCollectibleAvatarProps {
    token: NonFungibleToken<ChainId, SchemaType>
    setSelectedToken: React.Dispatch<React.SetStateAction<NonFungibleToken<ChainId, SchemaType> | undefined>>
    selectedToken?: NonFungibleToken<ChainId, SchemaType>
}

function NFTImageCollectibleAvatar({ token, setSelectedToken, selectedToken }: NFTImageCollectibleAvatarProps) {
    const { classes } = useStyles()
    const { value: isImageToken, loading } = useImageChecker(token.metadata?.imageURL)
    if (loading)
        return (
            <div className={classes.skeletonBox}>
                <Skeleton animation="wave" variant="rectangular" className={classes.skeleton} />
            </div>
        )
    return isImageToken ? <NFTImage token={token} selectedToken={selectedToken} onChange={setSelectedToken} /> : null
}
