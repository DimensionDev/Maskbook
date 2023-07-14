import { ActionButton, makeStyles } from '@masknet/theme'
import { forwardRef, useState } from 'react'
import { BottomDrawer, type BottomDrawerProps } from '../../components/index.js'
import { buttonClasses } from '@mui/material/Button'
import { type SingletonModalRefCreator } from '@masknet/shared-base'
import { useSingletonModal } from '@masknet/shared-base-ui'
import { useI18N } from '../../../../utils/i18n-next-ui.js'
import { EmojiAvatar } from '@masknet/shared'
import { alpha } from '@mui/system'
import { Typography } from '@mui/material'
import { formatEthereumAddress } from '@masknet/web3-shared-evm'
import { useAsyncFn } from 'react-use'
import { Web3State } from '@masknet/web3-providers'

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
    },
}))

interface DeleteContactModalProps extends BottomDrawerProps {
    onConfirm?(): void
    address: string
    name: string
}

function DeleteContactDrawer({ onConfirm, address, name, ...rest }: DeleteContactModalProps) {
    const { classes, cx } = useStyles()
    const { t } = useI18N()

    const [{ loading }, deleteContact] = useAsyncFn(async () => {
        await Web3State.state.AddressBook?.removeAddress?.(address)
        onConfirm?.()
    }, [address])

    return (
        <BottomDrawer {...rest}>
            <EmojiAvatar address={address} className={classes.emojiAvatar} sx={{ width: 60, height: 60 }} />
            <Typography className={classes.name}>{name}</Typography>
            <Typography className={classes.address}>{formatEthereumAddress(address, 4)}</Typography>

            <div className={classes.buttonGroup}>
                <ActionButton className={cx(classes.button, classes.secondaryButton)} onClick={rest.onClose}>
                    {t('cancel')}
                </ActionButton>
                <ActionButton onClick={deleteContact} loading={loading} className={classes.button} color="error">
                    {t('wallet_delete_contact')}
                </ActionButton>
            </div>
        </BottomDrawer>
    )
}

export type DeleteContactModalOpenProps = Omit<DeleteContactModalProps, 'open'>
export const DeleteContactModal = forwardRef<SingletonModalRefCreator<DeleteContactModalOpenProps, boolean>>(
    (_, ref) => {
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
    },
)
