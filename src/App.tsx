import {useEffect} from 'react';
import { Table } from "antd";
import useParams from './components/hook/useParams';
import useTeaTable from './components/hook/useTable';

const App = () => {
  const initialSearchs = {
    State: '',
  };

  const [params] = useParams(initialSearchs);

  const { run, loading, data, pagination } = useTeaTable(
    {
      url: '../test.json',
      params,
      dataPath: 'Rows',
    },
    {
      manual: true,
    }
  );

  useEffect(() => {
    if (params) {
      run({
        pageIndex: 1,
      });
    }
  }, [params]);
  
  return (
    <div style={{ width: '50%'}}>
      <Table 
        dataSource={data} 
        columns={[
          {
            title: 'Name',
            dataIndex: 'name',
            key: 'name',
          },
          {
            title: 'Age',
            dataIndex: 'age',
            key: 'age',
          },
          {
            title: 'Address',
            dataIndex: 'address',
            key: 'address',
          },
        ]} 
        pagination={pagination} 
      />
    </div>
  );
};

export default App;
