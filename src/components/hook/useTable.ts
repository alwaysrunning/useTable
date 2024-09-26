/* eslint-disable react-hooks/exhaustive-deps */
import useParams from './useParams';
import { useEffect, useState } from 'react';
import _isNil from 'lodash/isNil';
import _get from 'lodash/get';

const defaultPage = 1;
const defaultPageSize = 10;

type KvPair = { [key: string]: any };

interface IHttpConfig {
  url: string;
  baseURL?: string;
  params?: KvPair;
  dataPath: string; // 数据路径 比如 Response.MetaJobs
}

interface ISortConfig {
  Asc?: boolean; // true为升序，false为降序，默认降序
  Sort?: string; // 排序字段
  SortBy?: string; // 排序字段（后端接口参数没统一）
  Sorting?: string; // asc为升序，desc为降序，默认降序（后端接口参数没统一）
}
interface ITableConfig {
  pageSize?: number;
  page?: number;
  manual?: boolean; // 手动触发/自动触发 true/false
  asc?: boolean; // 排序，true 为升序，false 为降序
  count?: boolean; // 是否计算总数
  sort?: string;
  sortableColumns?: any[];
  pageRow?: number[];
}

interface IResponse {
  page: number;
  Rows: any[];
  size: number;
  // totalElements: number
  totalPages: number;
}

interface PagingChangeParams {
  pageIndex: number;
  pageSize: number;
}

const useTeaTable = (
  { url, params = {}, dataPath }: IHttpConfig,
  {
    pageSize = defaultPageSize,
    manual = false,
    page = defaultPage,
    sortableColumns = [],
    pageRow,
  }: ITableConfig = {}
) => {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<any>([]);
  const [sortConfig, setSortConfig] = useState<ISortConfig>({});
  const [totalCount, setTotalCount] = useState<number>(0);

  const onChange = (value: any) => {
    if (sortConfig?.Sort) {
      const Asc = value?.[0]?.order === 'asc';
      const Sort = value?.[0]?.by;
      run({}, { Asc, Sort });
    } else {
      const Sorting = value?.[0]?.order;
      const SortBy = value?.[0]?.by;
      run({}, { Sorting, SortBy });
    }
    setSortable({
      value: (value?.length && [value[0]]) || [],
    });
  };

  const [sortableConfig, setSortable] = useParams({
    columns: sortableColumns,
    value: [],
  });

  const [pagination, setPagination] = useState<Omit<IResponse, 'Rows'>>({
    page,
    size: pageSize,
    totalPages: 0,
  });

  async function fetchData(url = "", data = {}) {
    const response = await fetch(url, {
      method: "GET", 
      headers: {
        "Content-Type": "application/json",
      },
    });
    return response.json(); // parses JSON response into native JavaScript objects
  }

  const run = async (
    query: Partial<PagingChangeParams> = {},
    sortConfig: ISortConfig = {}
  ) => {
    setData([]);
    setLoading(true);
    try {
      const size = _isNil(query.pageSize) ? pagination.size : query.pageSize;
      const page = _isNil(query.pageIndex) ? pagination.page : query.pageIndex;
      const data = await fetchData(url, {
        ...params,
        PageNumber: page,
        PageSize: size,
        ...sortConfig,
      });
      

      setSortConfig(sortConfig);

      const responseData = _get(data, dataPath);
      setData(responseData || []);
      setPagination({
        page,
        size,
        totalPages:
          data?.TotalElements || data?.TotalCount || data?.Total || 0 / size,
      });
      if (data?.TotalCount) {
        setTotalCount(data?.TotalCount);
      }
    } catch (e) {
      setLoading(false);
    }
    setLoading(false);
  };

  const refresh = (sortpa: ISortConfig = {}) => {
    run(
      {
        pageIndex: defaultPage,
      },
      sortpa
    );
  };

  useEffect(() => {
    if (!manual) {
      run();
    }
  }, []);

  return {
    loading,
    data,
    setData,
    refresh,
    sortableConfig: {
      ...sortableConfig,
      onChange,
    },
    pagination: {
      pageSize: pagination.size,
      current: pagination.page,
      total: pagination.totalPages,
      pageSizeOptions: pageRow ? pageRow : [10, 20, 30, 50, 100],
      onChange: (query: any) => {
        run(query, sortConfig);
      },
    },
    run,
    totalCount,
  };
};

export default useTeaTable;
