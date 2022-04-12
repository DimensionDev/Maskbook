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
        {
            RenderEntryComponent({ disabled, AppIcon, title }) {
                const [open, setOpen] = useState(false)
                return (
                    <>
                        <ApplicationEntry
                            disabled={disabled}
                            title={title}
                            AppIcon={AppIcon}
                            onClick={() => setOpen(true)}
                        />
                        <SavingsDialog open={open} onClose={() => setOpen(false)} />
                    </>
                )
            },
            appBoardSortingDefaultPriority: 7,
            AppIcon: <SavingsIcon />,
            name: <Trans i18nKey="plugin_savings" />,
        },
    ],
}

export default sns
