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
            borderRadius: theme.spacing(0.5),
            paddingTop: '5px',
            paddingBottom: '8px',
        },
        typographyBody: {
            width: '100%',
            color: theme.palette.text.primary,
        },
        typography: {
            color: theme.palette.text.primary,
            margin: theme.spacing(0.7, 1, 0.7, 1),
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

function FoundationPrices(props: Props) {
    const { classes } = useStyles()
    const { t } = useI18N()
    const { value: nativeToken } = useNativeTokenDetailed()
    const nativeTokenPrice = useNativeTokenPrice(nativeToken?.chainId)
    const mostRecentAuction = props.nft.mostRecentAuction
    const reservePriceInUSD = formatCurrency(nativeTokenPrice * Number(mostRecentAuction.reservePriceInETH), '$')
    const highestBid = () => {
        if (mostRecentAuction.highestBid) {
            return {
                usd: formatCurrency(nativeTokenPrice * Number(mostRecentAuction.highestBid.amountInETH), '$'),
                eth: mostRecentAuction.highestBid.amountInETH,
            }
        }
        return {
            usd: reservePriceInUSD,
            eth: mostRecentAuction.reservePriceInETH,
        }
    }
    return (
        <Box>
            <Grid container spacing={0} className={classes.body}>
                <Grid item xs={6}>
                    <Typography className={classes.typographyBody} variant="h5" align="center" color="text.secondary">
                        {t('plugin_foundation_reserve')}
                    </Typography>
                    <Typography className={classes.typographyBody} variant="h5" align="center" color="text.secondary">
                        <ETHIcon className={classes.icons} color="primary" fontSize="inherit" />
                        <span className={classes.typography}>{mostRecentAuction.reservePriceInETH}</span>
                        <span className={classes.subCurrency}>({reservePriceInUSD})</span>
                    </Typography>
                </Grid>
                <Grid item xs={6}>
                    <Typography className={classes.typographyBody} variant="h5" align="center" color="text.secondary">
                        {t('plugin_foundation_highest')}
                    </Typography>
                    <Typography className={classes.typographyBody} variant="h5" align="center" color="text.secondary">
                        <ETHIcon className={classes.icons} color="primary" fontSize="inherit" />
                        <span className={classes.typography}>{highestBid().eth}</span>
                        <span className={classes.subCurrency}>({highestBid().usd})</span>
                    </Typography>
                </Grid>
            </Grid>
        </Box>
    )
}

export default FoundationPrices
