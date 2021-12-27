import { MemoryRouter, Redirect, Route, Switch } from 'react-router-dom'
import { FileRouter } from '../../constants'
import { Upload } from './Upload'
import { Uploaded } from './Uploaded'
import { Uploading } from './Uploading'

export const Entry: React.FC = () => (
    <MemoryRouter>
        <Switch>
            <Route path={FileRouter.upload} children={<Upload />} />
            <Route path={FileRouter.uploading} children={<Uploading />} />
            <Route path={FileRouter.uploaded} children={<Uploaded />} />
            <Redirect to={FileRouter.upload} />
        </Switch>
    </MemoryRouter>
)
