import { memo, useMemo } from 'react'
import { makeStyles } from '@masknet/theme'
import { useUnconfirmedRequest } from '../hooks/useUnConfirmedRequest'
import { EthereumRpcType, formatWeiToEther } from '@masknet/web3-shared'
import { Typography, Link, Button } from '@material-ui/core'
import { useI18N } from '../../../../../utils'
import { useHistory } from 'react-router-dom'
import { PopupRoutes } from '../../../index'
import { LoadingButton } from '@material-ui/lab'
import { useAsyncFn } from 'react-use'
import { WalletRPC } from '../../../../../plugins/Wallet/messages'
import Services from '../../../../service'

const useStyles = makeStyles()(() => ({
    container: {
        padding: 16,
        display: 'flex',
        flexDirection: 'column',
        flex: 1,
    },
    info: {
        backgroundColor: '#F7F9FA',
        padding: 10,
        borderRadius: 8,
    },
    title: {
        color: '#15181B',
        fontSize: 18,
        lineHeight: '24px',
        fontWeight: 500,
    },
    spender: {
        color: '#15181B',
        fontSize: 16,
        lineHeight: '22px',
        margin: '10px 0',
    },
    secondary: {
        color: '#7B8192',
        fontSize: 12,
        lineHeight: '16px',
        marginBottom: 10,
    },
    content: {
        flex: 1,
    },
    item: {
        display: 'flex',
        justifyContent: 'space-between',
    },
    label: {
        fontSize: 12,
        lineHeight: '16px',
        color: '#7B8192',
    },
    controller: {
        display: 'grid',
        gridTemplateColumns: 'repeat(2, 1fr)',
        gap: 20,
        padding: 16,
    },
    button: {
        padding: '9px 0',
        borderRadius: 20,
        fontSize: 14,
        lineHeight: '20px',
    },
}))

const ContractInteraction = memo(() => {
    const { t } = useI18N()
    const { classes } = useStyles()
    const history = useHistory()
    const { value } = useUnconfirmedRequest()

    const { spender, to, gasPrice } = useMemo(() => {
        if (
            value?.computedPayload?.type === EthereumRpcType.CONTRACT_INTERACTION &&
            value.computedPayload.name === 'approve'
        ) {
            const spender = value.computedPayload.parameters?.spender
            const { gasPrice, to } = value.computedPayload._tx
            return {
                spender,
                gasPrice,
                to,
            }
        }
        return {
            spender: '',
            gasPrice: 0,
            to: '',
        }
    }, [value])

    const [{ loading }, handleConfirm] = useAsyncFn(async () => {
        if (value) {
            await WalletRPC.deleteUnconfirmedRequest(value.payload)
            await Services.Ethereum.request(value.payload, { skipConfirmation: true })
        }
    }, [value])

    return (
        <main className={classes.container}>
            <div className={classes.info}>
                <Typography className={classes.title}>{t('popups_wallet_contract_interaction_approve')}</Typography>
                <Typography className={classes.spender}>{spender}</Typography>
                <Typography className={classes.secondary} style={{ wordBreak: 'break-all' }}>
                    {to}
                </Typography>
            </div>
            <div className={classes.content}>
                <div className={classes.item}>
                    <Typography className={classes.label}>{t('popups_wallet_contract_interaction_gas_fee')}</Typography>
                    <Typography>
                        {formatWeiToEther(gasPrice as number)} ETH
                        <Link
                            component="button"
                            onClick={() => history.push(PopupRoutes.GasSetting)}
                            style={{ marginLeft: 10 }}>
                            {t('popups_wallet_contract_interaction_edit')}
                        </Link>
                    </Typography>
                </div>

                <div className={classes.controller}>
                    <Button
                        variant="contained"
                        className={classes.button}
                        style={{ backgroundColor: '#F7F9FA', color: '#1C68F3' }}
                        onClick={() => window.close()}>
                        {t('cancel')}
                    </Button>
                    <LoadingButton
                        loading={loading}
                        variant="contained"
                        className={classes.button}
                        onClick={handleConfirm}>
                        {t('confirm')}
                    </LoadingButton>
                </div>
            </div>
        </main>
    )
})

export default ContractInteraction
