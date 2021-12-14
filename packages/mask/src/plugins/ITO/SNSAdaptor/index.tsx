import { Plugin, NetworkPluginID, ApplicationEntryConduct } from '@masknet/plugin-infra'
import { ItoLabelIcon } from '../assets/ItoLabelIcon'
import { makeStyles } from '@masknet/theme'
import {
    formatEthereumAddress,
    formatBalance,
    useFungibleTokenDetailed,
    EthereumTokenType,
} from '@masknet/web3-shared-evm'
import { PostInspector } from './PostInspector'
import { base } from '../base'
import { ITO_MetaKey_1, ITO_MetaKey_2, MSG_DELIMITER, ITO_PluginID } from '../constants'
import type { JSON_PayloadComposeMask } from '../types'
import { ITO_MetadataReader, payloadIntoMask } from './helpers'
import MaskPluginWrapper from '../../MaskPluginWrapper'
import { CompositionDialog } from './CompositionDialog'
import { set } from 'lodash-unified'
import { ToolIconURLs } from '../../../resources/tool-icon'
import { EthereumChainBoundary } from '../../../web3/UI/EthereumChainBoundary'
import { PLUGIN_NETWORKS } from '../../EVM/constants'

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
            <MaskPluginWrapper pluginName="ITO">
                <EthereumChainBoundary chainId={payload.val.chain_id}>
                    <PostInspector payload={set(payloadIntoMask(payload.val), 'token', payload.val.token)} />
                </EthereumChainBoundary>
            </MaskPluginWrapper>
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
    ApplicationEntries: [
        {
            icon: new URL('../assets/token.png', import.meta.url),
            label: 'ITO',
            priority: 3,
            conduct: { type: ApplicationEntryConduct.EncryptedMessage, id: ITO_PluginID },
            supportedNetworkList: [
                { network: NetworkPluginID.PLUGIN_EVM, chainIdList: PLUGIN_NETWORKS.map((network) => network.chainId) },
            ],
            walletRequired: true,
        },
        {
            icon: new URL('../assets/gift.png', import.meta.url),
            label: 'Claim',
            priority: 4,
            conduct: { type: ApplicationEntryConduct.Custom },
            supportedNetworkList: [
                { network: NetworkPluginID.PLUGIN_EVM, chainIdList: PLUGIN_NETWORKS.map((network) => network.chainId) },
            ],
            walletRequired: true,
        },
    ],
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
