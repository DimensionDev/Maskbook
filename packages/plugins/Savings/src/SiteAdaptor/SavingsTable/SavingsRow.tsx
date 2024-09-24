import { FormattedBalance, TokenIcon } from '@masknet/shared'
import { NetworkPluginID } from '@masknet/shared-base'
import { useEverSeen } from '@masknet/shared-base-ui'
import { makeStyles } from '@masknet/theme'
import { useChainContext, useFungibleTokenBalance } from '@masknet/web3-hooks-base'
import { ZERO, formatBalance, isZero, rightShift } from '@masknet/web3-shared-base'
import { Button, Grid, Typography } from '@mui/material'
import { type BigNumber } from 'bignumber.js'
import { memo } from 'react'
import { ProtocolType, type SavingsProtocol } from '../../types.js'
import { ProviderIconURLs } from '../IconURL.js'
import { useApr, useBalance } from '../hooks/index.js'
import { Trans } from '@lingui/macro'

const useStyles = makeStyles()((theme, props) => ({
    tableRow: {
        display: 'flex',
        background: theme.palette.maskColor.bg,
        borderRadius: theme.spacing(1),
        marginBottom: theme.spacing(1),

        '&:last-child': {
            marginBottom: 0,
        },
    },
    tableCell: {
        display: 'flex',
        alignItems: 'center',
        padding: '15px',
        fontSize: '14px',
    },
    logoWrap: {
        position: 'relative',
        margin: '0 20px 0 0',
    },
    logo: {
        width: '32px',
        height: '32px',
    },
    logoMini: {
        height: '16px',
        position: 'absolute',
        bottom: 0,
        right: '-5px',
    },
    protocolLabel: {},
}))

interface SavingsRowProps {
    protocol: SavingsProtocol
    isDeposit: boolean
    onWithdraw?(protocol: SavingsProtocol): void
    onDeposit?(protocol: SavingsProtocol): void
}

export const SavingsRow = memo(function SavingsRow({ protocol, isDeposit, onWithdraw, onDeposit }: SavingsRowProps) {
    const { classes } = useStyles()
    const { chainId } = useChainContext<NetworkPluginID.PLUGIN_EVM>()
    const [seen, ref] = useEverSeen()

    const { data: apr = '0.00', isFetching: isFetchingApr } = useApr(protocol, isDeposit && seen)
    const { data: balance = ZERO, isSuccess } = useBalance(protocol, !isDeposit || seen)

    if (!isDeposit && isSuccess && balance.isZero()) return null

    return (
        <Grid container spacing={0} className={classes.tableRow} ref={ref}>
            <Grid item xs={4} className={classes.tableCell}>
                <div className={classes.logoWrap}>
                    <TokenIcon
                        name={protocol.bareToken.name}
                        address={protocol.bareToken.address}
                        className={classes.logo}
                        chainId={chainId}
                    />
                    <img src={ProviderIconURLs[protocol.type]} className={classes.logoMini} />
                </div>
                <div>
                    <Typography variant="body1" className={classes.protocolLabel}>
                        {protocol.bareToken.symbol}
                    </Typography>
                </div>
            </Grid>
            {isDeposit ?
                <Grid item xs={2} className={classes.tableCell}>
                    <Typography variant="body1">
                        {isFetchingApr && apr === '0.00' ? '--' : `${Number(apr).toFixed(2)}%`}
                    </Typography>
                </Grid>
            :   null}
            <Grid item xs={isDeposit ? 3 : 5} className={classes.tableCell}>
                <FungibleTokenBalance isDeposit={isDeposit} protocol={protocol} protocolBalance={balance} />
            </Grid>
            <Grid item xs={3} className={classes.tableCell}>
                <Button
                    color="primary"
                    disabled={!isDeposit ? isZero(balance) : false}
                    onClick={() => {
                        if (!isDeposit && protocol.type === ProtocolType.Lido) {
                            onWithdraw?.(protocol)
                            return
                        }
                        onDeposit?.(protocol)
                    }}>
                    {isDeposit ?
                        <Trans>Deposit</Trans>
                    :   <Trans>Withdraw</Trans>}
                </Button>
            </Grid>
        </Grid>
    )
})

interface Props {
    protocol: SavingsProtocol
    isDeposit?: boolean
    protocolBalance: BigNumber
}
function FungibleTokenBalance({ protocol, isDeposit, protocolBalance }: Props) {
    const { data: tokenBalance = '0' } = useFungibleTokenBalance(
        NetworkPluginID.PLUGIN_EVM,
        isDeposit ? protocol.bareToken.address : '',
        { chainId: protocol.bareToken.chainId },
    )

    return (
        <Typography variant="body1">
            <FormattedBalance
                value={isDeposit ? tokenBalance : protocolBalance}
                decimals={protocol.bareToken.decimals}
                significant={6}
                minimumBalance={rightShift(10, protocol.bareToken.decimals - 6)}
                formatter={formatBalance}
            />
        </Typography>
    )
}
