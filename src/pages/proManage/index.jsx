import { PlusOutlined } from '@ant-design/icons';
import { Button, Divider, message, Input, Modal } from 'antd';
import React, { useState, useRef } from 'react';
import { PageContainer, FooterToolbar } from '@ant-design/pro-layout';
import ProTable from '@ant-design/pro-table';
import { getPro, list as queryPro, delete_1 as detetePro, add as addPro, update as updateById } from '@/components/api/backend/product';
import OperationModal from './components/OperationModal';

const TableList = () => {
  const [done, setDone] = useState(false);
  const [visible, setVisible] = useState(false);
  const [read, setRead] = useState(false);
  const [current, setCurrent] = useState(undefined);
  const addBtn = useRef(null);
  const actionRef = useRef();
  const columns = [
    {
      title: '产品名称',
      dataIndex: 'name',
      rules: [
        {
          required: true,
          message: '产品名称为必填项',
        },
      ],
    },
    {
      title: '产品主图',
      dataIndex: 'firstUrls',
      rules: [
        {
          required: true,
          message: '产品主图为必填项',
        },
      ],
      hideInSearch: true,
      renderText: (val) => <img style={{ width: '100px' }} src={val ? val.split(',')[0] : ''} />
    },
    {
      title: '产品banner',
      dataIndex: 'bannerUrl',
      rules: [
        {
          required: true,
          message: '产品banner为必填项',
        },
      ],
      hideInTable: true,
      hideInSearch: true,
      renderText: (val) => <img style={{ width: '100px' }} src={val} />
    },

    {
      title: '产品系列',
      dataIndex: 'seriesType',
      hideInForm: true,
      valueEnum: {
        "1": {
          text: 'ECOSAN'
        },
        "2": {
          text: 'LERO'
        },
        "3": {
          text: 'KAL'
        },
      },
    },
    {
      title: '规格',
      dataIndex: 'specification',
      rules: [
        {
          required: true,
          message: '产品规格为必填项',
        },
      ],
      hideInSearch: true
    },
    {
      title: '常规尺寸',
      dataIndex: 'size',
      rules: [
        {
          required: true,
          message: '常规尺寸为必填项',
        },
      ],
      hideInSearch: true
    },
    {
      title: '原料',
      dataIndex: 'material',
      rules: [
        {
          required: true,
          message: '原料为必填项',
        },
      ],
      hideInSearch: true
    },
    {
      title: '颜色',
      dataIndex: 'color',
      rules: [
        {
          required: true,
          message: '颜色为必填项',
        },
      ],
      hideInSearch: true
    },
    {
      title: '应用领域',
      dataIndex: 'field',
      rules: [
        {
          required: true,
          message: '应用领域为必填项',
        },
      ],
      hideInSearch: true
    },
    {
      title: '产品优势与特点',
      dataIndex: 'advantage',
      hideInTable: true,
      hideInSearch: true,
      rules: [
        {
          required: true,
          message: '产品优势与特点为必填项',
        },
      ]
    },
    // {
    //   title: '产品图',
    //   dataIndex: 'imgUrls',
    //   rules: [
    //     {
    //       required: true,
    //       message: '产品图为必填项',
    //     },
    //   ],
    //   hideInSearch: true
    // },

    {
      title: '产品详情图',
      dataIndex: 'detailUrls',
      rules: [
        {
          required: true,
          message: '产品详情图为必填项',
        },
      ],
      hideInTable: true,
      hideInSearch: true
    },
    {
      title: '产品简介',
      dataIndex: 'brief',
      valueType: 'textarea',
      hideInSearch: true,
      hideInTable: true
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
              showEditModal(record.id, false);
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
  const showEditModal = async (id) => {
    setVisible(true);
    setRead(read);
    if (id) {
      const { data: newItem } = await getPro({ id });
      console.log(newItem)
      setCurrent(newItem);
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
  };

  const handleSubmit = async (values) => {
    console.log(values)
    const id = current ? current.id : '';
    if (id) {
      values.id = id;
    }
    setAddBtnblur();
    const res = await (id ? updateById : addPro)(values);
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
      content: `确定要删除该产品吗？`,
      okText: '确认',
      cancelText: '取消',
      onOk: () => {
        detetePro({ id });
        if (actionRef.current) {
          actionRef.current.reload();
        }
      },
    });
  };
  return (
    <PageContainer>
      <ProTable
        headerTitle="查询表格"
        actionRef={actionRef}
        rowKey="key"
        toolBarRender={() => [
          <Button type="primary" onClick={() => showModal()}>
            <PlusOutlined /> 新建
          </Button>,
        ]}
        request={async (params, sorter, filter) => {
          const { current: page } = params;
          const { data: tableData = {} } = await queryPro({
            ...params,
            page,
          });
          const { rows: data, count: total } = tableData;
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
