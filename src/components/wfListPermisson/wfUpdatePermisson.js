import React, { Component, Fragment } from "react";
import * as moment from "moment";
import { sp } from "@pnp/sp";
import "@pnp/sp/webs";
import "@pnp/sp/lists/web";
import "@pnp/sp/items";
import "@pnp/sp/profiles";
import "@pnp/sp/site-users/web";
import "@pnp/sp/site-groups/web";
import {
  Row,
  Col,
  Card,
  CardHeader,
  CardBody,
  CardTitle,
  Container,
  Modal,
  Button,
  Spinner,
} from "reactstrap";
import { Table, Thead, Tbody, Tr, Th, Td } from "react-super-responsive-table";
import {
  isNotNull,
  CheckNull,
  CheckNullSetZero,
  ISODateString,
  formatDate,
  formatActiveLabel,
  formatActiveText,
  returnArray,
  returnObject,
  TotalSLA,
  FindTitleById,
} from "../wfShareCmpts/wfShareFunction";

import shareService from "../wfShareCmpts/wfShareService";
import "../css/loading.scss";

export default class UpdatePermisson extends Component {
  constructor(props) {
    super(props);
    this.state = {
      Title: "",
      RoleCode: "",
      PriorityPoint: null,
      Save: false,
      Submit: false,
      Approve: false,
      ReAssigment: false,
      MoveTo: false,
      Reject: false,
      View: false,
      InformTo: false,
      OverWrite: "",
      items: [],
      isShowLoadingPage: false,
      isShowModal: false,
      selectedItem: this.props.selectedItem,
      selectedId: this.props.selectedId,
    };
  }

  handleChange = (e) => {
    let selectedItem = this.state.selectedItem;
    const { name, value, type, checked } = e.target;
    const updatedValue = type === "checkbox" ? checked : value;
    selectedItem[name] = updatedValue;
    this.setState({
      selectedItem: selectedItem,
    });
  };

  componentDidMount() {
    const { selectedItem } = this.props;
    if(selectedItem){
        this.setState({
            Title: selectedItem.Title,
            RoleCode: selectedItem.RoleCode,
            PriorityPoint: selectedItem.PriorityPoint,
            OverWrite: selectedItem.OverWrite,
            Save: selectedItem.Save,
            Submit: selectedItem.Submit,
            Approve: selectedItem.Approve,
            ReAssigment: selectedItem.ReAssigment,
            MoveTo: selectedItem.MoveTo,
            Reject: selectedItem.Reject,
            View: selectedItem.View,
            InformTo: selectedItem.InformTo,
        });
    }
    
  }

  async updateItemToList(listName, id, item) {
    let itemsUpdate = { success: "", errors: "" };
    await sp.web.lists
      .getByTitle(listName)
      .items.getById(id)
      .update(item)
      .then(() => {
        itemsUpdate.success = "success";
      })
      .catch((error) => {
        console.log(error);
        itemsUpdate.errors = error;
      });

    return itemsUpdate;
  }

  async handleUpdate() {
    const { selectedId, selectedItem } = this.state;
    let obj = {
      Id: selectedItem.Id,
      Title: selectedItem.Title,
      RoleCode: selectedItem.RoleCode,
      PriorityPoint: selectedItem.PriorityPoint,
      OverWrite: selectedItem.OverWrite,
      Save: selectedItem.Save,
      Submit: selectedItem.Submit,
      Approve: selectedItem.Approve,
      ReAssigment: selectedItem.ReAssigment,
      MoveTo: selectedItem.MoveTo,
      Reject: selectedItem.Reject,
      View: selectedItem.View,
      InformTo: selectedItem.InformTo,
    };

    const result = await this.updateItemToList(
      "ListPermissonByRole",
      selectedId,
      obj
    );
    if (result.success === "success") {
      this.props.toggleUpdatePermisson(obj);
    }
  }

  refreshForm = () => {
    this.setState({
      Title: "",
      RoleCode: "",
      PriorityPoint: "",
      OverWrite: "",
      Save: false,
      Submit: false,
      Approve: false,
      ReAssigment: false,
      MoveTo: false,
      Reject: false,
      View: false,
      InformTo: false,
    });
  };

