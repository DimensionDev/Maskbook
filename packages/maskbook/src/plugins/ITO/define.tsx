import { makeStyles } from '@material-ui/core'
import { PostInspector } from './UI/PostInspector'
import { PluginConfig, PluginScope, PluginStage } from '../types'
import { formatBalance } from '@dimensiondev/maskbook-shared'
import { ITO_MetaKey, ITO_PluginID } from './constants'
import type { JSON_PayloadOutMask } from './types'
import { ITO_MetadataReader, payloadIntoMask } from './helpers'
import MaskbookPluginWrapper from '../MaskbookPluginWrapper'
import { createCompositionDialog } from '../utils/createCompositionDialog'
import { CompositionDialog } from './UI/CompositionDialog'
import { ItoLabelIcon } from './assets/ItoLabelIcon'
import { formatEthereumAddress } from '@dimensiondev/maskbook-shared'

interface LabelWrapperProps {
    iconSize: number
    labelText: string
}

const useStyles = makeStyles((theme) => ({
    root: {
        display: 'flex',
        alignItems: 'center',
    },
    span: {
        paddingLeft: theme.spacing(1),
    },
}))

function LabelWrapper(props: LabelWrapperProps) {
    const classes = useStyles()
    return (
        <div className={classes.root}>
            <ItoLabelIcon size={props.iconSize} />
            <span className={classes.span}>{props.labelText}</span>
        </div>
    )
}

export const [ITO_CompositionEntry, ITO_CompositionUI] = createCompositionDialog(
    <LabelWrapper iconSize={12} labelText={'ITO'} />,
    (props) => <CompositionDialog open={props.open} onConfirm={props.onClose} onClose={props.onClose} />,
)

export const ITO_PluginDefine: PluginConfig = {
    id: ITO_PluginID,
    pluginIcon: '🚀',
    pluginName: 'ITO',
    pluginDescription: 'Participate in Public Offering on Twitter.',
    identifier: ITO_PluginID,
    stage: PluginStage.Production,
    scope: PluginScope.Public,
    successDecryptionInspector: function Comp(props) {
        const payload = ITO_MetadataReader(props.message.meta)
        if (!payload.ok) return null
        return (
            <MaskbookPluginWrapper pluginName="ITO">
                <PostInspector payload={payloadIntoMask(payload.val)} />
            </MaskbookPluginWrapper>
        )
    },
    postDialogMetadataBadge: new Map([
        [
            ITO_MetaKey,
            (payload: JSON_PayloadOutMask) => {
                const sellerName = payload.seller.name ?? formatEthereumAddress(payload.seller.address, 4)
                return (
                    <LabelWrapper
                        iconSize={14}
                        labelText={`A ITO with
                        ${formatBalance(payload.total, payload.token?.decimals)} $${
                            payload.token?.symbol ?? payload.token?.name ?? 'Token'
                        } from ${sellerName}`}
                    />
                )
            },
        ],
    ]),
    PageComponent: ITO_CompositionUI,
    postDialogEntries: [ITO_CompositionEntry],
}
