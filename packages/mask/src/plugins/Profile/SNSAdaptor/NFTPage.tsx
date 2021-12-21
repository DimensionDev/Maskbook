import { getMaskColor, makeStyles } from '@masknet/theme'
import { Box, Typography } from '@mui/material'
import type { ChainId } from '@masknet/web3-shared-evm'
import { useI18N } from '../../../utils'
import { CollectionList } from '../../../extension/options-page/DashboardComponents/CollectionList'

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
}))

export interface NFTPageProps {
    address: string
    chainId: ChainId
}

export function NFTPage(props: NFTPageProps) {
    const { address, chainId } = props
    const { t } = useI18N()
    const { classes } = useStyles()

    if (!address)
        return (
            <div className={classes.root}>
                <Box className={classes.text} display="flex" alignItems="center" justifyContent="center">
                    <Typography color="textSecondary">{t('dashboard_no_collectible_found')}</Typography>
                </Box>
            </div>
        )

    return (
        <div className={classes.root}>
            <CollectionList address={address} chainId={chainId} />
        </div>
    )
}
