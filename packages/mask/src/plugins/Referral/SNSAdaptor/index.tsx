import { useState } from 'react'
import type { Plugin } from '@masknet/plugin-infra'
import { ApplicationEntry } from '@masknet/shared'
import { PluginI18NFieldRender } from '@masknet/plugin-infra/content-script'

import { base } from '../base'
import { referralMetadataReader } from '../helpers'
import { META_KEY } from '../constants'
import type { ReferralMetaData } from '../types'

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
        [
            META_KEY,
            (meta: ReferralMetaData) =>
                `Buy or refer ${meta.referral_token_symbol} and receive farming yield without farming!`,
        ],
    ]),
    GlobalInjection: function Component() {
        return <SelectToken />
    },
    ApplicationEntries: [
        (() => {
            const icon = <ReferralFarmsIcon />
            const name = { i18nKey: '__plugin_name', fallback: 'Referral Farms' }
            return {
                ApplicationEntryID: base.ID,
                RenderEntryComponent(EntryComponentProps) {
                    const [open, setOpen] = useState(false)
                    const clickHandler = () => setOpen(true)
                    return (
                        <>
                            <ApplicationEntry
                                {...EntryComponentProps}
                                icon={icon}
                                title={<PluginI18NFieldRender field={name} pluginID={base.ID} />}
                                onClick={
                                    EntryComponentProps.onClick
                                        ? () => EntryComponentProps.onClick?.(clickHandler)
                                        : clickHandler
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
