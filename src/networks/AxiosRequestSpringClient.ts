import { HttpClient, RestResponse } from "./SpringInterface";
import axios, { AxiosInstance, AxiosResponse, InternalAxiosRequestConfig } from 'axios';

export class AxiosRequestSpringClient implements HttpClient {
  private axiosInstance: AxiosInstance
  constructor(private baseUrl: string, private tokenProvider: () => [string, string | undefined | null], 
  requestInterceptor?: (((value: InternalAxiosRequestConfig<any>) => InternalAxiosRequestConfig<any>))[], 
  responseInterceptor?: (((value: AxiosResponse<any, any>) => AxiosResponse<any, any> | Promise<AxiosResponse<any, any>>))[], 
  private errorHandles?: (error: any) => void) {
    this.axiosInstance = axios.create({
      baseURL: this.baseUrl,
    })
    for (const requestHandle of requestInterceptor ?? []) {
      this.axiosInstance.interceptors.request.use(requestHandle)
    }

    this.axiosInstance.interceptors.request.use(config => {
      const tokenData = this.tokenProvider()
      if (tokenData[1]) {
        // config.headers[tokenData[0]] = tokenData[1]
        config.headers[tokenData[0]]= tokenData[1]
      }
      let cfg = config
      for (let reqInter of requestInterceptor??[]){
        cfg = reqInter(cfg)
      }
      return cfg
    })

    for (const rspHandle of responseInterceptor ?? []) {
      this.axiosInstance.interceptors.response.use(rspHandle)
    }

    this.axiosInstance.interceptors.response.use(response => {
      return response
    }, error => {
      errorHandles?.(error)
      return Promise.reject(error)
    })
  }

  async request<R>(requestConfig: {
    method: string;
    url: string;
    queryParams?: any;
    data?: any;
    copyFn?: ((data: R) => R) | undefined;
    responseType?: "arraybuffer" | "blob" | "document" | "json" | "text" | "stream";
  }): RestResponse<R> {
    try{
      const rsp = await this.axiosInstance.request({
        method: requestConfig.method,
        url:  requestConfig.url,
        params: requestConfig.queryParams,
        data: requestConfig.data,
        responseType: requestConfig.responseType
      })      

      return rsp?.data
    }catch(ex:any){
      this.errorHandles?.(ex)
      throw ex
    }
  }

  async downloadFile(fileName: string, requestConfig: {
    method: string;
    url: string;
    queryParams?: any;
    data?: any;
  }) {
    const res = await this.request<Blob>({ ...requestConfig, responseType: 'blob' })
    const blob = new Blob([res]);   //注意拿到的是数据流！！
    const objectURL = URL.createObjectURL(blob);
    let btn = document.createElement('a');
    btn.download = fileName; //文件类型
    btn.href = objectURL;
    btn.click();
    URL.revokeObjectURL(objectURL);
  }
}