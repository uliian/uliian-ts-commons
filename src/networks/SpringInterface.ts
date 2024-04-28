export type RestResponse<R> = Promise<R>;

export interface HttpClient {
  request: <R>(requestConfig: {
    method: string;
    url: string;
    queryParams?: any;
    data?: any;
    copyFn?: (data: R) => R;
  }) => RestResponse<R>;

  downloadFile(fileName:string,requestConfig: {
    method: string;
    url: string;
    queryParams?: any;
    data?: any;    
  }):Promise<void>
}

export interface AntdPageCondition{
  current: number;
  pageSize: number;
}

export type AntdPage<T> ={
  data: T[];
  success: boolean;
  total: number;
}

export interface PageCondition {
  index?: number;
  pageSize?: number;
}

export function uriEncoding(template: TemplateStringsArray, ...substitutions: any[]): string {
  let result = '';
  for (let i = 0; i < substitutions.length; i++) {
    result += template[i];
    result += encodeURIComponent(substitutions[i]);
  }
  result += template[template.length - 1];
  return result;
}