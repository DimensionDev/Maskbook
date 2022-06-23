import type { Plugin } from '@masknet/plugin-infra'
import { ApplicationEntry } from '@masknet/shared'
import { Icon } from '@masknet/icons'
import { Trans } from 'react-i18next'
import { useState } from 'react'
import { base } from '../base'
import { SavingsDialog } from './SavingsDialog'

const sns: Plugin.SNSAdaptor.Definition = {
    ...base,
    init(signal) {},
    ApplicationEntries: [
        (() => {
            const icon = <Icon type="savings" size={36} />
            const name = <Trans i18nKey="plugin_savings" />
            const iconFilterColor = 'rgba(255, 83, 146, 0.3)'
            return {
                ApplicationEntryID: base.ID,
                RenderEntryComponent(EntryComponentProps) {
                    const [open, setOpen] = useState(false)
                    const clickHandler = () => setOpen(true)
                    return (
                        <>
                            <ApplicationEntry
                                {...EntryComponentProps}
                                title={name}
                                iconFilterColor={iconFilterColor}
                                icon={icon}
                                onClick={
                                    EntryComponentProps.onClick
                                        ? () => EntryComponentProps.onClick?.(clickHandler)
                                        : clickHandler
                                }
                            />
                            {open ? <SavingsDialog open onClose={() => setOpen(false)} /> : null}
                        </>
                    )
                },
                appBoardSortingDefaultPriority: 8,
                icon,
                name,
                iconFilterColor,
            }
        })(),
    ],
}

export default sns
