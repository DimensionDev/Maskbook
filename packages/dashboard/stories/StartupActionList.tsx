import { story } from '@dimensiondev/maskbook-storybook-shared'
import { StartupActionList as C, StartupActionListItem } from '../src/components/StartupActionList'
import { CloudUpload, CloudDownload, Restore } from '@material-ui/icons'
const { meta, of } = story(C)

export default meta({ title: 'Components/Startup Action List' })
export const StartupActionList = of({
    children: (
        <>
            <StartupActionListItem
                icon={<CloudUpload />}
                title="Creating a new account"
                description="Local storage of accounts and data"
                action="Sign Up"
                onClick={() => {}}
            />
            <StartupActionListItem
                icon={<CloudDownload />}
                title="Sign in to your account"
                description="Support only for your local account."
                color="secondary"
                action="Sign in"
                onClick={() => {}}
            />
            <StartupActionListItem
                icon={<Restore />}
                title="Restore from backups"
                description="Restoring from historical backups. And very very very very very very very very very long text."
                color="secondary"
                action="Recovery"
                onClick={() => {}}
            />
        </>
    ),
})
