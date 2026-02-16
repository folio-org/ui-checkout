import React from 'react';
import PropTypes from 'prop-types';
import {
  FormattedMessage,
  injectIntl,
} from 'react-intl';

import {
  Col,
  Headline,
  KeyValue,
  Row,
} from '@folio/stripes/components';
import {
  ProxyManager,
  ViewCustomFieldsRecord,
} from '@folio/stripes/smart-components';

import UserDetail from '../UserDetail';
import PatronBlock from '../PatronBlock';
import {
  MODULE_NAME,
  CUSTOM_FIELDS_ENTITY_TYPE,
} from '../../constants';
import { getCheckoutSettings } from '../../util';

import css from './ViewPatron.css';

class ViewPatron extends React.Component {
  static propTypes = {
    checkoutSettings: PropTypes.arrayOf(PropTypes.object).isRequired,
    stripes: PropTypes.shape({
      connect: PropTypes.func.isRequired,
      hasInterface: PropTypes.func.isRequired,
    }).isRequired,
    patron: PropTypes.shape({
      id: PropTypes.string,
      barcode: PropTypes.string,
      customFields: PropTypes.object,
    }).isRequired,
    proxy: PropTypes.shape({
      id: PropTypes.string,
      barcode: PropTypes.string,
      customFields: PropTypes.object,
    }).isRequired,
    onSelectPatron: PropTypes.func.isRequired,
    onClearPatron: PropTypes.func.isRequired,
    intl: PropTypes.shape({
      formatMessage: PropTypes.func.isRequired,
    }).isRequired,
    patronBlocks: PropTypes.arrayOf(PropTypes.object),
    settings: PropTypes.arrayOf(PropTypes.object),
  };

  constructor(props) {
    super(props);

    this.connectedProxyDetail = props.stripes.connect(UserDetail, { dataKey: 'proxy' });
    this.connectedPatronDetail = props.stripes.connect(UserDetail, { dataKey: 'patron' });
    this.connectedProxyManager = props.stripes.connect(ProxyManager);
  }

  renderCustomFields = (customFieldsValues) => {
    const {
      checkoutSettings,
      stripes,
    } = this.props;
    const allowedCustomFieldRefIds = getCheckoutSettings(checkoutSettings)?.allowedCustomFieldRefIds;

    if (!customFieldsValues || !stripes.hasInterface('custom-fields')) {
      return null;
    }

    return (
      <ViewCustomFieldsRecord
        backendModuleName={MODULE_NAME}
        entityType={CUSTOM_FIELDS_ENTITY_TYPE}
        customFieldsValues={customFieldsValues}
        showAccordion={false}
        columnCount={3}
        allowedRefIds={allowedCustomFieldRefIds}
        isSectionTitleEnabled={false}
      />
    );
  }

  render() {
    const {
      patron,
      proxy,
      onSelectPatron,
      onClearPatron,
      patronBlocks,
      settings,
      intl: {
        formatMessage,
      },
    } = this.props;

    const patronDetail = (
      <div className={css.detail}>
        <this.connectedPatronDetail
          id="patron-detail"
          label={
            <Headline size="medium">
              <FormattedMessage id="ui-checkout.borrower" />
            </Headline>
          }
          user={patron}
          renderLoans
          settings={settings}
          ariaLabel={formatMessage({ id: 'ui-checkout.borrower.ariaLabel' })}
          {...this.props}
        />
      </div>
    );

    const proxyDetail = (
      <div className={css.detail}>
        <this.connectedProxyDetail
          id="proxy-detail"
          label={<FormattedMessage id="ui-checkout.borrowerProxy" />}
          user={proxy}
          settings={settings}
          ariaLabel={formatMessage({ id: 'ui-checkout.proxy.ariaLabel' })}
        />
        <div className={css.section}>
          <Row>
            <Col xs={4}>
              <KeyValue
                label={<FormattedMessage id="ui-checkout.proxy.expiration" />}
                value="-"
              />
            </Col>
            {this.renderCustomFields(proxy?.customFields)}
          </Row>
        </div>
      </div>
    );

    return (
      <div>
        {patronDetail}
        <Row className={css.section}>
          <Col xs={4}>
            <PatronBlock
              patronBlocksCount={patronBlocks.length || 0}
              user={patron}
              formatMessage={formatMessage}
            />
          </Col>
          {this.renderCustomFields(patron?.customFields)}
        </Row>
        {proxy.id && proxy.id !== patron.id && proxyDetail}
        <this.connectedProxyManager
          patron={patron}
          proxy={proxy}
          onSelectPatron={onSelectPatron}
          onClose={onClearPatron}
        />
      </div>
    );
  }
}

export default injectIntl(ViewPatron);
