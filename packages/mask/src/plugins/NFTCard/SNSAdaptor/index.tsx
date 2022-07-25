import type { Plugin } from '@masknet/plugin-infra/content-script'
import { ApplicationEntry } from '@masknet/shared'
import { base } from '../base'
import { Trans } from 'react-i18next'
import { PluginI18NFieldRender } from '@masknet/plugin-infra/content-script'
import { ApplicationIcon } from '../../Avatar/assets/application'
import { NFTCardDialog } from './NFTCardDialog'

const sns: Plugin.SNSAdaptor.Definition = {
    ...base,
    init(signal) {},
    ApplicationEntries: [
        (() => {
            const name = { fallback: 'NFT Card' }
            const icon = <ApplicationIcon />
            return {
                RenderEntryComponent(EntryComponentProps) {
                    return (
                        <>
                            <ApplicationEntry
                                title={<PluginI18NFieldRender field={name} pluginID={base.ID} />}
                                icon={icon}
                                {...EntryComponentProps}
                                tooltipHint={
                                    EntryComponentProps.tooltipHint ??
                                    (EntryComponentProps.disabled ? undefined : <Trans i18nKey="application_hint" />)
                                }
                            />

                            <NFTCardDialog />
                        </>
                    )
                },
                appBoardSortingDefaultPriority: 3,
                name,
                icon,
                ApplicationEntryID: base.ID,
                nextIdRequired: false,
            }
        })(),
    ],
}

export default sns
