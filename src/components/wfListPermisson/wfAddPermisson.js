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

export default class AddPermisson extends Component {
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
    };
  }

  handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    this.setState({
      [name]: type === "checkbox" ? checked : value,
    });
  };

  async addItemToList(listName, item) {
    let itemsAdd = { success: "", errors: "" };

    await sp.web.lists
      .getByTitle(listName)
      .items.add(item)
      .then(() => {
        itemsAdd.success = "success";
      })
      .catch((error) => {
        console.log(error);
        itemsAdd.errors = error;
      });

    return itemsAdd;
  }

  async handleAdd() {
    const listName = "ListPermissonByRole";
    const item = {
      Title: this.state.Title ? this.state.Title : "",
      RoleCode: this.state.RoleCode ? this.state.RoleCode : "",
      PriorityPoint: parseInt(this.state.PriorityPoint) ? this.state.PriorityPoint : "",
      OverWrite: this.state.OverWrite ? this.state.OverWrite : "",
      Save: this.state.Save,
      Submit: this.state.Submit,
      Approve: this.state.Approve,
      ReAssigment: this.state.ReAssigment,
      MoveTo: this.state.MoveTo,
      Reject: this.state.Reject,
      View: this.state.View,
      InformTo: this.state.InformTo,
    };

    const result = await this.addItemToList(listName, item);
    if (result.success === "success") {
      this.props.onAddItem(item);
      this.props.toggleAddPermisson();
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
    const {} = this.state;
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
            onClick={() => this.props.toggleAddPermisson(false)}
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
                    value={this.state.Title}
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
                    value={this.state.RoleCode}
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
                    value={this.state.PriorityPoint}
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
                    value={this.state.OverWrite}
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
                    value={this.state.Save}
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
                  Submit
                </label>
                <div className="col-md-1">
                  <input
                    className="form-check mt-2"
                    type="checkbox"
                    name="Submit"
                    value={this.state.Submit}
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
                    value={this.state.Approve}
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
                    value={this.state.ReAssigment}
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
                    value={this.state.MoveTo}
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
                    value={this.state.Reject}
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
                    value={this.state.View}
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
                    value={this.state.InformTo}
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
                  onClick={() => this.handleAdd()}
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
                  onClick={() => this.props.toggleAddPermisson(false)}
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
