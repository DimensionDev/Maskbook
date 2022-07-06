import type { Plugin } from '@masknet/plugin-infra'
import { useState } from 'react'
import { base } from '../base'
import { Trans } from 'react-i18next'
import { AzuroIcon } from '../Azuro/icons/AzuroIcon'
import { ApplicationEntry } from '@masknet/shared'
import { PredictDialog } from './PredictDialog'

const sns: Plugin.SNSAdaptor.Definition = {
    ...base,
    init() {},
    ApplicationEntries: [
        (() => {
            const icon = <AzuroIcon />
            const name = <Trans i18nKey="plugin_predict" />
            return {
                ApplicationEntryID: base.ID,
                RenderEntryComponent(EntryComponentProps) {
                    const [open, setOpen] = useState(false)
                    return (
                        <>
                            <ApplicationEntry
                                {...EntryComponentProps}
                                disabled={EntryComponentProps.disabled}
                                title={name}
                                icon={icon}
                                onClick={EntryComponentProps.onClick ?? (() => setOpen(true))}
                            />
                            <PredictDialog open={open} onClose={() => setOpen(false)} />
                        </>
                    )
                },
                appBoardSortingDefaultPriority: 14,
                icon,
                name,
            }
        })(),
    ],
}

export default sns
