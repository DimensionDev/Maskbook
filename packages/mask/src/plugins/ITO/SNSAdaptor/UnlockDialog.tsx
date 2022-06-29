import { makeStyles } from '@masknet/theme'
import { formatBalance, FungibleToken, isGreaterThan, NetworkPluginID, rightShift } from '@masknet/web3-shared-base'
import { useCallback, useState } from 'react'
import { SchemaType, formatEthereumAddress, explorerResolver, useITOConstants, ChainId } from '@masknet/web3-shared-evm'
import { Link, Typography } from '@mui/material'
import { Trans } from 'react-i18next'
import { useSelectFungibleToken } from '@masknet/shared'
import ActionButton from '../../../extension/options-page/DashboardComponents/ActionButton'
import { useI18N } from '../../../utils'
import { EthereumERC20TokenApprovedBoundary } from '../../../web3/UI/EthereumERC20TokenApprovedBoundary'
import { WalletConnectedBoundary } from '../../../web3/UI/WalletConnectedBoundary'
import { TokenAmountPanel } from '../../../web3/UI/TokenAmountPanel'
import { useChainId, useFungibleTokenBalance } from '@masknet/plugin-infra/web3'

function isMoreThanMillion(allowance: string, decimals: number) {
    return isGreaterThan(allowance, `100000000000e${decimals}`) // 100 billion
}

const useStyles = makeStyles()((theme) => ({
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
    tokens: Array<FungibleToken<ChainId, SchemaType.ERC20>>
}

export function UnlockDialog(props: UnlockDialogProps) {
    const { tokens } = props
    const { t } = useI18N()
    const { classes } = useStyles()

    const chainId = useChainId(NetworkPluginID.PLUGIN_EVM)
    const { ITO2_CONTRACT_ADDRESS } = useITOConstants(chainId)
    // #region select token
    const [token, setToken] = useState<FungibleToken<ChainId, SchemaType.ERC20>>(tokens[0])
    const selectFungibleToken = useSelectFungibleToken(NetworkPluginID.PLUGIN_EVM)
    const onSelectTokenChipClick = useCallback(async () => {
        const picked = await selectFungibleToken({
            disableNativeToken: true,
            disableSearchBar: true,
            selectedTokens: token?.address ? [token.address] : [],
            whitelist: tokens.map((x) => x.address),
        })
        if (picked) setToken(picked as FungibleToken<ChainId, SchemaType.ERC20>)
    }, [tokens, token?.address])
    // #endregion
    // #region amount
    const [rawAmount, setRawAmount] = useState('')
    const amount = rightShift(rawAmount || '0', token?.decimals)
    const { value: tokenBalance = '0', loading: loadingTokenBalance } = useFungibleTokenBalance(
        NetworkPluginID.PLUGIN_EVM,
        token?.address ?? '',
    )
    // #endregion
    if (!tokens.length) return <Typography>{t('plugin_ito_empty_token')}</Typography>
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
                    <Trans
                        i18nKey="plugin_ito_unlock_tip"
                        components={{
                            contractLink: (
                                <Link
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    href={explorerResolver.addressLink(chainId, ITO2_CONTRACT_ADDRESS)}
                                />
                            ),
                        }}
                        values={{
                            address: formatEthereumAddress(ITO2_CONTRACT_ADDRESS, 4),
                            symbol: token.symbol ?? 'Unknown',
                        }}
                    />
                </Typography>
            ) : null}
            <WalletConnectedBoundary>
                <EthereumERC20TokenApprovedBoundary
                    onlyInfiniteUnlock
                    amount={amount.toFixed()}
                    spender={ITO2_CONTRACT_ADDRESS}
                    token={token}>
                    {(allowance: string) => (
                        <ActionButton className={classes.button} fullWidth disabled>
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
            </WalletConnectedBoundary>
        </div>
    )
}
