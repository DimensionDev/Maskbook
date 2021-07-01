import { Alert, AlertTitle, Box, Button, Link, makeStyles, Paper } from '@material-ui/core'
import { useI18N } from '../../../../utils'
import type { Coin } from '../../types'
import { useApprovedTokens } from '../../trending/useApprovedTokens'
import { resolveTokenLinkOnExplorer, ChainId, EthereumTokenType } from '@masknet/web3-shared'

const useStyles = makeStyles((theme) => {
    return {
        root: {
            padding: theme.spacing(0, 2, 2, 2),
        },
        approve: {
            marginLeft: theme.spacing(1),
            whiteSpace: 'nowrap',
            backgroundColor: theme.palette.error.main,
            color: theme.palette.error.contrastText,
            '&:hover': {
                backgroundColor: theme.palette.error.main,
            },
        },
    }
})

export interface CoinSaftyAlertProps {
    coin: Coin
}

export function CoinSaftyAlert(props: CoinSaftyAlertProps) {
    const { coin } = props

    const { t } = useI18N()
    const classes = useStyles()
    const { approvedTokens, onApprove } = useApprovedTokens(coin.contract_address)

    if (!coin.contract_address) return null
    if (approvedTokens.some((address) => address === coin.contract_address)) return null

    return (
        <Paper className={classes.root} elevation={0}>
            <Alert variant="outlined" severity="error">
                <AlertTitle>Token Safety Alert</AlertTitle>
                Anyone can create and name any ERC20 token on Ethereum, including creating fake versions of existing
                tokens and tokens that claim to represent projects that do not have a token. Similar to Etherscan, this
                site automatically tracks analytics for all ERC20 tokens independent of token integrity. Please do your
                own research before interacting with any ERC20 token.
                <Box display="flex" alignItems="center" justifyContent="space-between">
                    <Link
                        color="primary"
                        target="_blank"
                        rel="noopener noreferrer"
                        href={resolveTokenLinkOnExplorer({
                            type: EthereumTokenType.Native,
                            address: coin.contract_address,
                            chainId: ChainId.Mainnet,
                        })}>
                        View on Etherscan
                    </Link>
                    <Button variant="contained" className={classes.approve} onClick={onApprove}>
                        I understand
                    </Button>
                </Box>
            </Alert>
        </Paper>
    )
}
