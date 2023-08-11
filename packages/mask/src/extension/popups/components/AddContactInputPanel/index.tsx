import { memo, useCallback } from 'react'
import { Box, Typography, useTheme, type BoxProps } from '@mui/material'
import { Icons } from '@masknet/icons'
import { MaskTextField, makeStyles } from '@masknet/theme'
import { openWindow } from '@masknet/shared-base-ui'
import { ExplorerResolver } from '@masknet/web3-providers'
import { useChainContext } from '@masknet/web3-hooks-base'
import type { NetworkPluginID } from '@masknet/shared-base'
import { useI18N } from '../../../../utils/index.js'
import { ContactsContext } from '../../hook/useContactsContext.js'
import { AddContactModal } from '../../modals/modals.js'

const useStyles = makeStyles()((theme) => ({
    input: {
        flex: 1,
    },
    toText: {
        color: theme.palette.maskColor.second,
        fontSize: 14,
        fontWeight: 700,
        height: 40,
        minWidth: 32,
        marginRight: theme.spacing(0.5),
        display: 'flex',
        alignItems: 'center',
    },
    receiverPanel: {
        display: 'flex',
        alignItems: 'flex-start',
    },
    inputText: {
        fontSize: 10,
        paddingRight: '0px !important',
    },
    save: {
        color: theme.palette.maskColor.main,
        marginRight: 4,
    },
    endAdornment: {
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        paddingLeft: theme.spacing(0.5),
    },
    receiver: {
        display: 'flex',
        alignItems: 'flex-start',
        color: theme.palette.maskColor.second,
        fontSize: 13,
    },
    validation: {
        color: theme.palette.maskColor.danger,
        fontSize: 14,
    },
    warning: {
        color: theme.palette.maskColor.warn,
        fontSize: 14,
    },
    fieldWrapper: {
        flex: 1,
    },
    linkOut: {
        color: theme.palette.maskColor.main,
        marginLeft: 4,
        cursor: 'pointer',
    },
}))

interface Props extends BoxProps {
    isManage?: boolean
}

const AddContactInputPanel = memo(function AddContactInputPanel({ isManage, ...props }: Props) {
    const { t } = useI18N()
    const { classes, cx } = useStyles()
    const { chainId } = useChainContext<NetworkPluginID.PLUGIN_EVM>()
    const {
        address,
        userInput,
        setUserInput,
        inputValidationMessage: addressValidationMessage,
        inputWarningMessage,
    } = ContactsContext.useContainer()

    const theme = useTheme()

    const openAddContactModal = useCallback(() => {
        if (!address) return
        return AddContactModal.openAndWaitForClose({
            title: t('wallet_add_contact'),
            address,
            name: userInput,
        })
    }, [address, userInput])

    const addable = !addressValidationMessage && (address || userInput)
    const shouldShowAddress = !!address && address !== userInput

    return (
        <Box padding={2} {...props} className={cx(classes.receiverPanel, props.className)}>
            {isManage ? null : <Typography className={classes.toText}>{t('popups_wallet_transfer_to')}</Typography>}
            <div className={classes.fieldWrapper}>
                <MaskTextField
                    placeholder={t('wallet_transfer_placeholder')}
                    value={userInput}
                    onChange={(ev) => setUserInput(ev.target.value)}
                    wrapperProps={{ className: classes.input }}
                    InputProps={{
                        spellCheck: false,
                        endAdornment: addable ? (
                            <div className={classes.endAdornment} onClick={openAddContactModal}>
                                <Typography className={classes.save}>{t('save')}</Typography>
                                <Icons.AddUser size={18} color={theme.palette.maskColor.main} />
                            </div>
                        ) : undefined,
                        classes: { input: classes.inputText },
                    }}
                />
                {inputWarningMessage && !addressValidationMessage ? (
                    <Typography className={classes.warning} mt={1}>
                        {inputWarningMessage}
                    </Typography>
                ) : null}
                {addressValidationMessage ? (
                    <Typography className={classes.validation} mt={1}>
                        {addressValidationMessage}
                    </Typography>
                ) : shouldShowAddress ? (
                    <Typography className={classes.receiver} mt={1}>
                        {address}
                        <Icons.LinkOut
                            size={18}
                            className={classes.linkOut}
                            onClick={() => openWindow(ExplorerResolver.addressLink(chainId, address))}
                        />
                    </Typography>
                ) : null}
            </div>
        </Box>
    )
})

export default AddContactInputPanel
