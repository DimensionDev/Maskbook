import { Icons } from '@masknet/icons'
import { AssetPreviewer } from '@masknet/shared'
import { makeStyles } from '@masknet/theme'
import type { Web3Helper } from '@masknet/web3-helpers'
import { formatTokenId } from '@masknet/web3-shared-evm'
import { Typography } from '@mui/material'
import { memo, type HTMLProps } from 'react'

const useStyles = makeStyles()((theme) => {
    return {
        removeButton: {
            position: 'absolute',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            top: 3,
            right: 3,
            overflow: 'hidden',
            cursor: 'pointer',
            color: 'rgba(255, 53, 69, 1)',
        },
        fallbackImage: {
            minHeight: '0 !important',
            maxWidth: 'none',
            width: 64,
            height: 64,
        },
        preview: {
            height: 'auto',
            aspectRatio: '1 / 1',
            borderRadius: 8,
            overflow: 'hidden',
        },
        card: {
            width: 86,
            position: 'relative',
            borderRadius: 8,
            overflow: 'hidden',
            backgroundColor: theme.palette.maskColor.input,
        },
        cardName: {
            height: 24,
            fontSize: 12,
            fontWeight: 700,
            color: theme.palette.maskColor.main,
            padding: theme.spacing(0.5),
            boxSizing: 'border-box',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
        },
    }
})

interface NFTCardProps extends HTMLProps<HTMLDivElement> {
    token: Web3Helper.NonFungibleAssetAll
    onRemove?: (token: Web3Helper.NonFungibleAssetAll) => void
}

export const NFTCard = memo(function NFTCard({ token, onRemove, className, ...rest }: NFTCardProps) {
    const { classes, cx } = useStyles()
    return (
        <div className={cx(classes.card, className)} {...rest}>
            <AssetPreviewer
                url={token.metadata?.mediaURL || token.metadata?.imageURL}
                classes={{
                    fallbackImage: classes.fallbackImage,
                    root: classes.preview,
                }}
            />
            <Typography className={classes.cardName} color="textSecondary">
                {formatTokenId(token.tokenId, 2)}
            </Typography>
            {onRemove ?
                <Icons.Clear size={20} className={classes.removeButton} />
            :   null}
        </div>
    )
})
