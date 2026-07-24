import { Trans } from '@lingui/react/macro'
import { Icons } from '@masknet/icons'
import { usePluginWrapper, type Plugin } from '@masknet/plugin-infra/content-script'
import { ApplicationEntry } from '@masknet/shared'
import { RedPacketMetaKey, SolanaRedPacketMetaKey } from '@masknet/shared-base'
import type { RedPacketJSONPayload } from '@masknet/web3-providers/types'
import { Telemetry } from '@masknet/web3-telemetry'
import { EventID, EventType } from '@masknet/web3-telemetry/types'
import { Typography } from '@mui/material'
import { memo } from 'react'
import { base } from '../base.js'
import { RedPacketInPost } from './RedPacketInPost.js'
import { RedPacketInjection } from './RedPacketInjection.js'
import { SolanaRedPacketFrame } from './SolanaRedPacket/SolanaRedPacketFrame.js'
import { openDialog } from './emitter.js'
import {
    RedPacketMetadataReader,
    renderWithRedPacketMetadata,
    renderWithSolanaRedPacketMetadata,
    SolanaRedPacketMetadataReader,
} from './helpers.js'

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

const PluginIcon = Icons.RedPacket

const site: Plugin.SiteAdaptor.Definition = {
    ...base,
    DecryptedInspector: memo(function RedPacketInspector(props) {
        const meta = props.message.meta
        const redpacket = RedPacketMetadataReader(meta)
        if (redpacket.isOk()) {
            return (
                <Render name="Lucky Drop">
                    {renderWithRedPacketMetadata(meta, (r) => (
                        <RedPacketInPost payload={r} />
                    ))}
                </Render>
            )
        }

        if (SolanaRedPacketMetadataReader(meta).isOk())
            return (
                <Render name="Solana Lucky Drop">
                    {renderWithSolanaRedPacketMetadata(props.message.meta, (r) => (
                        <SolanaRedPacketFrame payload={r} />
                    ))}
                </Render>
            )
        return null
    }),
    CompositionDialogMetadataBadgeRender: new Map([
        [
            RedPacketMetaKey,
            (_payload) => {
                return {
                    text: (
                        <RedpacketBadge
                            message={(_payload as RedPacketJSONPayload).sender.message}
                            fallback={'A Token Lucky Drop'}
                        />
                    ),
                }
            },
        ],
        [
            SolanaRedPacketMetaKey,
            (_payload) => {
                return {
                    text: (
                        <RedpacketBadge
                            message={(_payload as RedPacketJSONPayload).sender.message}
                            fallback={'A Token Lucky Drop'}
                        />
                    ),
                }
            },
        ],
    ]),
    GlobalInjection: RedPacketInjection,
    CompositionDialogEntry: {
        label: (
            <>
                <Icons.RedPacket size={16} />
                <Trans>Lucky Drop</Trans>
            </>
        ),
        onClick: ({ compositionType }) => {
            openDialog(compositionType)
        },
    },
    ApplicationEntries: [
        (() => {
            const icon = <PluginIcon size={36} />
            const name = <Trans>Lucky Drop</Trans>
            const recommendFeature = {
                description: <Trans>Send a surprise crypto giveaway. Tokens on multiple chains are supported.</Trans>,
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
                            onClick={() => {
                                if (EntryComponentProps.onClick)
                                    EntryComponentProps.onClick(() => openDialog('timeline'))
                                else openDialog()
                                Telemetry.captureEvent(EventType.Access, EventID.EntryAppLuckOpen)
                            }}
                        />
                    )
                },
                appBoardSortingDefaultPriority: 1,
                marketListSortingPriority: 1,
                icon,
                description: <Trans>Gift crypto to any users, first come, first served.</Trans>,
                name,
                tutorialLink: 'https://www.mask.io/help-tutorial/send-a-lucky-drop',
                category: 'dapp',
                recommendFeature,
            }
        })(),
    ],
    wrapperProps: {
        icon: <PluginIcon size={20} style={{ filter: 'drop-shadow(0px 6px 12px rgba(240, 51, 51, 0.2))' }} />,
        backgroundGradient:
            'linear-gradient(180deg, rgba(255, 255, 255, 0) 0%, rgba(255, 255, 255, 0.8) 100%), linear-gradient(90deg, rgba(28, 104, 243, 0.2) 0%, rgba(249, 55, 55, 0.2) 100%), #FFFFFF',
    },
}
interface RedpacketBadgeProps {
    message: string
    fallback: string
}

function RedpacketBadge(props: RedpacketBadgeProps) {
    const { message, fallback } = props

    return (
        <div style={containerStyle}>
            <Icons.RedPacket size={20} />
            <Typography
                sx={{
                    fontSize: '12px',
                    lineHeight: '16px',
                    marginLeft: '8px',
                    maxWidth: '450px',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                }}>
                {message || fallback}
            </Typography>
        </div>
    )
}

export default site
