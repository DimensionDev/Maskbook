import type { Plugin } from '@masknet/plugin-infra'
import { base } from '../base'
import { ApplicationEntry } from '@masknet/shared'

const sns: Plugin.SNSAdaptor.Definition = {
    ...base,
    init(signal) {},
    ApplicationEntries: [
        {
            RenderEntryComponent({ disabled }) {
                return (
                    <ApplicationEntry
                        title="Tips"
                        disabled={disabled}
                        icon={new URL('../assets/Tips.png', import.meta.url).toString()}
                        onClick={() => console.log('tips')}
                    />
                )
            },
            defaultSortingPriority: 8,
        },
    ],
}

export default sns
