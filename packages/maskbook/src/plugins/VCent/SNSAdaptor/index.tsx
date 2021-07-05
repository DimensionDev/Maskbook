import type { Plugin } from '@masknet/plugin-infra'
import { usePostInfoDetails } from '../../../components/DataSource/usePostInfo'
import VCentDialog from './TweetDialog'
import { base } from '../base'

const sns: Plugin.SNSAdaptor.Definition = {
    ...base,
    init(signal) {},
    DecryptedInspector: function Comp() {
        const tweetAddress = usePostInfoDetails.postID()
        if (!tweetAddress) return null
        return <VCentDialog tweetAddress={tweetAddress} />
    },
}

export default sns
