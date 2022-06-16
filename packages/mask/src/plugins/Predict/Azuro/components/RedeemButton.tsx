import { Grid } from '@mui/material'
import LoadingButton from '@mui/lab/LoadingButton'
import { makeStyles } from '@masknet/theme'
import { useI18N } from '../../../../utils/i18n-next-ui'
import type { UserBet } from '../types'
import { useAsyncFn } from 'react-use'
import { useAzuroContract } from '../hooks/useAzuroContract'
import { useAccount } from '@masknet/plugin-infra/web3'
import { NetworkPluginID } from '@masknet/web3-shared-base'

const useStyles = makeStyles()((theme) => ({
    redeemButton: {
        background: theme.palette.success.light,
    },
}))

interface RedeemButtonProps {
    bet: UserBet
    retry: () => void
}

export function RedeemButton(props: RedeemButtonProps) {
    const { t } = useI18N()
    const { bet, retry } = props
    const { classes } = useStyles()
    const azuroContract = useAzuroContract()
    const account = useAccount(NetworkPluginID.PLUGIN_EVM)

    const [{ loading, error }, doFetch] = useAsyncFn(async () => {
        const config = {
            from: account,
            gas: await azuroContract?.methods.withdrawPayout(bet.nftId).estimateGas({ from: account }),
        }

        const tx = await azuroContract?.methods.withdrawPayout(bet.nftId).send(config)
        const txHash = tx?.transactionHash

        retry()
    }, [bet.nftId, retry])

    const isRedeemable = (bet.result > 0 && bet.gameInfo.state === 1) || bet.gameInfo.state === 2

    return (
        <Grid textAlign="center">
            {isRedeemable ? (
                <LoadingButton
                    onClick={() => doFetch()}
                    className={classes.redeemButton}
                    size="small"
                    loading={loading}
                    disabled={bet.isRedeemed || loading}>
                    {bet.isRedeemed ? t('plugin_azuro_redeemed') : t('plugin_azuro_redeem')}
                </LoadingButton>
            ) : null}
        </Grid>
    )
}
