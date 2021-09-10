import formatDateTime from 'date-fns/format'
import {
    ChainId,
    TransactionStateType,
    useAccount,
    resolveTransactionLinkOnExplorer,
    useChainId,
} from '@masknet/web3-shared'
import { EthereumWalletConnectedBoundary } from '../../../web3/UI/EthereumWalletConnectedBoundary'
import { Box, Typography, Button, TextField, CircularProgress, Link } from '@material-ui/core'
import { useSpaceStationClaimableTokenCountCallback } from './hooks/useSpaceStationClaimableTokenCountCallback'
import { useSpaceStationContractClaimCallback } from './hooks/useSpaceStationContractClaimCallback'
import { useSpaceStationClaimable } from './hooks/useSpaceStationClaimable'
import { useI18N } from '../../../utils'
import { useState, useEffect } from 'react'
import { makeStyles, useSnackbar, OptionsObject } from '@masknet/theme'
import OpenInNewIcon from '@material-ui/icons/OpenInNew'
import CloseIcon from '@material-ui/icons/Close'
import classNames from 'classnames'
import type { CampaignInfo } from '../types'

const useStyles = makeStyles()((theme) => ({
    root: {
        color: '#fff',
        width: 496,
        height: 340,
        padding: 20,
        borderRadius: 12,
        marginLeft: 'auto',
        marginRight: 'auto',
        marginBottom: theme.spacing(1.5),
        background: 'linear-gradient(rgba(234, 69, 96, 1), rgba(255, 126, 172, 1))',
    },
    title: {
        fontSize: 20,
        fontWeight: 500,
        marginBottom: theme.spacing(1.5),
    },
    text: {
        fontSize: 16,
    },
    subText: {
        fontSize: 14,
    },
    claimTimeWrapper: {
        display: 'flex',
        justifyContent: 'space-between',
        marginBottom: theme.spacing(1.5),
    },
    claimWrapper: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        width: '100%',
        borderBottom: '1px solid rgba(255, 255, 255, 0.2)',
        paddingBottom: theme.spacing(2),
        marginBottom: theme.spacing(1.5),
    },
    checkWrapper: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginTop: theme.spacing(1),
        marginBottom: theme.spacing(1.5),
    },
    nftsWrapper: {
        width: 285,
    },
    nftImage: {
        width: '100%',
        borderRadius: 4,
    },
    imgWrapper: {
        display: 'inline-block',
        width: 65,
        height: 85,
        border: '1px solid rgba(255, 255, 255, 0.2)',
        borderRadius: 5,
        marginRight: theme.spacing(1),
    },
    gallery: {
        width: '100%',
        marginBottom: theme.spacing(0.5),
        overflowX: 'scroll',
        whiteSpace: 'nowrap',
    },
    actionButton: {
        height: 40,
        width: 130,
        background: 'rgba(255, 255, 255, 0.2)',
        color: '#fff',
        '&:hover': {
            background: 'rgba(255, 255, 255, 0.4)',
        },
        '&.Mui-disabled': { color: '#fff', opacity: 0.6, background: 'rgba(255, 255, 255, 0.2)' },
    },
    connectWallet: {
        width: 200,
        minHeight: 40,
        whiteSpace: 'nowrap',
    },
    disabledButton: {
        color: '#fff',
    },
    address: {
        width: 340,
        color: '#fff',
        '& fieldset': {
            borderColor: '#fff !important',
        },
    },
    addressInput: {
        color: '#fff',
        padding: 13,
    },
    chainBoundary: {
        display: 'none',
    },
    loading: {
        marginLeft: theme.spacing(1),
        color: 'rgba(255, 255, 255, 0.4)',
    },
    snackbarContent: {
        color: '#fff',
        display: 'flex',
        width: 250,
        marginLeft: theme.spacing(0.5),
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    snackbarTipContent: {
        display: 'flex',
        flexDirection: 'column',
    },
    snackbarTip: {
        fontSize: 13,
        display: 'flex',
        alignItems: 'self-start',
    },
    snackbarIcon: {
        marginLeft: theme.spacing(0.3),
        height: 17,
        width: 17,
        cursor: 'pointer',
    },
    whiteText: {
        color: '#fff',
    },
    closeIcon: {
        cursor: 'pointer',
    },
}))

