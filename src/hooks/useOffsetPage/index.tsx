import { DependencyList, useEffect, useState } from 'react';

type OffestPageCondition = {
  offset: number | string;
  pageSize: number;
};

type OffsetResult<T> = {
  records: T[];
  hasMore: boolean;
  offset?: number | string;
};

type Options = {
  dependencys?: DependencyList;
  pageSize?: number;
  ready?: () => boolean;
};

export default function useOffsetPage<T>(
  service: (page: OffestPageCondition) => Promise<OffsetResult<T>>,
  params:Record<string,any>,
  options: Options,
) {
  const [offset, setOffset] = useState<number | string>();
  const [records, setRecords] = useState<T[]>([]);
  const [hasMore, setHasMore] = useState<boolean>(false);
  const { dependencys, pageSize, ready } = options;
  const [loading, setLoading] = useState(false);

  const run = () => {
    if (ready?.() ?? true) {
      service({ ...params, offset: offset ?? '0', pageSize: pageSize ?? 20 }).then((result) => {
        setOffset(result.offset);
        setRecords(preValue =>[...preValue, ...result.records]);
        setHasMore(result.hasMore);
        setLoading(false);
      });
    }
  };

  const getMore = run;

  useEffect(() => {
    setOffset(undefined);
    setRecords([]);
    setHasMore(false);
    run()
  }, [params,...dependencys??[]]);

  return {
    offset,
    records,
    hasMore,
    loading,
    getMore
  };
}
