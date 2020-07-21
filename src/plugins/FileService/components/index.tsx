import React from 'react'
import { MemoryRouter, Route, Redirect } from 'react-router'
import { UploadArea } from './UploadArea'

export const Entry: React.FC = () => (
    <MemoryRouter>
        <Route path="/upload" component={UploadArea} />
        <Route path="/uploading" />
        <Route path="/entry/:id" />
        <Redirect to="/upload" />
    </MemoryRouter>
)
