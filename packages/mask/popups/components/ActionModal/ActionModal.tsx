import { Icons } from '@masknet/icons'
import { makeStyles } from '@masknet/theme'
import { Button, Drawer, backdropClasses, type DrawerProps } from '@mui/material'
import { memo, type ReactNode, useEffect } from 'react'
import { ActionModalContainer, useActionModal } from './ActionModalContext.js'

const useStyles = makeStyles()((theme) => ({
    modal: {
        display: 'flex',
        flexDirection: 'column',
        position: 'absolute',
        maxHeight: '80vh',
        padding: 18,
        borderRadius: theme.spacing(3, 3, 0, 0),
        backgroundColor: theme.palette.maskColor.bottom,
    },
    closeButton: {
        position: 'absolute',
        width: 24,
        height: 24,
        color: theme.palette.maskColor.main,
        minWidth: 'auto',
        right: 18,
        top: 18,
    },
    header: {
        fontSize: 24,
        fontWeight: 700,
        height: 40,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
    },
    content: {
        overflow: 'auto',
        '&::-webkit-scrollbar': {
            display: 'none',
        },
        marginTop: theme.spacing(2),
        // If has no action.
        '&:not(:last-child)': {
            marginBottom: theme.spacing(2),
        },
    },
    root: {
        [`& .${backdropClasses.root}`]: {
            background:
                theme.palette.mode === 'dark' ?
                    'rgba(255, 255, 255, 0.10)'
                :   'linear-gradient(0deg, rgba(0, 0, 0, 0.40) 0%, rgba(0, 0, 0, 0.40) 100%), rgba(28, 104, 243, 0.20)',
            backdropFilter: 'blur(5px)',
        },
    },
}))

export interface ActionModalBaseProps extends Omit<DrawerProps, 'onClose'> {}
interface ActionModalProps extends ActionModalBaseProps {
    header: ReactNode
    action?: ReactNode
    onClose?(): void
    headerClassName?: string
}

export const ActionModal = memo(function ActionModal({
    header,
    className,
    children,
    action = null,
    onClose,
    headerClassName,
    ...rest
}: ActionModalProps) {
    const { classes, cx } = useStyles()

    const { open, openModal, closeModal } = useActionModal()
    useEffect(openModal, [])

    return (
        <Drawer
            anchor="bottom"
            className={className}
            classes={{ paper: classes.modal, root: classes.root }}
            role="dialog"
            open={open}
            onClose={closeModal}
            {...rest}>
            <Button variant="text" disableRipple className={classes.closeButton}>
                <Icons.Close size={24} onClick={closeModal} />
            </Button>
            {header ?
                <header className={cx(classes.header, headerClassName)}>{header}</header>
            :   null}
            <div className={classes.content}>{children}</div>
            {action}
        </Drawer>
    )
})

export function wrapModal(modal: ReactNode) {
    return <ActionModalContainer>{modal}</ActionModalContainer>
}
