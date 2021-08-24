import type { Plugin } from '@masknet/plugin-infra'
import { ItoLabelIcon } from '../assets/ItoLabelIcon'
import { makeStyles } from '@masknet/theme'
import { formatEthereumAddress, formatBalance, useFungibleTokenDetailed, EthereumTokenType } from '@masknet/web3-shared'
import { PostInspector } from './PostInspector'
import { base } from '../base'
import { ITO_MetaKey_1, ITO_MetaKey_2, MSG_DELIMITER } from '../constants'
import type { JSON_PayloadComposeMask } from '../types'
import { ITO_MetadataReader, payloadIntoMask } from './helpers'
import MaskbookPluginWrapper from '../../MaskbookPluginWrapper'
import { CompositionDialog } from './CompositionDialog'
import { set } from 'lodash-es'
import { ToolIconURLs } from '../../../resources/tool-icon'
import { EthereumChainBoundary } from '../../../web3/UI/EthereumChainBoundary'

const useStyles = makeStyles()((theme) => ({
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
                <EthereumChainBoundary chainId={payload.val.chain_id}>
                    <PostInspector payload={set(payloadIntoMask(payload.val), 'token', payload.val.token)} />
                </EthereumChainBoundary>
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
    ToolbarEntry: {
        ...ToolIconURLs.markets,
        onClick: 'openCompositionEntry',
    },
}

function onAttached_ITO(payload: JSON_PayloadComposeMask) {
    return { text: <Badge payload={payload} /> }
}
interface BadgeProps {
    payload: JSON_PayloadComposeMask
}
function Badge({ payload }: BadgeProps) {
    const { classes } = useStyles()
    const { value: tokenDetailed, loading: loadingToken } = useFungibleTokenDetailed(
        EthereumTokenType.ERC20,
        payload.token,
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
