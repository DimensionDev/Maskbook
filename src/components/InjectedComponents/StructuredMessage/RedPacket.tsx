import React from 'react'

import { Button } from '@material-ui/core'
import { RedPacketSimplified } from '../../../extension/options-page/DashboardComponents/RedPacket'

export default function PluginRedPacket() {
    return (
        <div>
            <RedPacketSimplified />
            <Button variant="contained" color="primary" style={{ width: 190, marginLeft: 'auto', display: 'block' }}>
                Open Red Packet
            </Button>
        </div>
    )
}
