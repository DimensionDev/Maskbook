import { MemoryRouter, Navigate, Route, Routes } from 'react-router-dom'
import { FileRouter } from '../../constants'
import { Prepare } from './Prepare'
import { Uploaded } from './Uploaded'
import { Uploading } from './Uploading'

export const Entry: React.FC = () => (
    <MemoryRouter>
        <Routes>
            <Route path={FileRouter.Prepare} element={<Prepare />} />
            <Route path={FileRouter.Uploading} element={<Uploading />} />
            <Route path={FileRouter.Uploaded} element={<Uploaded />} />
            <Route path="*" element={<Navigate replace to={FileRouter.Prepare} />} />
        </Routes>
    </MemoryRouter>
)
