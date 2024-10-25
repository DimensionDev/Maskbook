import { memo } from 'react'
import { FeedDetailsModal } from './DetailsModal/index.js'
import { SocialFeedDetailsModal } from './SocialFeedDetailsModal/index.js'

import * as modals from './modals.js'

export const Modals = memo(function Modals() {
    return (
        <>
            <FeedDetailsModal ref={modals.FeedDetailsModal.register} />
            <SocialFeedDetailsModal ref={modals.SocialFeedDetailsModal.register} />
        </>
    )
})
