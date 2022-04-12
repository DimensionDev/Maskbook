import type { Plugin } from '@masknet/plugin-infra'
import { Box } from '@mui/system'
import { base } from '../base'
import { baseDeferred } from '../base-deferred'
import { TraderxyzDialog } from './trader/TraderDialog'
import { SearchResultInspector } from './trending/SearchResultInspector'
import { TagInspector } from './trending/TagInspector'

const sns: Plugin.SNSAdaptor.Definition = {
    ...base,
    ...baseDeferred,
    init(signal) {},
    SearchBoxComponent: SearchResultInspector,
    DecryptedInspector: function Comp(props) {
        return <Box>test Box</Box>
    },
    GlobalInjection: function Component() {
        return (
            <>
                <TagInspector />
                <TraderxyzDialog />
            </>
        )
    },
}

export default sns
