import { DependencyList, useEffect, useState } from 'react';

export type OffestPageCondition = {
  offset: number | string;
  pageSize: number;
};

export type OffsetResult<T> = {
  records: T[];
  hasMore: boolean;
  offset?: number | string;
};

export type Options = {
  dependencys?: DependencyList;
  pageSize?: number;
  ready?: () => boolean;
};

export type UseOffsetPageResult<T> = {
  offset?: number | string,
    records: T[],
    hasMore: boolean,
    loading: boolean,
    getMore: () => Promise<void>,
}

export default function useOffsetPage<T>(
  service: (page: OffestPageCondition) => Promise<OffsetResult<T>>,
  params:Record<string,any>,
  options: Options,
):UseOffsetPageResult<T> {
  const [offset, setOffset] = useState<number | string>();
  const [records, setRecords] = useState<T[]>([]);
  const [hasMore, setHasMore] = useState<boolean>(false);
  const { dependencys, pageSize, ready } = options;
  const [loading, setLoading] = useState(false);

  const run:()=>Promise<void> = () =>  {
    if (ready?.() ?? true) {
      setLoading(true)
      return service({ ...params, offset: offset ?? '0', pageSize: pageSize ?? 20 }).then((result) => {
        setOffset(result.offset);
        setRecords(preValue =>[...preValue, ...result.records]);
        setHasMore(result.hasMore);
        setLoading(false);
      });
    }
    setLoading(false)
    return Promise.resolve()
  };

  const getMore = run;

  useEffect(() => {
    setOffset("0");
    setRecords([]);
    setHasMore(false);
    run()
  }, [...(dependencys??[])]);

  return {
    offset,
    records,
    hasMore,
    loading,
    getMore
  };
}
