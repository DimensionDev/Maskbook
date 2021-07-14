import type { Plugin } from '@masknet/plugin-infra'
import { ItoLabelIcon } from '../assets/ItoLabelIcon'
import { makeStyles } from '@material-ui/core'
import { formatEthereumAddress, formatBalance, useTokenDetailed, EthereumTokenType } from '@masknet/web3-shared'
import { PostInspector } from './PostInspector'
import { base } from '../base'
import { ITO_MetaKey_1, ITO_MetaKey_2, MSG_DELIMITER } from '../constants'
import type { JSON_PayloadOutMask } from '../types'
import { ITO_MetadataReader, payloadIntoMask } from './helpers'
import MaskbookPluginWrapper from '../../MaskbookPluginWrapper'
import { CompositionDialog } from './CompositionDialog'
import { set } from 'lodash-es'

const useStyles = makeStyles((theme) => ({
    root: {
        display: 'flex',
        alignItems: 'center',
    },
    span: {
        paddingLeft: theme.spacing(1),
    },
}))

const sns: Plugin.SNSAdaptor.Definition = {
    ...base,
    init(signal) {},
    DecryptedInspector(props) {
        const payload = ITO_MetadataReader(props.message.meta)
        if (!payload.ok) return null
        return (
            <MaskbookPluginWrapper pluginName="ITO">
                <PostInspector payload={set(payloadIntoMask(payload.val), 'token', payload.val.token)} />
            </MaskbookPluginWrapper>
        )
    },
    CompositionDialogMetadataBadgeRender: new Map([
        [ITO_MetaKey_1, onAttached_ITO],
        [ITO_MetaKey_2, onAttached_ITO],
    ]),
    CompositionDialogEntry: {
        dialog({ open, onClose }) {
            return <CompositionDialog open={open} onConfirm={onClose} onClose={onClose} />
        },
        label: { fallback: '🚀 ITO' },
    },
}

function onAttached_ITO(payload: JSON_PayloadOutMask) {
    return { text: <Badge payload={payload} /> }
}
interface BadgeProps {
    payload: JSON_PayloadOutMask
}
function Badge({ payload }: BadgeProps) {
    const classes = useStyles()
    const { value: tokenDetailed, loading: loadingToken } = useTokenDetailed(
        EthereumTokenType.ERC20,
        payload.token as string,
    )
    const balance = formatBalance(payload.total, tokenDetailed?.decimals)
    const symbol = tokenDetailed?.symbol ?? tokenDetailed?.name ?? 'Token'
    const sellerName = payload.seller.name
        ? payload.seller.name
        : payload.message.split(MSG_DELIMITER)[0] ?? formatEthereumAddress(payload.seller.address, 4)
    return loadingToken ? null : (
        <div className={classes.root}>
            <ItoLabelIcon size={14} />
            <span className={classes.span}>{`A ITO with ${balance} $${symbol} from ${sellerName}`}</span>
        </div>
    )
}

export default sns
