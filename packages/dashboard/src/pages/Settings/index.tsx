import { Button, Typography } from '@material-ui/core'
import { PageFrame } from '../../components/DashboardFrame'

export default function Settings() {
    return (
        <PageFrame title="Settings" primaryAction={<Button>Create a new wallet</Button>}>
            <Typography>Hi</Typography>
        </PageFrame>
    )
}
