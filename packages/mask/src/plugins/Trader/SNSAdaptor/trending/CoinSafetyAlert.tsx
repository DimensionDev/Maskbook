import { Alert, AlertTitle, Box, Button, Link, Paper } from '@mui/material'
import { makeStyles } from '@masknet/theme'
import { useI18N } from '../../../../utils'
import type { Coin } from '../../types'
import { useApprovedTokens } from '../../trending/useApprovedTokens'
import { resolveTokenLinkOnExplorer, ChainId, EthereumTokenType } from '@masknet/web3-shared-evm'

const useStyles = makeStyles()((theme) => {
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

export interface CoinSafetyAlertProps {
    coin: Coin
}

export function CoinSafetyAlert(props: CoinSafetyAlertProps) {
    const { coin } = props

    const { t } = useI18N()
    const { classes } = useStyles()
    const { approvedTokens, onApprove } = useApprovedTokens(coin.contract_address)

    if (!coin.contract_address) return null
    if (approvedTokens.some((address) => address === coin.contract_address)) return null

    return (
        <Paper className={classes.root} elevation={0}>
            <Alert variant="outlined" severity="error">
                <AlertTitle>{t('plugin_trader_safety_alert_title')}</AlertTitle>
                {t('plugin_trader_safety_alert')}
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
                        {t('plugin_trader_view_on_etherscan')}
                    </Link>
                    <Button variant="contained" className={classes.approve} onClick={onApprove}>
                        {t('plugin_trader_safety_agree')}
                    </Button>
                </Box>
            </Alert>
        </Paper>
    )
}
