import { useReducer } from 'react';

interface ResetAction<T> {
  type: 'reset';
  payload?: T;
}
interface DeleteAction {
  type: 'delete';
  payload: string[];
}
interface UpdateAction<T> {
  type: 'update';
  payload: Partial<T>;
}
/**
 * 指令类型
 */
type Action<T = any> = ResetAction<T> | DeleteAction | UpdateAction<T>;

/**
 * 参数hook，多用于查询参数
 * @param initParams 初始参数数据
 */
const useParams = <T extends Record<string, any> = Object>(initParams: T) => {
  const paramsReducer = (state: Partial<T>, action: Action<T>): Partial<T> => {
    switch (action.type) {
      case 'reset': {
        const resetParams = action.payload || initParams;
        return {
          ...resetParams,
        };
      }
      case 'delete': {
        const deleteKeys = action.payload;
        const deleteKeyMap: Record<string, boolean> = {};
        deleteKeys.forEach((key) => (deleteKeyMap[key] = true));
        const newState: Partial<T> = {};

        Object.keys(state).forEach((key) => {
          if (deleteKeyMap[key]) return;
          newState[key as keyof T] = state[key];
        });
        return newState;
      }
      case 'update': {
        const newParams = action.payload;
        return {
          ...state,
          ...newParams,
        };
      }
      default:
        throw new Error();
    }
  };
  const [params, dispatchParams] = useReducer(paramsReducer, initParams);
  const updateParams = (params: Partial<T>) => {
    dispatchParams({
      type: 'update',
      payload: params,
    });
  };
  return [params, updateParams, dispatchParams] as [
    Partial<T>,
    typeof updateParams,
    typeof dispatchParams
  ];
};

export default useParams;
