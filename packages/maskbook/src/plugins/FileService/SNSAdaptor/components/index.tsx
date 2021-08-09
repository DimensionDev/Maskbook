import { MemoryRouter, Redirect, Route } from 'react-router'
import { FileRouter } from '../../constants'
import { Upload } from './Upload'
import { Uploaded } from './Uploaded'
import { Uploading } from './Uploading'

export const Entry: React.FC = () => (
    <MemoryRouter>
        <Route path={FileRouter.upload} component={Upload} />
        <Route path={FileRouter.uploading} component={Uploading} />
        <Route path={FileRouter.uploaded} component={Uploaded} />
        <Redirect to={FileRouter.upload} />
    </MemoryRouter>
)
