import { memo, useEffect } from 'react'
import { DonateModal } from './DonateModal/index.js'
import { ResultModal } from './ResultModal/index.js'

import * as modals from './modals.js'
export * from './modals.js'

export const Modals = memo(function Modals() {
    return (
        <>
            <DonateModal ref={modals.DonateModal.register} />
            <ResultModal ref={modals.ResultModal.register} />
        </>
    )
})
