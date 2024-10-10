import { Icons } from '@masknet/icons'
import { ActionButton, type ActionButtonProps } from '@masknet/theme'
import { memo } from 'react'
import { Trans } from '@lingui/macro'

interface MoreBarProps extends ActionButtonProps {
    isExpand: boolean
}

export const MoreBar = memo<MoreBarProps>(function MoreBar({ isExpand, ...rest }) {
    if (isExpand)
        return (
            <ActionButton variant="roundedOutlined" {...rest}>
                <span>
                    <Trans>Hide tokens with value less than $1</Trans>
                </span>
                <Icons.ArrowDrop style={{ transform: 'rotate(180deg)' }} />
            </ActionButton>
        )
    return (
        <ActionButton variant="roundedOutlined" {...rest}>
            <span>
                <Trans>Show tokens with value less than $1</Trans>
            </span>
            <Icons.ArrowDrop />
        </ActionButton>
    )
})
