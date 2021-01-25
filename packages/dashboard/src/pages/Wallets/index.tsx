import { Button, Typography } from '@material-ui/core'
import { DashboardFrame } from '../../components/DashboardFrame'

export default function Wallets() {
    return (
        <DashboardFrame title="Wallets" primaryAction={<Button>Create a new wallet</Button>}>
            <Typography>Hi</Typography>
        </DashboardFrame>
    )
}
