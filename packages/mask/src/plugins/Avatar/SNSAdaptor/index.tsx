import type { Plugin } from '@masknet/plugin-infra'
import { useAsync } from 'react-use'
import { ApplicationEntry } from '@masknet/shared'
import { useRemoteControlledDialog } from '@masknet/shared-base-ui'
import { WalletMessages } from '@masknet/plugin-wallet'
import { base } from '../base'
import { CollectiblesIcon } from '@masknet/icons'
import { activatedSocialNetworkUI } from '../../../social-network'
import { loadSocialNetworkUI } from '../../../social-network/ui'

const sns: Plugin.SNSAdaptor.Definition = {
    ...base,
    init(signal) {},
    ApplicationEntries: [
        {
            RenderEntryComponent({ disabled, AppIcon }) {
                const { value: ui } = useAsync(async () => {
                    return loadSocialNetworkUI(activatedSocialNetworkUI.networkIdentifier)
                }, [activatedSocialNetworkUI])

                // #region remote controlled dialog logic
                const { closeDialog: closeWalletStatusDialog } = useRemoteControlledDialog(
                    WalletMessages.events.walletStatusDialogUpdated,
                )

                return ui?.injection.openNFTAvatarSettingDialog ? (
                    <ApplicationEntry
                        disabled={disabled}
                        title="NFT Avatar"
                        AppIcon={AppIcon}
                        onClick={() => {
                            closeWalletStatusDialog()
                            ui.injection.openNFTAvatarSettingDialog!()
                        }}
                    />
                ) : null
            },
            appBoardSortingDefaultPriority: 8,
            AppIcon: <CollectiblesIcon />,
            name: 'NFT Avatar',
        },
    ],
}

export default sns
