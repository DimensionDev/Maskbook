import { memo } from 'react'
import { ConfirmModal } from './ConfirmModal/index.js'
import { RenameModal } from './RenameModal/index.js'

import * as modals from './modals.js'

export const Modals = memo(function Modals() {
    return (
        <>
            <ConfirmModal ref={modals.ConfirmModal.register} />
            <RenameModal ref={modals.RenameModal.register} />
        </>
    )
})