interface NftAirdropCardProps {
    campaignInfo: CampaignInfo
}

export function NftAirdropCard(props: NftAirdropCardProps) {
    const { t } = useI18N()
    const [checkAddress, setCheckAddress] = useState('')
    const now = Date.now()
    const { campaignInfo } = props

    const [spaceStationClaimableCount, spaceStationAccountClaimableCallback, spaceStationAccountClaimableLoading] =
        useSpaceStationClaimableTokenCountCallback()
    const account = useAccount()
    const currentChainId = useChainId()
    const { value: claimInfo, loading } = useSpaceStationClaimable(account)
    const claimable = Boolean(claimInfo?.claimable) && currentChainId === ChainId.Matic
    const { classes } = useStyles()
    const [claimState, claimCallback] = useSpaceStationContractClaimCallback(campaignInfo!)
    const { enqueueSnackbar, closeSnackbar } = useSnackbar()
    const snackbarOptions = {
        preventDuplicate: true,
        anchorOrigin: {
            vertical: 'top',
            horizontal: 'center',
        },
    }

    useEffect(() => setCheckAddress(''), [account, currentChainId])

    useEffect(() => {
        if (claimState.type === TransactionStateType.CONFIRMED && claimState.no === 0) {
            enqueueSnackbar(
                <div className={classes.snackbarContent}>
                    <div className={classes.snackbarTipContent}>
                        <Typography>{t('plugin_airdrop_nft_claim_all')}</Typography>
                        <Typography className={classes.snackbarTip}>
                            <span>{t('plugin_airdrop_nft_claim_successful')}</span>
                            <Link
                                className={classes.whiteText}
                                target="_blank"
                                rel="noopener noreferrer"
                                href={resolveTransactionLinkOnExplorer(
                                    ChainId.Mumbai,
                                    claimState.receipt.transactionHash,
                                )}>
                                <OpenInNewIcon className={classes.snackbarIcon} />
                            </Link>
                        </Typography>
                    </div>
                    <CloseIcon onClick={() => closeSnackbar()} className={classes.closeIcon} />
                </div>,
                {
                    variant: 'success',
                    ...snackbarOptions,
                } as OptionsObject,
            )
        } else if (claimState.type === TransactionStateType.FAILED) {
            enqueueSnackbar(
                <div className={classes.snackbarContent}>
                    <div className={classes.snackbarTipContent}>
                        <Typography>{t('plugin_airdrop_nft_claim_all')}</Typography>
                        <Typography className={classes.snackbarTip}>{t('plugin_airdrop_nft_claim_failed')}</Typography>
                    </div>
                    <CloseIcon onClick={() => closeSnackbar()} className={classes.closeIcon} />
                </div>,
                {
                    variant: 'error',
                    ...snackbarOptions,
                } as OptionsObject,
            )
        }
    }, [claimState])

    return (
        <Box className={classes.root}>
            {loading ? (
                <CircularProgress size={16} className={classes.loading} />
            ) : (
                <>
                    <Typography className={classes.title}>{campaignInfo.name}</Typography>
                    <div className={classes.claimTimeWrapper}>
                        <Typography className={classes.text}>{t('wallet_airdrop_nft_unclaimed_title')}</Typography>

                        <Typography className={classes.text}>
                            {now < campaignInfo.startTime * 1000
                                ? t('plugin_airdrop_nft_start_time', {
                                      date: formatDateTime(campaignInfo.startTime * 1000, 'yyyy-MM-dd HH:mm'),
                                  })
                                : t('plugin_airdrop_nft_end_time', {
                                      date: formatDateTime(campaignInfo.endTime * 1000, 'yyyy-MM-dd HH:mm'),
                                  })}
                        </Typography>
                    </div>
                    <div className={classes.claimWrapper}>
                        <div className={classes.nftsWrapper}>
                            {now < campaignInfo.startTime * 1000 ||
                            now > campaignInfo.endTime * 1000 ||
                            !claimable ? null : (
                                <div className={classes.gallery}>
                                    {campaignInfo.nfts.map((nft, i) => (
                                        <div className={classes.imgWrapper} key={i}>
                                            <img src={nft.image} className={classes.nftImage} />
                                        </div>
                                    ))}
                                </div>
                            )}
                            <Typography className={classes.text}>
                                {`${
                                    (now > campaignInfo.startTime * 1000 && now < campaignInfo.endTime * 1000) ||
                                    claimable
                                        ? campaignInfo.nfts.length
                                        : 0
                                } ${campaignInfo.nfts.length > 1 ? 'Items' : 'Item'}`}
                            </Typography>
                        </div>
                        <div>
                            <EthereumWalletConnectedBoundary
                                classes={{
                                    connectWallet: classNames(classes.actionButton, classes.connectWallet),
                                    gasFeeButton: classNames(classes.actionButton, classes.connectWallet),
                                    invalidButton: classNames(classes.actionButton, classes.connectWallet),
                                    unlockMetaMask: classNames(classes.actionButton, classes.connectWallet),
                                }}>
                                <Button
                                    disabled={
                                        claimState.type === TransactionStateType.WAIT_FOR_CONFIRMING ||
                                        claimState.type === TransactionStateType.HASH ||
                                        campaignInfo.nfts.length === 0 ||
                                        !claimable ||
                                        now < campaignInfo.startTime * 1000 ||
                                        now > campaignInfo.endTime * 1000
                                    }
                                    classes={{ disabled: classes.disabledButton }}
                                    onClick={claimCallback}
                                    className={classes.actionButton}>
                                    <span>
                                        {claimInfo?.claimed
                                            ? t('plugin_airdrop_nft_claimed')
                                            : now > campaignInfo.endTime * 1000
                                            ? t('plugin_airdrop_nft_expired')
                                            : t('plugin_airdrop_nft_claim')}
                                    </span>
                                    {claimState.type === TransactionStateType.WAIT_FOR_CONFIRMING ||
                                    claimState.type === TransactionStateType.HASH ? (
                                        <CircularProgress size={16} className={classes.loading} />
                                    ) : null}
                                </Button>
                            </EthereumWalletConnectedBoundary>
                        </div>
                    </div>

                    <Typography className={classes.subText}>{t('plugin_airdrop_nft_check_address')}</Typography>
                    <div className={classes.checkWrapper}>
                        <TextField
                            value={checkAddress}
                            onChange={(e) => setCheckAddress(e.target.value)}
                            className={classes.address}
                            InputProps={{ classes: { input: classes.addressInput } }}
                            placeholder="Enter your wallet address"
                        />
                        <Button
                            disabled={spaceStationAccountClaimableLoading || checkAddress === ''}
                            onClick={async () => spaceStationAccountClaimableCallback(checkAddress)}
                            classes={{ disabled: classes.disabledButton }}
                            className={classes.actionButton}>
                            {spaceStationAccountClaimableLoading ? (
                                <CircularProgress size={16} className={classes.loading} />
                            ) : null}
                            <span>{t('plugin_airdrop_nft_check')}</span>
                        </Button>
                    </div>
                    <Typography className={classes.text}>
                        {spaceStationClaimableCount
                            ? spaceStationClaimableCount.maxCount === -1
                                ? t('plugin_airdrop_nft_incorrect_address')
                                : spaceStationClaimableCount.maxCount === 0 || campaignInfo.nfts.length === 0
                                ? t('plugin_airdrop_nft_none_to_claim')
                                : spaceStationClaimableCount.maxCount - spaceStationClaimableCount.usedCount === 0
                                ? t('plugin_airdrop_nft_already_claimed')
                                : t('plugin_airdrop_nft_number_to_claim', {
                                      count:
                                          (spaceStationClaimableCount.maxCount - spaceStationClaimableCount.usedCount) *
                                          campaignInfo.nfts.length,
                                      name:
                                          (spaceStationClaimableCount.maxCount - spaceStationClaimableCount.usedCount) *
                                              campaignInfo.nfts.length >
                                          1
                                              ? 'NFTs'
                                              : 'NFT',
                                  })
                            : null}
                    </Typography>
                </>
            )}
        </Box>
    )
}
