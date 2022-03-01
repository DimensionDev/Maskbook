import { Plugin, usePluginWrapper } from '@masknet/plugin-infra'
import {
    ChainId,
    EthereumTokenType,
    formatBalance,
    getChainDetailed,
    getChainIdFromName,
    useERC20TokenDetailed,
} from '@masknet/web3-shared-evm'
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
import { RedPacketIcon, NFTRedPacketIcon } from '@masknet/icons'

function Render(props: React.PropsWithChildren<{ name: string }>) {
    usePluginWrapper(true, { name: props.name })
    return <>{props.children}</>
}
const sns: Plugin.SNSAdaptor.Definition = {
    ...base,
    init(signal) {},
    DecryptedInspector(props) {
        if (RedPacketMetadataReader(props.message.meta).ok)
            return (
                <Render name="Lucky Drop">
                    {renderWithRedPacketMetadata(props.message.meta, (r) => (
                        <RedPacketInPost payload={r} />
                    ))}
                </Render>
            )

        if (RedPacketNftMetadataReader(props.message.meta).ok)
            return (
                <Render name="NFT Lucky Drop">
                    {renderWithRedPacketNftMetadata(props.message.meta, (r) => (
                        <RedPacketNftInPost payload={r} />
                    ))}
                </Render>
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
                return {
                    text: (
                        <>
                            <NFTRedPacketIcon style={{ width: 12, height: 12 }} />
                            {payload.message ? payload.message : 'An NFT Lucky Drop'}
                        </>
                    ),
                }
            },
        ],
    ]),
    CompositionDialogEntry: {
        dialog: RedPacketDialog,
        label: {
            fallback: (
                <>
                    <RedPacketIcon style={{ width: 16, height: 16 }} />
                    Luck drop
                </>
            ),
        },
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
            <RedPacketIcon style={{ width: 12, height: 12 }} /> A Lucky Drop with
            {formatBalance(payload.total, tokenDetailed?.decimals ?? 0)} $
            {tokenDetailed?.symbol ?? tokenDetailed?.name ?? 'Token'} from {payload.sender.name}
        </>
    )
}

export default sns
