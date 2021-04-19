import { Suspense } from 'react'
import { makeStyles, createStyles } from '@material-ui/core'
import { ITO_Loading } from './UI/ITO'
import { PostInspector } from './UI/PostInspector'
import { PluginConfig, PluginScope, PluginStage } from '../types'
import { formatBalance } from '../Wallet/formatter'
import { ITO_MetaKey, ITO_PluginID, MSG_DELIMITER } from './constants'
import type { JSON_PayloadOutMask } from './types'
import { ITO_MetadataReader, payloadIntoMask } from './helpers'
import MaskbookPluginWrapper from '../MaskbookPluginWrapper'
import { createCompositionDialog } from '../utils/createCompositionDialog'
import { CompositionDialog } from './UI/CompositionDialog'
import { ItoLabelIcon } from './assets/ItoLabelIcon'
import { formatEthereumAddress } from '../../plugins/Wallet/formatter'

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
                <Suspense fallback={<ITO_Loading />}>
                    <PostInspector payload={payloadIntoMask(payload.val)} />
                </Suspense>
            </MaskbookPluginWrapper>
        )
    },
    postDialogMetadataBadge: new Map([
        [
            ITO_MetaKey,
            (payload: JSON_PayloadOutMask) => {
                const sellerName =
                    payload.message.split(MSG_DELIMITER)[0] ?? formatEthereumAddress(payload.seller.address, 4)
                return (
                    <LabelWrapper
                        iconSize={14}
                        labelText={`A ITO with
                        ${formatBalance(payload.total, payload.token?.decimals ?? 0, payload.token?.decimals ?? 0)} $${
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
