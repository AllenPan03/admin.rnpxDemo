import React, { FC, useEffect, useState } from 'react';
import { Modal, Form, Input, Select, Upload, Icon, message, Button } from 'antd';
import { API_URL } from '@/utils/request';
import { MinusCircleOutlined, PlusOutlined } from '@ant-design/icons';
// import { ConnectState } from '@/models/connect';
import { connect } from 'umi';


const { TextArea } = Input;
const formLayout = {
  labelCol: { span: 7 },
  wrapperCol: { span: 13 },
};
function getBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = error => reject(error);
  });
}
const OperationModal = (props) => {
  const [form] = Form.useForm();
  const [formRef, setFormRef] = useState();  // <---- set the ref when Form Rendered
  const [bannerUrl, setBannerUrl] = useState('');
  const [firstUrls, setfirstUrls] = useState([]);
  const [detailUrls, setDetailUrls] = useState([]);
  const [previewVisible, setPreviewVisible] = useState(false);
  const [previewImage, setPreviewImage] = useState("");
  const { done, read, visible, current, onDone, onCancel, onSubmit, currentUser } = props;
  useEffect(() => {
    if (form && !visible && formRef) {
      // 数据重置
      setBannerUrl('');
      setfirstUrls([]);
      setDetailUrls([]);
      form.resetFields();
    }
  }, [props.visible]);

  useEffect(() => {
    if (current) {
      if (current.bannerUrl) {
        // banner图回显
        setBannerUrl(current.bannerUrl);
      }
      if (current.firstUrls && current.firstUrls.length > 0) {
        // 主图回显
        const list = current.firstUrls.map((x, i) => { return { url: x, uid: i } })
        setfirstUrls(list);
      }
      if (current.detailUrls && current.detailUrls.length > 0) {
        // 详情图片回显
        const list = current.detailUrls.map((x, i) => { return { url: x, uid: i } })
        setDetailUrls(list);
      }
      if (!current.advantage) {
        current.advantage = []
      }
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
      if (bannerUrl) {
        values.bannerUrl = bannerUrl;
      }
      if (firstUrls && firstUrls.length > 0) {
        values.firstUrls = firstUrls.map(x => x.url).join(',');
      } else {
        values.firstUrls = ''
      }
      if (detailUrls && detailUrls.length > 0) {
        values.detailUrls = detailUrls.map(x => x.url).join(',');
      } else {
        values.detailUrls = ''
      }
      if (values.advantage) {
        values.advantage = values.advantage.join(',');
      } else {
        values.advantage = ''
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
      const isLt2M = file.size / 1024 / 1024 < 2;
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
        setBannerUrl(info.file.response.data);
      }
    };
    /**
     *
     * 产品主图数据更改
     * @memberof Add
     */
    const handleFirstImgChange = ({ fileList }) => {
      fileList.forEach(x => {
        if (x.response && x.response.data) {
          x.url = x.response.data;
        }
      })
      setfirstUrls(fileList)
    };

    /**
     *
     * 产品详情数据更改
     * @memberof Add
     */
    const handleDetailChange = ({ fileList }) => {
      fileList.forEach(x => {
        if (x.response && x.response.data) {
          x.url = x.response.data;
        }
      })
      setDetailUrls(fileList)
    };
    const handleCancel = () => setPreviewVisible(false);
    const handleDetailPreview = async file => {
      if (!file.url && !file.preview) {
        file.preview = await getBase64(file.originFileObj);
      }
      setPreviewVisible(true);
      setPreviewImage(file.url || file.preview)
    };
    return (
      <Form {...formLayout} ref={setFormRef} form={form} onFinish={handleFinish}>
        <Form.Item
          name="name"
          label="产品名称"
          rules={[{ required: true, message: '请填写产品全称' }]}
        >
          <Input disabled={read} placeholder="请填写产品全称" />
        </Form.Item>
        <Form.Item
          label="产品banner"
          name="bannerUrl"
          extra=""
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
            {bannerUrl ? <img src={bannerUrl} alt="avatar" style={{ width: '100%' }} /> : uploadButton}
          </Upload>
          <span style={{ fontSize: "12px", color: "#666" }}>（产品banner建议尺寸：1920*428）</span>
        </Form.Item>
        <Form.Item
          label="产品主图"
          name="firstUrls"
          extra=""
        // rules={[{ required: true, message: '请上传产品主图' }]}
        >
          <Upload
            name="file"
            listType="picture-card"
            className="avatar-uploader"
            disabled={read}
            fileList={firstUrls}
            action={`${API_URL}backend/file/upload`}
            beforeUpload={beforeHandleChange}
            onChange={handleFirstImgChange}
            headers={{ Authorization: localStorage.getItem('polo_token') }}
            onPreview={handleDetailPreview}
          >
            {firstUrls.length > 4 ? null : uploadButton}
          </Upload>
          <span style={{ fontSize: "12px", color: "#666" }}>（产品主图建议尺寸：600*400）</span>
          <Modal
            visible={previewVisible}
            title="图片预览"
            footer={null}
            onCancel={handleCancel}
          >
            <img alt="example" style={{ width: '100%' }} src={previewImage} />
          </Modal>
        </Form.Item>
        <Form.Item
          label="产品详情图"
          name="detailUrls"
          extra=""
        // rules={[{ required: true, message: '请上传产品主图' }]}
        >
          <Upload
            name="file"
            listType="picture-card"
            className="avatar-uploader"
            disabled={read}
            fileList={detailUrls}
            action={`${API_URL}backend/file/upload`}
            beforeUpload={beforeHandleChange}
            onChange={handleDetailChange}
            headers={{ Authorization: localStorage.getItem('polo_token') }}
            onPreview={handleDetailPreview}
          >
            {detailUrls.length > 15 ? null : uploadButton}
          </Upload>
          <span style={{ fontSize: "12px", color: "#666", whiteSpace: 'nowrap' }}>（详情图建议宽度1200，高度不限，单张图片大小最好低于500K）</span>
          <Modal
            visible={previewVisible}
            title="图片预览"
            footer={null}
            onCancel={handleCancel}
          >
            <img alt="example" style={{ width: '100%' }} src={previewImage} />
          </Modal>
        </Form.Item>
        <Form.Item
          name="specification"
          label="规格"
          rules={[{ required: true, message: '请填写产品规格' }]}
        >
          <Input disabled={read} placeholder="请填写产品规格" />
        </Form.Item>
        <Form.Item
          name="size"
          label="常规尺寸"
          rules={[{ required: true, message: '请填写常规尺寸' }]}
        >
          <Input disabled={read} placeholder="请填写常规尺寸" />
        </Form.Item>
        <Form.Item
          name="material"
          label="原料"
          rules={[{ required: true, message: '请填写原料' }]}
        >
          <Input disabled={read} placeholder="请填写原料" />
        </Form.Item>
        <Form.Item
          name="color"
          label="颜色"
          rules={[{ required: true, message: '请填写颜色' }]}
        >
          <Input disabled={read} placeholder="请填写颜色" />
        </Form.Item>
        <Form.Item
          name="field"
          label="应用领域"
          rules={[{ required: true, message: '请填写应用领域' }]}
        >
          <Input disabled={read} placeholder="请填写应用领域" />
        </Form.Item>
        <Form.Item
          name="brief"
          label="产品简介"
          rules={[{ required: true, message: '请填写产品简介' }, { message: '最大不能超过500个字符！', max: 500 }]}
        >
          <TextArea disabled={read} placeholder="请填写产品简介" />
        </Form.Item>
        <Form.Item
          name="seriesType"
          label="产品系列"
          rules={[{ required: true, message: '请选择产品系列' }]}
        >
          <Select placeholder="请选择" disabled={read}>
            <Select.Option value={"1"}>ECOSAN</Select.Option>
            <Select.Option value={"2"}>LERO</Select.Option>
            <Select.Option value={"3"}>KAL</Select.Option>
          </Select>
        </Form.Item>
        <Form.List name="advantage">
          {(fields, { add, remove }) => {
            return (
              <div>
                {fields && fields.length > 0 && fields.map((field, index) => (
                  <Form.Item
                    {...formLayout}
                    label={`产品优势与特点${index + 1}`}
                    required={false}
                    key={field.key}
                  >
                    <Form.Item
                      {...formLayout}
                      {...field}
                      validateTrigger={['onChange', 'onBlur']}
                      rules={[
                        {
                          required: true,
                          whitespace: true,
                          message: "请输入产品优势与特点或者删除",
                        },
                      ]}
                      noStyle
                    >
                      <TextArea disabled={read} style={{ width: '90%' }} placeholder="请填写产品优势与特点" />
                    </Form.Item>
                    {fields && fields.length > 1 ? (
                      <MinusCircleOutlined
                        className="dynamic-delete-button"
                        style={{ margin: '0 8px' }}
                        onClick={() => {
                          remove(field.name);
                        }}
                      />
                    ) : null}
                  </Form.Item>
                ))}
                <Form.Item {...formLayout} label="操作">

                  <Button
                    type="dashed"
                    onClick={() => {
                      add();
                    }}
                    style={{ width: '60%' }}
                  >
                    <PlusOutlined /> 添加产品特别与优势
                </Button>
                </Form.Item>
              </div>
            );
          }}
        </Form.List>
      </Form >
    );
  };

  return (
    <Modal
      title={done ? null : `产品${current ? '编辑' : '添加'}`}
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
