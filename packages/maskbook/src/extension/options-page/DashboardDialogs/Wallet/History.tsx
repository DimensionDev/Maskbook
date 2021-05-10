import { makeStyles, Theme } from '@material-ui/core'
import { useState } from 'react'
import { Clock as ClockIcon } from 'react-feather'
import type { RedPacketJSONPayload } from '../../../../plugins/RedPacket/types'
import { RedPacketInboundList, RedPacketOutboundList } from '../../../../plugins/RedPacket/UI/RedPacketList'
import { useI18N } from '../../../../utils/i18n-next-ui'
import AbstractTab, { AbstractTabProps } from '../../DashboardComponents/AbstractTab'
import { DashboardDialogCore, DashboardDialogWrapper, WrappedDialogProps } from '../Base'
import type { WalletProps } from './types'

const useHistoryDialogStyles = makeStyles((theme: Theme) => ({
    list: {
        width: '100%',
        overflow: 'auto',
    },
}))

export function DashboardWalletHistoryDialog(
    props: WrappedDialogProps<WalletProps & { onRedPacketClicked: (payload: RedPacketJSONPayload) => void }>,
) {
    const { t } = useI18N()

    const { onRedPacketClicked } = props.ComponentProps!

    const state = useState(0)
    const tabProps: AbstractTabProps = {
        tabs: [
            {
                label: t('activity_inbound'),
                children: <RedPacketInboundList onSelect={onRedPacketClicked} />,
                sx: { p: 0 },
            },
            {
                label: t('activity_outbound'),
                children: <RedPacketOutboundList onSelect={onRedPacketClicked} />,
                sx: { display: 'flex', p: 0 },
            },
        ],
        state,
        height: 350,
    }

    return (
        <DashboardDialogCore {...props}>
            <DashboardDialogWrapper
                icon={<ClockIcon />}
                iconColor="#FB5858"
                primary={t('activity')}
                content={<AbstractTab {...tabProps}></AbstractTab>}
            />
        </DashboardDialogCore>
    )
}
