import { Button, Typography } from '@material-ui/core'
import { DashboardFrame } from '../../components/DashboardFrame'

export function Wallets() {
    return (
        <DashboardFrame title="Wallets" primaryAction={<Button>Create a new wallet</Button>}>
            <Typography>Hi</Typography>
        </DashboardFrame>
    )
}
