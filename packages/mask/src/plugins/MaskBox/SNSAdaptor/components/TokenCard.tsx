import { useNonFungibleAsset } from '@masknet/web3-hooks-base'
import { LoadingBase, makeStyles } from '@masknet/theme'
import { NetworkPluginID } from '@masknet/shared-base'
import { NonFungibleTokenContract, SourceType } from '@masknet/web3-shared-base'
import type { ChainId, SchemaType } from '@masknet/web3-shared-evm'
import { Typography } from '@mui/material'
import { memo } from 'react'
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
    contractDetailed: NonFungibleTokenContract<ChainId, SchemaType>
    renderOrder: number
}

export const TokenCard = memo<TokenCardProps>((props: TokenCardProps) => {
    const { contractDetailed, tokenId, renderOrder } = props
    const { classes } = useStyles()
    const { value: tokenDetailed } = useNonFungibleAsset(NetworkPluginID.PLUGIN_EVM, contractDetailed.address, tokenId)

    return tokenDetailed ? (
        <>
            <CollectibleCard readonly provider={SourceType.OpenSea} asset={tokenDetailed} renderOrder={renderOrder} />
            <div className={classes.title}>
                <Typography className={classes.name} color="textSecondary" variant="body2">
                    {tokenDetailed.contract?.name ?? tokenId}
                </Typography>
            </div>
        </>
    ) : (
        <LoadingBase />
    )
})
