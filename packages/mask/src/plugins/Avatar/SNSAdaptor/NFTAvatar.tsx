import { useCallback, useState } from 'react'
import { uniqBy } from 'lodash-unified'
import { WalletMessages } from '@masknet/plugin-wallet'
import { useRemoteControlledDialog, useValueRef } from '@masknet/shared'
import { makeStyles, useStylesExtends } from '@masknet/theme'
import { ChainId } from '@masknet/web3-shared-evm'
import {
    ERC721TokenDetailed,
    formatEthereumAddress,
    useAccount,
    useChainId,
    useCollectibles,
} from '@masknet/web3-shared-evm'
import { Box, Button, Skeleton, TablePagination, Typography } from '@mui/material'
import { currentNonFungibleAssetDataProviderSettings } from '../../../plugins/Wallet/settings'
import { useI18N } from '../../../utils'
import { EthereumChainBoundary } from '../../../web3/UI/EthereumChainBoundary'
import { AddNFT } from './AddNFT'
import { NFTImage } from './NFTImage'

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
    },
}))

export interface NFTAvatarProps extends withClasses<'root'> {
    onChange: (token: ERC721TokenDetailed) => void
}

export function NFTAvatar(props: NFTAvatarProps) {
    const { onChange } = props
    const classes = useStylesExtends(useStyles(), props)
    const account = useAccount()
    const chainId = useChainId()
    const provider = useValueRef(currentNonFungibleAssetDataProviderSettings)
    const [page, setPage] = useState(0)
    const [selectedToken, setSelectedToken] = useState<ERC721TokenDetailed | undefined>()
    const [open_, setOpen_] = useState(false)
    const [collectibles_, setCollectibles_] = useState<ERC721TokenDetailed[]>([])
    const { t } = useI18N()
    const {
        value = {
            collectibles: [],
            hasNextPage: false,
        },
        loading,
        retry,
        error,
    } = useCollectibles(account, ChainId.Mainnet, provider, page, 50)
    const { collectibles, hasNextPage } = value

    const onClick = useCallback(async () => {
        if (!selectedToken) return
        onChange(selectedToken)
        setSelectedToken(undefined)
    }, [onChange, selectedToken])

    const onAddClick = useCallback((token) => {
        setSelectedToken(token)
        setCollectibles_((tokens) => uniqBy([token, ...tokens], (x) => x.contractDetailed.address && x.tokenId))
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
                            {t('nft_wallet_label')}: {formatEthereumAddress(account, 4)}
                            <Button onClick={openSelectProviderDialog} size="small" className={classes.changeButton}>
                                {t('nft_wallet_change')}
                            </Button>
                        </Typography>
                    ) : null}
                </Box>
                <EthereumChainBoundary chainId={chainId}>
                    <Box className={classes.galleryItem}>
                        <Box className={classes.gallery}>
                            {loading
                                ? LoadStatus
                                : error || (collectibles.length === 0 && collectibles_.length === 0)
                                ? Retry
                                : uniqBy(
                                      [...collectibles_, ...collectibles],
                                      (x) => x.contractDetailed.address && x.tokenId,
                                  )
                                      .filter(
                                          (token: ERC721TokenDetailed) =>
                                              token.info.image &&
                                              !token.info.image?.match(/\.(mp4|webm|mov|ogg|mp3|wav)$/i),
                                      )
                                      .map((token: ERC721TokenDetailed, i) => (
                                          <NFTImage
                                              token={token}
                                              key={i}
                                              selectedToken={selectedToken}
                                              onChange={(token) => setSelectedToken(token)}
                                          />
                                      ))}
                        </Box>

                        {hasNextPage || page > 0 ? (
                            <TablePagination
                                count={-1}
                                component="div"
                                onPageChange={() => {}}
                                page={page}
                                rowsPerPage={30}
                                rowsPerPageOptions={[30]}
                                labelDisplayedRows={() => null}
                                backIconButtonProps={{
                                    onClick: () => setPage(page - 1),
                                    size: 'small',
                                    disabled: page === 0,
                                }}
                                nextIconButtonProps={{
                                    onClick: () => setPage(page + 1),
                                    disabled: !hasNextPage,
                                    size: 'small',
                                }}
                            />
                        ) : null}
                        <Box className={classes.buttons}>
                            <Button variant="outlined" size="small" onClick={() => setOpen_(true)}>
                                {t('nft_button_add_collectible')}
                            </Button>
                            <Button
                                variant="contained"
                                size="small"
                                sx={{ marginLeft: 2 }}
                                onClick={onClick}
                                disabled={!selectedToken}>
                                {t('nft_button_set_avatar')}
                            </Button>
                        </Box>
                    </Box>
                </EthereumChainBoundary>
            </Box>
            <AddNFT open={open_} onClose={() => setOpen_(false)} onAddClick={onAddClick} />
        </>
    )
}
