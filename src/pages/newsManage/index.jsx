import { PlusOutlined } from '@ant-design/icons';
import { Button, Divider, message, Input, Modal } from 'antd';
import React, { useState, useRef } from 'react';
import { PageContainer, FooterToolbar } from '@ant-design/pro-layout';
import ProTable from '@ant-design/pro-table';
import { getNews, list as queryNews, delete_1 as deteteNews, add as addNews, update as updateById } from '@/components/api/backend/news';
import OperationModal from './components/OperationModal';
import { formatDate } from '@/utils/utils';

const TableList = () => {
  const [done, setDone] = useState(false);
  const [visible, setVisible] = useState(false);
  const [read, setRead] = useState(false);
  const [current, setCurrent] = useState(undefined);
  const addBtn = useRef(null);
  const actionRef = useRef();
  const columns = [
    {
      title: '新闻ID',
      dataIndex: 'id',
      hideInForm: true,
      hideInSearch: true
    },
    {
      title: '新闻标题',
      dataIndex: 'title',
      rules: [
        {
          required: true,
          message: '新闻标题为必填项',
        },
      ],
    },
    {
      title: '新闻主图',
      dataIndex: 'imgUrl',
      rules: [
        {
          required: true,
          message: '新闻主图为必填项',
        },
      ],
      hideInSearch: true,
      renderText: (val) => <img style={{ width: '100px' }} src={val ? val.split(',')[0] : ''} />
    },
    {
      title: '创建时间',
      dataIndex: 'createTime',
      hideInForm: true,
      hideInSearch: true,
      renderText: (val) => formatDate(val, "yyyy-MM-dd HH:mm:ss")
    },
    {
      title: '前台显示时间',
      dataIndex: 'showTime',
      hideInForm: true,
      hideInSearch: true
    },
    {
      title: '操作',
      dataIndex: 'option',
      valueType: 'option',
      render: (_, record) => (
        <>
          <a
            onClick={(e) => {
              e.preventDefault();
              showEditModal(record);
            }}
          >
            编辑
          </a>
          <Divider type="vertical" />
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
  const showEditModal = async (item) => {
    setVisible(true);
    if (item) {
      console.log(item)
      // const { data: newItem } = await getNews({ id });
      setCurrent(item);
    }

  };
  const handleDone = () => {
    setAddBtnblur();
    setDone(false);
    setVisible(false);
  };

  const handleCancel = () => {
    setAddBtnblur();
    setVisible(false);
    if (actionRef.current) {
      actionRef.current.reload();
    }
  };

  const handleSubmit = async (values) => {
    console.log(values)
    const id = current ? current.id : '';
    if (id) {
      values.id = id;
    }
    setAddBtnblur();
    const res = await (id ? updateById : addNews)(values);
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
      content: `确定要删除该新闻吗？`,
      okText: '确认',
      cancelText: '取消',
      onOk: () => {
        deteteNews({ id });
        if (actionRef.current) {
          actionRef.current.reload();
        }
      },
    });
  };
  return (
    <PageContainer key="news">
      <ProTable
        headerTitle="查询表格"
        actionRef={actionRef}
        rowKey="news"
        toolBarRender={() => [
          <Button type="primary" onClick={() => showModal()}>
            <PlusOutlined /> 新建
          </Button>,
        ]}
        request={async (params, sorter, filter) => {
          const { current: page } = params;
          const { data: tableData = {} } = await queryNews({
            ...params,
            page,
            sorter,
            filter
          });
          const { rows: data, count: total } = tableData;
          data.forEach(x => x.key = x.id);
          console.log(data);
          return { data, total };
        }}
        columns={columns}
      />
      <OperationModal
        read={read}
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
