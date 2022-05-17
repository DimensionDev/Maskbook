import { type Plugin, usePluginWrapper } from '@masknet/plugin-infra/content-script'
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
import { Trans } from 'react-i18next'
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
        label: (
            <>
                <RedPacketIcon style={badgeSvgIconSize} />
                Lucky Drop
            </>
        ),
    },
    ApplicationEntries: [
        (() => {
            const icon = <RedPacketIcon />
            const name = <Trans i18nKey="plugin_red_packet_name" />
            const recommendFeature = {
                description: <Trans i18nKey="plugin_red_packet_recommend_feature_description" />,
                backgroundGradient: 'linear-gradient(180.54deg, #FF9A9E 0.71%, #FECFEF 98.79%, #FECFEF 99.78%)',
            }
            return {
                ApplicationEntryID: base.ID,
                RenderEntryComponent(EntryComponentProps) {
                    return (
                        <ApplicationEntry
                            title={name}
                            recommendFeature={recommendFeature}
                            {...EntryComponentProps}
                            icon={icon}
                            onClick={
                                EntryComponentProps.onClick ??
                                (() =>
                                    CrossIsolationMessages.events.requestComposition.sendToLocal({
                                        reason: 'timeline',
                                        open: true,
                                        options: {
                                            startupPlugin: base.ID,
                                        },
                                    }))
                            }
                        />
                    )
                },
                appBoardSortingDefaultPriority: 1,
                marketListSortingPriority: 1,
                icon,
                description: <Trans i18nKey="plugin_red_packet_description" />,
                name,
                tutorialLink: 'https://realmasknetwork.notion.site/0a71fd421aae4563bd07caa3e2129e5b',
                category: 'dapp',
                recommendFeature,
            }
        })(),
    ],
    wrapperProps: {
        icon: (
            <RedPacketIcon
                style={{ width: 24, height: 24, filter: 'drop-shadow(0px 6px 12px rgba(240, 51, 51, 0.2))' }}
            />
        ),
        backgroundGradient:
            'linear-gradient(180deg, rgba(255, 255, 255, 0) 0%, rgba(255, 255, 255, 0.8) 100%), linear-gradient(90deg, rgba(28, 104, 243, 0.2) 0%, rgba(249, 55, 55, 0.2) 100%), #FFFFFF',
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
        payload.token?.type === EthereumTokenType.Native ? chainDetailed?.nativeCurrency : fetchedToken ?? payload.token

    return (
        <div style={containerStyle}>
            <RedPacketIcon style={badgeSvgIconSize} /> A Lucky Drop with{' '}
            {formatBalance(payload.total, tokenDetailed?.decimals ?? 0)} $
            {tokenDetailed?.symbol ?? tokenDetailed?.name ?? 'Token'} from {payload.sender.name}
        </div>
    )
}

export default sns
