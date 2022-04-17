import type { Plugin } from '@masknet/plugin-infra'
import { useAsync } from 'react-use'
import { ApplicationEntry } from '@masknet/shared'
import { Trans } from 'react-i18next'
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
            ID: base.ID,
            RenderEntryComponent({ disabled, icon, title }) {
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
                        title={title}
                        icon={icon}
                        onClick={() => {
                            closeWalletStatusDialog()
                            ui.injection.openNFTAvatarSettingDialog!()
                        }}
                    />
                ) : null
            },
            appBoardSortingDefaultPriority: 8,
            icon: <CollectiblesIcon />,
            name: <Trans i18nKey="nft_avatar" />,
        },
    ],
}

export default sns
