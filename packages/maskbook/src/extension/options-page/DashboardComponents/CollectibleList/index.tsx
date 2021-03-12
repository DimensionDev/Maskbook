import {
    Box,
    Button,
    createStyles,
    makeStyles,
    Skeleton,
    Table,
    TableBody,
    TableCell,
    TableRow,
    Typography,
} from '@material-ui/core'
import { useCollectibles } from "../../../../plugins/Wallet/hooks/useCollectibles";
import { AssetProvider } from "../../../../plugins/Wallet/types";
import { useAccount } from "../../../../web3/hooks/useAccount";

export function CollectibleList() {
    const account = useAccount()
    const {
        value: collectibles = [],
        loading: collectiblesLoading,
        error: collectiblesError,
        retry: transactionRetry,
    } = useCollectibles(account, AssetProvider.OPENSEAN)

    if (collectiblesLoading)
        return (
            <Typography>Loading...</Typography>
        )

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
                <Typography color="textSecondary">No transaction found.</Typography>
                <Button
                    sx={{
                        marginTop: 1,
                    }}
                    variant="text"
                    onClick={() => transactionRetry()}>
                    Retry
                </Button>
            </Box>
        )


    return (
        <>
            {
                collectibles.map(x => <Typography>{x.id}</Typography>)
            }
        </>
    )
}
