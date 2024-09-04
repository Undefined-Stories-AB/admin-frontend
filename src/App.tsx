import React from 'react';
import {
    Admin,
    CustomRoutes,
} from 'react-admin';
import { BrowserRouter, Route } from 'react-router-dom';

import jwtAuthProvider from './auth/providers/JWTAuthProvider';
import FortnoxAuthPage from './fortnox/pages/FortnoxAuthPage';


export const App = () => {
    return (
        <BrowserRouter>
            <Admin
                authProvider={jwtAuthProvider}
            >
                <CustomRoutes noLayout>
                    <Route path="/fortnox" element={<FortnoxAuthPage />} />
                </CustomRoutes>
            </Admin>
        </BrowserRouter>
    );
};
