import type { Plugin } from '@masknet/plugin-infra'
import { base } from '../base'

const sns: Plugin.SNSAdaptor.Definition = {
    ...base,
    init(signal) {},
    ProfileTabs: [
        {
            ID: 'addressName',
            label: 'Address Names',
            priority: 1,
            children: ({ addressNames = [] }) => {
                return (
                    <ul>
                        {addressNames.map((x) => (
                            <li key={x.type}>
                                {x.label} - {x.resolvedAddress}
                            </li>
                        ))}
                    </ul>
                )
            },
        },
        {
            ID: 'identity',
            label: 'Identity',
            priority: 2,
            children: ({ identity }) => {
                return (
                    <ul>
                        <li>{identity?.avatar}</li>
                        <li>{identity?.bio}</li>
                        <li>{identity?.homepage}</li>
                        <li>{identity?.nickname}</li>
                        <li>{identity?.identifier.toText()}</li>
                    </ul>
                )
            },
        },
    ],
}

export default sns
