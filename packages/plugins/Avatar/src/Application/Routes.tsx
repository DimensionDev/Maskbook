import { Navigate, Route, Routes } from 'react-router-dom'
import { NFTListDialog, type NFTListDialogRef } from './NFTListDialog.js'
import { PersonaPage } from './PersonaPage.js'
import { UploadAvatarDialog } from './UploadAvatarDialog.js'
import { type RefAttributes } from 'react'

export enum RoutePaths {
    Personas = '/personas',
    NFTPicker = '/picker',
    Upload = '/upload',
    Exit = '/exit',
}

export function AvatarRoutes({ ref }: RefAttributes<NFTListDialogRef | undefined>) {
    return (
        <Routes>
            <Route path={RoutePaths.Personas} element={<PersonaPage />} />
            <Route path={RoutePaths.NFTPicker} element={<NFTListDialog ref={ref} />} />
            <Route path={RoutePaths.Upload} element={<UploadAvatarDialog />} />
            {/* If router is embedded inside a dialog, */}
            {/* which should know it's time to close itself once we enter Exit */}
            <Route path={RoutePaths.Exit} element={null} />
            <Route path="*" element={<Navigate replace to={RoutePaths.Personas} />} />
        </Routes>
    )
}
