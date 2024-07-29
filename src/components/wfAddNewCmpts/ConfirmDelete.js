import React, { Component } from "react";

import { Modal } from "reactstrap";
import { CheckNull } from "../wfShareCmpts/wfShareFunction";
const ConfirmDelete = ({
  textConfirm,
  closeConfirm,
  resultConfirm,
  objConfirm,
}) => {
  return (
    <Modal size="lg" isOpen={true} style={{top:"35%"}}>
      <div className="modal-header" style={{ backgroundColor: "#ffc107" }}>
        <h5 className="modal-title mt-0" id="myLargeModalLabel">
          {CheckNull(textConfirm)}
        </h5>
        <button
          onClick={() => closeConfirm()}
          type="button"
          className="close"
          data-dismiss="modal"
          aria-label="Close"
        >
          <span aria-hidden="true">&times;</span>
        </button>
      </div>
      <div className="modal-body">
        <div className="text-center mt-3 col-lg-12 button-items text-right">
          <button
            type="button"
            className="btn btn-secondary btn-md waves-effect waves-light"
            onClick={() => closeConfirm()}
            data-dismiss="modal"
            aria-label="Close"
          >
            Không
          </button>
          <button
           style={{width:"66px"}}
            type="button"
            className="btn btn-info  btn-md waves-effect waves-light"
            onClick={() => resultConfirm(objConfirm)}
          >
            Có
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default ConfirmDelete;
