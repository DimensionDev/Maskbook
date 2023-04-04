import { unreachable } from '@masknet/kit'
import { TokenIcon } from '@masknet/shared'
import { ActionButton, type ActionButtonProps, makeStyles, ShadowRootTooltip } from '@masknet/theme'
import { ApproveStateType, useERC20TokenApproveCallback } from '@masknet/web3-hooks-evm'
import type { FungibleToken } from '@masknet/web3-shared-base'
import type { ChainId, SchemaType } from '@masknet/web3-shared-evm'
import { HelpOutline } from '@mui/icons-material'
import { noop } from 'lodash-es'
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
    onlyInfiniteUnlock?: boolean
    contractName?: string
    showHelperToken?: boolean
    failedContent?: React.ReactNode
}

export function EthereumERC20TokenApprovedBoundary(props: EthereumERC20TokenApprovedBoundaryProps) {
    const {
        children = null,
        amount,
        spender,
        token,
        fallback,
        infiniteUnlockContent,
        contractName,
        showHelperToken = true,
        failedContent,
    } = props

    const t = useSharedI18N()
    const { classes } = useStyles(undefined, { props })

    const [{ type: approveStateType, allowance }, transactionState, approveCallback, resetApproveCallback] =
        useERC20TokenApproveCallback(token?.address ?? '', amount, spender ?? '', noop, token?.chainId)

    const onApprove = useCallback(async () => {
        if (approveStateType !== ApproveStateType.NOT_APPROVED) return
        await approveCallback(false)
    }, [approveStateType, transactionState, approveCallback])

    // not a valid erc20 token, please given token as undefined
    if (!token) return <>{typeof children === 'function' ? children(allowance) : children}</>

    if (approveStateType === ApproveStateType.UNKNOWN)
        return (
            <ActionButton
                className={classes.button}
                fullWidth
                variant="contained"
                disabled
                {...props.ActionButtonProps}>
                {fallback ?? t.wallet_transfer_error_amount_absence()}
            </ActionButton>
        )
    if (approveStateType === ApproveStateType.FAILED)
        return (
            <ActionButton
                className={classes.button}
                fullWidth
                variant="contained"
                onClick={resetApproveCallback}
                {...props.ActionButtonProps}>
                {failedContent ?? t.wallet_load_retry({ symbol: token.symbol ?? token.name ?? 'Token' })}
            </ActionButton>
        )
    if (
        approveStateType === ApproveStateType.NOT_APPROVED ||
        transactionState.loading ||
        approveStateType === ApproveStateType.UPDATING
    )
        return (
            <ActionButton
                loading={transactionState.loading || approveStateType === ApproveStateType.UPDATING}
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
    if (approveStateType === ApproveStateType.APPROVED)
        return <>{typeof children === 'function' ? children(allowance) : children}</>

    unreachable(approveStateType)
}
