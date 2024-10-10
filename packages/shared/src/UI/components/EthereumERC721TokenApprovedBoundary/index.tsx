import { useEffect, useMemo } from 'react'
import type { ChainId, SchemaType } from '@masknet/web3-shared-evm'
import { makeStyles, type ActionButtonProps, ActionButton } from '@masknet/theme'
import { useWeb3Utils } from '@masknet/web3-hooks-base'
import type { NonFungibleCollection } from '@masknet/web3-shared-base'
import { useERC721ContractIsApproveForAll, useERC721ContractSetApproveForAllCallback } from '@masknet/web3-hooks-evm'
import { Trans } from '@lingui/macro'

const useStyles = makeStyles()(() => ({}))

export interface EthereumERC712TokenApprovedBoundaryProps extends withClasses<'approveButton'> {
    children?: React.ReactNode
    owner: string | undefined
    chainId: ChainId
    collection: NonFungibleCollection<ChainId, SchemaType> | undefined
    validationMessage?: React.ReactNode
    operator: string | undefined
    ActionButtonProps?: ActionButtonProps
}

export function EthereumERC721TokenApprovedBoundary(props: EthereumERC712TokenApprovedBoundaryProps) {
    const { owner, collection, operator, children, validationMessage: _validationMessage, chainId } = props
    const Utils = useWeb3Utils()
    const { classes } = useStyles(undefined, { props })
    const {
        value: isApproveForAll,
        loading,
        retry,
    } = useERC721ContractIsApproveForAll(collection?.address, owner, operator, chainId)
    const [approveState, approveCallback] = useERC721ContractSetApproveForAllCallback(
        collection?.address,
        operator,
        true,
        retry,
        chainId,
    )

    useEffect(() => {
        retry()
    }, [approveState.loading])
    const validationMessage = useMemo(() => {
        if (!collection?.address || !Utils.isValidAddress(collection.address))
            return <Trans>Select an NFT Contract</Trans>
        if (!owner || !Utils.isValidAddress(owner)) return <Trans>Select an NFT Contract Owner</Trans>
        if (!operator || !Utils.isValidAddress(operator)) return <Trans>Select an NFT Contract Operator</Trans>
        if (_validationMessage) return _validationMessage
        return ''
    }, [collection, owner, operator, _validationMessage])

    if (approveState.loading) {
        const hasSymbolName = collection?.symbol && collection.symbol.toLowerCase() !== 'unknown'
        return (
            <ActionButton
                className={classes.approveButton}
                variant="contained"
                fullWidth
                loading
                disabled
                {...props.ActionButtonProps}>
                {hasSymbolName ?
                    <Trans>
                        Unlocking {hasSymbolName}
                        ...
                    </Trans>
                :   <Trans>Unlocking ALL...</Trans>}
            </ActionButton>
        )
    } else if (validationMessage) {
        return (
            <ActionButton
                className={classes.approveButton}
                variant="contained"
                fullWidth
                disabled
                {...props.ActionButtonProps}>
                {validationMessage}
            </ActionButton>
        )
    } else if (loading) {
        return (
            <ActionButton
                className={classes.approveButton}
                variant="contained"
                fullWidth
                loading
                disabled
                {...props.ActionButtonProps}
            />
        )
    } else if (isApproveForAll === false) {
        const hasSymbolName = collection?.symbol && collection.symbol.toLowerCase() !== 'unknown'
        return (
            <ActionButton
                className={classes.approveButton}
                variant="contained"
                fullWidth
                onClick={approveCallback}
                {...props.ActionButtonProps}>
                {hasSymbolName ?
                    <Trans>
                        Unlocking {hasSymbolName}
                        ...
                    </Trans>
                :   <Trans>Unlocking ALL...</Trans>}
            </ActionButton>
        )
    } else if (isApproveForAll === undefined) {
        return (
            <ActionButton
                className={classes.approveButton}
                variant="contained"
                fullWidth
                onClick={retry}
                {...props.ActionButtonProps}>
                <Trans>Click to retry</Trans>
            </ActionButton>
        )
    }

    return <>{children}</>
}
