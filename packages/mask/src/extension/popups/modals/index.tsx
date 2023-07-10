import { memo } from 'react'
import { ResetWalletModal } from './ResetWalletModal/index.js'
import { DisconnectModal } from './DisconnectModal/index.js'
import { ConfirmModal } from './ConfirmModal/index.js'

import * as modals from './modals.js'
export * from './modals.js'

export const Modals = memo(function Modals() {
    return (
        <>
            <ResetWalletModal ref={modals.ResetWalletModal.register} />
            <DisconnectModal ref={modals.DisconnectModal.register} />
            <ConfirmModal ref={modals.ConfirmModal.register} />
        </>
    )
})
