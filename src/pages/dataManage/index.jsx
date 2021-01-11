import { PlusOutlined } from '@ant-design/icons';
import { Button, Modal } from 'antd';
import React, { useState, useRef } from 'react';
import { PageContainer } from '@ant-design/pro-layout';
import ProTable from '@ant-design/pro-table';
import { list as queryFile, delete_1 as deteteFile, add as addFile } from '@/components/api/backend/file';
import OperationModal from './components/OperationModal';

const TableList = () => {
  const [done, setDone] = useState(false);
  const [visible, setVisible] = useState(false);
  const [current, setCurrent] = useState(undefined);
  const addBtn = useRef(null);
  const actionRef = useRef();
  const columns = [
    {
      title: '资料名称',
      dataIndex: 'name',
      rules: [
        {
          required: true,
          message: '资料名称为必填项',
        },
      ],
    },
    {
      title: '资料链接地址',
      dataIndex: 'fileUrl',
      hideInSearch: true
    },
    {
      title: '操作',
      dataIndex: 'option',
      valueType: 'option',
      render: (_, record) => (
        <>
          <a onClick={() => { doDelete(record.id) }}>删除</a>
        </>
      ),
    },
  ];
  const setAddBtnblur = () => {
    if (addBtn.current) {
      const addBtnDom = findDOMNode(addBtn.current);
      setTimeout(() => addBtnDom.blur(), 0);
    }
  };
  const showModal = () => {
    setVisible(true);
    setCurrent(undefined);
  };

  const handleDone = () => {
    setAddBtnblur();
    setDone(false);
    setVisible(false);
  };

  const handleCancel = () => {
    setAddBtnblur();
    setVisible(false);
  };

  const handleSubmit = async (values) => {
    setAddBtnblur();
    const res = await addFile(values);
    if (res && res.code === 0) {
      setDone(true);
      if (actionRef.current) {
        actionRef.current.reload();
      }
    }
  };
  // 删除操作
  const doDelete = (id) => {
    Modal.confirm({
      title: `温馨提示`,
      content: `确定要删除该资料吗？`,
      okText: '确认',
      cancelText: '取消',
      onOk: () => {
        deteteFile({ id });
        if (actionRef.current) {
          actionRef.current.reload();
        }
      },
    });
  };
  return (
    <PageContainer>
      <ProTable
        actionRef={actionRef}
        rowKey="dataManage"
        toolBarRender={() => [
          <Button type="primary" onClick={() => showModal()}>
            <PlusOutlined /> 上传资料
          </Button>,
        ]}
        request={async (params, sorter, filter) => {
          const { current: page } = params;
          const { data: tableData = {} } = await queryFile({
            ...params,
            page,
          });
          const { rows: data, count: total } = tableData;
          return { data, total };
        }}
        columns={columns}
      />
      <OperationModal
        done={done}
        current={current}
        visible={visible}
        onDone={handleDone}
        onCancel={handleCancel}
        onSubmit={handleSubmit}
      />
    </PageContainer>
  );
};

export default TableList;
