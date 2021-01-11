import React, { FC, useEffect, useState } from 'react';
import { Modal, Form, Input, Select, Upload, Icon, message, DatePicker, Row, Col } from 'antd';
import { API_URL } from '@/utils/request';
import { connect } from 'umi';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import moment from 'moment';


const formLayout1 = {
  labelCol: { span: 3 },
  wrapperCol: { span: 20 },
};
const formLayout2 = {
  labelCol: { span: 6 },
  wrapperCol: { span: 18 },
};
const modules = {
  toolbar: [
    ['bold', 'italic', 'underline', 'strike'],        // toggled buttons
    ['blockquote', 'code-block'],
    ['link', 'image'],

    [{ 'header': 1 }, { 'header': 2 }],               // custom button values
    [{ 'list': 'ordered' }, { 'list': 'bullet' }],
    [{ 'script': 'sub' }, { 'script': 'super' }],      // superscript/subscript
    [{ 'indent': '-1' }, { 'indent': '+1' }],          // outdent/indent
    [{ 'direction': 'rtl' }],                         // text direction

    // [{ 'size': ['small', false, 'large', 'huge'] }],  // custom dropdown
    [{ 'header': [1, 2, 3, 4, 5, 6, false] }],

    [{ 'color': [] }, { 'background': [] }],          // dropdown with defaults from theme
    [{ 'font': [] }],
    [{ 'align': [] }],

    ['clean']                                         // remove formatting button
  ]
}
const OperationModal = (props) => {
  const [form] = Form.useForm();
  const [formRef, setFormRef] = useState();  // <---- set the ref when Form Rendered
  const [imgUrl, setImgUrl] = useState('');
  const [content, setContent] = useState("");
  const [showTime, setShowTime] = useState("");
  const { done, read, visible, current, onDone, onCancel, onSubmit, currentUser } = props;
  useEffect(() => {
    if (form && !visible && formRef) {
      // 数据重置
      setImgUrl('');
      setContent('');
      form.resetFields();
    }
  }, [props.visible]);

  useEffect(() => {
    if (current) {
      if (current.imgUrl) {
        setImgUrl(current.imgUrl);
      }
      if (current.showTime) {
        current.showTime = moment(current.showTime)
        setShowTime(current.showTime);
      }
      if (current.info) {
        setContent(current.info);
      }
      if (visible) {
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
    console.log(values);
    if (onSubmit) {
      if (imgUrl) {
        values.imgUrl = imgUrl;
      }
      if (showTime) {
        values.showTime = showTime;
      }
      if (content) {
        values.info = content;
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
    const uploadButton = (
      <div>
        <Icon type="plus" />
        <div className="ant-upload-text">上传图片</div>
      </div>
    );

    const beforeHandleChange = (file) => {
      const isJpgOrPng = file.type === 'image/jpeg' || file.type === 'image/png';
      if (!isJpgOrPng) {
        message.error('请选择正确的图片格式!');
      }
      const isLt2M = file.size / 1024 / 1024 < 20;
      if (!isLt2M) {
        message.error('图片大小不能超过2MB!');
      }
      return isJpgOrPng && isLt2M;
    }
    /**
     *
     * 文件数据更改
     * @memberof Add
     */
    const handleChange = (info) => {
      if (info.file.status === 'uploading') {
        return;
      }
      if (info.file.status === 'done') {
        setImgUrl(info.file.response.data);
      }
    };

    const onValueChange = (value) => {
      console.log(value, 'value');
      setContent(value);
    }
    const onChangeTime = (date, dateString) => {
      setShowTime(dateString);
    }
    return (
      <Form ref={setFormRef} form={form} onFinish={handleFinish}>
        <Form.Item
          {...formLayout1}
          name="title"
          label="新闻标题"
          rules={[{ required: true, message: '请填写新闻标题' }]}
        >
          <Input disabled={read} placeholder="请填写新闻标题" />
        </Form.Item>
        <Row gutter={16}>
          <Col className="gutter-row" span={12}>
            <Form.Item
              {...formLayout2}
              label="新闻主图"
              name="imgUrl"
              extra=""
            // rules={[{ required: true, message: '请上传新闻主图' }]}
            >
              <Upload
                name="file"
                listType="picture-card"
                className="avatar-uploader"
                disabled={read}
                showUploadList={false}
                action={`${API_URL}backend/file/upload`}
                beforeUpload={beforeHandleChange}
                onChange={handleChange}
                headers={{ Authorization: localStorage.getItem('polo_token') }}
              >
                {imgUrl ? <img src={imgUrl} alt="avatar" style={{ width: '100%' }} /> : uploadButton}
              </Upload>
              <span style={{ fontSize: "12px", color: "#666" }}>（新闻主图建议尺寸：483*370）</span>
            </Form.Item>
          </Col>
          <Col className="gutter-row" span={12}>
            <Form.Item
              {...formLayout2}
              name="showTime"
              label="前台显示时间"
            >
              <DatePicker format="YYYY-MM-DD" onChange={onChangeTime} />
            </Form.Item>
          </Col>
        </Row>
        <ReactQuill
          value={content}
          theme="snow"
          modules={modules}
          style={{ width: "90%", margin: '-20px auto 0', height: "300px" }}
          onChange={onValueChange} />
      </Form >
    );
  };

  return (
    <Modal
      title={done ? null : `新闻${current ? '编辑' : '添加'}`}
      width={1000}
      bodyStyle={done ? { padding: '72px 0' } : { padding: '28px 0 100px' }}
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
