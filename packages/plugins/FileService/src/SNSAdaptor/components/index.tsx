import { MemoryRouter, Navigate, Route, Routes } from 'react-router-dom'
import { FileRouter } from '../../constants'
import { Upload } from './Upload'
import { Uploaded } from './Uploaded'
import { Uploading } from './Uploading'

export const Entry: React.FC = () => (
    <MemoryRouter>
        <Routes>
            <Route path={FileRouter.upload} element={<Upload />} />
            <Route path={FileRouter.uploading} element={<Uploading />} />
            <Route path={FileRouter.uploaded} element={<Uploaded />} />
            <Route path="*" element={<Navigate replace to={FileRouter.upload} />} />
        </Routes>
    </MemoryRouter>
)
