import { useCallback, useState } from 'react'
import { DialogContent, DialogProps } from '@material-ui/core'
import { InjectedDialog } from '../../../components/shared/InjectedDialog'
import { getActivatedUI } from '../../../social-network/ui'
import { useChainId } from '../../../web3/hooks/useChainState'
import { ITO_MetaKey } from '../constants'
import type { ITO_JSONPayload } from '../types'
import type { AbstractTabProps } from '../../../extension/options-page/DashboardComponents/AbstractTab'
import AbstractTab from '../../../extension/options-page/DashboardComponents/AbstractTab'
import { useI18N } from '../../../utils/i18n-next-ui'
import { CreateItoGuide } from './CreateItoGuide'
import React from 'react'
import { MuiPickersUtilsProvider } from '@material-ui/pickers'
import DateFnsUtils from '@date-io/date-fns'

export interface ITO_CompositionDialogProps {
    open: boolean
    onClose: () => void
    DialogProps?: Partial<DialogProps>
}

export function CompositionDialog(props: ITO_CompositionDialogProps) {
    const chainId = useChainId()
    const { t } = useI18N()

    const onCreatePayload = useCallback(
        (payload: ITO_JSONPayload) => {
            // An ITO packet offering 1000000000 ETH for ordering 1000000000 * 500 MAK from public domain
            /*
        const payload: ITO_JSONPayload = {
            pid: uuid(),
            password: uuid(),
            total: new BigNumber('1000000000').toFixed(),
            sender: {
                address: '0x',
                name: 'Maskbook',
                message: 'ITO',
            },
            creation_time: new Date().getTime(),
            duration: 60 /* seconds *\/ * 60 /* mins *\/ * 24 /* hours *\/,
            network: resolveChainName(chainId) as EthereumNetwork,
            token_type: EthereumTokenType.Ether,
            exchange_ratios: ['1', '500'],
            exchange_tokens: [
                {
                    address: '0x',
                    name: 'MASKBOOK TEST TOKEN',
                    decimals: 18,
                    symbol: 'MAK',
                },
            ],
        }
        */

            // update the composition dialog
            const ref = getActivatedUI().typedMessageMetadata
            const next = new Map(ref.value.entries())
            payload ? next.set(ITO_MetaKey, payload) : next.delete(ITO_MetaKey)
            ref.value = next

            // close the dialog
            props.onClose()
        },
        [props],
    )

    const state = useState(0)

    const tabProps: AbstractTabProps = {
        tabs: [
            {
                label: t('plugin_ito_create_new'),
                children: <CreateItoGuide onCreate={onCreatePayload} />,
                p: 0,
            },
        ],
        state,
    }

    return (
        <MuiPickersUtilsProvider utils={DateFnsUtils}>
            <InjectedDialog open={props.open} title={t('plugin_ito_display_name')} onClose={props.onClose}>
                <DialogContent>
                    <AbstractTab height={362} {...tabProps} />
                </DialogContent>
            </InjectedDialog>
        </MuiPickersUtilsProvider>
    )
}
