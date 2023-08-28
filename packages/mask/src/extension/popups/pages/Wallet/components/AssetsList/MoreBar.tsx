import { Icons } from '@masknet/icons'
import { ActionButton, type ActionButtonProps } from '@masknet/theme'
import { memo } from 'react'
import { useI18N } from '../../../../../../utils/index.js'

export interface MoreBarProps extends ActionButtonProps {
    isExpand: boolean
}

export const MoreBar = memo<MoreBarProps>(function MoreBar({ isExpand, ...rest }) {
    const { t } = useI18N()
    if (isExpand)
        return (
            <ActionButton variant="roundedOutlined" {...rest}>
                <span>{t('popups_wallet_more_collapse')}</span>
                <Icons.ArrowDrop style={{ transform: 'rotate(180deg)' }} />
            </ActionButton>
        )
    return (
        <ActionButton variant="roundedOutlined" {...rest}>
            <span>{t('popups_wallet_more_expand')}</span>
            <Icons.ArrowDrop />
        </ActionButton>
    )
})
