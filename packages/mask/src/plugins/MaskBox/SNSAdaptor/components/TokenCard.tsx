import { memo } from 'react'
import { Typography } from '@mui/material'
import { useNonFungibleAsset } from '@masknet/plugin-infra/web3'
import { LoadingBase, makeStyles } from '@masknet/theme'
import { NetworkPluginID } from '@masknet/web3-shared-base'
import { CollectibleCard } from '../../../../extension/options-page/DashboardComponents/CollectibleList/CollectibleCard.js'

const useStyles = makeStyles()((theme) => ({
    title: {
        textAlign: 'center',
        margin: theme.spacing(1, 0),
        maxWidth: 160,
    },
    name: {
        whiteSpace: 'nowrap',
        textOverflow: 'ellipsis',
        overflow: 'hidden',
    },
}))

export interface TokenCardProps {
    tokenId: string
    tokenAddress: string
}

export const TokenCard = memo<TokenCardProps>((props: TokenCardProps) => {
    const { tokenId, tokenAddress } = props
    const { classes } = useStyles()
    const { value: asset } = useNonFungibleAsset(NetworkPluginID.PLUGIN_EVM, tokenAddress, tokenId)

    return asset ? (
        <>
            <CollectibleCard asset={asset} />
            <div className={classes.title}>
                <Typography className={classes.name} color="textSecondary" variant="body2">
                    {asset.metadata?.name}
                </Typography>
            </div>
        </>
    ) : (
        <LoadingBase />
    )
})
