import { makeStyles } from '@masknet/theme'
import { ERC721ContractDetailed, NonFungibleAssetProvider, useERC721TokenDetailed } from '@masknet/web3-shared-evm'
import { Typography, CircularProgress } from '@mui/material'
import { memo } from 'react'
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
    contractDetailed: ERC721ContractDetailed
}

export const TokenCard = memo<TokenCardProps>((props: TokenCardProps) => {
    const { contractDetailed, tokenId } = props
    const { classes } = useStyles()
    const { tokenDetailed } = useERC721TokenDetailed(contractDetailed, tokenId)

    return tokenDetailed ? (
        <>
            <CollectibleCard readonly provider={NonFungibleAssetProvider.OPENSEA} token={tokenDetailed} />
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
