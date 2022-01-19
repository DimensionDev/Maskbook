import { getITOConstants, isSameAddress, useERC20TokenDetailed, formatBalance } from '@masknet/web3-shared-evm'
import { useI18N } from '../../../../../utils'
import type { ContractMethodInfo, ComputedPayload } from '../type'

export function getITO_Description({ name, address, chainId }: ContractMethodInfo, computedPayload: ComputedPayload) {
    const { ITO2_CONTRACT_ADDRESS } = getITOConstants(chainId)
    if (!isSameAddress(address, ITO2_CONTRACT_ADDRESS)) return undefined

    switch (name) {
        case 'fill_pool':
            return (
                <FillPoolDescription
                    tokenAddress={computedPayload?.parameters?._token_addr ?? ''}
                    tokenAmount={computedPayload?.parameters?._total_tokens}
                />
            )
        default:
            return undefined
    }
}

interface FillPoolDescriptionProps {
    tokenAddress: string
    tokenAmount: string
}

function FillPoolDescription(props: FillPoolDescriptionProps) {
    const { tokenAddress, tokenAmount } = props

    const { value: token } = useERC20TokenDetailed(tokenAddress)
    const { t } = useI18N()

    return (
        <span>
            {token && tokenAddress
                ? t('plugin_ito_transaction_dialog_summary', {
                      amount: formatBalance(tokenAmount, token.decimals),
                      symbol: token.symbol,
                  })
                : t('plugin_ito_transaction_dialog_summary_with_no_token')}
        </span>
    )
}
