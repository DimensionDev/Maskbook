import { AdditionalContent, AdditionalContentProps } from './AdditionalPostContent'
import Services from '../../extension/service'
import { useI18N } from '../../utils/i18n-next-ui'
import type { ProfileIdentifier } from '../../database/type'
import { useAsync } from 'react-use'
import { createElement, memo } from 'react'

export interface AddToKeyStoreProps {
    provePost: string
    postBy: ProfileIdentifier
    completeComponentProps?: Partial<SuccessProps & { data: boolean }>
    completeComponent?: React.ComponentType<{ data: boolean }> | null
}
export function AddToKeyStore({ provePost, postBy, ...props }: AddToKeyStoreProps) {
    const state = useAsync(() => Services.Crypto.verifyOthersProve(provePost, postBy), [provePost, postBy])
    const { completeComponent: Success, completeComponentProps } = props
    if (state.value) return render(Success, AddToKeyStoreUI.success, completeComponentProps)
    else return null
    function render(outer: React.ComponentType<any> | null | undefined, def: React.ComponentType<any>, props?: {}) {
        if (outer === null) return null
        return createElement(outer || def, props)
    }
}
type SuccessProps = Partial<AdditionalContentProps>
export const AddToKeyStoreUI = {
    success: memo((props: SuccessProps) => {
        const { t } = useI18N()
        return <AdditionalContent title={t('add_to_key_store_success')} titleIcon="check" {...props} />
    }),
}
