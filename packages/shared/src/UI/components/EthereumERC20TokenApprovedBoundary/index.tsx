import { Icons } from '@masknet/icons'
import { unreachable } from '@masknet/kit'
import { TokenIcon } from '@masknet/shared'
import { NetworkPluginID } from '@masknet/shared-base'
import { ActionButton, ShadowRootTooltip, makeStyles, type ActionButtonProps } from '@masknet/theme'
import { useChainContext, useFungibleTokenBalance, useFungibleTokenSpenders } from '@masknet/web3-hooks-base'
import { ApproveStateType, useERC20TokenApproveCallback } from '@masknet/web3-hooks-evm'
import { isGte, isSameAddress, rightShift, type FungibleToken } from '@masknet/web3-shared-base'
import type { ChainId, SchemaType } from '@masknet/web3-shared-evm'
import { Trans } from '@lingui/react/macro'
import { useCallback, useMemo } from 'react'

const useStyles = makeStyles()(() => ({
    button: {
        whiteSpace: 'nowrap',
    },
}))

export interface EthereumERC20TokenApprovedBoundaryProps extends withClasses<'button' | 'container'> {
    amount: string
    balance?: string
    spender?: string
    token?: FungibleToken<ChainId, SchemaType>
    fallback?: React.ReactNode
    children?: React.ReactNode | ((allowance: string) => React.ReactNode)
    infiniteUnlockContent?: React.ReactNode
    ActionButtonProps?: ActionButtonProps
    contractName?: string
    showHelperToken?: boolean
    failedContent?: React.ReactNode
    tooltip?: string
    callback?: () => void
}

export function EthereumERC20TokenApprovedBoundary(props: EthereumERC20TokenApprovedBoundaryProps) {
    const {
        children = null,
        amount,
        balance,
        spender,
        token,
        infiniteUnlockContent,
        contractName,
        showHelperToken = true,
        failedContent,
        callback,
        tooltip,
    } = props
    const { classes } = useStyles(undefined, { props })
    const { account, chainId } = useChainContext<NetworkPluginID.PLUGIN_EVM>({ chainId: token?.chainId })
    const { data: tokenBalance } = useFungibleTokenBalance(NetworkPluginID.PLUGIN_EVM, token?.address, {
        chainId,
    })

    const {
        data: spenders,
        isPending: spendersLoading,
        isError,
        refetch,
    } = useFungibleTokenSpenders(NetworkPluginID.PLUGIN_EVM, {
        chainId,
        account,
    })

    const approveAmount = balance || tokenBalance || amount
    const [{ type: approveStateType, allowance }, transactionState, approveCallback] = useERC20TokenApproveCallback(
        token?.address ?? '',
        approveAmount,
        spender ?? '',
        () => {
            callback?.()
            refetch()
        },
        token?.chainId,
    )
    const approved = useMemo(() => {
        if (isGte(allowance, amount)) return true
        if (!token?.address || !spenders?.length) return false
        return spenders.some((x) => {
            return (
                isSameAddress(x.tokenInfo.address, token.address) &&
                isSameAddress(x.address, spender) &&
                isGte(rightShift(x.amount || 0, x.tokenInfo.decimals || token.decimals), amount)
            )
        })
    }, [allowance, amount, spenders, token?.address, token?.decimals, spender])

    const loading =
        spendersLoading ||
        approveStateType === ApproveStateType.UPDATING ||
        transactionState.loadingApprove ||
        transactionState.loading

    const onApprove = useCallback(async () => {
        if (approved || loading) return
        await approveCallback(true)
    }, [approved, loading, approveCallback])

    // not a valid erc20 token, please given token as undefined
    if (!token) return <>{typeof children === 'function' ? children(allowance) : children}</>

    if (isError)
        return (
            <ActionButton
                className={classes.button}
                fullWidth
                variant="contained"
                onClick={() => refetch()}
                {...props.ActionButtonProps}>
                {failedContent ?? (
                    <Trans>Failed to load {token.symbol ?? token.name ?? 'Token'}. Click to retry.</Trans>
                )}
            </ActionButton>
        )
    if (loading || !approved)
        return (
            <ActionButton
                loading={loading}
                className={classes.button}
                fullWidth
                variant="contained"
                startIcon={
                    <TokenIcon
                        address={token.address}
                        size={18}
                        chainId={token.chainId}
                        name={token.name}
                        disableDefaultIcon
                        disableBadge
                    />
                }
                endIcon={
                    showHelperToken ?
                        <ShadowRootTooltip
                            title={
                                tooltip ?? (
                                    <Trans>
                                        You must give the {contractName ?? ''} smart contract permission to use your{' '}
                                        {token.symbol}. You only have to do this once per token.
                                    </Trans>
                                )
                            }
                            placement="top"
                            arrow
                            leaveDelay={2000}
                            disableInteractive
                            disableFocusListener
                            disableTouchListener>
                            <Icons.Questions size={18} />
                        </ShadowRootTooltip>
                    :   null
                }
                onClick={onApprove}
                {...props.ActionButtonProps}>
                {infiniteUnlockContent ?? (
                    <>
                        <TokenIcon
                            size={18}
                            style={{ marginRight: 8 }}
                            chainId={token.chainId}
                            address={token.address}
                            disableBadge
                        />
                        <Trans>Unlock {token.symbol}</Trans>
                    </>
                )}
            </ActionButton>
        )
    if (approved) return <>{typeof children === 'function' ? children(allowance) : children}</>

    unreachable(approved)
}
