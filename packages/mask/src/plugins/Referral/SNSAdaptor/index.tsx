import { useState } from 'react'
import type { Plugin } from '@masknet/plugin-infra'
import { ApplicationEntry } from '@masknet/shared'
import { CrossIsolationMessages } from '@masknet/shared-base'

import type { ReferralMetaData } from '../types'
import { base } from '../base'
import { META_KEY } from '../constants'
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
    CompositionDialogEntry: {
        label: <>Referral Farms</>,
        dialog: ReferralDialog,
    },
    GlobalInjection: function Component() {
        return <SelectToken />
    },
    ApplicationEntries: [
        (() => {
            const icon = <ReferralFarmsIcon />
            const name = 'Referral Farms'
            return {
                ApplicationEntryID: base.ID,
                RenderEntryComponent({ disabled }) {
                    const [open, setOpen] = useState(false)
                    return (
                        <>
                            <ApplicationEntry
                                disabled={disabled}
                                icon={icon}
                                title={name}
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
                description: 'A plugin for Referral Farms.',
                name,
                category: 'dapp',
            }
        })(),
    ],
}

export default sns
