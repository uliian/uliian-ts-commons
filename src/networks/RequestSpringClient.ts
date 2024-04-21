import { HttpClient, RestResponse } from "./SpringInterface";
import qs from 'qs';

class RequestClient implements HttpClient {

    constructor(private baseUrl: string,private tokenProvider:()=>string|null) { }
  
    request<R>(requestConfig: {
      method: string;
      url: string;
      queryParams?: any;
      data?: any;
      copyFn?: ((data: R) => R) | undefined;
    }): RestResponse<R> {
      const tokenObj: string | null = this.tokenProvider()
      return req(requestConfig.url, {
        method: requestConfig.method,
        data: requestConfig.data,
        params: requestConfig.queryParams,
        paramsSerializer: (params) => qs.stringify(params, { arrayFormat: 'repeat' }),
        baseURL: this.baseUrl,
        requestInterceptors: [
          (url, options) => ({
            url,
            options: { ...options, interceptors: true, headers: { 'x-scp': tokenObj } },
          }),
        ],
        responseInterceptors: [],
      });
    }
  }