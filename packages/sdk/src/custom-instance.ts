import Axios, { type AxiosInstance, type AxiosRequestConfig } from "axios";

let axiosInstance: AxiosInstance = Axios.create();

export interface SDKConfig {
  baseURL: string;
  getToken?: () => string | null;
  onUnauthorized?: () => void;
}

/**
 * Configure the SDK's shared axios instance.
 * Call this once at app startup before any API calls.
 */
export function configureSDK(config: SDKConfig) {
  axiosInstance = Axios.create({
    baseURL: config.baseURL,
    withCredentials: true,
  });

  if (config.getToken) {
    const getToken = config.getToken;
    axiosInstance.interceptors.request.use((cfg) => {
      const token = getToken();
      if (token) {
        cfg.headers.Authorization = `Bearer ${token}`;
      }
      return cfg;
    });
  }

  if (config.onUnauthorized) {
    const onUnauthorized = config.onUnauthorized;
    axiosInstance.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          onUnauthorized();
        }
        return Promise.reject(error);
      },
    );
  }
}

/**
 * Custom instance used by orval-generated hooks.
 */
export const customInstance = <T>(config: AxiosRequestConfig): Promise<T> => {
  const source = Axios.CancelToken.source();
  const promise = axiosInstance({
    ...config,
    cancelToken: source.token,
  }).then(({ data }) => data);

  // @ts-expect-error — orval expects cancel on promise
  promise.cancel = () => {
    source.cancel("Query was cancelled");
  };

  return promise;
};

export default customInstance;
