import { Icons } from '@masknet/icons'
import { type NetworkPluginID } from '@masknet/shared-base'
import { openWindow } from '@masknet/shared-base-ui'
import { MaskTextField, makeStyles } from '@masknet/theme'
import { useChainContext } from '@masknet/web3-hooks-base'
import { EVMExplorerResolver } from '@masknet/web3-providers'
import { isSameAddress } from '@masknet/web3-shared-base'
import { Box, Typography, useTheme, type BoxProps, type InputProps } from '@mui/material'
import { memo, useCallback, useMemo } from 'react'
import { ContactsContext } from '../../hooks/index.js'
import { AddContactModal } from '../../modals/modal-controls.js'
import { Trans, msg } from '@lingui/macro'
import { useLingui } from '@lingui/react'

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
        fontSize: 14,
        paddingRight: '0px !important',
        '&&::placeholder': {
            color: theme.palette.maskColor.third,
        },
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
    autoFocus?: InputProps['autoFocus']
}

const AddContactInputPanel = memo(function AddContactInputPanel({ isManage, autoFocus, ...props }: Props) {
    const { _ } = useLingui()
    const { classes, cx } = useStyles()
    const { chainId } = useChainContext<NetworkPluginID.PLUGIN_EVM>()
    const {
        address,
        userInput,
        setUserInput,
        contacts,
        wallets,
        inputValidationMessage: addressValidationMessage,
        inputWarningMessage,
    } = ContactsContext.useContainer()

    const theme = useTheme()

    const openAddContactModal = useCallback(() => {
        if (!address) return
        return AddContactModal.openAndWaitForClose({
            title: <Trans>Add Contact</Trans>,
            address,
            name: '',
        })
    }, [address, userInput])

    const isAdded = useMemo(
        () => [...contacts, ...wallets].some((x) => isSameAddress(address, x.address)),
        [contacts, wallets, address],
    )

    const addable = !addressValidationMessage && (address || userInput) && !isAdded
    const shouldShowAddress = !!address && address !== userInput

    return (
        <Box padding={2} {...props} className={cx(classes.receiverPanel, props.className)}>
            {isManage ? null : (
                <Typography className={classes.toText}>
                    <Trans>To</Trans>
                </Typography>
            )}
            <div className={classes.fieldWrapper}>
                <MaskTextField
                    placeholder={_(msg`Ens or Address(0x)`)}
                    value={userInput}
                    onChange={(ev) => setUserInput(ev.target.value)}
                    wrapperProps={{ className: classes.input }}
                    autoFocus={autoFocus}
                    InputProps={{
                        spellCheck: false,
                        endAdornment:
                            addable ?
                                <div className={classes.endAdornment} onClick={openAddContactModal}>
                                    <Typography className={classes.save}>
                                        <Trans>Save</Trans>
                                    </Typography>
                                    <Icons.AddUser size={18} color={theme.palette.maskColor.main} />
                                </div>
                            :   undefined,
                        classes: { input: classes.inputText },
                    }}
                />
                {inputWarningMessage && !addressValidationMessage ?
                    <Typography className={classes.warning} mt={1}>
                        {inputWarningMessage}
                    </Typography>
                :   null}
                {addressValidationMessage ?
                    <Typography className={classes.validation} mt={1}>
                        {addressValidationMessage}
                    </Typography>
                : shouldShowAddress ?
                    <Typography className={classes.receiver} mt={1}>
                        {address}
                        <Icons.LinkOut
                            size={18}
                            className={classes.linkOut}
                            onClick={() => openWindow(EVMExplorerResolver.addressLink(chainId, address))}
                        />
                    </Typography>
                :   null}
            </div>
        </Box>
    )
})

export default AddContactInputPanel
