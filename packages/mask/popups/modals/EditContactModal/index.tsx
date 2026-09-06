import { useCallback, useMemo, useState } from 'react'
import { useAsyncFn } from 'react-use'
import { alpha, ActionButton, MaskTextField, makeStyles, useSnackbar } from '@masknet/theme'
import { buttonClasses } from '@mui/material/Button'
import { Box, Typography } from '@mui/material'
import type { SingletonModalProps } from '@masknet/shared-base'
import { useSingletonModal } from '@masknet/shared-base-ui'
import { EmojiAvatar } from '@masknet/shared'
import { formatEthereumAddress } from '@masknet/web3-shared-evm'
import { evm } from '@masknet/web3-providers'
import { isSameAddress } from '@masknet/web3-shared-base'
import { useContacts } from '@masknet/web3-hooks-base'
import { BottomDrawer, type BottomDrawerProps } from '@masknet/injected-ui/BottomDrawer'
import { ContactType } from '../../pages/Wallet/type.js'
import { Trans, useLingui } from '@lingui/react/macro'

const useStyles = makeStyles()((theme) => ({
    button: {
        flex: 1,
    },
    secondaryButton: {
        backgroundColor: theme.vars.palette.maskColor.thirdMain,
        color: theme.vars.palette.maskColor.main,
        border: 'none!important',
        ['&:hover']: {
            background: theme.vars.palette.maskColor.thirdMain,
            boxShadow: `0px 8px 25px ${alpha(theme.vars.palette.maskColor.thirdMain, 0.1)}`,
            border: 'none',
        },
        [`&.${buttonClasses.disabled}`]: {
            color: theme.vars.palette.maskColor.main,
            background: theme.vars.palette.maskColor.thirdMain,
            opacity: 0.4,
        },
    },
    emojiAvatar: {
        margin: '28px auto 12px',
        fontSize: 32,
    },
    buttonGroup: {
        marginTop: theme.spacing(3),
        display: 'flex',
        columnGap: 12,
    },
    input: {
        marginTop: 12,
        background: 'transparent',
    },
    inputRoot: {
        background: 'transparent',
        textAlign: 'center',
        fontSize: 18,
        fontWeight: 700,
        color: theme.vars.palette.maskColor.third,
        height: 30,
        caretColor: theme.vars.palette.maskColor.primary,
        border: 'none',
        outline: 'none',
        '&.Mui-focused': {
            border: 'none',
            outline: 'none',
        },
        '& .MuiInputBase-input': {
            textAlign: 'center',
        },
    },
    helperText: {
        color: theme.vars.palette.maskColor.danger,
        marginTop: 12,
    },
    address: {
        textAlign: 'center',
        color: theme.vars.palette.maskColor.second,
        marginTop: 12,
        fontSize: 16,
    },
    inputWrapper: {
        width: '100%',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        margin: '0 auto',
    },
}))

interface EditContactModalProps extends BottomDrawerProps {
    onConfirm?(): void
    setName(name: string): void
    address: string
    name: string
    type: ContactType | undefined
}

function EditContactDrawer({ onConfirm, address, name, setName, type, ...rest }: EditContactModalProps) {
    const { t } = useLingui()
    const { classes, cx } = useStyles()

    const contacts = useContacts()

    const { enqueueSnackbar } = useSnackbar()

    const nameAlreadyExist = Boolean(
        contacts?.find((contact) => contact.name === name && !isSameAddress(contact.address, address)),
    )

    const validationMessage = useMemo(() => {
        if (nameAlreadyExist) return <Trans>The wallet name already exists.</Trans>
        return ''
    }, [nameAlreadyExist])

    const [{ loading }, edit] = useAsyncFn(async () => {
        const _name = name.trim()
        if (type === ContactType.Recipient) {
            await evm.state!.AddressBook?.renameContact({ name: _name, address })
        }

        enqueueSnackbar(<Trans>Contact edited.</Trans>, { variant: 'success' })

        onConfirm?.()
    }, [name, address, type, onConfirm])

    return (
        <BottomDrawer {...rest}>
            <EmojiAvatar value={address} className={classes.emojiAvatar} sx={{ width: 60, height: 60 }} />
            <Box className={classes.inputWrapper}>
                <MaskTextField
                    variant="standard"
                    autoFocus
                    slotProps={{ htmlInput: { style: { textAlign: 'center' } } }}
                    classes={{ root: classes.inputRoot }}
                    spellCheck={false}
                    placeholder={t`Name`}
                    className={classes.input}
                    value={name}
                    onChange={(ev) => {
                        if (name.length > 18) return
                        setName(ev.target.value)
                    }}
                    error={nameAlreadyExist}
                />
            </Box>
            <Typography className={classes.address}>{formatEthereumAddress(address, 4)}</Typography>
            {validationMessage ?
                <Typography className={classes.helperText}>{validationMessage}</Typography>
            :   null}
            <div className={classes.buttonGroup}>
                <ActionButton className={cx(classes.button, classes.secondaryButton)} onClick={rest.onClose}>
                    <Trans>Cancel</Trans>
                </ActionButton>
                <ActionButton
                    onClick={edit}
                    loading={loading}
                    className={classes.button}
                    disabled={nameAlreadyExist || !name.trim()}>
                    <Trans>Confirm</Trans>
                </ActionButton>
            </div>
        </BottomDrawer>
    )
}

export type EditContactModalOpenProps = Omit<EditContactModalProps, 'open' | 'setName'>
export function EditContactModal({ ref }: SingletonModalProps<EditContactModalOpenProps, boolean>) {
    const [props, setProps] = useState<EditContactModalOpenProps>({
        title: '',
        address: '',
        name: '',
        type: undefined,
    })

    const setName = useCallback((name: string) => setProps({ ...props, name }), [props])

    const [open, dispatch] = useSingletonModal(ref, {
        onOpen(p) {
            setProps(p)
        },
    })
    return (
        <EditContactDrawer
            open={open}
            {...props}
            setName={setName}
            onClose={() => dispatch?.close(false)}
            onConfirm={() => dispatch?.close(true)}
        />
    )
}
