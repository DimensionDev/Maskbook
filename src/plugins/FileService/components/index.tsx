import React from 'react'
import { MemoryRouter, Route, Redirect } from 'react-router'

export const Entry: React.FC = () => (
    <MemoryRouter>
        <Route path="/upload" />
        <Redirect to="/upload" />
    </MemoryRouter>
)
