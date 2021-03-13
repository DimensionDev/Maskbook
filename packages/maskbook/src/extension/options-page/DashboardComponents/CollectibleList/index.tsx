import {
    Box,
    Button,
    makeStyles,
    Typography,
} from '@material-ui/core'
import { CollectibleCard } from './Card'
import { useCollectibles } from '../../../../plugins/Wallet/hooks/useCollectibles'
import { AssetProvider } from '../../../../plugins/Wallet/types'
import { useAccount } from '../../../../web3/hooks/useAccount'

const useStyles = makeStyles((theme) => ({
    root: {
        display: 'flex',
        flexWrap: 'wrap',
        padding: theme.spacing(1),
    },
    card: {
        padding: theme.spacing(1),
    },
    description: {
        textAlign: 'center',
        marginTop: theme.spacing(0.5),
    },
}))

export function CollectibleList() {
    const account = useAccount()
    const classes = useStyles()
    const {
        value: collectibles = [],
        loading: collectiblesLoading,
        error: collectiblesError,
        retry: collectiblesRetry,
    } = useCollectibles(account, AssetProvider.OPENSEAN)

    if (collectiblesLoading) return <Typography>Loading...</Typography>

    if (collectiblesError || collectibles.length === 0)
        return (
            <Box
                sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    height: '100%',
                }}>
                <Typography color="textSecondary">No collectible found.</Typography>
                <Button
                    sx={{
                        marginTop: 1,
                    }}
                    variant="text"
                    onClick={() => collectiblesRetry()}>
                    Retry
                </Button>
            </Box>
        )

    return (
        <Box className={classes.root}>
            {collectibles.map((x) => (
                <div className={classes.card} key={x.id}>
                    <CollectibleCard key={x.id} url={x.image_url ?? x.image_preview_url ?? ''} link={x.permalink} />
                    <div className={classes.description}>
                        <Typography color="textSecondary" variant="body2">{x.name}</Typography>
                    </div>
                </div>
            ))}
        </Box>
    )
}
