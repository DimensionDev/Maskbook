import { ERC721TokenDetailed, ChainId, CollectibleProvider, resolveCollectibleLink } from '@masknet/web3-shared-evm'
import { memo } from 'react'
import { Link, Typography } from '@material-ui/core'
import { makeStyles } from '@masknet/theme'
import { MaskColorVar } from '@masknet/theme'
import { CollectiblePlaceholder } from '../CollectiblePlaceHolder'

const useStyles = makeStyles()({
    card: {
        borderRadius: 8,
        width: 140,
        height: 215,
        backgroundColor: MaskColorVar.lightestBackground,
        display: 'flex',
        flexDirection: 'column',
    },
    imgContainer: {
        width: '100%',
        height: 186,
    },
    description: {
        flex: 1,
        padding: '6.5px 7.5px',
    },
    name: {
        whiteSpace: 'nowrap',
        textOverflow: 'ellipsis',
        overflow: 'hidden',
        fontSize: 12,
    },
})

export interface CollectibleCardProps {
    chainId: ChainId
    provider: CollectibleProvider
    token: ERC721TokenDetailed
}

export const CollectibleCard = memo<CollectibleCardProps>(({ chainId, provider, token }) => {
    const { classes } = useStyles()
    return token.info.image ? (
        <div className={classes.card}>
            <Link target="_blank" rel="noopener noreferrer" href={resolveCollectibleLink(chainId, provider, token)}>
                <div className={classes.imgContainer}>
                    <img src={token.info.image} style={{ objectFit: 'contain', width: '100%', height: '100%' }} />
                </div>
            </Link>
            <div className={classes.description}>
                <Typography className={classes.name} color="textPrimary" variant="body2">
                    {token.info.name}
                </Typography>
            </div>
        </div>
    ) : (
        <CollectiblePlaceholder />
    )
})
