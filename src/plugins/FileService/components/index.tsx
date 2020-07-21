import React from 'react'
import { MemoryRouter, Route, Redirect } from 'react-router'
import { Upload } from './Upload'
import { Uploaded } from './Uploaded'
import { Uploading } from './Uploading'

export const Entry: React.FC = () => (
    <MemoryRouter>
        <Route path="/upload" component={Upload} />
        <Route path="/uploading" component={Uploading} />
        <Route path="/uploaded" component={Uploaded} />
        <Redirect to="/upload" />
    </MemoryRouter>
)
