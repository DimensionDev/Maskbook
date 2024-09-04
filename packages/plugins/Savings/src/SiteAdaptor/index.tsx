import { useState } from 'react'
import type { Plugin } from '@masknet/plugin-infra'
import { ApplicationEntry } from '@masknet/shared'
import { Icons } from '@masknet/icons'
import { base } from '../base.js'
import { SavingsDialog } from './SavingsDialog.js'
import { useSavingsTrans } from '../locales/i18n_generated.js'

function Name() {
    const t = useSavingsTrans()
    return t.plugin_savings()
}
const site: Plugin.SiteAdaptor.Definition = {
    ...base,
    ApplicationEntries: [
        (() => {
            const icon = <Icons.Savings size={36} />
            const name = <Name />
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
                                    EntryComponentProps.onClick ?
                                        () => EntryComponentProps.onClick?.(clickHandler)
                                    :   clickHandler
                                }
                            />
                            {open ?
                                <SavingsDialog open onClose={() => setOpen(false)} />
                            :   null}
                        </>
                    )
                },
                appBoardSortingDefaultPriority: 10,
                icon,
                name,
                iconFilterColor,
            }
        })(),
    ],
}

export default site
