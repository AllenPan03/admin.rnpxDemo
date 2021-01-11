import React, { useState, useRef } from 'react';
import { PageContainer } from '@ant-design/pro-layout';
import ProTable from '@ant-design/pro-table';
import { list as queryMsg } from '@/components/api/backend/message';
import { formatDate } from '@/utils/utils';

const TableList = () => {
  const actionRef = useRef();
  const columns = [
    {
      title: '留言ID',
      dataIndex: 'id',
      hideInForm: true,
      hideInSearch: true
    },
    {
      title: '留言姓名',
      dataIndex: 'name',
    },
    {
      title: '留言电话',
      dataIndex: 'tel',
    },
    {
      title: '邮箱',
      dataIndex: 'email',
      hideInSearch: true
    },
    {
      title: '留言时间',
      dataIndex: 'createTime',
      hideInForm: true,
      hideInSearch: true,
      renderText: (val) => formatDate(val, "yyyy-MM-dd HH:mm:ss")
    },
    {
      title: '留言内容',
      dataIndex: 'content',
      hideInSearch: true
    }
  ];
  return (
    <PageContainer>
      <ProTable
        headerTitle="查询表格"
        actionRef={actionRef}
        rowKey="key"
        request={async (params, sorter, filter) => {
          const { current: page } = params;
          const { data: tableData = {} } = await queryMsg({
            ...params,
            page,
          });
          const { rows: data, count: total } = tableData;
          return { data, total };
        }}
        columns={columns}
      />
    </PageContainer>
  );
};

export default TableList;
