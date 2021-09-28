import { WalletMessages } from '@masknet/plugin-wallet'
import { useRemoteControlledDialog, useStylesExtends, useValueRef } from '@masknet/shared'
import { getMaskColor, makeStyles } from '@masknet/theme'
import {
    ERC721TokenDetailed,
    formatEthereumAddress,
    useAccount,
    useChainId,
    useCollectibles,
} from '@masknet/web3-shared'
import { Box, Button, Skeleton, TablePagination, Typography } from '@material-ui/core'
import classNames from 'classnames'
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
        justifyContent: 'center',
    },
    image: {
        width: 97,
        height: 97,
        objectFit: 'cover',
        borderRadius: '100%',
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
    imgBackground: {
        '&:hover': {
            backgroundColor: getMaskColor(theme).blue,
        },
        height: 97,
        padding: 6,
        borderRadius: '100%',
        margin: theme.spacing(0.5, 1),
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
    },
    selected: {
        backgroundColor: getMaskColor(theme).blue,
    },
    error: {
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
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
    //0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045

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
            <div className={classes.imgBackground}>
                <Skeleton animation="wave" variant="rectangular" className={classes.image} key={i} />
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
                        <Box className={classes.AddCollectible}>
                            <Button variant="outlined" size="small" onClick={() => setOpen_(true)}>
                                {t('nft_collectible_add')}
                            </Button>
                        </Box>
                        <Box className={classes.NFTImage}>
                            {loading
                                ? LoadStatus
                                : error || collectibles.length === 0
                                ? Retry
                                : collectibles
                                      .filter(
                                          (token: ERC721TokenDetailed) =>
                                              token.info.image &&
                                              !token.info.image?.match(/\.(mp4|webm|mov|ogg|mp3|wav)$/i),
                                      )
                                      .map((token: ERC721TokenDetailed, i) => (
                                          <div
                                              className={classNames(
                                                  classes.imgBackground,
                                                  selectedToken === token ? classes.selected : '',
                                              )}
                                              key={i}>
                                              <img
                                                  onClick={() => setSelectedToken(token)}
                                                  src={token.info.image}
                                                  className={classes.image}
                                              />
                                          </div>
                                      ))}
                        </Box>

                        {!(page === 0 && collectibles.length === 0) ? (
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
