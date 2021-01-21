import { Suspense } from 'react'
import BigNumber from 'bignumber.js'
import { makeStyles, createStyles } from '@material-ui/core'
import { ITO } from './UI/ITO'
import { PluginConfig, PluginScope, PluginStage } from '../types'
import { formatBalance } from '../Wallet/formatter'
import { ITO_MetaKey, ITO_PluginID } from './constants'
import type { JSON_PayloadOutMask } from './types'
import { ITO_MetadataReader, payloadIntoMask } from './helpers'
import MaskbookPluginWrapper from '../MaskbookPluginWrapper'
import { SnackbarContent } from '@material-ui/core'
import { Flags } from '../../utils/flags'
import { createCompositionDialog } from '../utils/createCompositionDialog'
import { CompositionDialog } from './UI/CompositionDialog'
import { ItoLabelIcon } from './assets/ItoLabelIcon'
import { ErrorBoundary } from '@dimensiondev/maskbook-theme'

interface LabelWrapperProps {
    iconSize: number
    labelText: string
}

const useStyles = makeStyles((theme) =>
    createStyles({
        root: {
            display: 'flex',
            alignItems: 'center',
        },
        span: {
            paddingLeft: theme.spacing(1),
        },
    }),
)

function LabelWrapper(props: LabelWrapperProps) {
    const classes = useStyles()
    return (
        <div className={classes.root}>
            <ItoLabelIcon size={props.iconSize} />
            <span className={classes.span}>{props.labelText}</span>
        </div>
    )
}

const [ITO_CompositionEntry, ITO_CompositionUI] = createCompositionDialog(
    <LabelWrapper iconSize={12} labelText={'ITO'} />,
    (props) => <CompositionDialog open={props.open} onConfirm={props.onClose} onClose={props.onClose} />,
)

export const ITO_PluginDefine: PluginConfig = {
    pluginName: 'ITO',
    identifier: ITO_PluginID,
    stage: PluginStage.Production,
    scope: PluginScope.Public,
    successDecryptionInspector: function Comp(props) {
        const payload = ITO_MetadataReader(props.message.meta)
        if (!payload.ok) return null
        return (
            <MaskbookPluginWrapper pluginName="ITO">
                <Suspense fallback={<SnackbarContent message="Maskbook is loading this plugin..." />}>
                    <ITO pid={payloadIntoMask(payload.val).pid} />
                </Suspense>
            </MaskbookPluginWrapper>
        )
    },
    postDialogMetadataBadge: new Map([
        [
            ITO_MetaKey,
            (payload: JSON_PayloadOutMask) => {
                return (
                    <LabelWrapper
                        iconSize={14}
                        labelText={`A ITO with
                        ${formatBalance(
                            new BigNumber(payload.total),
                            payload.token?.decimals ?? 0,
                            payload.token?.decimals ?? 0,
                        )} $${payload.token?.name || 'ETH'} from ${payload.seller.name}`}
                    />
                )
            },
        ],
    ]),
    PageComponent: ITO_CompositionUI,
    postDialogEntries: [ITO_CompositionEntry],
}
