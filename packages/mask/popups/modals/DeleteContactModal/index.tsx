import { useState } from 'react'
import { useAsyncFn } from 'react-use'
import { alpha } from '@mui/system'
import { Typography } from '@mui/material'
import { buttonClasses } from '@mui/material/Button'
import { ActionButton, makeStyles, usePopupCustomSnackbar } from '@masknet/theme'
import { type SingletonModalProps } from '@masknet/shared-base'
import { useSingletonModal } from '@masknet/shared-base-ui'
import { EmojiAvatar } from '@masknet/shared'
import { formatEthereumAddress } from '@masknet/web3-shared-evm'
import { evm } from '@masknet/web3-providers'
import { BottomDrawer, type BottomDrawerProps } from '../../components/index.js'
import { Trans } from '@lingui/macro'

const useStyles = makeStyles()((theme) => ({
    button: {
        flex: 1,
    },
    secondaryButton: {
        backgroundColor: theme.palette.maskColor.thirdMain,
        color: theme.palette.maskColor.main,
        border: 'none!important',
        ['&:hover']: {
            background: theme.palette.maskColor.thirdMain,
            boxShadow: `0px 8px 25px ${alpha(theme.palette.maskColor.thirdMain, 0.1)}`,
            border: 'none',
        },
        [`&.${buttonClasses.disabled}`]: {
            color: theme.palette.maskColor.main,
            background: theme.palette.maskColor.thirdMain,
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
    address: {
        textAlign: 'center',
        color: theme.palette.maskColor.second,
        marginTop: 12,
        fontSize: 16,
    },
    name: {
        textAlign: 'center',
        color: theme.palette.maskColor.main,
        marginTop: 12,
        fontSize: 18,
        fontWeight: 700,
        maxWidth: 300,
        margin: 'auto',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
    },
}))

interface DeleteContactModalProps extends BottomDrawerProps {
    onConfirm?(): void
    address: string
    name: string
}

function DeleteContactDrawer({ onConfirm, address, name, ...rest }: DeleteContactModalProps) {
    const { classes, cx } = useStyles()

    const { showSnackbar } = usePopupCustomSnackbar()

    const [{ loading }, deleteContact] = useAsyncFn(async () => {
        await evm.state!.AddressBook?.removeContact(address)
        showSnackbar(<Trans>Contact deleted.</Trans>)
        onConfirm?.()
    }, [address, onConfirm])

    return (
        <BottomDrawer {...rest}>
            <EmojiAvatar value={address} className={classes.emojiAvatar} sx={{ width: 60, height: 60 }} />
            <Typography className={classes.name}>{name}</Typography>
            <Typography className={classes.address}>{formatEthereumAddress(address, 4)}</Typography>

            <div className={classes.buttonGroup}>
                <ActionButton className={cx(classes.button, classes.secondaryButton)} onClick={rest.onClose}>
                    <Trans>Cancel</Trans>
                </ActionButton>
                <ActionButton onClick={deleteContact} loading={loading} className={classes.button} color="error">
                    <Trans>Delete Contact</Trans>
                </ActionButton>
            </div>
        </BottomDrawer>
    )
}

export type DeleteContactModalOpenProps = Omit<DeleteContactModalProps, 'open'>
export function DeleteContactModal({ ref }: SingletonModalProps<DeleteContactModalOpenProps, boolean>) {
    const [props, setProps] = useState<DeleteContactModalOpenProps>({
        title: '',
        address: '',
        name: '',
    })

    const [open, dispatch] = useSingletonModal(ref, {
        onOpen(p) {
            setProps(p)
        },
    })
    return (
        <DeleteContactDrawer
            open={open}
            {...props}
            onClose={() => dispatch?.close(false)}
            onConfirm={() => dispatch?.close(true)}
        />
    )
}
