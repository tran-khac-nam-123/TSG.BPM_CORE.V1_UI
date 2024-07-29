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

export default class AddDepartment extends Component {
  constructor(props) {
    super(props);
    this.state = {
      Title: "",
      DeptCode: "",
      Manager: "",
      Members: [],
      ParentCode: "",
      items: [],
      isShowLoadingPage: false,
      search_UserDefault: null,
      search_UserDefaultB: null,
      isShowModal: false,
      listSearch_UserDefault: [],
      listSearch_UserDefaultB: [],
      list_UserDefault: [],
      list_UserDefaultB: [],
    };
    this.fieldSearch = undefined;
    this.callSearchPeople = this.callSearchPeople.bind(this);
  }

  handleChange = (e) => {
    const { name, value } = e.target;
    this.setState({
      [name]: value,
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
    const listName = "ListDepartment";
    const item = {
      Title: this.state.Title ? this.state.Title : "",
      DeptCode: this.state.DeptCode ? this.state.DeptCode : "",
      ManagerId: this.state.list_UserDefault[0].UserId,
      MembersId: {results: this.state.list_UserDefaultB.map(user => user.UserId)},
      ParentCode: this.state.ParentCode ? this.state.ParentCode : "",
    };

    const result = await this.addItemToList(listName, item);
    if (result.success === "success") {
      this.props.toggleAddDepartment();
    }
  }

  refreshForm = () => {
    this.setState({
      Title: "",
      DeptCode: "",
      list_UserDefault: [],
      list_UserDefaultB: [],
      ParentCode: "",
    });
  };

  // nhập giá trị để tìm kiếm người
  changeSearchPeople(event) {
    this.fieldSearch = event.target.name;
    this.setState({ [`search_` + event.target.name]: event.target.value });
    clearTimeout(this.typingTimeout);
    this.typingTimeout = setTimeout(this.callSearchPeople, 1000);
  }

  // set giá trị cho danh sách người tìm kiếm
  async callSearchPeople() {
    let PeoplePicker = await shareService.searchPeoplePicker(
      this.state[`search_` + this.fieldSearch]
    );
    this.setState({ [`listSearch_` + this.fieldSearch]: PeoplePicker });
    this.fieldSearch = undefined;
  }

  // Chọn người từ trong danh sách tìm kiếm
  async selectSearch(Key, InternalName) {
    let objUser = await shareService.getInforUser(Key);
    if (objUser.UserId !== 0) {
      let arrPeople = this.state[`list_` + InternalName];
      if (arrPeople.findIndex((x) => x.UserId == objUser.UserId) == -1) {
        arrPeople.push(objUser);
      }
      this.setState({
        [`list_` + InternalName]: arrPeople,
        [`search_` + InternalName]: "",
        [`listSearch_` + InternalName]: [],
      });
    } else {
      this.setState({
        [`search_` + InternalName]: "",
        [`listSearch_` + InternalName]: [],
      });
    }
  }

  // Xóa danh sách người đã chọn
  removePeople(index) {
    let arrPeople = returnArray(this.state.list_UserDefault);
    arrPeople.splice(index, 1);
    this.setState({ list_UserDefault: arrPeople });
  }

  removePeopleB(index) {
    let arrPeople = returnArray(this.state.list_UserDefaultB);
    arrPeople.splice(index, 1);
    this.setState({ list_UserDefaultB: arrPeople });
  }

  render() {
    const { list_UserDefault, list_UserDefaultB } = this.state;
    return (
      <Modal size="lg" isOpen={true}>
        <div className="modal-header">
          <h5 className="modal-title mt-0 text-primary" id="myLargeModalLabel">
            Thêm mới department
          </h5>
          <button
            type="button"
            className="close"
            data-dismiss="modal"
            aria-label="Close"
            onClick={() => this.props.toggleAddDepartment(false)}
          >
            <span arial-hidden="true">&times;</span>
          </button>
        </div>
        <div className="card-body">
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
                  Bộ phận
                </label>
                <div className="col-md-9">
                  <input
                    className="form-control"
                    type="text"
                    name="DeptCode"
                    value={this.state.DeptCode}
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
                  Người quản lý
                </label>
                <div className="col-md-9">
                  <input
                    className="form-control"
                    type="text"
                    name="UserDefault"
                    onChange={this.changeSearchPeople.bind(this)}
                    value={this.state.search_UserDefault}
                    placeholder="Tìm kiếm người dùng"
                  />

                  {/* {list_UserDefault.map((x) => x.UserTitle)} */}

                  {this.state.listSearch_UserDefault.length > 0 ? (
                    <div className="suggesAuto">
                      {this.state.listSearch_UserDefault.map((people) => (
                        <div
                          key={people.Key}
                          className="suggtAutoItem"
                          onClick={() =>
                            this.selectSearch(people.Key, "UserDefault")
                          }
                        >
                          <i className="fa fa-user"></i> {people.DisplayText}
                          {` (${people.Description}`}
                          {isNotNull(people.EntityData.Title)
                            ? ` - ${people.EntityData.Title})`
                            : `)`}
                        </div>
                      ))}
                    </div>
                  ) : (
                    ""
                  )}

                  {this.state.list_UserDefault.length > 0 ? (
                    <div className="tagName">
                      {this.state.list_UserDefault.map((users, indexUs) => (
                        <div key={indexUs} className="wrapName">
                          <a
                            type="button"
                            onClick={() => this.removePeople(indexUs)}
                          >
                            <i className="fa fa-close text-danger"></i>
                          </a>{" "}
                          {users.UserTitle}
                        </div>
                      ))}
                    </div>
                  ) : (
                    ""
                  )}
                </div>
              </div>
            </div>

            <div className="col-lg-12">
              <div className="form-group row">
                <label
                  for="example-text-input"
                  className="col-md-3 col-form-label"
                >
                  Các thành viên
                </label>
                <div className="col-md-9">
                  <input
                    className="form-control"
                    type="text"
                    name="UserDefaultB"
                    onChange={this.changeSearchPeople.bind(this)}
                    value={this.state.search_UserDefaultB}
                    placeholder="Tìm kiếm người dùng"
                  />

                  {this.state.listSearch_UserDefaultB.length > 0 ? (
                    <div className="suggesAuto">
                      {this.state.listSearch_UserDefaultB.map((people) => (
                        <div
                          key={people.Key}
                          className="suggtAutoItem"
                          onClick={() =>
                            this.selectSearch(people.Key, "UserDefaultB")
                          }
                        >
                          <i className="fa fa-user"></i> {people.DisplayText}
                          {` (${people.Description}`}
                          {isNotNull(people.EntityData.Title)
                            ? ` - ${people.EntityData.Title})`
                            : `)`}
                        </div>
                      ))}
                    </div>
                  ) : (
                    ""
                  )}

                  {this.state.list_UserDefaultB.length > 0 ? (
                    <div className="tagName">
                      {this.state.list_UserDefaultB.map((users, indexUs) => (
                        <div key={indexUs} className="wrapName">
                          <a
                            type="button"
                            onClick={() => this.removePeopleB(indexUs)}
                          >
                            <i className="fa fa-close text-danger"></i>
                          </a>{" "}
                          {users.UserTitle}
                        </div>
                      ))}
                    </div>
                  ) : (
                    ""
                  )}
                </div>
              </div>
            </div>

            <div className="col-lg-12">
              <div className="form-group row">
                <label
                  for="example-text-input"
                  className="col-md-3 col-form-label"
                >
                  ParentCode
                </label>
                <div className="col-md-9">
                  <input
                    className="form-control"
                    type="text"
                    name="ParentCode"
                    value={this.state.ParentCode}
                    onChange={this.handleChange}
                  />
                </div>
              </div>
            </div>

            <div className="col-lg-12">
              <div className="button-items text-center mt-3 mb-3">
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
                  onClick={() => this.props.toggleAddDepartment(false)}
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
