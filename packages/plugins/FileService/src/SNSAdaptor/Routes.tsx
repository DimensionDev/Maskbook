import { Navigate, Route, Routes } from 'react-router-dom'
import { RoutePaths } from '../constants.js'
import { Terms, FileBrowser, FilePicker, UploadFile } from './components/index.js'

export function FileRoutes() {
    return (
        <Routes>
            <Route path={RoutePaths.Browser} element={<FileBrowser />} />
            <Route path={RoutePaths.FileSelector} element={<FilePicker />} />
            <Route path={RoutePaths.UploadFile} element={<UploadFile />} />
            <Route path={RoutePaths.Terms} element={<Terms />} />
            {/* If router is embedded inside a dialog, */}
            {/* which should know it's time to close itself once we enter Exit */}
            <Route path={RoutePaths.Exit} element={null} />
            <Route path="*" element={<Navigate replace to={RoutePaths.Browser} />} />
        </Routes>
    )
}
