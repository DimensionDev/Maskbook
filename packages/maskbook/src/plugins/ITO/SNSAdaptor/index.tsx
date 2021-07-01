import type { Plugin } from '@masknet/plugin-infra'
import { formatEthereumAddress, formatBalance } from '@masknet/web3-shared'
import { PostInspector } from './PostInspector'
import { base } from '../base'
import { ITO_MetaKey, MSG_DELIMITER } from '../constants'
import type { JSON_PayloadOutMask } from '../types'
import { ITO_MetadataReader, payloadIntoMask } from './helpers'
import MaskbookPluginWrapper from '../../MaskbookPluginWrapper'
import { CompositionDialog } from './CompositionDialog'

const sns: Plugin.SNSAdaptor.Definition = {
    ...base,
    init(signal) {},
    DecryptedInspector(props) {
        const payload = ITO_MetadataReader(props.message.meta)
        if (!payload.ok) return null
        return (
            <MaskbookPluginWrapper pluginName="ITO">
                <PostInspector payload={payloadIntoMask(payload.val)} />
            </MaskbookPluginWrapper>
        )
    },
    CompositionDialogMetadataBadgeRender: new Map([
        [
            ITO_MetaKey,
            (payload: JSON_PayloadOutMask) => {
                const sellerName = payload.seller.name
                    ? payload.seller.name
                    : payload.message.split(MSG_DELIMITER)[0] ?? formatEthereumAddress(payload.seller.address, 4)
                return `A ITO with ${formatBalance(payload.total, payload.token?.decimals)} $${
                    payload.token?.symbol ?? payload.token?.name ?? 'Token'
                } from ${sellerName}`
            },
        ],
    ]),
    CompositionDialogEntry: {
        dialog({ open, onClose }) {
            return <CompositionDialog open={open} onConfirm={onClose} onClose={onClose} />
        },
        label: { fallback: '🚀 ITO' },
    },
}

export default sns
