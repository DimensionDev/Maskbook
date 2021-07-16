import { Link, makeStyles, Typography } from '@material-ui/core'
import BigNumber from 'bignumber.js'
import { useCallback, useState } from 'react'
import { v4 as uuid } from 'uuid'
import { FormattedAddress, useRemoteControlledDialog } from '@masknet/shared'
import { useI18N } from '../../../utils'
import ActionButton from '../../../extension/options-page/DashboardComponents/ActionButton'
import {
    useITOConstants,
    ERC20TokenDetailed,
    EthereumTokenType,
    formatBalance,
    isGreaterThan,
    pow10,
    resolveAddressLinkOnExplorer,
    useChainId,
    useTokenBalance,
} from '@masknet/web3-shared'
import { EthereumERC20TokenApprovedBoundary } from '../../../web3/UI/EthereumERC20TokenApprovedBoundary'
import { EthereumWalletConnectedBoundary } from '../../../web3/UI/EthereumWalletConnectedBoundary'
import { TokenAmountPanel } from '../../../web3/UI/TokenAmountPanel'
import { SelectTokenDialogEvent, WalletMessages } from '../../Wallet/messages'

function isMoreThanMillion(allowance: string, decimals: number) {
    return isGreaterThan(allowance, `100000000000e${decimals}`) // 100 billion
}

const useStyles = makeStyles((theme) => ({
    root: {},
    tip: {
        margin: theme.spacing(1.5, 0, 1),
        fontSize: 10,
    },
    button: {
        marginTop: theme.spacing(1.5),
    },
}))

export interface UnlockDialogProps {
    tokens: ERC20TokenDetailed[]
}

export function UnlockDialog(props: UnlockDialogProps) {
    const { tokens } = props
    const { t } = useI18N()
    const classes = useStyles()

    const { ITO2_CONTRACT_ADDRESS } = useITOConstants()
    const chainId = useChainId()

    //#region select token
    const [token, setToken] = useState<ERC20TokenDetailed>(tokens[0])
    const [id] = useState(uuid())
    const { setDialog: setSelectTokenDialog } = useRemoteControlledDialog(
        WalletMessages.events.selectTokenDialogUpdated,
        useCallback(
            (ev: SelectTokenDialogEvent) => {
                if (ev.open || !ev.token || ev.uuid !== id) return
                if (ev.token.type !== EthereumTokenType.ERC20) return
                setToken(ev.token)
            },
            [id],
        ),
    )
    const onSelectTokenChipClick = useCallback(() => {
        setSelectTokenDialog({
            open: true,
            uuid: id,
            disableNativeToken: true,
            disableSearchBar: true,
            FixedTokenListProps: {
                selectedTokens: token ? [token.address] : [],
                whitelist: tokens.map((x) => x.address),
            },
        })
    }, [id, token?.address])
    //#endregion

    //#region amount
    const [rawAmount, setRawAmount] = useState('')
    const amount = new BigNumber(rawAmount || '0').multipliedBy(pow10(token?.decimals ?? 0))
    const { value: tokenBalance = '0', loading: loadingTokenBalance } = useTokenBalance(
        token?.type ?? EthereumTokenType.Native,
        token?.address ?? '',
    )
    //#endregion

    if (!tokens.length) return <Typography>No need to unlock any token on this ITO.</Typography>

    return (
        <div className={classes.root}>
            <TokenAmountPanel
                label="Amount"
                amount={rawAmount}
                balance={tokenBalance ?? '0'}
                token={token}
                onAmountChange={setRawAmount}
                SelectTokenChip={{
                    loading: loadingTokenBalance,
                    ChipProps: {
                        onClick: onSelectTokenChipClick,
                    },
                }}
            />
            {ITO2_CONTRACT_ADDRESS ? (
                <Typography className={classes.tip} variant="body2" color="textSecondary">
                    Allow the contract{' '}
                    <Link
                        target="_blank"
                        rel="noopener noreferrer"
                        href={resolveAddressLinkOnExplorer(chainId, ITO2_CONTRACT_ADDRESS)}>
                        <FormattedAddress address={ITO2_CONTRACT_ADDRESS} size={4} />
                    </Link>{' '}
                    to use your {token.symbol ?? 'Token'} tokens when a new ITO round starts later.
                </Typography>
            ) : null}
            <EthereumWalletConnectedBoundary>
                <EthereumERC20TokenApprovedBoundary
                    amount={amount.toFixed()}
                    spender={ITO2_CONTRACT_ADDRESS}
                    token={token}>
                    {(allowance: string) => (
                        <ActionButton className={classes.button} size="large" fullWidth disabled variant="contained">
                            {isMoreThanMillion(allowance, token.decimals)
                                ? t('plugin_ito_amount_unlocked_infinity', {
                                      symbol: token.symbol ?? 'Token',
                                  })
                                : t('plugin_ito_amount_unlocked', {
                                      amount: formatBalance(allowance, token.decimals, 2),
                                      symbol: token.symbol ?? 'Token',
                                  })}
                        </ActionButton>
                    )}
                </EthereumERC20TokenApprovedBoundary>
            </EthereumWalletConnectedBoundary>
        </div>
    )
}
