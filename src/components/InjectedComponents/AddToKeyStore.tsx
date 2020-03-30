import React from 'react'
import { AdditionalContent, AdditionalContentProps } from './AdditionalPostContent'
import Services from '../../extension/service'
import { useI18N } from '../../utils/i18n-next-ui'
import type { ProfileIdentifier } from '../../database/type'
import { useAsync } from 'react-use'
import CheckIcon from '@material-ui/icons/Check'
import CloseIcon from '@material-ui/icons/Close'
import { Typography, CircularProgress, makeStyles } from '@material-ui/core'
import { getUrl } from '../../utils/utils'

export interface AddToKeyStoreProps {
    provePost: string
    postBy: ProfileIdentifier
    completeComponentProps?: Partial<SuccessProps & { data: boolean }>
    completeComponent?: React.ComponentType<{ data: boolean }> | null
    waitingComponentProps?: Partial<WaitingProps>
    waitingComponent?: React.ComponentType | null
    failedComponentProps?: Partial<FailedProps>
    failedComponent?: React.ComponentType<FailedProps> | null
}
export function AddToKeyStore({ provePost, postBy, ...props }: AddToKeyStoreProps) {
    const state = useAsync(() => Services.Crypto.verifyOthersProve(provePost, postBy), [provePost, postBy])
    const { completeComponent: Success, completeComponentProps } = props
    const { failedComponent: Fail, failedComponentProps } = props
    const { waitingComponent, waitingComponentProps } = props
    if (state.loading) return render(waitingComponent, AddToKeyStoreUI.awaiting, waitingComponentProps)
    if (state.error) return render(Fail, AddToKeyStoreUI.failed, { error: state.error, ...failedComponentProps })
    else return render(Success, AddToKeyStoreUI.success, completeComponentProps)
    function render(outer: React.ComponentType<any> | null | undefined, def: React.ComponentType<any>, props?: {}) {
        if (outer === null) return null
        return React.createElement(outer || def, props)
    }
}
type SuccessProps = Partial<AdditionalContentProps>
type WaitingProps = Partial<AdditionalContentProps>
type FailedProps = Partial<AdditionalContentProps> & { error: Error }
const useStyle = makeStyles((theme) => ({
    root: {
        display: 'inline-flex',
        lineHeight: '16px',
        '& > *': {
            margin: theme.spacing(0, 0.5, 0, 0),
        },
    },
}))
const icon = <img alt="" width={16} height={16} src={getUrl('/maskbook-icon-padded.png')} />
export const AddToKeyStoreUI = {
    success: React.memo((props: SuccessProps) => {
        const { t } = useI18N()
        const classes = useStyle()
        return (
            <AdditionalContent
                header={
                    <Typography variant="caption" color="textSecondary" classes={classes}>
                        {icon}
                        <span>{t('add_to_key_store_success')}</span>
                        <CheckIcon htmlColor="green" fontSize="small" />
                    </Typography>
                }
                {...props}
            />
        )
    }),
    awaiting: React.memo((props: WaitingProps) => {
        const { t } = useI18N()
        const classes = useStyle()
        return (
            <AdditionalContent
                header={
                    <Typography variant="caption" color="textSecondary" classes={classes}>
                        {icon}
                        <span>{t('add_to_key_store_verifying')}</span>
                        <CircularProgress size={18} />
                    </Typography>
                }
                {...props}
            />
        )
    }),
    failed: React.memo(({ error, ...props }: FailedProps) => {
        const { t } = useI18N()
        const classes = useStyle()
        return (
            <AdditionalContent
                header={
                    <Typography variant="caption" color="textSecondary" classes={classes}>
                        {icon}
                        <span>{t('add_to_key_store_failed_title')}</span>
                        <CloseIcon color="error" fontSize="small" />
                    </Typography>
                }
                message={(console.error(error), t('add_to_key_store_failed_text', { error: error.message }))}
                {...props}
            />
        )
    }),
}
