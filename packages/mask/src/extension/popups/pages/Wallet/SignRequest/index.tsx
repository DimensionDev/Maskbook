import { memo, useMemo } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { ActionButton } from '@masknet/theme'
import { Box } from '@mui/material'
import { useRequests, useWeb3State } from '@masknet/web3-hooks-base'
import { useI18N } from '../../../../../utils/index.js'
import { EthereumMethodType } from '@masknet/web3-shared-evm'
import { toUtf8 } from 'web3-utils'
import { BottomController } from '../../../components/BottomController/index.js'
import { useAsyncFn } from 'react-use'
import Services from '../../../../service.js'
import { PopupRoutes } from '@masknet/shared-base'
import { SignRequestInfo } from '../../../components/SignRequestInfo/index.js'
import { last } from 'lodash-es'

const SignRequest = memo(() => {
    const { t } = useI18N()
    const [params] = useSearchParams()
    const navigate = useNavigate()
    const requests = useRequests()
    const { Request } = useWeb3State()

    const lastRequest = useMemo(() => {
        return last(
            requests.filter((x) =>
                [
                    EthereumMethodType.ETH_SIGN,
                    EthereumMethodType.ETH_SIGN_TYPED_DATA,
                    EthereumMethodType.PERSONAL_SIGN,
                ].includes(x.arguments.method),
            ),
        )
    }, [requests])

    const source = params.get('source')

    const message = useMemo(() => {
        if (!lastRequest) return
        const { method, params } = lastRequest.arguments
        if (method === EthereumMethodType.ETH_SIGN || method === EthereumMethodType.ETH_SIGN_TYPED_DATA) {
            try {
                return toUtf8(params[1])
            } catch {
                return params[1]
            }
        } else if (method === EthereumMethodType.PERSONAL_SIGN) {
            return params[0]
        }
    }, [lastRequest])

    const [{ loading: confirmLoading }, handleConfirm] = useAsyncFn(async () => {
        if (!lastRequest) return
        await Request?.approveRequest(lastRequest.ID)
        if (source) await Services.Helper.removePopupWindow()
        navigate(-1)
    }, [lastRequest, Request, source])

    const [{ loading: cancelLoading }, handleCancel] = useAsyncFn(async () => {
        if (!lastRequest) return
        await Request?.denyRequest(lastRequest.ID)
        if (source) await Services.Helper.removePopupWindow()
        navigate(PopupRoutes.Wallet, { replace: true })
    }, [lastRequest, Request, source])

    return (
        <Box>
            <SignRequestInfo message={message} source={source} />
            <BottomController>
                <ActionButton loading={cancelLoading} onClick={handleCancel} fullWidth variant="outlined">
                    {t('cancel')}
                </ActionButton>
                <ActionButton loading={confirmLoading} onClick={handleConfirm} fullWidth>
                    {t('confirm')}
                </ActionButton>
            </BottomController>
        </Box>
    )
})

export default SignRequest
