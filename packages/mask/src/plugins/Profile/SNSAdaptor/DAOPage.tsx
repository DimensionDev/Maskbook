import IframeResizer from 'iframe-resizer-react'
import { useTheme } from '@mui/material'

interface DAOPageProps {}
export function DAOPage(props: DAOPageProps) {
    const mode = useTheme().palette.mode
    return (
        <IframeResizer
            log
            src={`https://dimensiondev.github.io/DAO-Interface/?mode=${mode}`}
            frameBorder={0}
            style={{ width: '1px', minWidth: '100%' }}
        />
    )
}
