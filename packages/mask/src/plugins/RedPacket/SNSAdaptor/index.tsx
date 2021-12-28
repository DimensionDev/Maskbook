import type { Plugin } from '@masknet/plugin-infra'
import {
    ChainId,
    EthereumTokenType,
    formatBalance,
    getChainDetailed,
    getChainIdFromName,
    useERC20TokenDetailed,
} from '@masknet/web3-shared-evm'
import MaskPluginWrapper from '../../MaskPluginWrapper'
import { base } from '../base'
import { RedPacketMetaKey, RedPacketNftMetaKey } from '../constants'
import {
    RedPacketMetadataReader,
    RedPacketNftMetadataReader,
    renderWithRedPacketMetadata,
    renderWithRedPacketNftMetadata,
} from './helpers'
import type { RedPacketJSONPayload, RedPacketNftJSONPayload } from '../types'
import RedPacketDialog from './RedPacketDialog'
import { RedPacketInPost } from './RedPacketInPost'
import { RedPacketNftInPost } from './RedPacketNftInPost'

const sns: Plugin.SNSAdaptor.Definition = {
    ...base,
    init(signal) {},
    DecryptedInspector(props) {
        if (RedPacketMetadataReader(props.message.meta).ok)
            return (
                <MaskPluginWrapper pluginName="Lucky Drop">
                    {renderWithRedPacketMetadata(props.message.meta, (r) => (
                        <RedPacketInPost payload={r} />
                    ))}
                </MaskPluginWrapper>
            )

        if (RedPacketNftMetadataReader(props.message.meta).ok)
            return (
                <MaskPluginWrapper pluginName="NFT Lucky Drop">
                    {renderWithRedPacketNftMetadata(props.message.meta, (r) => (
                        <RedPacketNftInPost payload={r} />
                    ))}
                </MaskPluginWrapper>
            )
        return null
    },
    CompositionDialogMetadataBadgeRender: new Map([
        [
            RedPacketMetaKey,
            (_payload) => {
                return { text: <ERC20RedpacketBadge payload={_payload as RedPacketJSONPayload} /> }
            },
        ],
        [
            RedPacketNftMetaKey,
            (_payload) => {
                const payload = _payload as RedPacketNftJSONPayload
                return { text: <>{payload.message ? `🧧 ${payload.message}` : '🧧 An NFT Lucky Drop'}</> }
            },
        ],
    ]),
    CompositionDialogEntry: {
        dialog: RedPacketDialog,
        label: { fallback: '💰 Lucky Drop' },
    },
}
interface ERC20RedpacketBadgeProps {
    payload: RedPacketJSONPayload
}

function ERC20RedpacketBadge(props: ERC20RedpacketBadgeProps) {
    const { payload } = props
    const { value: fetchedToken } = useERC20TokenDetailed(payload.token?.address ?? payload.token_address)
    const chainId = getChainIdFromName(payload.network ?? '') ?? ChainId.Mainnet
    const chainDetailed = getChainDetailed(chainId)
    const tokenDetailed =
        payload.token?.type === EthereumTokenType.Native ? chainDetailed?.nativeCurrency : payload.token ?? fetchedToken
    return (
        <>
            🧧 A Lucky Drop with {formatBalance(payload.total, tokenDetailed?.decimals ?? 0)} $
            {tokenDetailed?.symbol ?? tokenDetailed?.name ?? 'Token'} from {payload.sender.name}
        </>
    )
}

export default sns
