import { useCallback } from 'react'
import { makeStyles } from '@masknet/theme'
import { Grid, Typography } from '@mui/material'
import { NetworkPluginID } from '@masknet/web3-shared-base'

import { useI18N } from '../locales'
import type { DepositDialogInterface } from '../types'
import { roundValue } from '../helpers'

import ActionButton from '../../../extension/options-page/DashboardComponents/ActionButton'
import { WalletConnectedBoundary } from '../../../web3/UI/WalletConnectedBoundary'
import { ChainBoundary } from '../../../web3/UI/ChainBoundary'

import { useSharedStyles } from './styles'

const useStyles = makeStyles()((theme) => ({
    container: {
        fontFamily: theme.typography.fontFamily,
        padding: `${theme.spacing(3)} 0`,
    },
    row: {
        display: 'flex',
        justifyContent: 'space-between',
        color: theme.palette.text.secondary,
        marginBottom: '12px',
        fontSize: '1rem',
    },
    total: {
        fontWeight: 600,
    },
}))

export function Deposit(props: DepositDialogInterface | undefined) {
    const t = useI18N()
    const { classes } = useStyles()
    const { classes: sharedClasses } = useSharedStyles()

    const onClickDeposit = useCallback(async () => {
        props?.deposit && (await props.deposit.onDeposit())
    }, [props])

    if (!props?.deposit) return null

    const { deposit } = props
    const totalDeposit = roundValue(
        Number.parseFloat(deposit.totalFarmReward) + deposit.attraceFee,
        deposit.token?.decimals,
    )

    return (
        <Grid container display="flex" flexDirection="column" className={classes.container}>
            <Grid item xs={12}>
                <Typography fontWeight={600} variant="h6" marginBottom="24px">
                    {t.deposit_total_rewards()}
                </Typography>
            </Grid>
            <Grid item xs={12} className={classes.row}>
                {t.total_farm_rewards()}
                <span>
                    {roundValue(deposit.totalFarmReward)} {deposit.token?.symbol}
                </span>
            </Grid>
            <Grid item xs={12} className={classes.row}>
                {t.attrace_fees()}
                <span>
                    {roundValue(deposit.attraceFee)} {deposit.token?.symbol}
                </span>
            </Grid>
            <Grid item xs={12} className={`${classes.row} ${classes.total}`}>
                {t.deposit_total()}
                <span>
                    {totalDeposit} {deposit.token?.symbol}
                </span>
            </Grid>
            <Grid item xs={12} marginTop="24px">
                <ChainBoundary expectedChainId={deposit.requiredChainId} expectedPluginID={NetworkPluginID.PLUGIN_EVM}>
                    <WalletConnectedBoundary classes={{ connectWallet: sharedClasses.switchButton }}>
                        <ActionButton fullWidth variant="contained" size="medium" onClick={onClickDeposit}>
                            {t.deposit()} {totalDeposit} {deposit.token?.symbol}
                        </ActionButton>
                    </WalletConnectedBoundary>
                </ChainBoundary>
            </Grid>
        </Grid>
    )
}
