import { PluginId, useActivatedPluginsSNSAdaptor, usePluginI18NField } from '@masknet/plugin-infra/content-script'
import { useAvailablePlugins } from '@masknet/plugin-infra/web3'
import { ConcealableTabs } from '@masknet/shared'
import type { SocialIdentity } from '@masknet/web3-shared-base'
import { first } from 'lodash-unified'
import { FC, useState } from 'react'

interface Props {
    identity: SocialIdentity
}

export const ProfileCard: FC<Props> = ({ identity }) => {
    const activatedPlugins = useActivatedPluginsSNSAdaptor('any')
    const realms = useAvailablePlugins(activatedPlugins, (plugins) => {
        return plugins
            .filter((x) => x.AvatarRealm)
            .map((x) => ({ ...x.AvatarRealm!, pluginID: x.ID }))
            .filter((x) => x.Utils?.shouldDisplay?.(identity) ?? true)
            .sort((a, z) => {
                // order those tabs from next id first
                if (a.pluginID === PluginId.NextID) return -1
                if (z.pluginID === PluginId.NextID) return 1

                // order those tabs from collectible first
                if (a.pluginID === PluginId.Collectible) return -1
                if (z.pluginID === PluginId.Collectible) return 1

                // place those tabs from debugger last
                if (a.pluginID === PluginId.Debugger) return 1
                if (z.pluginID === PluginId.Debugger) return -1

                // place those tabs from dao before the last
                if (a.pluginID === PluginId.DAO) return 1
                if (z.pluginID === PluginId.DAO) return -1

                return a.priority! - z.priority!
            })
    })
    const translate = usePluginI18NField()
    const [selectedTab, setSelectedTab] = useState<string | undefined>()
    const tabs = realms.map((x) => ({
        id: x.ID,
        label: typeof x.label === 'string' ? x.label : translate(x.pluginID, x.label!),
    }))
    const selectedTabId = selectedTab ?? first(tabs)?.id
    const Decorator = realms.find((x) => x.ID === selectedTabId)?.UI?.Decorator

    return (
        <article>
            {tabs.length > 0 && (
                <ConcealableTabs<string> tabs={tabs} selectedId={selectedTabId} onChange={setSelectedTab} />
            )}
        </article>
    )
}
