import { Button } from '@material-ui/core'
import { PageFrame } from '../../components/DashboardFrame'

export default function Plugins() {
    return <PageFrame title="Plugins" primaryAction={<Button>Add a new plugin</Button>} />
}
