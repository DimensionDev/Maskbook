import React from 'react'

import { RedPacket } from '../../../extension/options-page/DashboardComponents/RedPacket'
import { Button } from '@material-ui/core'

export default function PluginRedPacket() {
    return (
        <div>
            <RedPacket simplified />
            <Button variant="contained" color="primary" style={{ width: 190, marginLeft: 'auto', display: 'block' }}>
                Open Red Packet
            </Button>
        </div>
    )
}
