import { unreachable } from '@masknet/kit'
import { TokenIcon } from '@masknet/shared'
import { NetworkPluginID } from '@masknet/shared-base'
import { ActionButton, ShadowRootTooltip, makeStyles, type ActionButtonProps } from '@masknet/theme'
import { useChainContext, useFungibleTokenSpenders } from '@masknet/web3-hooks-base'
import { ApproveStateType, useERC20TokenApproveCallback } from '@masknet/web3-hooks-evm'
import { isGte, isSameAddress, type FungibleToken } from '@masknet/web3-shared-base'
import type { ChainId, SchemaType } from '@masknet/web3-shared-evm'
import { HelpOutline } from '@mui/icons-material'
import React, { useCallback } from 'react'
import { useSharedI18N } from '../../../locales/index.js'

const useStyles = makeStyles<void, 'icon'>()((theme, _, refs) => ({
    icon: {},
    button: {
        whiteSpace: 'nowrap',
        // increase selector priority over button's
        [`.${refs.icon}`]: {
            width: 18,
            height: 18,
            fontSize: 10,
        },
    },
    helpIcon: {
        width: 18,
        height: 18,
    },
}))

export interface EthereumERC20TokenApprovedBoundaryProps extends withClasses<'button' | 'container'> {
    amount: string
    spender?: string
    token?: FungibleToken<ChainId, SchemaType>
    fallback?: React.ReactNode
    children?: React.ReactNode | ((allowance: string) => React.ReactNode)
    infiniteUnlockContent?: React.ReactNode
    ActionButtonProps?: ActionButtonProps
    contractName?: string
    showHelperToken?: boolean
    failedContent?: React.ReactNode
    callback?: () => void
}

export function EthereumERC20TokenApprovedBoundary(props: EthereumERC20TokenApprovedBoundaryProps) {
    const {
        children = null,
        amount,
        spender,
        token,
        infiniteUnlockContent,
        contractName,
        showHelperToken = true,
        failedContent,
        callback,
    } = props

    const t = useSharedI18N()
    const { classes } = useStyles(undefined, { props })
    const { account, chainId } = useChainContext<NetworkPluginID.PLUGIN_EVM>({ chainId: token?.chainId })

    const {
        data: spenders,
        isLoading: spendersLoading,
        isError,
        refetch,
    } = useFungibleTokenSpenders(NetworkPluginID.PLUGIN_EVM, {
        chainId,
        account,
    })

    const [{ type: approveStateType, allowance }, transactionState, approveCallback] = useERC20TokenApproveCallback(
        token?.address ?? '',
        amount,
        spender ?? '',
        () => {
            callback?.()
            refetch()
        },
        token?.chainId,
    )

    const approved =
        isGte(allowance, amount) ||
        spenders?.some((x) => isSameAddress(x.tokenInfo.address, token?.address) && isSameAddress(x.address, spender))

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
                {failedContent ?? t.wallet_load_retry({ symbol: token.symbol ?? token.name ?? 'Token' })}
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
                        className={classes.icon}
                        address={token.address}
                        chainId={token.chainId}
                        name={token.name}
                        disableDefaultIcon
                    />
                }
                endIcon={
                    showHelperToken ? (
                        <ShadowRootTooltip
                            title={t.plugin_wallet_token_infinite_unlock_tips({
                                provider: contractName ?? '',
                                symbol: token.symbol,
                            })}
                            placement="top"
                            arrow
                            leaveDelay={2000}
                            disableInteractive
                            disableFocusListener
                            disableTouchListener>
                            <HelpOutline className={classes.helpIcon} />
                        </ShadowRootTooltip>
                    ) : null
                }
                onClick={onApprove}
                {...props.ActionButtonProps}>
                {infiniteUnlockContent ?? t.plugin_wallet_token_infinite_unlock({ symbol: token.symbol })}
            </ActionButton>
        )
    if (approved) return <>{typeof children === 'function' ? children(allowance) : children}</>

    unreachable(approved)
}
