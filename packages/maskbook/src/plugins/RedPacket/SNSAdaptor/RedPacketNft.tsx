import { WalletMessages } from '@masknet/plugin-wallet'
import { useRemoteControlledDialog } from '@masknet/shared'
import { makeStyles } from '@masknet/theme'
import { ChainId, useAccount, useChainIdValid } from '@masknet/web3-shared'
import { Box } from '@material-ui/core'
import { useState } from 'react'
import ActionButton from '../../../extension/options-page/DashboardComponents/ActionButton'
import { useI18N } from '../../../utils'
import { EthereumChainBoundary } from '../../../web3/UI/EthereumChainBoundary'
import { EthereumWalletConnectedBoundary } from '../../../web3/UI/EthereumWalletConnectedBoundary'
import type { RedPacketNftJSONPayload } from '../types'
import { RedPacketNftUI } from './RedPacketUI'

const useStyles = makeStyles()((theme) => ({
    actions: {
        paddingTop: theme.spacing(2),
        display: 'flex',
        justifyContent: 'center',
    },
}))
export interface RedPacketNftProps {
    payload: RedPacketNftJSONPayload
}

export function RedPacketNft({ payload }: RedPacketNftProps) {
    const { t } = useI18N()
    const { classes } = useStyles()
    const account = useAccount()
    const chainIdValid = useChainIdValid()
    const [disabled, setDisabled] = useState(false)

    //#region remote controlled select provider dialog
    const { openDialog: openSelectProviderDialog } = useRemoteControlledDialog(
        WalletMessages.events.selectProviderDialogUpdated,
    )
    //#endregion

    return (
        <EthereumChainBoundary chainId={ChainId.Mainnet}>
            <RedPacketNftUI claim={true} />
            <EthereumWalletConnectedBoundary>
                <Box className={classes.actions}>
                    {!account ? (
                        <ActionButton variant="contained" size="large" onClick={openSelectProviderDialog}>
                            {t('plugin_wallet_connect_a_wallet')}
                        </ActionButton>
                    ) : !chainIdValid ? (
                        <ActionButton disabled variant="contained" size="large">
                            {t('plugin_wallet_invalid_network')}
                        </ActionButton>
                    ) : (
                        <ActionButton disabled={disabled} variant="contained" size="large" onClick={() => {}}>
                            OK
                        </ActionButton>
                    )}
                </Box>
            </EthereumWalletConnectedBoundary>
        </EthereumChainBoundary>
    )
}
