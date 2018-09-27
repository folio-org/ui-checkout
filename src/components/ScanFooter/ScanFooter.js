import React from 'react';
import PropTypes from 'prop-types';
import { Row, Col } from '@folio/stripes-components/lib/LayoutGrid';

import ScanTotal from '../ScanTotal';
import css from './ScanFooter.css';

const ScanFooter = props => (
  <div className={css.root}>
    <Row>
      <Col xsOffset={8} xs={4}>
        <Row end="xs">
          <ScanTotal buttonId="clickable-done-footer" translate={props.translate} {...props} />
        </Row>
      </Col>
    </Row>
  </div>
);

ScanFooter.propTypes = {
  translate: PropTypes.func.isRequired,
};
export default ScanFooter;
