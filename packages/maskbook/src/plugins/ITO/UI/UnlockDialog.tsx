import { createStyles, Link, makeStyles, Typography } from '@material-ui/core'
import BigNumber from 'bignumber.js'
import { useCallback, useState } from 'react'
import { v4 as uuid } from 'uuid'
import ActionButton from '../../../extension/options-page/DashboardComponents/ActionButton'
import { useRemoteControlledDialog } from '../../../utils/hooks/useRemoteControlledDialog'
import { useI18N } from '../../../utils/i18n-next-ui'
import { useAccount } from '../../../web3/hooks/useAccount'
import { useChainId } from '../../../web3/hooks/useChainState'
import { useConstant } from '../../../web3/hooks/useConstant'
import { useTokenBalance } from '../../../web3/hooks/useTokenBalance'
import { resolveLinkOnEtherscan } from '../../../web3/pipes'
import { ERC20TokenDetailed, EthereumTokenType } from '../../../web3/types'
import { EthereumERC20TokenApprovedBoundary } from '../../../web3/UI/EthereumERC20TokenApprovedBoundary'
import { EthereumWalletConnectedBoundary } from '../../../web3/UI/EthereumWalletConnectedBoundary'
import { TokenAmountPanel } from '../../../web3/UI/TokenAmountPanel'
import { formatBalance, formatEthereumAddress } from '../../Wallet/formatter'
import { SelectTokenDialogEvent, WalletMessages } from '../../Wallet/messages'
import { ITO_CONSTANTS } from '../constants'

function isMoreThanMillion(allowance: string, decimals: number) {
    return new BigNumber(allowance).isGreaterThan(`100000000000e${decimals}`) // 100 billion
}

const useStyles = makeStyles((theme) =>
    createStyles({
        root: {},
        tip: {
            margin: theme.spacing(1.5, 0, 1),
            fontSize: 10,
        },
        button: {
            marginTop: theme.spacing(1.5),
        },
    }),
)

export interface UnlockDialogProps {
    isMask: boolean
    tokens: ERC20TokenDetailed[]
}

export function UnlockDialog(props: UnlockDialogProps) {
    const { isMask, tokens } = props
    const { t } = useI18N()
    const classes = useStyles()
    const ITO_CONTRACT_ADDRESS = useConstant(ITO_CONSTANTS, 'ITO_CONTRACT_ADDRESS')
    const MASK_ITO_CONTRACT_ADDRESS = useConstant(ITO_CONSTANTS, 'MASK_ITO_CONTRACT_ADDRESS')
    const recipientAddress = isMask ? MASK_ITO_CONTRACT_ADDRESS : ITO_CONTRACT_ADDRESS

    const account = useAccount()
    const chainId = useChainId()

    //#region select token
    const [token, setToken] = useState<ERC20TokenDetailed>(tokens[0])
    const [id] = useState(uuid())
    const [, setSelectTokenDialogOpen] = useRemoteControlledDialog(
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
        setSelectTokenDialogOpen({
            open: true,
            uuid: id,
            disableEther: true,
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
    const amount = new BigNumber(rawAmount || '0').multipliedBy(new BigNumber(10).pow(token?.decimals ?? 0))
    const { value: tokenBalance = '0', loading: loadingTokenBalance } = useTokenBalance(
        token?.type ?? EthereumTokenType.Ether,
        token?.address ?? '',
    )
    //#endregion

    if (!tokens.length) return null

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
            <Typography className={classes.tip} variant="body2" color="textSecondary">
                Allow the contract{' '}
                <Link
                    target="_blank"
                    rel="noopener noreferrer"
                    href={`${resolveLinkOnEtherscan(chainId)}/address/${recipientAddress}`}>
                    {formatEthereumAddress(recipientAddress, 4)}
                </Link>{' '}
                to use your {token.symbol ?? 'Token'} tokens when a new ITO round starts later.
            </Typography>
            <EthereumWalletConnectedBoundary>
                <EthereumERC20TokenApprovedBoundary amount={amount.toFixed()} spender={recipientAddress} token={token}>
                    {(allowance: string) => (
                        <ActionButton className={classes.button} size="large" fullWidth disabled variant="contained">
                            {isMoreThanMillion(allowance, token.decimals)
                                ? t('plugin_ito_amount_approved_infinity', {
                                      symbol: token.symbol ?? 'Token',
                                  })
                                : t('plugin_ito_amount_approved', {
                                      amount: formatBalance(new BigNumber(allowance), token.decimals, 2),
                                      symbol: token.symbol ?? 'Token',
                                  })}
                        </ActionButton>
                    )}
                </EthereumERC20TokenApprovedBoundary>
            </EthereumWalletConnectedBoundary>
        </div>
    )
}
