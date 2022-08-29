import { Plugin, PluginId } from '@masknet/plugin-infra'
import { PluginI18NFieldRender } from '@masknet/plugin-infra/content-script'
import { Trans } from 'react-i18next'
import { Icons } from '@masknet/icons'
import { base } from '../base'
import MaskPostExtraInfoWrapper from '../../MaskPluginWrapper'
import { SearchResultInspector } from './SearchResultInspector'

const sns: Plugin.SNSAdaptor.Definition = {
    ...base,
    init(signal) {},
    SearchResultBox: {
        ID: PluginId.ENS,
        UI: {
            Content: ({ keyword }) => (
                <MaskPostExtraInfoWrapper
                    open
                    wrapperProps={{
                        icon: <Icons.ENS size={24} />,
                        borderRadius: '0px',
                        margin: '0px',
                    }}
                    key={PluginId.ENS}
                    title={<PluginI18NFieldRender field={base.name} pluginID={PluginId.ENS} />}
                    publisher={
                        base.publisher ? (
                            <PluginI18NFieldRender pluginID={PluginId.ENS} field={base.publisher.name} />
                        ) : undefined
                    }
                    publisherLink={base.publisher?.link}>
                    <SearchResultInspector domain={keyword} />
                </MaskPostExtraInfoWrapper>
            ),
        },
        Utils: {
            shouldDisplay(keyword: string) {
                return keyword.endsWith('.eth')
            },
        },
    },
    ApplicationEntries: [
        {
            ApplicationEntryID: base.ID,
            category: 'dapp',
            marketListSortingPriority: 20,
            description: <Trans i18nKey="plugin_ens_description" />,
            name: <Trans i18nKey="plugin_ens_name" />,
            icon: <Icons.ENS size={36} />,
        },
    ],
}

export default sns
