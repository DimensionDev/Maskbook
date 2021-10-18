import { NFTLinkIcon, NFTSelectedIcon } from '@masknet/icons'
import { WalletMessages } from '@masknet/plugin-wallet'
import { useRemoteControlledDialog, useStylesExtends, useValueRef } from '@masknet/shared'
import { makeStyles } from '@masknet/theme'
import {
    ERC721TokenDetailed,
    formatEthereumAddress,
    resolveCollectibleLink,
    useAccount,
    useChainId,
    useCollectibles,
} from '@masknet/web3-shared'
import { Box, Button, Link, Skeleton, TablePagination, Typography } from '@material-ui/core'
import { uniqBy } from 'lodash-es'
import { useCallback, useState } from 'react'
import { currentCollectibleDataProviderSettings } from '../../../plugins/Wallet/settings'
import { useI18N } from '../../../utils'
import { EthereumChainBoundary } from '../../../web3/UI/EthereumChainBoundary'
import { AddNFT } from './AddNFT'

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
    AddCollectible: {
        textAlign: 'right',
        paddingBottom: theme.spacing(1),
    },
    NFTBox: {
        border: `1px solid ${theme.palette.mode === 'dark' ? 'rgb(61, 84, 102)' : 'rgb(207, 217, 222)'}`,
        borderRadius: 4,
        padding: theme.spacing(1),
    },
    NFTImage: {
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
}))

export interface NFTAvatarProps extends withClasses<'root'> {
    onChange: (token: ERC721TokenDetailed) => void
}

export function NFTAvatar(props: NFTAvatarProps) {
    const { onChange } = props
    const classes = useStylesExtends(useStyles(), props)
    const account = useAccount()
    const chainId = useChainId()
    const provider = useValueRef(currentCollectibleDataProviderSettings)
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
    } = useCollectibles(account, chainId, provider, page, 50)

    const { collectibles, hasNextPage } = value

    const onClick = useCallback(async () => {
        if (!selectedToken) return
        onChange(selectedToken)
        setSelectedToken(undefined)
    }, [onChange, selectedToken, setSelectedToken])

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
            <div key={i}>
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
                    <Box className={classes.NFTBox}>
                        <Box className={classes.NFTImage}>
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
                        <Box className={classes.button}>
                            <Button variant="outlined" size="medium" onClick={() => setOpen_(true)}>
                                {t('nft_collectible_add')}
                            </Button>

                            <Button
                                variant="contained"
                                size="medium"
                                className={classes.setNFTAvatar}
                                onClick={onClick}
                                disabled={!selectedToken}>
                                {t('profile_nft_avatar_set')}
                            </Button>
                        </Box>
                    </Box>
                </EthereumChainBoundary>
            </Box>
            <AddNFT open={open_} onClose={() => setOpen_(false)} onAddClick={onAddClick} />
        </>
    )
}

const useNFTImageStyles = makeStyles()((theme) => ({
    imgBackground: {
        position: 'relative',
        padding: 6,
        margin: theme.spacing(0.5, 1),
    },
    icon: {
        position: 'absolute',
        top: 5,
        right: 5,
        width: 24,
        height: 24,
    },
    image: {
        width: 97,
        height: 97,
        objectFit: 'cover',
        borderRadius: '100%',
        boxSizing: 'border-box',
    },
}))

interface NFTImageProps {
    token: ERC721TokenDetailed
    selectedToken?: ERC721TokenDetailed
    onChange: (token: ERC721TokenDetailed) => void
}

function NFTImage(props: NFTImageProps) {
    const { token, onChange, selectedToken } = props
    const { classes } = useNFTImageStyles()
    const chainId = useChainId()
    const provider = useValueRef(currentCollectibleDataProviderSettings)

    return (
        <div className={classes.imgBackground}>
            <img onClick={() => onChange(token)} src={token.info.image} className={classes.image} />
            <Link target="_blank" rel="noopener noreferrer" href={resolveCollectibleLink(chainId, provider, token)}>
                {selectedToken === token ? (
                    <NFTSelectedIcon className={classes.icon} />
                ) : (
                    <NFTLinkIcon className={classes.icon} />
                )}
            </Link>
        </div>
    )
}
