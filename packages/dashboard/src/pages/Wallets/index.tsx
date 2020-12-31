import { Button, Typography } from '@material-ui/core'
import { PageFrame } from '../../components/DashboardFrame'

export default function Wallets() {
    return (
        <PageFrame title="Wallets" primaryAction={<Button>Create a new wallet</Button>}>
            <Typography>Hi</Typography>
        </PageFrame>
    )
}
