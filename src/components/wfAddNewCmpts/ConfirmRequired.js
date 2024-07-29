import React, { Component } from "react";

import {

  Modal,

} from "reactstrap";

class ConfirmRequired extends Component {
  constructor(props) {
    super(props);
    this.state = {
      textRequired: this.props.textRequired,
    };
    this.typingTimeout = null;
  }
  render() {
    const {
      textRequired,
    } = this.state;
    // console.log(this.state);
    return (
      <Modal isOpen={true}>
        <div className="modal-header">
          <h5 className="modal-title mt-0 text-primary" id="myLargeModalLabel">
            Thông tin quy trình chưa được nhập đủ !
          </h5>
          <button
             onClick={() => this.props.modalOpenCloseAlert(false)}
            type="button"
            className="close"
            data-dismiss="modal"
            aria-label="Close"
          >
            <span aria-hidden="true">&times;</span>
          </button>
        </div>
        <div className="modal-body">
        
            <div className="row">
            {textRequired}
            </div>
        </div>
        <div className="modal-footer">

          <div className="text-center mt-3 col-lg-12">
            <button
              type="button"
              className="btn btn-primary btn-md waves-effect waves-light"
              onClick={() => this.props.modalOpenCloseAlert(false)}
              data-dismiss="modal"
              aria-label="Close"
            >
              Đóng
              </button>
          </div>
        </div>
      </Modal>
    );
  }
}

export default ConfirmRequired;
