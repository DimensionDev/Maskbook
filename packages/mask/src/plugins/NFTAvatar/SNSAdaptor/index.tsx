import type { Plugin } from '@masknet/plugin-infra'
import { NFTAvatarsIcon } from '../../../resources/nftavatars'
import { base } from '../base'
import { NFTAvatarDialog } from './NFTAvatarsDialog'

const badgeSvgIconSize = {
    width: 16,
    height: 16,
}
const sns: Plugin.SNSAdaptor.Definition = {
    ...base,
    init(signal) {},
    CompositionDialogEntry: {
        dialog: NFTAvatarDialog,
        label: {
            fallback: (
                <>
                    <NFTAvatarsIcon style={badgeSvgIconSize} />
                    NFT Avatars
                </>
            ),
        },
    },
}

export default sns
