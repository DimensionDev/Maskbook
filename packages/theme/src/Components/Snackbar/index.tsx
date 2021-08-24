import { useRef, memo } from 'react'
import { SnackbarProvider } from 'notistack'
import { IconButton } from '@material-ui/core'
import { makeStyles } from '../../makeStyles'
import { Close as CloseIcon } from '@material-ui/icons'
import { MaskColorVar } from '../../constants'

export { SnackbarProvider, useSnackbar } from 'notistack'
export type { VariantType } from 'notistack'

const useStyles = makeStyles()({
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
})

export const CustomSnackbarProvider = memo(({ children }) => {
    const ref = useRef<SnackbarProvider>(null)
    const { classes } = useStyles()
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
