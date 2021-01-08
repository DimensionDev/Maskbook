import { Button, Typography } from '@material-ui/core'
import { PageFrame } from '../../components/DashboardFrame'

export default function Personas() {
    return (
        <PageFrame title="Personas" primaryAction={<Button>Create a new wallet</Button>}>
            <Typography>Hi</Typography>
        </PageFrame>
    )
}
