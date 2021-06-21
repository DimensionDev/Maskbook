import { createRef, memo } from 'react'
import { SnackbarProvider } from 'notistack'
import { makeStyles, IconButton } from '@material-ui/core'
import { MaskColorVar } from '@dimensiondev/maskbook-theme'
import { Close as CloseIcon } from '@material-ui/icons'

const useStyles = makeStyles(() => ({
    root: {
        color: MaskColorVar.textLight,
        pointerEvents: 'inherit',
    },
    success: {
        background: MaskColorVar.greenMain,
        color: MaskColorVar.lightestBackground,
    },
    error: {
        background: MaskColorVar.redMain,
        color: MaskColorVar.lightestBackground,
    },
    info: {
        background: MaskColorVar.secondaryInfoText,
        color: MaskColorVar.lightestBackground,
    },
    warning: {
        background: MaskColorVar.warning,
        color: MaskColorVar.lightestBackground,
    },
}))

export const CustomSnackbarProvider = memo(({ children }) => {
    const ref = createRef<SnackbarProvider>()
    const classes = useStyles()

    const onDismiss = (key: string | number) => () => {
        ref.current?.closeSnackbar(key)
    }

    return (
        <SnackbarProvider
            ref={ref}
            maxSnack={30}
            disableWindowBlurListener
            anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
            hideIconVariant={true}
            action={(key) => (
                <IconButton onClick={onDismiss(key)} sx={{ color: 'inherit' }}>
                    <CloseIcon color="inherit" />
                </IconButton>
            )}
            classes={{
                containerRoot: classes.root,
                variantSuccess: classes.success,
                variantError: classes.error,
                variantInfo: classes.info,
                variantWarning: classes.warning,
            }}>
            {children}
        </SnackbarProvider>
    )
})
