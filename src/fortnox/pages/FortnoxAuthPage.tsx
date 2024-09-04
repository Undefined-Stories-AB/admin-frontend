import {
    Card,
    CardContent,
    Button,
    Grid,
    CircularProgress,
} from '@material-ui/core';
import { useAuthenticated } from 'ra-core';
import React, { useEffect, useState } from 'react';
import { Title } from 'react-admin';
import { fetchJson } from '../../auth/common/fetchJson';
import { generateState } from '../utils/generateState';
import {
    REACT_APP_API_ENDPOINT_URL,
    REACT_APP_FRONTEND_URL,
} from '../../common/constants';
import { REACT_APP_FORTNOX_SCOPES } from '../constants';
import { JWTTokenDTO } from '../../auth/dtos/JWTToken.dto';

const cleanup = (state: string | null = null, redirect = false) => {
    if (state) localStorage.removeItem(`fortnox.${state}`);
    // Removes the query params '?code=&state=' from the URL
    window.history.replaceState(
        {},
        window.document.title,
        `${window.location.origin}/fortnox`
    );
    if (redirect) {
        window.location.assign(`${window.location.origin}/fortnox`);
    }
};

const apiUrl = REACT_APP_API_ENDPOINT_URL;

const FortnoxAuthPage = () => {
    useAuthenticated();
    const [authUrl, setAuthUrl] = useState<string | null>(null);
    const [fortnoxState, setFortnoxState] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [isAuthenticated, setAuthenticated] = useState<boolean | null>(null);

    const [error, setError] = useState<string | undefined>();

    useEffect(() => {
        if (loading) return;

        if (isAuthenticated == null) {
            setLoading(true);
            fetchJson(`${apiUrl}/fortnox/auth/authenticated`, {
                method: 'GET',
            })
                .then(({ status, json }) => {
                    if (status === 200 && typeof json?.authenticated === 'boolean') {
                        setAuthenticated(json.authenticated);
                        return;
                    }
                    setAuthenticated(false);
                })
                .catch(() => {
                    setAuthenticated(false);
                })
                .finally(() => {
                    setLoading(false);
                });
            return;
        }

        const queryParams = new URLSearchParams(window.location.search);

        const code = queryParams.get('code');
        const state = queryParams.get('state');
        const error = queryParams.get('error');

        if (error) {
            const error_description = queryParams.get('error_description');
            setError(`${error} - ${error_description}`);
            return;
        }

        if (code) {
            if (!state) {
                cleanup();
                return;
            }

            setLoading(true);
            fetchJson(`${apiUrl}/fortnox/token`, {
                method: 'POST',
                body: JSON.stringify({
                    grant_type: 'authorization_code',
                    code,
                    redirectUri: `${REACT_APP_FRONTEND_URL}/fortnox`,
                }),
            })
                .then(({ status }) => {
                    if (status === 200) {
                        setAuthenticated(true);
                    }
                })
                .catch(({ body }) => {
                    console.log({ ...body });
                })
                .finally(() => {
                    cleanup(fortnoxState);
                    setLoading(false);
                });
            return;
        }

        if (!authUrl && !isAuthenticated) {
            setLoading(true);
            const state = generateState();

            fetchJson(`${apiUrl}/fortnox/auth/url`, {
                method: 'POST',
                body: JSON.stringify({
                    redirectUri: `${REACT_APP_FRONTEND_URL}/fortnox`,
                    scopes: REACT_APP_FORTNOX_SCOPES ?? 'companyinformation',
                    state,
                }),
            })
                .then(({ json }) => {
                    const { uri, state: returnedState } = json;

                    if (state === returnedState) {
                        setFortnoxState(state);
                        setAuthUrl(uri);
                    }
                })
                .catch(({ body }) => {
                    console.log({ errors: body.errors });
                })
                .finally(() => {
                    localStorage.removeItem(`fortnox.${state}`);
                    setLoading(false);
                });
        }
    }, [authUrl, loading, fortnoxState, isAuthenticated]);

    const redirectTo = (url: string | null) => {
        console.log(`Skip redirect to: ${url}`);
        //if (url) window.location.assign(url);
    };

    return (
        <>
            <Card>
                <Title title="Fortnox Authentication Page" />
                <CardContent>
                    <Grid container justifyContent="center">
                        {isAuthenticated === true ? (
                            <h1>Authenticated Succesful</h1>
                        ) : (
                            <Button
                                type="submit"
                                color="primary"
                                variant="contained"
                                onClick={() =>
                                    error
                                        ? cleanup(fortnoxState, true)
                                        : redirectTo(authUrl)
                                }
                                disabled={loading}
                            >
                                {loading && (
                                    <CircularProgress size={18} thickness={2} />
                                )}
                                Authenticate With Fortnox
                            </Button>
                        )}
                    </Grid>
                </CardContent>
            </Card>
            {error && <div>{error}</div>}
        </>
    );
};

export default FortnoxAuthPage;
