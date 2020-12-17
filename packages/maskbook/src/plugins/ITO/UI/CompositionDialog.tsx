import { useCallback, useState } from 'react'
import { createStyles, DialogContent, DialogProps, makeStyles, Typography } from '@material-ui/core'
import { InjectedDialog } from '../../../components/shared/InjectedDialog'
import { ITO_MetaKey } from '../constants'
import type { ITO_JSONPayload } from '../types'
import { useStylesExtends } from '../../../components/custom-ui-helper'
import { useI18N } from '../../../utils/i18n-next-ui'
import AbstractTab, { AbstractTabProps } from '../../../extension/options-page/DashboardComponents/AbstractTab'
import { editActivatedPostMetadata } from '../../../social-network/ui'
import { CreateItoGuide } from './CreateItoGuide'
import { TestForm } from './TestForm'

const useStyles = makeStyles((theme) => createStyles({}))

export interface CompositionDialogProps extends withClasses<'root'> {
    open: boolean
    onConfirm(payload: ITO_JSONPayload): void
    onClose: () => void
    DialogProps?: Partial<DialogProps>
}

export function CompositionDialog(props: CompositionDialogProps) {
    const { t } = useI18N()
    const classes = useStylesExtends(useStyles(), props)

    const onCreateOrSelect = useCallback(
        (payload: ITO_JSONPayload) => {
            editActivatedPostMetadata((next) => (payload ? next.set(ITO_MetaKey, payload) : next.delete(ITO_MetaKey)))
            props.onConfirm(payload)
        },
        [props.onConfirm],
    )

    //#region tabs
    const state = useState(0)
    const tabProps: AbstractTabProps = {
        tabs: [
            {
                label: 'Test',
                children: <TestForm onCreate={onCreateOrSelect} />,
                sx: { p: 0 },
            },
            {
                label: t('plugin_ito_create_new'),
                children: <CreateItoGuide onCreate={onCreateOrSelect} />,
                sx: { p: 0 },
            },
            {
                label: t('plugin_ito_select_existing'),
                children: <Typography>abc2</Typography>,
                sx: { p: 0 },
            },
        ],
        state,
    }
    //#endregion

    return (
        <>
            <InjectedDialog open={props.open} title={t('plugin_ito_display_name')} onClose={props.onClose}>
                <DialogContent>
                    <AbstractTab height={540} {...tabProps} />
                </DialogContent>
            </InjectedDialog>
        </>
    )
}
