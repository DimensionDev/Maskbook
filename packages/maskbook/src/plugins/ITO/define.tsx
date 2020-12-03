import { Suspense } from 'react'
import BigNumber from 'bignumber.js'
import { makeStyles, createStyles } from '@material-ui/core'
import { PostInspector } from './UI/PostInspector'
import { PluginConfig, PluginScope, PluginStage } from '../types'
import { formatBalance } from '../Wallet/formatter'
import { ITO_MetaKey, ITO_PluginID } from './constants'
import type { ITO_JSONPayload } from './types'
import { ITO_MetadataReader } from './helpers'
import MaskbookPluginWrapper from '../MaskbookPluginWrapper'
import { SnackbarContent } from '@material-ui/core'
import { Flags } from '../../utils/flags'
import { createCompositionDialog } from '../utils/createCompositionDialog'
import { ITO_CompositionDialog } from './UI/ITO_CompositionDialog'
import { ItoLabelSvg } from './assets/ItoLabelSvg'

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
            <ItoLabelSvg size={props.iconSize} />
            <span className={classes.span}>{props.labelText}</span>
        </div>
    )
}

const [ITO_CompositionEntry, ITO_CompositionUI] = createCompositionDialog(
    <LabelWrapper iconSize={12} labelText={'ITO'} />,
    (props) => <ITO_CompositionDialog {...props} />,
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
            <MaskbookPluginWrapper pluginName="NFT">
                <Suspense fallback={<SnackbarContent message="Maskbook is loading this plugin..." />}>
                    <PostInspector payload={payload.val} />
                </Suspense>
            </MaskbookPluginWrapper>
        )
    },
    postDialogMetadataBadge: new Map([
        [
            ITO_MetaKey,
            (payload: ITO_JSONPayload) => {
                return (
                    <LabelWrapper
                        iconSize={14}
                        labelText={`A ITO with
                        ${formatBalance(
                            new BigNumber(payload.total),
                            payload.token?.decimals ?? 0,
                            payload.token?.decimals ?? 0,
                        )} $${payload.token?.name || 'ETH'} from ${payload.sender.name}`}
                    />
                )
            },
        ],
    ]),
    PageComponent: Flags.ito_enabled ? ITO_CompositionUI : undefined,
    postDialogEntries: Flags.ito_enabled ? [ITO_CompositionEntry] : undefined,
}
