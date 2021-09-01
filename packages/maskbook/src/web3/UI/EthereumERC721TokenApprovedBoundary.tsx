import {
    useERC721ContractIsApproveForAll,
    useERC721ContractSetApproveForAllCallback,
    TransactionStateType,
    ERC721ContractDetailed,
} from '@masknet/web3-shared'
import { useI18N } from '../../utils'
import { makeStyles, useSnackbar } from '@masknet/theme'
import ActionButton from '../../extension/options-page/DashboardComponents/ActionButton'
import { useMemo, useEffect } from 'react'
import { EthereumAddress } from 'wallet.ts'
import { useStylesExtends } from '@masknet/shared'

const useStyles = makeStyles()(() => ({}))

export interface EthereumERC712TokenApprovedBoundaryProps extends withClasses<'approveButton'> {
    children?: React.ReactNode
    owner: string | undefined
    contract: ERC721ContractDetailed | undefined
    validationMessage?: string
    operator: string | undefined
}

export function EthereumERC721TokenApprovedBoundary(props: EthereumERC712TokenApprovedBoundaryProps) {
    const { owner, contract, operator, children, validationMessage: _validationMessage } = props
    const { t } = useI18N()
    const classes = useStylesExtends(useStyles(), props)
    const { value, loading, retry } = useERC721ContractIsApproveForAll(contract?.address, owner, operator)
    const [approveState, approveCallback, resetCallback] = useERC721ContractSetApproveForAllCallback(
        contract?.address,
        operator,
        true,
    )
    const { enqueueSnackbar } = useSnackbar()

    useEffect(() => {
        if ([TransactionStateType.CONFIRMED, TransactionStateType.RECEIPT].includes(approveState.type)) {
            enqueueSnackbar(t('plugin_wallet_approve_all_nft_successfully', { symbol: contract?.symbol }), {
                variant: 'success',
            })
            resetCallback()
            retry()
        } else if (approveState.type === TransactionStateType.FAILED) {
            enqueueSnackbar(t('plugin_wallet_approve_all_nft_failed', { symbol: contract?.symbol }), {
                variant: 'error',
            })
            resetCallback()
        }
    }, [approveState, contract])

    const validationMessage = useMemo(() => {
        if (!contract?.address || !EthereumAddress.isValid(contract?.address))
            return t('plugin_wallet_select_a_nft_contract')
        if (!owner || !EthereumAddress.isValid(owner)) return t('plugin_wallet_select_a_nft_owner')
        if (!operator || !EthereumAddress.isValid(operator)) return t('plugin_wallet_select_a_nft_operator')
        if (!!_validationMessage) return _validationMessage
        return ''
    }, [contract, owner, operator, _validationMessage])

    if ([TransactionStateType.WAIT_FOR_CONFIRMING, TransactionStateType.HASH].includes(approveState.type)) {
        return (
            <ActionButton variant="contained" size="large" fullWidth className={classes.approveButton} loading disabled>
                {t('plugin_wallet_nft_approving_all', { symbol: contract?.symbol })}
            </ActionButton>
        )
    } else if (!!validationMessage) {
        return (
            <ActionButton variant="contained" size="large" fullWidth className={classes.approveButton} disabled>
                {validationMessage}
            </ActionButton>
        )
    } else if (loading) {
        return (
            <ActionButton
                variant="contained"
                size="large"
                fullWidth
                className={classes.approveButton}
                loading
                disabled
            />
        )
    } else if (value === false) {
        return (
            <ActionButton
                variant="contained"
                size="large"
                fullWidth
                className={classes.approveButton}
                onClick={approveCallback}>
                {t('plugin_wallet_approve_all_nft', { symbol: contract?.symbol })}
            </ActionButton>
        )
    } else if (value === undefined) {
        return (
            <ActionButton variant="contained" size="large" fullWidth className={classes.approveButton} onClick={retry}>
                {t('plugin_wallet_fail_to_load_nft_contract')}
            </ActionButton>
        )
    }

    return <>{children}</>
}
