import { memo } from 'react'
import { makeStyles } from '@masknet/theme'
import { PageHeader } from '../components/PageHeader'
import { useI18N } from '../../../../../utils'
import { useLocation } from 'react-router-dom'
import { useAsync } from 'react-use'
import Services from '../../../../service'
import { LoadingPlaceholder } from '../../../components/LoadingPlaceholder'

const useStyles = makeStyles()({
    container: {
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        padding: '16px 10px',
    },
    textField: {
        marginTop: 10,
    },
    form: {
        marginTop: 26,
        width: '100%',
    },
    label: {
        fontSize: 12,
        lineHeight: '16px',
        color: '#1C68F3',
    },
    tips: {
        color: '#7B8192',
        fontSize: 12,
        lineHeight: '16px',
        marginTop: 10,
    },
    tabs: {
        marginTop: 20,
        minHeight: 'unset',
    },
    tab: {
        fontSize: 12,
        lineHeight: '16px',
        padding: 9,
        minWidth: 0,
        backgroundColor: '#F7F9FA',
        minHeight: 'unset',
    },
    indicator: {
        display: 'none',
    },
    selected: {
        backgroundColor: '#ffffff',
    },
    tabPanel: {
        padding: '16px 0 0 0',
    },
    multiline: {
        width: '100%',
    },
    multilineInput: {
        padding: 6,
        backgroundColor: '#F7F9FA',
    },
    textArea: {
        padding: 0,
        fontSize: 12,
    },
    button: {
        padding: '9px 10px',
        borderRadius: 20,
    },
    error: {
        color: '#FF5F5F',
        fontSize: 12,
        marginTop: 8,
        lineHeight: '16px',
        wordBreak: 'break-all',
    },
    controller: {
        padding: '20px 10px',
    },
})

const WalletRecovery = memo(() => {
    const { t } = useI18N()
    const location = useLocation()

    const backupId = new URLSearchParams(location.search).get('backupId')
    const { loading, value } = useAsync(async () => {
        if (backupId) return Services.Welcome.getUnconfirmedBackup(backupId)
        return undefined
    }, [backupId])

    return loading ? (
        <LoadingPlaceholder />
    ) : (
        <>
            <PageHeader title={t('popups_wallet_recovered')} />
        </>
    )
})

export default WalletRecovery
