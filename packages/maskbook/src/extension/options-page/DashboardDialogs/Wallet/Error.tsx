import { Button } from '@material-ui/core'
import { Info as InfoIcon } from 'react-feather'
import { useHistory } from 'react-router-dom'
import { useQueryParams, useI18N, delay } from '../../../../utils'
import { DashboardRoute } from '../../Route'
import { DashboardDialogCore, DashboardDialogWrapper, WrappedDialogProps } from '../Base'

export function DashboardWalletErrorDialog(props: WrappedDialogProps<object>) {
    const { t } = useI18N()
    const history = useHistory<unknown>()
    const { error } = useQueryParams(['error'])

    let message = ''
    switch (error) {
        case 'nowallet':
            message = t('error_no_wallet')
            break
        case 'Returned error: gas required exceeds allowance (10000000) or always failing transaction':
            message = t('error_gas_feed_exceeds')
            break
        case 'Returned error: insufficient funds for gas * price value':
            message = t('error_insufficient_balance')
            break
        default:
            message = t('error_unknown')
            break
    }

    const onClose = async () => {
        props.onClose()
        // prevent UI updating before dialog disappearing
        await delay(300)
        history.replace(DashboardRoute.Wallets)
    }

    return (
        <DashboardDialogCore {...props} onClose={onClose}>
            <DashboardDialogWrapper
                size="small"
                icon={<InfoIcon />}
                iconColor="#F4637D"
                primary={t('error_wallet')}
                secondary={message}
                footer={
                    <Button variant="contained" onClick={onClose}>
                        {t('ok')}
                    </Button>
                }
            />
        </DashboardDialogCore>
    )
}
