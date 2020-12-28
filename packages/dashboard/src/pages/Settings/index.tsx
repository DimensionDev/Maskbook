import { Button, Typography } from '@material-ui/core'
import { DashboardFrame } from '../../components/DashboardFrame'

export default function Settings() {
    return (
        <DashboardFrame title="Settings" primaryAction={<Button>Create a new wallet</Button>}>
            <Typography>Hi</Typography>
        </DashboardFrame>
    )
}
