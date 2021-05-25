import { useCallback } from 'react'
import { useSnackbar } from 'notistack'
import { Typography, Alert } from '@material-ui/core'
import { Close as CloseIcon } from '@material-ui/icons'
import { makeStyles } from '@material-ui/core'
import { useI18N } from '../index'

interface CustomAlertProps {
    title: string
    description: string
    type: 'success' | 'error'
    close: () => void
}

const useStyles = makeStyles((theme) => {
    return {
        alert: {
            display: 'flex',
            alignItems: 'center',
            fontSize: 14,
        },
        contentWrapper: {
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            width: 340,
        },
        title: {
            fontSize: 16,
        },
        icon: {
            width: 24,
            height: 24,
            cursor: 'pointer',
        },
    }
})

function CustomAlert(props: CustomAlertProps) {
    const classes = useStyles()
    return (
        <Alert className={classes.alert} variant="filled" severity={props.type}>
            <div className={classes.contentWrapper}>
                <div>
                    <Typography className={classes.title}>{props.title}</Typography>
                    <Typography>{props.description}</Typography>
                </div>
                <CloseIcon className={classes.icon} onClick={props.close} />
            </div>
        </Alert>
    )
}

export function useSnackbarCallback<P extends (...args: any[]) => Promise<T>, T>(
    executor: P,
    deps: React.DependencyList,
    onSuccess?: (ret: T) => void,
    onError?: (err: Error) => void,
    key?: string,
    title?: string,
    description?: string,
) {
    const { t } = useI18N()
    const { enqueueSnackbar, closeSnackbar } = useSnackbar()
    const close = useCallback(() => closeSnackbar(), [closeSnackbar])
    return useCallback(
        (...args) =>
            executor(...args).then(
                (res) => {
                    enqueueSnackbar(title ?? t('done'), {
                        key,
                        variant: 'success',
                        preventDuplicate: true,
                        content: description ? (
                            // Need to wrap it with <div>, otherwise it throws error:
                            // Cannot read property 'getBoundingClientRect' of null
                            <div>
                                <CustomAlert
                                    type="success"
                                    title={title ?? t('done')}
                                    description={description}
                                    close={close}
                                />
                            </div>
                        ) : undefined,
                    })
                    onSuccess?.(res)
                    return res
                },
                (err) => {
                    enqueueSnackbar(`Error: ${err.message || err}`, {
                        key,
                        variant: 'error',
                        preventDuplicate: true,
                        content: description ? (
                            <div>
                                <CustomAlert
                                    type="error"
                                    title={title ?? `Error: ${err.message || err}`}
                                    description={`Error: ${err.message || err}`}
                                    close={close}
                                />
                            </div>
                        ) : undefined,
                    })
                    onError?.(err)
                    throw err
                },
            ),
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [...deps, enqueueSnackbar, closeSnackbar, executor, onError, onSuccess, key, title],
    )
}
