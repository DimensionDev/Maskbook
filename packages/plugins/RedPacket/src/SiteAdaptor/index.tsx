import { Icons } from '@masknet/icons'
import { usePluginWrapper, type Plugin } from '@masknet/plugin-infra/content-script'
import { EnhanceableSite, PluginID, getEnhanceableSiteType } from '@masknet/shared-base'
import { memo } from 'react'
import { Trans } from 'react-i18next'
import { base } from '../base.js'
import { RedPacketInPost } from './RedPacketInPost.js'
import { RedPacketInjection } from './RedPacketInjection.js'
import { RedPacketNftInPost } from './RedPacketNftInPost.js'
import { openDialog } from './emitter.js'
import {
    RedPacketMetadataReader,
    RedPacketNftMetadataReader,
    renderWithRedPacketMetadata,
    renderWithRedPacketNftMetadata,
} from './helpers.js'

function Render(
    props: React.PropsWithChildren<{
        name: string
    }>,
) {
    usePluginWrapper(true, { name: props.name })
    return <>{props.children}</>
}

const isFirefly = getEnhanceableSiteType() === EnhanceableSite.Firefly
const PluginIcon = isFirefly ? Icons.Gift : Icons.RedPacket

const site: Plugin.SiteAdaptor.Definition = {
    ...base,
    init(signal) {},
    DecryptedInspector: memo(function RedPacketInspector(props) {
        const meta = props.message.meta
        if (RedPacketMetadataReader(meta).isOk())
            return (
                <Render name="Lucky Drop">
                    {renderWithRedPacketMetadata(meta, (r) => (
                        <RedPacketInPost payload={r} />
                    ))}
                </Render>
            )

        if (RedPacketNftMetadataReader(meta).isOk())
            return (
                <Render name="NFT Lucky Drop">
                    {renderWithRedPacketNftMetadata(props.message.meta, (r) => (
                        <RedPacketNftInPost payload={r} />
                    ))}
                </Render>
            )
        return null
    }),
    GlobalInjection: RedPacketInjection,
    CompositionDialogEntry: {
        label: (
            <>
                <Icons.RedPacket size={16} />
                <Trans ns={PluginID.RedPacket} i18nKey="name" />
            </>
        ),
        onClick: ({ compositionType }) => {
            openDialog(compositionType)
        },
    },
    wrapperProps: {
        icon: <PluginIcon size={20} style={{ filter: 'drop-shadow(0px 6px 12px rgba(240, 51, 51, 0.2))' }} />,
        backgroundGradient:
            'linear-gradient(180deg, rgba(255, 255, 255, 0) 0%, rgba(255, 255, 255, 0.8) 100%), linear-gradient(90deg, rgba(28, 104, 243, 0.2) 0%, rgba(249, 55, 55, 0.2) 100%), #FFFFFF',
    },
}

export default site
