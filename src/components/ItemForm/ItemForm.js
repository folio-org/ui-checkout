import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { isEmpty } from 'lodash';
import { FormattedMessage } from 'react-intl';

import {
  Field,
  reduxForm,
  reset,
  getFormSubmitErrors,
} from 'redux-form';

import {
  Col,
  Button,
  Row,
  TextField,
} from '@folio/stripes/components';

import {
  withStripes,
  stripesShape,
} from '@folio/stripes/core';

import ScanTotal from '../ScanTotal';
import ErrorModal from '../ErrorModal';
import OverrideModal from '../OverrideModal';

class ItemForm extends React.Component {
  static propTypes = {
    stripes: stripesShape.isRequired,
    submitting: PropTypes.bool.isRequired,
    submitSucceeded: PropTypes.bool.isRequired,
    item: PropTypes.object,
    patron: PropTypes.object,
    handleSubmit: PropTypes.func.isRequired,
    addScannedItem: PropTypes.func.isRequired,
  };

  static defaultProps = {
    patron: {},
    item: {},
  };

  static getDerivedStateFromProps(props, { error }) {
    return { error: props.submitErrors.item || error || {} };
  }

  constructor(props) {
    super(props);

    this.barcodeEl = React.createRef();
    this.state = {
      overrideModalOpen: false,
      error: {},
    };
  }

  componentDidMount() {
    if (this.props.patron) {
      this.focusInput();
    }
  }

  componentDidUpdate(prevProps) {
    const {
      submitSucceeded,
      patron,
    } = this.props;

    if (document.activeElement === this.barcodeEl.current ||
      !patron || !patron.id) {
      return;
    }

    // Focus on the item barcode input after the patron is entered
    if (submitSucceeded || !prevProps.patron ||
      prevProps.patron.id !== patron.id) {
      this.clearForm();
      this.focusInput();
    }
  }

  setError = (error) => {
    this.setState({ error });
  };

  openOverrideModal = () => {
    this.setState({ overrideModalOpen: true });
  };

  closeOverrideModal = () => {
    this.setState({ overrideModalOpen: false });
  };

  focusInput() {
    this.barcodeEl.current.focus();
  }

  clearForm = () => {
    const { stripes: { store } } = this.props;

    this.setError({});
    store.dispatch(reset('itemForm'));
  };

 handleSubmit = (data) => {
   const {
     handleSubmit,
   } = this.props;

   handleSubmit(data);
 };

 render() {
   const {
     submitting,
     patron,
     stripes,
     item,
     addScannedItem,
   } = this.props;

   const { error } = this.state;

   const { overrideModalOpen } = this.state;
   const validationEnabled = false;

   return (
     <React.Fragment>
       <form
         id="item-form"
         onSubmit={this.handleSubmit}
       >
         <Row id="section-item">
           <Col xs={4}>
             <FormattedMessage id="ui-checkout.scanOrEnterItemBarcode">
               {placeholder => (
                 <FormattedMessage id="ui-checkout.itemId">
                   {ariaLabel => (
                     <Field
                       name="item.barcode"
                       placeholder={placeholder}
                       aria-label={ariaLabel}
                       fullWidth
                       id="input-item-barcode"
                       component={TextField}
                       inputRef={this.barcodeEl}
                       validationEnabled={validationEnabled}
                     />
                   )}
                 </FormattedMessage>
               )}
             </FormattedMessage>
           </Col>
           <Col xs={2}>
             <Button
               id="clickable-add-item"
               type="submit"
               buttonStyle="primary"
               disabled={submitting}
             >
               <FormattedMessage id="ui-checkout.enter" />
             </Button>
           </Col>
           {
            !isEmpty(patron) &&
            <Col xs={6}>
              <Row end="xs">
                <ScanTotal
                  buttonId="clickable-done"
                  {...this.props}
                />
              </Row>
            </Col>
          }
         </Row>
       </form>
       {
         !isEmpty(error) &&
         <ErrorModal
           item={item}
           message={error.barcode}
           open={!isEmpty(error)}
           openOverrideModal={this.openOverrideModal}
           onClose={this.clearForm}
         />
       }
       {
         overrideModalOpen &&
         <OverrideModal
           item={item}
           patron={patron}
           stripes={stripes}
           overrideModalOpen={overrideModalOpen}
           setError={this.setError}
           addScannedItem={addScannedItem}
           closeOverrideModal={this.closeOverrideModal}
         />
       }
     </React.Fragment>
   );
 }
}
const itemForm = reduxForm({
  form: 'itemForm',
})(withStripes(ItemForm));

export default connect(state => ({
  submitErrors: getFormSubmitErrors('itemForm')(state)
}))(itemForm);
