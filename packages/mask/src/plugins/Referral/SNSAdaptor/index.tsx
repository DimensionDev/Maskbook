import { useState } from 'react'
import type { Plugin } from '@masknet/plugin-infra'
import { ApplicationEntry } from '@masknet/shared'
import { CrossIsolationMessages } from '@masknet/shared-base'
import { PluginI18NFieldRender } from '@masknet/plugin-infra/content-script'

import type { ReferralMetaData } from '../types'
import { base } from '../base'
import { META_KEY, DISABLE_PLUGIN } from '../constants'
import { referralMetadataReader } from '../helpers'

import { FarmPost } from './FarmPost'
import { ReferralDialog } from './ReferralDialog'
import { SelectToken } from './SelectToken'
import { ReferralFarmsIcon } from './shared-ui/icons/ReferralFarms'

const sns: Plugin.SNSAdaptor.Definition = {
    ...base,
    init() {},
    DecryptedInspector(props) {
        const metadata = referralMetadataReader(props.message.meta)
        if (!metadata.ok) return null
        return <FarmPost payload={metadata.val} />
    },
    CompositionDialogMetadataBadgeRender: new Map([
        [META_KEY, (meta: ReferralMetaData) => `Refer Farm of '${meta.referral_token_name}' from ${meta.sender}`],
    ]),
    CompositionDialogEntry: !DISABLE_PLUGIN
        ? {
              label: (
                  <PluginI18NFieldRender
                      field={{ i18nKey: '__plugin_name', fallback: 'Referral Farms' }}
                      pluginID={base.ID}
                  />
              ),
              dialog: ReferralDialog,
          }
        : undefined,
    GlobalInjection: function Component() {
        return <SelectToken />
    },
    ApplicationEntries: [
        (() => {
            const icon = <ReferralFarmsIcon />
            const name = { i18nKey: '__plugin_name', fallback: 'Referral Farms' }
            return {
                ApplicationEntryID: base.ID,
                RenderEntryComponent({ disabled }) {
                    const [open, setOpen] = useState(false)
                    return (
                        <>
                            <ApplicationEntry
                                disabled={DISABLE_PLUGIN || disabled}
                                icon={icon}
                                title={<PluginI18NFieldRender field={name} pluginID={base.ID} />}
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
                            <ReferralDialog open={open} onClose={() => setOpen(false)} />
                        </>
                    )
                },
                appBoardSortingDefaultPriority: 13,
                marketListSortingPriority: 18,
                icon,
                description: {
                    i18nKey: '__plugin_description',
                    fallback: 'Referral Farming distributes yield farming alike returns for successful referrals.',
                },
                name,
                category: 'dapp',
            }
        })(),
    ],
    wrapperProps: {
        backgroundGradient: 'linear-gradient(235.14deg, #E8F4FF 0%, #E5E3FF 100%)',
        icon: <ReferralFarmsIcon style={{ width: 24, height: 23 }} />,
    },
}

export default sns
