import React, { useState } from 'react'
import { Button, TextField, Grid } from '@material-ui/core'
import type { nftData } from '../types'
import type { AbiItem } from 'web3-utils'
import { EthereumWalletConnectedBoundary } from '../../../web3/UI/EthereumWalletConnectedBoundary'
import { useContract, useAccount, TransactionStateType, useTransactionState, ChainId } from '@masknet/web3-shared'
import type { PayableTx } from '@masknet/web3-contracts/types/types'
import FoundationAbi from '../abis/Foundation.json'
import type { Foundation } from '@masknet/web3-contracts/types/Foundation'
import { useI18N } from '../../../utils'
import Web3 from 'web3'
import { makeStyles } from '@masknet/theme'
import FoudationCountdown from './FoudationCountdown'

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
    nftData: nftData
}

function PlaceBid(props: Props) {
    const { classes } = useStyles()
    const { t } = useI18N()
    const [transactionState, setTransactionState] = useTransactionState()
    const account = useAccount()
    const hasnHighestBid = () => {
        if (props.nftData.graph.data.nfts[0].mostRecentAuction.highestBid) {
            return props.nftData.graph.data.nfts[0].mostRecentAuction.highestBid.bidder.id.includes(account)
        }
        return false
    }
    const [amount, setAmount] = useState<string>('')
    const contractAddres =
        props.nftData.chainId === ChainId.Gorli
            ? '0xeB1bD095061bbDb1aD065524628812cae63e4222'
            : '0xcDA72070E455bb31C7690a170224Ce43623d0B6f'

    const contract = useContract<Foundation>(contractAddres, FoundationAbi as AbiItem[])
    if (
        props.nftData.graph.data.nfts[0].mostRecentAuction &&
        props.nftData.graph.data.nfts[0].mostRecentAuction?.status === 'Open'
    ) {
        return (
            <EthereumWalletConnectedBoundary offChain={true}>
                <div className={classes.body}>
                    <Grid container spacing={2}>
                        <FoudationCountdown auctions={props.nftData.graph.data.nfts[0].auctions} />
                        {hasnHighestBid() === false && (
                            <>
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
                                                props.nftData.graph.data.nfts[0].mostRecentAuction.id.split('-').at(1),
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
                                            const bid = contract?.methods.placeBid(auctionId).send(config as PayableTx)
                                        }}
                                        variant="contained"
                                        fullWidth
                                        disableElevation>
                                        {t('plugin_foundation_place_bid')}
                                    </Button>
                                </Grid>
                            </>
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
