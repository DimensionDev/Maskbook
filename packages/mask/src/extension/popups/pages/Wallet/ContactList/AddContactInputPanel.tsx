import { Icons } from '@masknet/icons'
import { type NetworkPluginID } from '@masknet/shared-base'
import { MaskTextField, makeStyles } from '@masknet/theme'
import { useChainContext } from '@masknet/web3-hooks-base'
import { Box, Typography, useTheme } from '@mui/material'
import { memo, useCallback } from 'react'

import { useI18N } from '../../../../../utils/index.js'
import { ContactsContext } from './contactsContext.js'
import { AddContactModal } from '../../../modals/modals.js'

const useStyles = makeStyles()((theme) => ({
    input: {
        flex: 1,
        marginBottom: 8,
    },
    to: {
        display: 'flex',
        alignItems: 'center',
        marginRight: 16,
        height: 40,
    },
    toText: {
        color: theme.palette.maskColor.second,
        fontSize: 14,
        fontWeight: 700,
    },
    receiverPanel: {
        display: 'flex',
        alignItems: 'flex-start',
        height: 88,
        width: '100%',
    },
    inputText: {
        fontSize: 10,
        paddingRight: '0px !important',
    },
    save: {
        color: theme.palette.maskColor.primary,
        marginRight: 4,
    },
    endAdornment: {
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
    },
    receiver: {
        color: theme.palette.maskColor.main,
        fontSize: 14,
    },
    validation: {
        color: theme.palette.maskColor.danger,
        fontSize: 14,
    },
    fieldWrapper: {
        flex: 1,
    },
}))

const AddContactInputPanel = memo(function AddContactInputPanel() {
    const { t } = useI18N()
    const { classes } = useStyles()
    const { address, receiver, setReceiver, ensName, receiverValidationMessage, registeredAddress } =
        ContactsContext.useContainer()
    const { chainId } = useChainContext<NetworkPluginID.PLUGIN_EVM>()

    const theme = useTheme()

    const openAddContactModal = useCallback(() => {
        AddContactModal.openAndWaitForClose({
            title: t('wallet_add_contact'),
            address,
            name: ensName,
        })
    }, [address, ensName])

    return (
        <>
            <Box padding={2} className={classes.receiverPanel}>
                <div className={classes.to}>
                    <Typography className={classes.toText}>{t('popups_wallet_transfer_to')}</Typography>
                </div>
                <div className={classes.fieldWrapper}>
                    <MaskTextField
                        placeholder={t('wallet_transfer_placeholder')}
                        value={receiver}
                        onChange={(ev) => setReceiver(ev.target.value)}
                        wrapperProps={{ className: classes.input }}
                        InputProps={{
                            spellCheck: false,
                            endAdornment:
                                !receiverValidationMessage && (registeredAddress || receiver) ? (
                                    <div className={classes.endAdornment} onClick={openAddContactModal}>
                                        <Typography className={classes.save}>{t('save')}</Typography>
                                        <Icons.AddUser size={18} color={theme.palette.maskColor.second} />
                                    </div>
                                ) : undefined,
                            classes: { input: classes.inputText },
                        }}
                    />
                    {receiverValidationMessage || registeredAddress ? (
                        <Typography className={receiverValidationMessage ? classes.validation : classes.receiver}>
                            {receiverValidationMessage || registeredAddress}
                        </Typography>
                    ) : null}
                </div>
            </Box>
        </>
    )
})

export default AddContactInputPanel
