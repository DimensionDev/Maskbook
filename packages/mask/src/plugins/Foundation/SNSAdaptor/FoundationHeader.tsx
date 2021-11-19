import React, { useCallback } from 'react'
import type { Nft, Metadata } from '../types'
import { Typography, Box, Grid } from '@mui/material'
import { useI18N } from '../../../utils'
import { makeStyles } from '@masknet/theme'
import { useNativeTokenPrice } from '../../Wallet/hooks/useTokenPrice'
import { useNativeTokenDetailed, formatCurrency } from '@masknet/web3-shared-evm'
import { ETHIcon } from '@masknet/icons'

const useStyles = makeStyles()((theme) => {
    return {
        body: {
            background: theme.palette.background.paper,
            borderRadius: '4px 4px 4px 4px',
            paddingTop: '5px',
            paddingBottom: '8px',
        },
        box: {},
        name: {
            color: theme.palette.text.primary,
            marginTop: '20px',
            marginBottom: '20px',
        },
        typographyBox: {},
        typographyBody: {
            width: '100%',
            color: theme.palette.text.primary,
        },
        typography: {
            color: theme.palette.text.primary,
            margin: '5px 8px 5px 8px',
        },
        subCurrency: {
            margin: '5px',
            color: theme.palette.text.disabled,
        },
        icons: {
            width: '24px',
            height: '24px',
            margin: '-3px',
        },
    }
})

interface Props extends React.PropsWithChildren<{}> {
    nft: Nft
    metadata: Metadata
    link: string
}

interface Prices extends React.PropsWithChildren<{}> {
    nft: Nft
}

function FoundationPrices(prices: Prices) {
    const { t } = useI18N()
    const { classes } = useStyles()
    const { value: nativeToken } = useNativeTokenDetailed()
    const nativeTokenPrice = useNativeTokenPrice(nativeToken?.chainId)
    const convertUsd = formatCurrency(nativeTokenPrice * Number(prices.nft.mostRecentAuction.reservePriceInETH), '$')
    console.log()
    console.log(prices.nft.mostRecentAuction.reservePriceInETH)
    if (prices.nft.mostRecentAuction) {
        if (prices.nft.mostRecentAuction.highestBid) {
            const convertUsdHighestBid = formatCurrency(
                nativeTokenPrice * Number(prices.nft.mostRecentAuction.highestBid.amountInETH),
                '$',
            )
            return (
                <Grid container spacing={0} className={classes.body}>
                    <Grid item xs={6} className={classes.typographyBox}>
                        <Typography
                            className={classes.typographyBody}
                            variant="h5"
                            align="center"
                            color="text.secondary">
                            {t('plugin_foundation_reserve')}
                        </Typography>
                        <Typography
                            className={classes.typographyBody}
                            variant="h5"
                            align="center"
                            color="text.secondary">
                            <ETHIcon className={classes.icons} color="primary" fontSize="inherit" />
                            <span className={classes.typography}>{prices.nft.mostRecentAuction.reservePriceInETH}</span>
                            <span className={classes.subCurrency}>({convertUsd})</span>
                        </Typography>
                    </Grid>
                    <Grid item xs={6} className={classes.typographyBox}>
                        <Typography
                            className={classes.typographyBody}
                            variant="h5"
                            align="center"
                            color="text.secondary">
                            {t('plugin_foundation_highest')}
                        </Typography>
                        <Typography
                            className={classes.typographyBody}
                            variant="h5"
                            align="center"
                            color="text.secondary">
                            <ETHIcon className={classes.icons} color="primary" fontSize="inherit" />
                            <span className={classes.typography}>
                                {prices.nft.mostRecentAuction.highestBid.amountInETH}
                            </span>
                            <span className={classes.subCurrency}>({convertUsdHighestBid})</span>
                        </Typography>
                    </Grid>
                </Grid>
            )
        }
        return (
            <Grid container spacing={0} className={classes.body}>
                <Grid item xs={6} className={classes.typographyBox}>
                    <Typography className={classes.typographyBody} variant="h5" align="center" color="text.secondary">
                        {t('plugin_foundation_reserve')}
                    </Typography>
                    <Typography className={classes.typographyBody} variant="h5" align="center" color="text.secondary">
                        <ETHIcon className={classes.icons} color="primary" fontSize="inherit" />
                        <span className={classes.typography}>{prices.nft.mostRecentAuction.reservePriceInETH}</span>
                        <span className={classes.subCurrency}>({convertUsd})</span>
                    </Typography>
                </Grid>
                <Grid item xs={6} className={classes.typographyBox}>
                    <Typography className={classes.typographyBody} variant="h5" align="center" color="text.secondary">
                        {t('plugin_foundation_highest')}
                    </Typography>
                    <Typography className={classes.typographyBody} variant="h5" align="center" color="text.secondary">
                        <ETHIcon className={classes.icons} color="primary" fontSize="inherit" />
                        <span className={classes.typography}>{prices.nft.mostRecentAuction.reservePriceInETH}</span>
                        <span className={classes.subCurrency}>({convertUsd})</span>
                    </Typography>
                </Grid>
            </Grid>
        )
    }
    return null
}

function FoundationHeader(props: Props) {
    const { t } = useI18N()
    const { classes } = useStyles()
    const { value: nativeToken } = useNativeTokenDetailed()
    const nativeTokenPrice = useNativeTokenPrice(nativeToken?.chainId)
    console.log(nativeTokenPrice * Number(props.nft.mostRecentAuction.reservePriceInETH))
    const CurrentPrice = useCallback(() => {
        if (props.nft.mostRecentAuction) {
            if (props.nft.mostRecentAuction.highestBid) {
                return `${t('plugin_foundation_highest')} ${props.nft.mostRecentAuction.highestBid.amountInETH}`
            }
            return `${t('plugin_foundation_reserve')} ${props.nft.mostRecentAuction.reservePriceInETH}`
        }
        return null
    }, [props.nft.mostRecentAuction])

    return (
        <Box>
            <Typography variant="h4" className={classes.name} align="center">
                {props.metadata?.name}
            </Typography>
            <FoundationPrices nft={props.nft} />
        </Box>
        // <CardHeader
        //     title={
        //         <Link color="inherit" target="_blank" rel="noopener noreferrer" href={props.link}>
        //             <Typography variant="h3" align="center">
        //                 {props.metadata?.name}
        //             </Typography>
        //         </Link>
        //     }
        //     subheader={
        //         <Typography variant="h5" align="center" color="text.secondary">
        //             <ETHIcon color="primary" fontSize="inherit" style={{ fill: '#ea7662' }} />
        //             {CurrentPrice()}
        //         </Typography>
        //     }
        // />
    )
}

export default FoundationHeader
