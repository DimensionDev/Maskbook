import { useState } from 'react'
import { createContainer } from 'unstated-next'

function useDeriveState() {
    return useState(false)
}

export const DeriveStateContext = createContainer(useDeriveState)
