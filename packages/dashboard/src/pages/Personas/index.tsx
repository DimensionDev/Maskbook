import { Button, Typography } from '@material-ui/core'
import { DashboardFrame } from '../../components/DashboardFrame'

export default function Personas() {
    return (
        <DashboardFrame title="Personas" primaryAction={<Button>Create a new wallet</Button>}>
            <Typography>Hi</Typography>
        </DashboardFrame>
    )
}
