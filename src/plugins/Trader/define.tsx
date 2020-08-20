import React from 'react'
import type { PluginConfig } from '../plugin'
import { usePostInfoDetails } from '../../components/DataSource/usePostInfo'
import MaskbookPluginWrapper from '../MaskbookPluginWrapper'
import { Suspense } from 'react'
import { SnackbarContent } from '@material-ui/core'

export const TraderPluginDefine: PluginConfig = {
    pluginName: 'Trader',
    identifier: 'co.maskbook.trader',
    postDialogMetadataBadge: new Map([['com.maskbook.trader:1', (meta) => 'no metadata']]),

    postInspector: function Component(): JSX.Element | null {
        const tokenName = usePostInfoDetails('postMetadataMentionedLinks')
        if (!tokenName) return null
        return (
            <MaskbookPluginWrapper pluginName="Trader">
                <Suspense fallback={<SnackbarContent message="Maskbook is loading this plugin..." />}>
                    <Trader></Trader>
                </Suspense>
            </MaskbookPluginWrapper>
        )
    },
}

interface TranderProps {}

function Trader(props: TranderProps) {
    return null
}
