import { WalletMessages } from '@masknet/plugin-wallet'
import { useRemoteControlledDialog, useStylesExtends, useValueRef } from '@masknet/shared'
import { getMaskColor, makeStyles } from '@masknet/theme'
import {
    ERC721TokenDetailed,
    formatEthereumAddress,
    useAccount,
    useChainId,
    useCollectibles,
} from '@masknet/web3-shared-evm'
import { Box, Button, Skeleton, TablePagination, Typography } from '@material-ui/core'
import classnames from 'classnames'
import { uniqBy } from 'lodash-es'
import { useCallback, useEffect, useState } from 'react'
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
        justifyContent: 'center',
    },
    image: {
        width: 97,
        height: 97,
        objectFit: 'cover',
        margin: theme.spacing(0.5, 1.5),
        borderRadius: '100%',
        '&:hover': {
            border: `1px solid ${getMaskColor(theme).blue}`,
        },
        boxSizing: 'border-box',
    },
    button: {
        textAlign: 'center',
        paddingTop: theme.spacing(1),
    },
    setNFTAvatar: {
        paddingLeft: 64,
        paddingRight: 64,
    },
    selected: {
        border: `1px solid ${getMaskColor(theme).blue}`,
    },
    error: {},
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

    useEffect(() => {
        setCollectibles_(collectibles)
    }, [collectibles])

    const onClick = useCallback(async () => {
        if (!selectedToken) return
        onChange(selectedToken)
    }, [onChange, selectedToken])

    const onAddClick = useCallback((token) => {
        setSelectedToken(token)
        setCollectibles_((tokens) => uniqBy([token, ...tokens], (x) => x.contractDetailed.address && x.tokenId))
    }, [])

    const { openDialog: openSelectProviderDialog } = useRemoteControlledDialog(
        WalletMessages.events.selectProviderDialogUpdated,
    )

    const LoadStatus = Array.from({ length: 6 })
        .fill(0)
        .map((_, i) => <Skeleton animation="wave" variant="rectangular" className={classes.image} key={i} />)
    const Retry = (
        <Box className={classes.error}>
            <Typography color="textSecondary">{t('dashboard_no_collectible_found')}</Typography>

            <Button className={classes.button} variant="text" onClick={() => retry()}>
                {t('plugin_collectible_retry')}
            </Button>
        </Box>
    )
    return (
        <>
            <Box className={classes.root}>
                <Box className={classes.title}>
                    <Typography variant="body1" color="textPrimary">
                        NFT Avatar Setting
                    </Typography>
                    {account ? (
                        <Typography variant="body1" color="textPrimary">
                            Wallet: {formatEthereumAddress(account, 4)}
                            <Button onClick={openSelectProviderDialog} size="small">
                                Change
                            </Button>
                        </Typography>
                    ) : null}
                </Box>
                <EthereumChainBoundary chainId={chainId}>
                    <Box className={classes.NFTBox}>
                        <Box className={classes.AddCollectible}>
                            <Button variant="outlined" size="small" onClick={() => setOpen_(true)}>
                                Add Collectibles
                            </Button>
                        </Box>
                        <Box className={classes.NFTImage}>
                            {loading
                                ? LoadStatus
                                : error || collectibles_.length === 0
                                ? Retry
                                : collectibles_.map((token: ERC721TokenDetailed, i) => (
                                      <img
                                          key={i}
                                          onClick={() => setSelectedToken(token)}
                                          src={token.info.image}
                                          className={classnames(
                                              classes.image,
                                              selectedToken === token ? classes.selected : '',
                                          )}
                                      />
                                  ))}
                        </Box>

                        {!(page === 0 && collectibles_.length === 0) ? (
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
                            <Button
                                variant="contained"
                                size="medium"
                                className={classes.setNFTAvatar}
                                onClick={() => onClick()}
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
