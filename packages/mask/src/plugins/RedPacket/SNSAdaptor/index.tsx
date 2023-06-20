import { type Plugin, usePluginWrapper } from '@masknet/plugin-infra/content-script'
import { Trans } from 'react-i18next'
import { Icons } from '@masknet/icons'
import { PluginID } from '@masknet/shared-base'
import { ApplicationEntry } from '@masknet/shared'
import { base } from '../base.js'
import { RedPacketMetaKey, RedPacketNftMetaKey } from '../constants.js'
import {
    RedPacketMetadataReader,
    RedPacketNftMetadataReader,
    renderWithRedPacketMetadata,
    renderWithRedPacketNftMetadata,
} from './helpers.js'
import type { RedPacketJSONPayload, RedPacketNftJSONPayload } from '@masknet/web3-shared-evm'
import { RedPacketInjection } from './RedPacketInjection.js'
import RedPacketDialog from './RedPacketDialog.js'
import { RedPacketInPost } from './RedPacketInPost.js'
import { RedPacketNftInPost } from './RedPacketNftInPost.js'
import { openDialog } from './emitter.js'
import { Typography } from '@mui/material'

function Render(
    props: React.PropsWithChildren<{
        name: string
    }>,
) {
    usePluginWrapper(true, { name: props.name })
    return <>{props.children}</>
}
const containerStyle = {
    display: 'flex',
    alignItems: 'center',
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
                return {
                    text: (
                        <ERC20RedpacketBadge
                            message={(_payload as RedPacketJSONPayload).sender.message}
                            fallback={'A Token Lucky Drop'}
                        />
                    ),
                }
            },
        ],
        [
            RedPacketNftMetaKey,
            (_payload) => {
                return {
                    text: (
                        <ERC20RedpacketBadge
                            message={(_payload as RedPacketNftJSONPayload).message}
                            fallback={'An NFT Lucky Drop'}
                        />
                    ),
                }
            },
        ],
    ]),
    GlobalInjection: RedPacketInjection,
    CompositionDialogEntry: {
        dialog: RedPacketDialog,
        label: (
            <>
                <Icons.RedPacket size={16} />
                <Trans ns={PluginID.RedPacket} i18nKey="name" />
            </>
        ),
    },
    ApplicationEntries: [
        (() => {
            const icon = <Icons.RedPacket size={36} />
            const name = <Trans ns={PluginID.RedPacket} i18nKey="name" />
            const recommendFeature = {
                description: <Trans ns={PluginID.RedPacket} i18nKey="recommend_feature_description" />,
                backgroundGradient: 'linear-gradient(180.54deg, #FF9A9E 0.71%, #FECFEF 98.79%, #FECFEF 99.78%)',
                isFirst: true,
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
                                EntryComponentProps.onClick
                                    ? () => EntryComponentProps.onClick?.(openDialog)
                                    : openDialog
                            }
                        />
                    )
                },
                appBoardSortingDefaultPriority: 1,
                marketListSortingPriority: 1,
                icon,
                description: <Trans ns={PluginID.RedPacket} i18nKey="description" />,
                name,
                tutorialLink: 'https://realmasknetwork.notion.site/0a71fd421aae4563bd07caa3e2129e5b',
                category: 'dapp',
                recommendFeature,
            }
        })(),
    ],
    wrapperProps: {
        icon: <Icons.RedPacket size={24} style={{ filter: 'drop-shadow(0px 6px 12px rgba(240, 51, 51, 0.2))' }} />,
        backgroundGradient:
            'linear-gradient(180deg, rgba(255, 255, 255, 0) 0%, rgba(255, 255, 255, 0.8) 100%), linear-gradient(90deg, rgba(28, 104, 243, 0.2) 0%, rgba(249, 55, 55, 0.2) 100%), #FFFFFF',
    },
}
interface ERC20RedpacketBadgeProps {
    message: string
    fallback: string
}

function ERC20RedpacketBadge(props: ERC20RedpacketBadgeProps) {
    const { message, fallback } = props

    return (
        <div style={containerStyle}>
            <Icons.RedPacket size={20} />
            <Typography
                fontSize="12px"
                lineHeight="16px"
                fontFamily="Helvetica"
                marginLeft="8px"
                maxWidth="450px"
                overflow="hidden"
                textOverflow="ellipsis">
                {message || fallback}
            </Typography>
        </div>
    )
}

export default sns
