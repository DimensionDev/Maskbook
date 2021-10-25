import MaskPluginWrapper from '../../MaskPluginWrapper'
import { Suspense } from 'react'
import { SnackbarContent } from '@mui/material'
import type { Plugin } from '@masknet/plugin-infra'
import { SavingDialog } from './SavingDialog'
import { base } from '../base'

const sns: Plugin.SNSAdaptor.Definition = {
    ...base,
    init(signal) {},
    CompositionDialogEntry: {
        label: 'Savings',
        dialog: Renderer,
    },
}

export default sns

function Renderer(
    props: React.PropsWithChildren<{
        open: boolean
        onClose(): void
    }>,
) {
    return (
        <MaskPluginWrapper pluginName="MaskSaving">
            <Suspense fallback={<SnackbarContent message="Mask is loading this plugin..." />}>
                <SavingDialog open={props.open} onClose={props.onClose} />
            </Suspense>
        </MaskPluginWrapper>
    )
}
