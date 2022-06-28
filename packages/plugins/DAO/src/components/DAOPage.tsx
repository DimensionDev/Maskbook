import { useState, useContext } from 'react'
import IframeResizer from 'iframe-resizer-react'
import type { ProfileIdentifier } from '@masknet/shared-base'
import { MaskIconPaletteContext } from '@masknet/icons'

export interface DAOPageProps {
    identifier?: ProfileIdentifier
}

export function DAOPage({ identifier }: DAOPageProps) {
    const mode = useContext(MaskIconPaletteContext)
    const [size, setSize] = useState({ height: 500, width: 1 })
    const onResized = (data: { height: number; width: number }) => setSize(data)

    if (!identifier) return null
    return (
        <IframeResizer
            log
            checkOrigin={false}
            heightCalculationMethod="lowestElement"
            enablePublicMethods
            src={`https://dimensiondev.github.io/DAO-Interface/?mode=${mode}&userId=${identifier.userId.toLowerCase()}`}
            frameBorder={0}
            onResized={onResized}
            style={{ width: size.width, minHeight: 1, height: size.height, minWidth: '100%' }}
        />
    )
}
