/**
 * Ant Design Pro v4 use `@ant-design/pro-layout` to handle Layout.
 * You can view component api by:
 * https://github.com/ant-design/ant-design-pro-layout
 */
import ProLayout, { DefaultFooter } from '@ant-design/pro-layout';
import React, { useEffect } from 'react';
import { Link, useIntl, connect, history } from 'umi';
import { Result, Button } from 'antd';
import Authorized from '@/utils/Authorized';
import RightContent from '@/components/GlobalHeader/RightContent';
import { getAuthorityFromRouter } from '@/utils/utils';
import logo from '../assets/logo.svg';

const noMatch = (
  <Result
    status={403}
    title="403"
    subTitle="Sorry, you are not authorized to access this page."
    extra={
      <Button type="primary">
        <Link to="/user/login">Go Login</Link>
      </Button>
    }
  />
);

/**
 * use Authorized check all menu item
 */
const menuDataRender = (menuList) =>
  menuList.map((item) => {
    const localItem = {
      ...item,
      children: item.children ? menuDataRender(item.children) : undefined,
    };
    return Authorized.check(item.authority, localItem, null);
  });

const defaultFooterDom = (
  <DefaultFooter
    copyright={`${new Date().getFullYear()} 2014 All Rights Reserved rnpx 版权所有`}
    links={[
      { key: "key1", title: <div><img src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABQAAAAUCAYAAAH6ji2bAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAA4ZpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuNi1jMTM4IDc5LjE1OTgyNCwgMjAxNi8wOS8xNC0wMTowOTowMSAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wTU09Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9tbS8iIHhtbG5zOnN0UmVmPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvc1R5cGUvUmVzb3VyY2VSZWYjIiB4bWxuczp4bXA9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC8iIHhtcE1NOk9yaWdpbmFsRG9jdW1lbnRJRD0ieG1wLmRpZDoxYmE0NjA3Ny1hYzE1LTQzNzMtODFkNi1jNDRhYmRjNWYzNWQiIHhtcE1NOkRvY3VtZW50SUQ9InhtcC5kaWQ6RkJCQTREMEZDNDNCMTFFNzkzQjNEMTZCMEM5QjVGMjIiIHhtcE1NOkluc3RhbmNlSUQ9InhtcC5paWQ6RkJCQTREMEVDNDNCMTFFNzkzQjNEMTZCMEM5QjVGMjIiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIENDIDIwMTcgKE1hY2ludG9zaCkiPiA8eG1wTU06RGVyaXZlZEZyb20gc3RSZWY6aW5zdGFuY2VJRD0ieG1wLmlpZDo4MDE1YmI5NC04MTEwLTRlMTQtYmQzZS02NmViYThmOTMyZGIiIHN0UmVmOmRvY3VtZW50SUQ9ImFkb2JlOmRvY2lkOnBob3Rvc2hvcDpjNjg2OGFjNS1kZjFkLTExN2EtOTE0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" alt="警徽" /> 沪ICP备20023697号</div> }
    ]}
  />
);

const BasicLayout = (props) => {
  const {
    dispatch,
    children,
    settings,
    location = {
      pathname: '/',
    },
  } = props;
  /**
   * constructor
   */

  useEffect(() => {
    if (dispatch) {
      dispatch({
        type: 'user/fetchCurrent',
      });
    }
  }, []);
  /**
   * init variables
   */

  const handleMenuCollapse = (payload) => {
    if (dispatch) {
      dispatch({
        type: 'global/changeLayoutCollapsed',
        payload,
      });
    }
  }; // get children authority

  const authorized = getAuthorityFromRouter(props.route.routes, location.pathname || '/') || {
    authority: undefined,
  };
  const { formatMessage } = useIntl();
  return (
    <ProLayout
      logo={logo}
      formatMessage={formatMessage}
      onCollapse={handleMenuCollapse}
      onMenuHeaderClick={() => history.push('/')}
      menuItemRender={(menuItemProps, defaultDom) => {
        if (menuItemProps.isUrl || !menuItemProps.path) {
          return defaultDom;
        }

        return <Link to={menuItemProps.path}>{defaultDom}</Link>;
      }}
      breadcrumbRender={(routers = []) => [
        {
          path: '/',
          breadcrumbName: formatMessage({
            id: 'menu.home',
          }),
        },
        ...routers,
      ]}
      itemRender={(route, params, routes, paths) => {
        const first = routes.indexOf(route) === 0;
        return first ? (
          <Link to={paths.join('/')}>{route.breadcrumbName}</Link>
        ) : (
            <span>{route.breadcrumbName}</span>
          );
      }}
      footerRender={() => defaultFooterDom}
      menuDataRender={menuDataRender}
      rightContentRender={() => <RightContent />}
      {...props}
      {...settings}
    >
      <Authorized authority={authorized.authority} noMatch={noMatch}>
        {children}
      </Authorized>
    </ProLayout>
  );
};

export default connect(({ global, settings }) => ({
  collapsed: global.collapsed,
  settings,
}))(BasicLayout);
