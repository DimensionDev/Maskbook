import React, { useState, useCallback } from 'react'
import { Button, TextField, Grid } from '@material-ui/core'
import type { AbiItem } from 'web3-utils'
import BigNumber from 'bignumber.js'
import { EthereumWalletConnectedBoundary } from '../../../web3/UI/EthereumWalletConnectedBoundary'
import {
    EthereumTokenType,
    useContract,
    useAccount,
    TransactionStateType,
    useTransactionState,
    FungibleTokenDetailed,
    ChainId,
    useChainId,
    formatBalance,
    pow10,
    useNativeTokenDetailed,
    useFungibleTokenBalance,
    useFoundationConstants,
} from '@masknet/web3-shared'
import { useRemoteControlledDialog, useStylesExtends } from '@masknet/shared'
import type { PayableTx } from '@masknet/web3-contracts/types/types'
import FoundationAbi from '@masknet/web3-contracts/abis/Foundation.json'
import type { Foundation } from '@masknet/web3-contracts/types/Foundation'
import { useI18N } from '../../../utils'
import Web3 from 'web3'
import { makeStyles } from '@masknet/theme'
import FoudationCountdown from './FoudationCountdown'
import type { Nft, Metadata } from '../types'
import { PluginFoundationMessages } from '../messages'
import { v4 as uuid } from 'uuid'
import { SelectTokenDialogEvent, WalletMessages } from '../../Wallet/messages'
import { usePlaceBidCallback } from '../hooks/usePlaceBidCallback'
import { activatedSocialNetworkUI } from '../../../social-network'
import { isTwitter } from '../../../social-network-adaptor/twitter.com/base'

const useStyles = makeStyles()((theme) => {
    return {
        body: {
            display: 'flex',
            justifyContent: 'center',
            margin: '16px',
            width: '100%',
        },
        paper: {
            width: '450px !important',
        },
        form: {
            '& > *': {
                margin: theme.spacing(1, 0),
            },
        },
        root: {
            margin: theme.spacing(2, 0),
        },
        tip: {
            fontSize: 12,
            color: theme.palette.text.secondary,
            padding: theme.spacing(2, 2, 0, 2),
        },
        button: {
            margin: theme.spacing(1.5, 0, 0),
            padding: 12,
        },
        button1: {
            width: '100%',
            padding: '16px',
        },
        input: {
            maxWidth: '100%',
        },
    }
})

interface Props extends React.PropsWithChildren<{}> {
    nft: Nft
    metadata: Metadata
    chainId: ChainId
}

export interface FoudationDialogProps extends withClasses<never> {}

function PlaceBid1(props: FoudationDialogProps) {
    const { t } = useI18N()
    const classes = useStylesExtends(useStyles(), props)

    const [title, setTitle] = useState('')
    const [auctionId, setAuctionId] = useState('')

    // context
    const account = useAccount()
    const chainId = useChainId()
    const nativeTokenDetailed = useNativeTokenDetailed()
    const { MARKET_ADDRESS } = useFoundationConstants()

    //#region remote controlled dialog
    const { open, closeDialog: closeDonationDialog } = useRemoteControlledDialog(
        PluginFoundationMessages.foundationDialogUpdated,
        (ev) => {
            if (!ev.open) return
            setTitle(ev.title)
            setAuctionId(ev.auctionId)
        },
    )
    //#endregion

    //#region the selected token
    const [token = nativeTokenDetailed.value, setToken] = useState<FungibleTokenDetailed | undefined>(
        nativeTokenDetailed.value,
    )
    const tokenBalance = useFungibleTokenBalance(token?.type ?? EthereumTokenType.Native, token?.address ?? '')
    //#endregion

    //#region select token dialog
    const [id] = useState(uuid())
    const { setDialog: setSelectTokenDialog } = useRemoteControlledDialog(
        WalletMessages.events.selectTokenDialogUpdated,
        useCallback(
            (ev: SelectTokenDialogEvent) => {
                if (ev.open || !ev.token || ev.uuid !== id) return
                setToken(ev.token)
            },
            [id],
        ),
    )

    const onSelectTokenChipClick = useCallback(() => {
        setSelectTokenDialog({
            open: true,
            uuid: id,
            disableNativeToken: false,
            FixedTokenListProps: {
                selectedTokens: token ? [token.address] : [],
            },
        })
    }, [id, token?.address])
    //#endregion

    //#region amount
    const [rawAmount, setRawAmount] = useState('')
    const amount = new BigNumber(rawAmount || '0').multipliedBy(pow10(token?.decimals ?? 0))
    //#endregion

    //#region blocking
    const [placeBidState, PlaceBidCallback, resetCallback] = usePlaceBidCallback(auctionId, amount.toFixed())
    //#endregion

    //#region transaction dialog
    const cashTag = isTwitter(activatedSocialNetworkUI) ? '$' : ''
    const shareLink = activatedSocialNetworkUI.utils
        .getShareLinkURL?.(
            token
                ? [
                      `I just donated ${title} with ${formatBalance(amount, token.decimals)} ${cashTag}${
                          token.symbol
                      }. Follow @realMaskNetwork (mask.io) to donate Gitcoin grants.`,
                      '#mask_io',
                  ].join('\n')
                : '',
        )
        .toString()

    // close the transaction dialog
    const { setDialog: setTransactionDialog } = useRemoteControlledDialog(
        WalletMessages.events.transactionDialogUpdated,
        (ev) => {
            if (ev.open) return
            if (placeBidState.type === TransactionStateType.HASH) setRawAmount('')
            resetCallback()
        },
    )
}

