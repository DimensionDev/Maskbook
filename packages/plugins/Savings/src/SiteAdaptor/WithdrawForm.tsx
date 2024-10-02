import {
    FormattedCurrency,
    FungibleTokenInput,
    InjectedDialog,
    PluginWalletStatusBar,
    useOpenShareTxDialog,
} from '@masknet/shared'
import { Box, DialogActions, DialogContent, Typography } from '@mui/material'
import { useState } from 'react'
import {
    useAccount,
    useChainContext,
    useFungibleTokenBalance,
    useFungibleTokenPrice,
    useNetworkContext,
} from '@masknet/web3-hooks-base'
import { formatCurrency, isZero } from '@masknet/web3-shared-base'
import { BigNumber } from 'bignumber.js'
import { ActionButton, makeStyles } from '@masknet/theme'
import { useQuery } from '@tanstack/react-query'
import { EVMChainResolver, EVMWeb3, Lido } from '@masknet/web3-providers'
import { differenceInDays } from 'date-fns'
import type { SavingsProtocol } from '../types.js'
import { type ChainId, formatAmount } from '@masknet/web3-shared-evm'
import { add } from 'lodash-es'
import { useAsyncFn } from 'react-use'
import { share } from '@masknet/plugin-infra/content-script/context'
import { type NetworkPluginID, Sniffings } from '@masknet/shared-base'
import { queryClient } from '@masknet/shared-base-ui'
import { Trans, msg } from '@lingui/macro'
import { useLingui } from '@lingui/react'

const useStyles = makeStyles()((theme) => ({
    value: {
        textAlign: 'right',
        fontWeight: 700,
        marginTop: theme.spacing(1),
    },
    row: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    title: {
        color: theme.palette.maskColor.second,
    },
    tips: {
        fontSize: 14,
        color: theme.palette.maskColor.second,
        lineHeight: '18px',
        marginTop: theme.spacing(2),
    },
    minimum: {
        color: theme.palette.maskColor.danger,
        margin: theme.spacing(1, 0),
    },
}))

interface WithdrawFormDialogProps {
    onClose?: () => void
    chainId: ChainId
    protocol: SavingsProtocol
}

const MINIMUM_AMOUNT = '0.000000000000000001'

export function WithdrawFormDialog({ onClose, chainId, protocol }: WithdrawFormDialogProps) {
    const { _ } = useLingui()
    const { classes } = useStyles()
    const [amount, setAmount] = useState('0')

    const token = protocol.stakeToken

    const { pluginID } = useNetworkContext()
    const { chainId: actualChainId } = useChainContext<NetworkPluginID.PLUGIN_EVM>()
    const { data: balance } = useFungibleTokenBalance(pluginID, token.address, { chainId })
    const { data: price } = useFungibleTokenPrice(pluginID, token.address, { chainId })
    const account = useAccount()
    const { data: time } = useQuery({
        enabled: !isZero(amount),
        queryKey: ['savings', 'lido', 'time', amount],
        queryFn: async () => {
            if (!amount) return
            return Lido.getLidoWaitingTime(amount)
        },
    })

    const openShareTxDialog = useOpenShareTxDialog()

    const isMinimum = !!amount && !isZero(amount) && new BigNumber(amount).lte(MINIMUM_AMOUNT)

    const [{ loading }, handleWithdraw] = useAsyncFn(async () => {
        if (!time) return

        if (chainId !== actualChainId) {
            await EVMWeb3.switchChain(chainId)
        }
        const hash = await protocol?.withdraw(
            account,
            chainId,
            EVMWeb3.getWeb3({ chainId }),
            formatAmount(amount, token.decimals),
        )

        if (typeof hash !== 'string') {
            throw new Error('Failed to deposit token.')
        } else {
            queryClient.invalidateQueries({
                queryKey: ['savings', 'balance', chainId, protocol.bareToken.address, account],
            })
        }

        const promote = {
            amount,
            symbol: protocol.bareToken.symbol,
            chain: EVMChainResolver.chainName(chainId) ?? '',
            account: Sniffings.is_twitter_page ? _(msg`realMaskNetwork`) : _(msg`masknetwork`),
        }

        await openShareTxDialog({
            hash,
            onShare() {
                share?.(
                    _(
                        msg`Hi friends, I just withdrew my deposit ${promote.amount} ${promote.symbol} on ${promote.chain}. Follow @${promote.account} to find more staking projects.`,
                    ),
                )
            },
        })
    }, [protocol, time, chainId, amount, token.decimals, actualChainId])

    return (
        <InjectedDialog open title={<Trans>Withdraw</Trans>} onClose={onClose}>
            <DialogContent style={{ minHeight: 492 }}>
                <FungibleTokenInput
                    amount={amount}
                    maxAmount={balance || '0'}
                    balance={balance || '0'}
                    onAmountChange={setAmount}
                    label={<Trans>Withdraw</Trans>}
                    token={token}
                />
                {isMinimum ?
                    <Typography className={classes.minimum}>
                        <Trans>
                            Minimum withdraw amount is {MINIMUM_AMOUNT} {token.symbol}
                        </Trans>
                    </Typography>
                :   null}
                <Typography className={classes.value}>
                    {' ≈ '}
                    <FormattedCurrency
                        value={new BigNumber(price || 0).times(amount)}
                        formatter={formatCurrency}
                        options={{ onlyRemainTwoOrZeroDecimal: true }}
                    />
                </Typography>
                <Box className={classes.row}>
                    <Typography className={classes.title}>
                        <Trans>Lido Exchange Rate</Trans>
                    </Typography>
                    <Typography className={classes.value}>
                        1 {token?.symbol} = 1 {protocol.bareToken.symbol}
                    </Typography>
                </Box>
                {time ?
                    <>
                        <Box className={classes.row}>
                            <Typography className={classes.title}>
                                <Trans>Waiting time</Trans>
                            </Typography>
                            <Typography className={classes.value}>
                                <Trans>{add(differenceInDays(new Date(time), new Date()), 1).toString()} days</Trans>
                            </Typography>
                        </Box>
                        <Typography className={classes.tips}>
                            <Trans>
                                To use Lido, you need to wait{' '}
                                {add(differenceInDays(new Date(time), new Date()), 1).toString()} days. Using other swap
                                aggregators is faster, but the exchange rate is lower than 1:1.
                            </Trans>
                        </Typography>
                    </>
                :   null}
            </DialogContent>
            <DialogActions style={{ padding: 0, position: 'sticky', bottom: 0 }}>
                <PluginWalletStatusBar expectedChainId={chainId}>
                    <ActionButton disabled={isMinimum} loading={loading} fullWidth onClick={handleWithdraw}>
                        <Trans>Withdraw {protocol.bareToken.symbol ?? ''}</Trans>
                    </ActionButton>
                </PluginWalletStatusBar>
            </DialogActions>
        </InjectedDialog>
    )
}
