import { memo } from 'react'
import { ConfirmModal } from './Confirm/index.js'

import * as modals from './modals.js'
export * from './modals.js'

export const Modals = memo(function Modals() {
    return (
        <>
            <ConfirmModal ref={modals.ConfirmModal.register} />
        </>
    )
})