function PlaceBid(props: Props) {
    const { classes } = useStyles()
    const { t } = useI18N()
    const [transactionState, setTransactionState] = useTransactionState()
    const account = useAccount()
    const hasnHighestBid = () => {
        if (props.nft.mostRecentAuction.highestBid) {
            return props.nft.mostRecentAuction.highestBid.bidder.id.includes('account')
        }
        return false
    }
    const [amount, setAmount] = useState<string>('0')
    const { MARKET_ADDRESS } = useFoundationConstants()
    const contract = useContract<Foundation>(MARKET_ADDRESS, FoundationAbi as AbiItem[])
    if (props.nft.mostRecentAuction?.status === 'Open') {
        return (
            <EthereumWalletConnectedBoundary offChain={true}>
                <div className={classes.body}>
                    <Grid container spacing={2}>
                        <Grid item xs={12}>
                            <FoudationCountdown auctions={props.nft.auctions} />
                        </Grid>
                        {hasnHighestBid() === false && (
                            <Grid item xs={12}>
                                <Grid container spacing={2}>
                                    <Grid item xs={8}>
                                        <TextField
                                            className={classes.input}
                                            id="outlined-helperText"
                                            label={t('plugin_foundation_eth_amount')}
                                            required
                                            fullWidth
                                            onChange={(e) => {
                                                setAmount(Web3.utils.toWei(e.target.value, 'ether'))
                                            }}
                                        />
                                    </Grid>
                                    <Grid item xs={4}>
                                        <Button
                                            className={classes.button1}
                                            onClick={async () => {
                                                const auctionId = String(
                                                    props.nft.mostRecentAuction.id.split('-').at(-1),
                                                )
                                                const config = {
                                                    from: account,
                                                    gas: await contract?.methods
                                                        .placeBid(auctionId)
                                                        .estimateGas({
                                                            from: account,
                                                            value: amount,
                                                        })
                                                        .catch((error) => {
                                                            return contract?.methods.placeBid(auctionId).estimateGas({
                                                                from: account,
                                                                value: amount,
                                                            })
                                                        })
                                                        .catch((error) => {
                                                            setTransactionState({
                                                                type: TransactionStateType.FAILED,
                                                                error,
                                                            })
                                                            throw error
                                                        }),
                                                    value: amount,
                                                }
                                                const bid = contract?.methods
                                                    .placeBid(auctionId)
                                                    .send(config as PayableTx)
                                            }}
                                            variant="contained"
                                            fullWidth
                                            disableElevation>
                                            {t('plugin_foundation_place_bid')}
                                        </Button>
                                    </Grid>
                                </Grid>
                            </Grid>
                        )}
                        {hasnHighestBid() && (
                            <Grid item xs={12}>
                                <Button
                                    disabled
                                    style={{ width: '500px', padding: '16px' }}
                                    variant="contained"
                                    fullWidth
                                    disableElevation>
                                    {t('plugin_foundation_user_highest')}
                                </Button>
                            </Grid>
                        )}
                    </Grid>
                </div>
            </EthereumWalletConnectedBoundary>
        )
    }
    return null
}

export default PlaceBid
