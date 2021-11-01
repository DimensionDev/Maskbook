import formatDateTime from 'date-fns/format'
import {
    ChainId,
    TransactionStateType,
    useAccount,
    resolveTransactionLinkOnExplorer,
    useChainId,
} from '@masknet/web3-shared-evm'
import { EthereumWalletConnectedBoundary } from '../../../web3/UI/EthereumWalletConnectedBoundary'
import { Box, Typography, Button, TextField, CircularProgress, Link } from '@mui/material'
import { useSpaceStationClaimableTokenCountCallback } from './hooks/useSpaceStationClaimableTokenCountCallback'
import { useSpaceStationContractClaimCallback } from './hooks/useSpaceStationContractClaimCallback'
import { useI18N } from '../../../utils'
import { useState, useEffect } from 'react'
import { makeStyles, useCustomSnackbar, OptionsObject } from '@masknet/theme'
import OpenInNewIcon from '@mui/icons-material/OpenInNew'
import CloseIcon from '@mui/icons-material/Close'
import classNames from 'classnames'
import type { CampaignInfo } from '../types'
import ActionButton from '../../../extension/options-page/DashboardComponents/ActionButton'

const useStyles = makeStyles()((theme) => ({
    root: {
        color: '#fff',
        width: 496,
        padding: 20,
        borderRadius: 12,
        marginLeft: 'auto',
        marginRight: 'auto',
        marginBottom: theme.spacing(1),
        background: 'linear-gradient(rgba(234, 69, 96, 1), rgba(255, 126, 172, 1))',
    },
    title: {
        fontSize: 20,
        fontWeight: 500,
        marginBottom: theme.spacing(1),
    },
    text: {
        fontSize: 16,
    },
    subText: {
        borderTop: '1px solid rgba(255, 255, 255, 0.1)',
        paddingTop: 4,
        marginTop: 4,
        fontSize: 14,
    },
    claimTimeWrapper: {
        display: 'flex',
        justifyContent: 'space-between',
        marginBottom: theme.spacing(1.5),
    },
    claimWrapper: {
        display: 'inline-flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        paddingBottom: theme.spacing(2),
        marginBottom: theme.spacing(0),
        marginRight: theme.spacing(1),
    },
    claimParent: {
        width: '100%',
        display: 'flex',
        flexWrap: 'wrap',
    },
    checkWrapper: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginTop: theme.spacing(1),
        marginBottom: theme.spacing(1),
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
        marginBottom: theme.spacing(1),
    },
    gallery: {
        marginBottom: theme.spacing(0.5),
        whiteSpace: 'nowrap',
    },
    actionButton: {
        height: 30,
        minHeight: 30,
        width: 80,
        background: 'rgba(255, 255, 255, 0.2)',
        color: '#fff',
        '&:hover': {
            background: 'rgba(255, 255, 255, 0.4)',
        },
        '&.Mui-disabled': { color: '#fff', opacity: 0.6, background: 'rgba(255, 255, 255, 0.2)' },
    },
    actionCheckButton: {
        height: 40,
        minHeight: 40,
        width: 130,
    },
    connectWallet: {
        width: 200,
        minHeight: 30,
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
        margin: theme.spacing(0, 1),
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
    campaignInfos: {
        campaignInfo: CampaignInfo
        claimableInfo: {
            claimable: boolean
            claimed: boolean
        }
    }[]
    loading: boolean
    retry: () => void
}

export function NftAirdropCard(props: NftAirdropCardProps) {
    const { t } = useI18N()
    const [checkAddress, setCheckAddress] = useState('')
    const now = Date.now()
    const { campaignInfos, loading, retry } = props
    const [
        spaceStationClaimableCount,
        setSpaceStationClaimableCount,
        spaceStationAccountClaimableCallback,
        spaceStationAccountClaimableLoading,
    ] = useSpaceStationClaimableTokenCountCallback()
    const account = useAccount()
    const currentChainId = useChainId()
    const { classes } = useStyles()

    const claimableCount = campaignInfos
        ? campaignInfos.reduce((acc, cur) => {
              if (cur.claimableInfo.claimable) return acc + 1
              return acc
          }, 0)
        : 0

    useEffect(() => {
        setCheckAddress('')
        setSpaceStationClaimableCount(undefined)
    }, [account, currentChainId])

    useEffect(() => {
        setSpaceStationClaimableCount(undefined)
    }, [checkAddress])

    return loading ? (
        <Box className={classes.root}>
            <CircularProgress size={16} className={classes.loading} />
        </Box>
    ) : (
        <Box className={classes.root}>
            <Typography className={classes.title}>SocialFi Launch Campaign</Typography>
            <div className={classes.claimTimeWrapper}>
                <Typography className={classes.text}>{t('wallet_airdrop_nft_unclaimed_title')}</Typography>

                <Typography className={classes.text}>
                    {now < campaignInfos[0].campaignInfo.startTime * 1000
                        ? t('plugin_airdrop_nft_start_time', {
                              date: formatDateTime(campaignInfos[0].campaignInfo.startTime * 1000, 'yyyy-MM-dd HH:mm'),
                          })
                        : t('plugin_airdrop_nft_end_time', {
                              date: formatDateTime(campaignInfos[0].campaignInfo.endTime * 1000, 'yyyy-MM-dd HH:mm'),
                          })}
                </Typography>
            </div>
            <div className={classes.claimParent}>
                {campaignInfos.map((v, i) => {
                    return v.claimableInfo.claimable ? (
                        <div key={i.toString()}>
                            <ClaimItem campaignInfo={v.campaignInfo} claimed={v.claimableInfo.claimed} retry={retry} />
                        </div>
                    ) : null
                })}
            </div>
            <Typography className={classes.text}>
                Total: {`${claimableCount} ${claimableCount > 1 ? 'items' : 'item'}`}
            </Typography>

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
                    className={classNames(classes.actionButton, classes.actionCheckButton)}>
                    {spaceStationAccountClaimableLoading ? (
                        <CircularProgress size={16} className={classes.loading} />
                    ) : null}
                    <span>{t('plugin_airdrop_nft_check')}</span>
                </Button>
            </div>

            <Typography className={classes.text}>
                {spaceStationClaimableCount === undefined
                    ? null
                    : spaceStationClaimableCount
                    ? t('plugin_airdrop_nft_number_to_claim', {
                          count: spaceStationClaimableCount,
                          name: spaceStationClaimableCount > 1 ? 'NFTs' : 'NFT',
                      })
                    : t('plugin_airdrop_nft_none_to_claim')}
            </Typography>
        </Box>
    )
}

interface ClaimItemProps {
    campaignInfo: CampaignInfo
    claimed: boolean
    retry: () => void
}

function ClaimItem(props: ClaimItemProps) {
    const { t } = useI18N()
    const { campaignInfo, claimed, retry } = props
    const currentChainId = useChainId()
    const [claimState, claimCallback] = useSpaceStationContractClaimCallback(campaignInfo)
    const now = Date.now()
    const { classes } = useStyles()
    const { showSnackbar, closeSnackbar } = useCustomSnackbar()
    const snackbarOptions = {
        preventDuplicate: true,
        anchorOrigin: {
            vertical: 'top',
            horizontal: 'center',
        },
    }
    useEffect(() => {
        if (claimState.type === TransactionStateType.CONFIRMED && claimState.no === 0) {
            showSnackbar(
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

            retry()
        } else if (claimState.type === TransactionStateType.FAILED) {
            showSnackbar(
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

    const unClaimable =
        now < campaignInfo.startTime * 1000 ||
        now > campaignInfo.endTime * 1000 ||
        !(currentChainId === ChainId.Matic) ||
        claimed

    return (
        <>
            <div className={classes.claimWrapper}>
                <div className={classes.gallery}>
                    {campaignInfo.nfts.map((nft, i) => (
                        <div className={classes.imgWrapper} key={i}>
                            <img src={nft.image} className={classes.nftImage} />
                        </div>
                    ))}
                </div>
                <div>
                    <EthereumWalletConnectedBoundary
                        hideRiskWarningConfirmed={true}
                        classes={{
                            connectWallet: classNames(classes.actionButton, classes.connectWallet),
                            gasFeeButton: classNames(classes.actionButton, classes.connectWallet),
                            invalidButton: classNames(classes.actionButton, classes.connectWallet),
                            unlockMetaMask: classNames(classes.actionButton, classes.connectWallet),
                        }}>
                        <ActionButton
                            disabled={
                                claimState.type === TransactionStateType.WAIT_FOR_CONFIRMING ||
                                claimState.type === TransactionStateType.HASH ||
                                unClaimable
                            }
                            loading={
                                claimState.type === TransactionStateType.WAIT_FOR_CONFIRMING ||
                                claimState.type === TransactionStateType.HASH
                            }
                            classes={{ disabled: classes.disabledButton }}
                            onClick={claimCallback}
                            className={classes.actionButton}>
                            <span>
                                {claimed
                                    ? t('plugin_airdrop_nft_claimed')
                                    : now > campaignInfo.endTime * 1000
                                    ? t('plugin_airdrop_nft_expired')
                                    : t('plugin_airdrop_nft_claim')}
                            </span>
                        </ActionButton>
                    </EthereumWalletConnectedBoundary>
                </div>
            </div>
        </>
    )
}
