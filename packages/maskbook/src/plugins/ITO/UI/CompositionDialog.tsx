import { useCallback, useState } from 'react'
import Web3Utils from 'web3-utils'
import { createStyles, DialogContent, DialogProps, makeStyles } from '@material-ui/core'
import { InjectedDialog } from '../../../components/shared/InjectedDialog'
import { ITO_MetaKey } from '../constants'
import type { JSON_PayloadInMask } from '../types'
import { useStylesExtends } from '../../../components/custom-ui-helper'
import { useI18N } from '../../../utils/i18n-next-ui'
import AbstractTab, { AbstractTabProps } from '../../../extension/options-page/DashboardComponents/AbstractTab'
import { editActivatedPostMetadata } from '../../../social-network/ui'
import { CreateGuide } from './CreateGuide'
import { payloadOutMask } from '../helpers'
import { PoolList } from './PoolList'
import { PluginITO_RPC } from '../messages'
import Services from '../../../extension/service'
import { useChainId } from '../../../web3/hooks/useChainState'
import { useAccount } from '../../../web3/hooks/useAccount'

const useStyles = makeStyles((theme) => createStyles({}))

export interface CompositionDialogProps extends withClasses<'root'> {
    open: boolean
    onConfirm(payload: JSON_PayloadInMask): void
    onClose: () => void
    DialogProps?: Partial<DialogProps>
}

export function CompositionDialog(props: CompositionDialogProps) {
    const { t } = useI18N()
    const classes = useStylesExtends(useStyles(), props)

    const account = useAccount()
    const chainId = useChainId()

    const onCreateOrSelect = useCallback(
        async (payload: JSON_PayloadInMask) => {
            if (!payload.password)
                payload.password = await Services.Ethereum.sign(Web3Utils.sha3(payload.message) ?? '', account, chainId)
            if (!payload.password) {
                alert('Failed to sign the password.')
                return
            }
            editActivatedPostMetadata((next) =>
                payload ? next.set(ITO_MetaKey, payloadOutMask(payload)) : next.delete(ITO_MetaKey),
            )
            props.onConfirm(payload)
            // storing the created pool in DB, it helps retrieve the pool password later
            PluginITO_RPC.discoverPool('', payload)
        },
        [account, chainId, props.onConfirm],
    )

    //#region tabs
    const state = useState(0)
    const tabProps: AbstractTabProps = {
        tabs: [
            {
                label: t('plugin_ito_create_new'),
                children: <CreateGuide onCreate={onCreateOrSelect} />,
                sx: { p: 0 },
            },
            {
                label: t('plugin_ito_select_existing'),
                children: <PoolList onSend={onCreateOrSelect} />,
                sx: { p: 0 },
            },
        ],
        state,
    }
    //#endregion

    const onClose = useCallback(() => {
        const [, setValue] = state
        setValue(0)
        props.onClose()
    }, [props, state])

    return (
        <>
            <InjectedDialog
                disableBackdropClick
                open={props.open}
                title={t('plugin_ito_display_name')}
                onClose={onClose}>
                <DialogContent>
                    <AbstractTab height={540} {...tabProps} />
                </DialogContent>
            </InjectedDialog>
        </>
    )
}
