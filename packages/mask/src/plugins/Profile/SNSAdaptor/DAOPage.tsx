import { styled } from '@mui/material/styles'
import { useTheme } from '@mui/material'

const IFrame = styled('iframe')(({ theme }) => ({
    border: 'none',
    scrollBehavior: 'unset',
    overflowY: 'hidden',
    width: '100%',
    minHeight: '500px',
}))

interface DAOPageProps {}
export function DAOPage(props: DAOPageProps) {
    const mode = useTheme().palette.mode
    return <IFrame src={`https://dimensiondev.github.io/DAO-Interface/?mode=${mode}`} />
}
