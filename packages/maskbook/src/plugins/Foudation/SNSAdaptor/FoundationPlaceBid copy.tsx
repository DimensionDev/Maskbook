import React, { useState } from 'react'
import { Button, TextField, Grid } from '@material-ui/core'
import type { AbiItem } from 'web3-utils'
import { EthereumWalletConnectedBoundary } from '../../../web3/UI/EthereumWalletConnectedBoundary'
import {
    useContract,
    useAccount,
    TransactionStateType,
    useTransactionState,
    ChainId,
    useFoundationConstants,
} from '@masknet/web3-shared'
import type { PayableTx } from '@masknet/web3-contracts/types/types'
import FoundationAbi from '@masknet/web3-contracts/abis/Foundation.json'
import type { Foundation } from '@masknet/web3-contracts/types/Foundation'
import { useI18N } from '../../../utils'
import Web3 from 'web3'
import { makeStyles } from '@masknet/theme'
import FoudationCountdown from './FoudationCountdown'
import type { Nft, Metadata } from '../types'

const useStyles = makeStyles()((theme) => {
    return {
        body: {
            display: 'flex',
            justifyContent: 'center',
            margin: '16px',
            width: '100%',
        },
        button: {
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
                                            className={classes.button}
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
