import { Plugin, usePluginWrapper, useCurrentWeb3NetworkPluginID, NetworkPluginID } from '@masknet/plugin-infra'
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
import { CrossIsolationMessages } from '@masknet/shared-base'
import { ApplicationEntry } from '@masknet/shared'

function Render(props: React.PropsWithChildren<{ name: string }>) {
    usePluginWrapper(true, { name: props.name })
    return <>{props.children}</>
}
const containerStyle = {
    display: 'flex',
    alignItems: 'center',
}
const badgeSvgIconSize = {
    width: 16,
    height: 16,
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
                        <div style={containerStyle}>
                            <NFTRedPacketIcon style={badgeSvgIconSize} />
                            {payload.message ? payload.message : 'An NFT Lucky Drop'}
                        </div>
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
                    <RedPacketIcon style={badgeSvgIconSize} />
                    Luck drop
                </>
            ),
        },
    },
    ApplicationEntries: [
        {
            RenderEntryComponent() {
                const currentPluginId = useCurrentWeb3NetworkPluginID()
                return (
                    <ApplicationEntry
                        title="Lucky Drop"
                        disabled={currentPluginId !== NetworkPluginID.PLUGIN_EVM}
                        icon={new URL('./assets/lucky_drop.png', import.meta.url).toString()}
                        onClick={() =>
                            CrossIsolationMessages.events.requestComposition.sendToLocal({
                                reason: 'timeline',
                                open: true,
                                options: {
                                    startupPlugin: base.ID,
                                },
                            })
                        }
                    />
                )
            },
            defaultSortingPriority: 1,
        },
    ],
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
        <div style={containerStyle}>
            <RedPacketIcon style={badgeSvgIconSize} /> A Lucky Drop with{' '}
            {formatBalance(payload.total, tokenDetailed?.decimals ?? 0)} $
            {tokenDetailed?.symbol ?? tokenDetailed?.name ?? 'Token'} from {payload.sender.name}
        </div>
    )
}

export default sns
