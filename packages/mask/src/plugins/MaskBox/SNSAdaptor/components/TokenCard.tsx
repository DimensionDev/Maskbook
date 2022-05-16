import { memo } from 'react'
import { useNonFungibleToken } from '@masknet/plugin-infra/web3'
import { makeStyles } from '@masknet/theme'
import { NetworkPluginID, NonFungibleToken } from '@masknet/web3-shared-base'
import { ChainId, NonFungibleAssetProvider, SchemaType } from '@masknet/web3-shared-evm'
import { Typography, CircularProgress } from '@mui/material'
import { CollectibleCard } from '../../../../extension/options-page/DashboardComponents/CollectibleList/CollectibleCard'

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
    contractDetailed: NonFungibleToken<ChainId, SchemaType>
    renderOrder: number
}

export const TokenCard = memo<TokenCardProps>((props: TokenCardProps) => {
    const { contractDetailed, tokenId, renderOrder } = props
    const { classes } = useStyles()
    const { value: tokenDetailed } = useNonFungibleToken(NetworkPluginID.PLUGIN_EVM, contractDetailed.address, tokenId)

    return tokenDetailed ? (
        <>
            <CollectibleCard
                readonly
                provider={NonFungibleAssetProvider.OPENSEA}
                token={tokenDetailed}
                renderOrder={renderOrder}
            />
            <div className={classes.title}>
                <Typography className={classes.name} color="textSecondary" variant="body2">
                    {tokenDetailed.info.name ?? tokenId}
                </Typography>
            </div>
        </>
    ) : (
        <CircularProgress />
    )
})
