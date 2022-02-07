import { getMaskColor, makeStyles } from '@masknet/theme'
import { Box, Typography, Link } from '@mui/material'
import { useI18N } from '../../../utils'
import { AddressName, resolveAddressLinkOnExplorer, formatEthereumAddress, ChainId } from '@masknet/web3-shared-evm'
import { CollectionList } from '../../../extension/options-page/DashboardComponents/CollectibleList'

const useStyles = makeStyles()((theme) => ({
    root: {
        position: 'relative',
    },
    text: {
        paddingTop: 36,
        paddingBottom: 36,
        '& > p': {
            color: getMaskColor(theme).textPrimary,
        },
    },
    note: {
        padding: `0 ${theme.spacing(1)}`,
        textAlign: 'right',
    },
    icon: {
        color: getMaskColor(theme).textPrimary,
    },
    iconContainer: {
        display: 'inherit',
    },
    tipList: {
        listStyleType: 'decimal',
        paddingLeft: 16,
    },
}))

export interface NFTPageProps {
    addressName?: AddressName
}

export function NFTPage(props: NFTPageProps) {
    const { addressName } = props
    const { classes } = useStyles()
    const { t } = useI18N()
    if (!addressName) return null

    return (
        <div className={classes.root}>
            <Box className={classes.note} display="flex" alignItems="center" justifyContent="flex-end" flexWrap="wrap">
                <Box display="flex" alignItems="center">
                    <Typography color="textPrimary" component="span">
                        {t('plugin_wallet_nft_wall_current_display')}
                        <Link
                            href={resolveAddressLinkOnExplorer(ChainId.Mainnet, addressName.resolvedAddress ?? '')}
                            target="_blank"
                            rel="noopener noreferrer">
                            {formatEthereumAddress(addressName.resolvedAddress ?? '', 4)}
                        </Link>
                    </Typography>
                </Box>
            </Box>
            <CollectionList address={addressName.resolvedAddress ?? ''} />
        </div>
    )
}
