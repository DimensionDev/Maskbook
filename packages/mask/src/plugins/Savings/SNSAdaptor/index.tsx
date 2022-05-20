import type { Plugin } from '@masknet/plugin-infra'
import { ApplicationEntry } from '@masknet/shared'
import { SavingsIcon } from '@masknet/icons'
import { Trans } from 'react-i18next'
import { useState } from 'react'
import { base } from '../base'
import { SavingsDialog } from './SavingsDialog'

const sns: Plugin.SNSAdaptor.Definition = {
    ...base,
    init(signal) {},
    ApplicationEntries: [
        (() => {
            const icon = <SavingsIcon />
            const name = <Trans i18nKey="plugin_savings" />
            const iconFilterColor = 'rgba(255, 83, 146, 0.3)'
            return {
                ApplicationEntryID: base.ID,
                RenderEntryComponent(EntryComponentProps) {
                    const [open, setOpen] = useState(false)
                    return (
                        <>
                            <ApplicationEntry
                                {...EntryComponentProps}
                                title={name}
                                iconFilterColor={iconFilterColor}
                                icon={icon}
                                onClick={EntryComponentProps.onClick ?? (() => setOpen(true))}
                            />
                            <SavingsDialog open={open} onClose={() => setOpen(false)} />
                        </>
                    )
                },
                appBoardSortingDefaultPriority: 7,
                icon,
                name,
                iconFilterColor,
            }
        })(),
    ],
}

export default sns
