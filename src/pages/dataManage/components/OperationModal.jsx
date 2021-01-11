import React, { FC, useEffect, useState } from 'react';
import { Modal, Form, Input, Select, Upload, Icon, message, Button } from 'antd';
import { API_URL } from '@/utils/request';
import { UploadOutlined } from '@ant-design/icons';
// import { ConnectState } from '@/models/connect';
import { connect } from 'umi';

const formLayout = {
  labelCol: { span: 7 },
  wrapperCol: { span: 13 },
};
const OperationModal = (props) => {
  const [form] = Form.useForm();
  const [formRef, setFormRef] = useState();  // <---- set the ref when Form Rendered
  const [fileUrl, setFileUrl] = useState('');
  const { done, read, visible, current, onDone, onCancel, onSubmit, currentUser } = props;
  useEffect(() => {
    if (form && !visible && formRef) {
      // 数据重置
      setFileUrl('');
      form.resetFields();
    }
  }, [props.visible]);

  useEffect(() => {
    if (current) {
      if (visible && formRef) {
        form.setFieldsValue({
          ...current
        });
      }
    }
  }, [props.current]);

  const handleSubmit = () => {
    if (!form) return;
    form.submit();
  };

  const handleFinish = (values) => {
    if (onSubmit) {
      if (fileUrl) {
        values.fileUrl = fileUrl;
      }
      onSubmit(values);
    }
  };

  const modalFooter = done
    ? { footer: null, onCancel: onDone }
    : { okText: '保存', onOk: handleSubmit, onCancel };

  const getModalContent = () => {
    if (done) {
      message.success({
        content: '保存成功',
        className: 'custom-class',
        style: {
          marginTop: '20vh',
        },
      });
      onDone();
    }
    const beforeHandleChange = (file) => {
      const isLt2M = file.size / 1024 / 1024 < 10;
      if (!isLt2M) {
        message.error('文件大小不能超过10MB!');
      }
      return isLt2M;
    }
    const props = {
      name: 'file',
      action: `${API_URL}backend/file/upload`,
      headers: {
        Authorization: localStorage.getItem('polo_token'),
      },
      beforeUpload: beforeHandleChange,
      onChange(info) {
        if (info.file.status === 'uploading') {
          return;
        }
        if (info.file.status === 'done') {
          setFileUrl(info.file.response.data);
          form.setFieldsValue({
            fileUrl: info.file.response.data
          });
        }
      },
    };
    return (
      <Form {...formLayout} ref={setFormRef} form={form} onFinish={handleFinish}>
        <Form.Item
          name="name"
          label="资料名称"
          rules={[{ required: true, message: '请填写资料全称' }, { message: '请限制在六个字符内！', max: 6 }]}
        >
          <Input disabled={read} placeholder="请填写资料全称" />
        </Form.Item>
        <Form.Item
          label="上传文件"
          name="fileUrl"
          extra=""
          rules={[{ required: true, message: '请上传资料文件' }]}
        >
          <Upload {...props}>
            <Button>
              <UploadOutlined /> 上传文件
          </Button>
          </Upload>
          <span style={{ fontSize: "12px", color: "#666" }}>（文件大小请限制在10M以内）</span>
        </Form.Item>
      </Form >
    );
  };

  return (
    <Modal
      title="上传资料"
      width={640}
      bodyStyle={done ? { padding: '72px 0' } : { padding: '28px 0 0' }}
      destroyOnClose
      okButtonProps={{ disabled: read }}
      visible={visible}
      {...modalFooter}
    >
      {getModalContent()}
    </Modal>
  );
};
export default connect(({ user, loading }) => ({
  currentUser: user.currentUser,
  loading: loading.models.user,
}))(OperationModal);
