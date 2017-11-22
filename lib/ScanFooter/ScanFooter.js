import React from 'react';
import PropTypes from 'prop-types';
import { Row, Col } from '@folio/stripes-components/lib/LayoutGrid';
import Button from '@folio/stripes-components/lib/Button';

import ScanTotal from '../ScanTotal';
import css from './ScanFooter.css';

const ScanFooter = props => (
  <div className={css.root}>
    <Row>
      <Col xsOffset={8} xs={4}>
        <Row end="xs">
          <Col xs={8}>
            <ScanTotal total={0} />
          </Col>
          <Col xs={4}>
            <Button
              id="clickable-done"
              buttonStyle="primary noRadius"
            >End Session</Button>
          </Col>
        </Row>
      </Col>
    </Row>
  </div>
);

ScanFooter.propTypes = {

};

export default ScanFooter;
