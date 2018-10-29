import React from 'react';
import { Row, Col } from '@folio/stripes/components';

import ScanTotal from '../ScanTotal';
import css from './ScanFooter.css';

const ScanFooter = props => (
  <div className={css.root}>
    <Row>
      <Col xsOffset={8} xs={4}>
        <Row end="xs">
          <ScanTotal buttonId="clickable-done-footer" {...props} />
        </Row>
      </Col>
    </Row>
  </div>
);

export default ScanFooter;