  render() {
    const { selectedItem } = this.state;
    return (
      <Modal size="xl" isOpen={true}>
        <div className="modal-header">
          <h5 className="modal-title mt-0 text-primary" id="myLargeModalLabel">
            Thêm mới permisson
          </h5>
          <button
            type="button"
            className="close"
            data-dismiss="modal"
            aria-label="Close"
            onClick={() => this.props.toggleUpdateP(false)}
          >
            <span arial-hidden="true">&times;</span>
          </button>
        </div>

        <div className="modal-body">
          <div className="row mb-3">
            <div className="col-lg-12">
              <div className="form-group row">
                <label
                  for="example-text-input"
                  className="col-md-3 col-form-label"
                >
                  Tên tiêu đề
                </label>
                <div className="col-md-9">
                  <input
                    className="form-control"
                    type="text"
                    name="Title"
                    value={selectedItem.Title}
                    onChange={this.handleChange}
                  />
                </div>
              </div>
            </div>

            <div className="col-lg-12">
              <div className="form-group row">
                <label
                  for="example-text-input"
                  className="col-md-3 col-form-label"
                >
                  Vai trò
                </label>
                <div className="col-md-9">
                  <input
                    className="form-control"
                    type="text"
                    name="RoleCode"
                    value={selectedItem.RoleCode}
                    onChange={this.handleChange}
                  />
                </div>
              </div>
            </div>

            <div className="col-lg-12">
              <div className="form-group row">
                <label
                  for="example-text-input"
                  className="col-md-3 col-form-label"
                >
                  PriorityPoint
                </label>
                <div className="col-md-9">
                  <input
                    className="form-control"
                    type="text"
                    name="PriorityPoint"
                    value={selectedItem.PriorityPoint}
                    onChange={this.handleChange}
                  />
                </div>
              </div>
            </div>

            <div className="col-lg-12">
              <div className="form-group row">
                <label
                  for="example-text-input"
                  className="col-md-3 col-form-label"
                >
                  OverWrite
                </label>
                <div className="col-md-9">
                  <input
                    className="form-control"
                    type="text"
                    name="OverWrite"
                    value={selectedItem.OverWrite}
                    onChange={this.handleChange}
                  />
                </div>
              </div>
            </div>

            <div className="col-lg-3">
              <div className="form-group row">
                <label
                  for="example-check-input"
                  className="col-md-4 col-form-label"
                >
                  Save
                </label>
                <div className="col-md-1">
                  <input
                    className="form-check mt-2"
                    type="checkbox"
                    name="Save"
                    onChange={this.handleChange}
                    checked={selectedItem.Save}
                  />
                </div>
              </div>
            </div>

            <div className="col-lg-3">
              <div className="form-group row">
                <label
                  for="example-check-input"
                  className="col-md-3 col-form-label"
                >
                  Submit
                </label>
                <div className="col-md-1">
                  <input
                    className="form-check mt-2"
                    type="checkbox"
                    name="Submit"
                    checked={selectedItem.Submit}
                    onChange={this.handleChange}
                  />
                </div>
              </div>
            </div>

            <div className="col-lg-3">
              <div className="form-group row">
                <label
                  for="example-check-input"
                  className="col-md-4 col-form-label"
                >
                  Approve
                </label>
                <div className="col-md-1">
                  <input
                    className="form-check mt-2"
                    type="checkbox"
                    name="Approve"
                    checked={selectedItem.Approve}
                    onChange={this.handleChange}
                  />
                </div>
              </div>
            </div>

            <div className="col-lg-3">
              <div className="form-group row">
                <label
                  for="example-check-input"
                  className="col-md-5 col-form-label"
                >
                  ReAssigment
                </label>
                <div className="col-md-1">
                  <input
                    className="form-check mt-2"
                    type="checkbox"
                    name="ReAssigment"
                    checked={selectedItem.ReAssigment}
                    onChange={this.handleChange}
                  />
                </div>
              </div>
            </div>

            <div className="col-lg-3">
              <div className="form-group row">
                <label
                  for="example-check-input"
                  className="col-md-4 col-form-label"
                >
                  MoveTo
                </label>
                <div className="col-md-1">
                  <input
                    className="form-check mt-2"
                    type="checkbox"
                    name="MoveTo"
                    checked={selectedItem.MoveTo}
                    onChange={this.handleChange}
                  />
                </div>
              </div>
            </div>

            <div className="col-lg-3">
              <div className="form-group row">
                <label
                  for="example-check-input"
                  className="col-md-3 col-form-label"
                >
                  Reject
                </label>
                <div className="col-md-1">
                  <input
                    className="form-check mt-2"
                    type="checkbox"
                    name="Reject"
                    checked={selectedItem.Reject}
                    onChange={this.handleChange}
                  />
                </div>
              </div>
            </div>

            <div className="col-lg-3">
              <div className="form-group row">
                <label
                  for="example-check-input"
                  className="col-md-4 col-form-label"
                >
                  View
                </label>
                <div className="col-md-1">
                  <input
                    className="form-check mt-2"
                    type="checkbox"
                    name="View"
                    checked={selectedItem.View}
                    onChange={this.handleChange}
                  />
                </div>
              </div>
            </div>

            <div className="col-lg-3">
              <div className="form-group row">
                <label
                  for="example-check-input"
                  className="col-md-5 col-form-label"
                >
                  InformTo
                </label>
                <div className="col-md-1">
                  <input
                    className="form-check mt-2"
                    type="checkbox"
                    name="InformTo"
                    checked={selectedItem.InformTo}
                    onChange={this.handleChange}
                  />
                </div>
              
              </div>
            </div>

            <div className="col-lg-12">
              <div className="button-items text-center mt-3">
                <button
                  type="button"
                  className="btn btn-info btn-md waves-effect waves-light"
                  onClick={() => this.handleUpdate()}
                >
                  <i className="fa fa-floppy-o mr-2"></i> Lưu
                </button>
                <button
                  type="button"
                  className="btn btn-info btn-md waves-effect waves-light"
                  onClick={() => this.refreshForm()}
                >
                  <i className="fa fa-refresh align-middle mr-2"></i> Làm mới
                </button>
                <button
                  type="button"
                  className="btn btn-info btn-md waves-effect waves-light"
                  onClick={() => this.props.toggleUpdateP(false)}
                >
                  Đóng
                </button>
              </div>
            </div>
          </div>
        </div>
      </Modal>
    );
  }
}
