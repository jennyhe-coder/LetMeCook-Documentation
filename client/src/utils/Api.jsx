import axios from "axios";
import { useAuth0 } from "@auth0/auth0-react";
import { useMemo } from "react";


export function useApi() {
    const { getAccessTokenSilently } = useAuth0();

    return useMemo(() => {
        const api = axios.create({
            baseURL: "http://localhost:8080",

        });

        api.interceptors.request.use(
            async (config) => {
                try {
                    const token = await getAccessTokenSilently({
                        audience: "https://letmecook/api",
                        scope: "openid profile email",
                    });
                    config.headers.Authorization = `Bearer ${token}`;
                } catch (error) {
                    console.error("Failed to get access token", error);
                }
                return config;
            },
            (error) => {
                return Promise.reject(error);
            }
        );
        return api;
    }, [getAccessTokenSilently]);
}