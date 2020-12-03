import { useState } from 'react'
import type { AbstractTabProps } from '../../../extension/options-page/DashboardComponents/AbstractTab'
import AbstractTab from '../../../extension/options-page/DashboardComponents/AbstractTab'
import type { ITOJSONPayload } from '../types'
import { InjectedDialog } from '../../../components/shared/InjectedDialog'
import { DialogContent, Typography } from '@material-ui/core'
import { useI18N } from '../../../utils/i18n-next-ui'
import { ITOForm } from './ITOForm'

interface ITODialogProps extends withClasses<never> {
    open: boolean

    onConfirm: (opt?: ITOJSONPayload | null) => void
    onDecline: () => void
}

export default function ITODialog(props: ITODialogProps) {
    const { t } = useI18N()
    const { onConfirm } = props
    const state = useState(0)

    const tabProps: AbstractTabProps = {
        tabs: [
            {
                label: 'Create New',
                children: <ITOForm />,
                p: 0,
            },
            {
                label: 'Select Existing',
                children: <Typography>abc2</Typography>,
                p: 0,
            },
        ],
        state,
    }

    return (
        <InjectedDialog open={props.open} title="Plugins: ITO" onClose={props.onDecline}>
            <DialogContent>
                <AbstractTab height={362} {...tabProps} />
            </DialogContent>
        </InjectedDialog>
    )
}
