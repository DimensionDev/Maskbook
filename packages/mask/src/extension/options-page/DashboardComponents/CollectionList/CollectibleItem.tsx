import type { NonFungibleAssetProvider, ERC721TokenDetailed, Wallet } from '@masknet/web3-shared-evm'
import { Typography } from '@mui/material'
import { makeStyles } from '@masknet/theme'
import { CollectibleCard } from './CollectibleCard'

const useStyles = makeStyles()((theme) => ({
    card: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        position: 'relative',
        padding: theme.spacing(1),
    },
    description: {
        background: theme.palette.mode === 'light' ? '#F7F9FA' : '#17191D',
        alignSelf: 'stretch',
    },
    name: {
        whiteSpace: 'nowrap',
        textOverflow: 'ellipsis',
        overflow: 'hidden',
        lineHeight: '36px',
        paddingLeft: '8px',
    },
}))

export interface CollectibleItemProps {
    provider: NonFungibleAssetProvider
    wallet?: Wallet
    token: ERC721TokenDetailed
    readonly?: boolean
}

export function CollectibleItem(props: CollectibleItemProps) {
    const { provider, wallet, token, readonly } = props
    const { classes } = useStyles()
    return (
        <div className={classes.card}>
            <CollectibleCard token={token} provider={provider} wallet={wallet} readonly={readonly} />
            <div className={classes.description}>
                <Typography className={classes.name} color="textPrimary" variant="body2">
                    {token.info.name}
                </Typography>
            </div>
        </div>
    )
}
