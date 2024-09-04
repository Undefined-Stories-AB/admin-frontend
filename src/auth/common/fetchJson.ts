import {
    type GetListParams,
    type GetManyParams,
    fetchUtils,
} from 'ra-core';
import { JWTTokenDTO } from '../dtos/JWTToken.dto';

const isManyParams = (
    params: GetListParams | GetManyParams
): params is GetManyParams => (params as GetManyParams).ids !== undefined;

const addParams = (
    url: string,
    params?: GetListParams | GetManyParams
): string => {
    if (!params) return url;
    if (isManyParams(params)) {
        if (params.ids.length > 1) {
            return `${url}?${JSON.stringify(params.ids)}`;
        }
        return `${url}/${params.ids[0].toString()}`;
    }

    const { page, perPage } = params.pagination;
    const { field, order } = params.sort;
    const queryParams = new URLSearchParams({
        sort: JSON.stringify([field, order]),
        range: JSON.stringify([(page - 1) * perPage, page * perPage - 1]),
        filter: JSON.stringify(params.filter),
        page: page.toString(),
        perPage: perPage.toString(),
    });
    if (params.meta && typeof params.meta.id === 'string') {
        return `${url}/${params.meta.id}?${queryParams.toString()}`;
    }
    return `${url}?${queryParams.toString()}`;
};

export const fetchJson = (
    url: string,
    options?: {
        headers?: Headers;
        method?: 'POST' | 'GET' | 'PUT' | 'PATCH';
        body?: string | BodyInit;
        params?: GetListParams | GetManyParams;
    }
) => {
    const fetchOptions: fetchUtils.Options & { headers: Headers } = {
        headers: new Headers({ Accept: 'application/json' }),
        ...options,
    };

    JWTTokenDTO.addAccessTokenToHeaders(fetchOptions.headers);
    fetchOptions.headers.set('Access-Control-Expose-Headers', 'Content-Range');

    return fetchUtils.fetchJson(addParams(url, options?.params), fetchOptions);
};
