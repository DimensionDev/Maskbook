import IframeResizer from 'iframe-resizer-react'
import { useTheme } from '@mui/material'
import type { Dao_Payload } from './hooks/useDao'
import { useState } from 'react'

interface DAOPageProps {
    payload: Dao_Payload | undefined
    userId: string
}
export function DAOPage(props: DAOPageProps) {
    const mode = useTheme().palette.mode
    const [size, setSize] = useState({ height: 500, width: 1 })
    const onResized = (data: { height: number; width: number }) => setSize(data)

    return props.payload ? (
        <IframeResizer
            log
            checkOrigin={false}
            heightCalculationMethod="lowestElement"
            enablePublicMethods={true}
            src={`https://dimensiondev.github.io/DAO-Interface/?mode=${mode}&userId=${props.userId}`}
            frameBorder={0}
            onResized={onResized}
            style={{ width: size.width, minHeight: 1, height: size.height, minWidth: '100%' }}
        />
    ) : null
}
