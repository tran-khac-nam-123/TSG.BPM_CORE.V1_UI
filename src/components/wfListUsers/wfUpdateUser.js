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

export default class UpdateUser extends Component {
  constructor(props) {
    super(props);
    this.state = {
      Title: "",
      ApproveCode: "",
      DeptCode: "",
      RoleCode: "",
      User: "",
      items: [],
      search_UserDefault: null,
      isShowModal: false,
      listSearch_UserDefault: [],
      list_UserDefault: [],
      selectedItem: this.props.selectedItem,
      selectedId: this.props.selectedId,
    };
    this.fieldSearch = undefined;
    this.callSearchPeople = this.callSearchPeople.bind(this);
  }

  componentDidMount() {
    const { selectedItem } = this.props;
    if (selectedItem) {
      this.setState({
        Title: selectedItem.Title,
        ApproveCode: selectedItem.ApproveCode,
        DeptCode: selectedItem.DeptCode,
        RoleCode: selectedItem.RoleCode,
        search_UserDefault: selectedItem.User,
        list_UserDefault: [
          { UserId: selectedItem.UserId, UserTitle: selectedItem.User },
        ],
      });
    }
  }

  handleChange = (e) => {
    let selectedItem = this.state.selectedItem;
    const { name, value } = e.target;
    selectedItem[name] = value;
    this.setState({
      selectedItem: selectedItem,
    });
  };

  refreshForm = () => {
    this.setState({
      Title: "",
      ApproveCode: "",
      DeptCode: "",
      RoleCode: "",
      list_UserDefault: [],
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
      if (arrPeople.length > 0) {
        arrPeople[0] = objUser;
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
    const { selectedId, selectedItem, list_UserDefault } = this.state;
    let obj = {
      Id: selectedItem.Id,
      Title: selectedItem.Title,
      ApproveCode: selectedItem.ApproveCode,
      DeptCode: selectedItem.DeptCode,
      RoleCode: selectedItem.RoleCode,
      UserId: list_UserDefault[0].UserId,
    };

    const result = await this.updateItemToList(
      "ListMapEmployee",
      selectedId,
      obj
    );
    if (result.success === "success") {
      obj.User = list_UserDefault[0].UserTitle;
      this.props.toggleUpdateUser(obj);
    }
  }

  render() {
    const { list_UserDefault, selectedItem } = this.state;
    return (
      <Fragment>
        <div className="modal-content d-block">
          <Container>
            <Row>
              <Col lg={12} sm={12}>
                <Card>
                  <div className="modal-header d-flex">
                    <h5
                      className="modal-title mt-0 text-primary"
                      id="myLargeModalLabel"
                    >
                      Cập nhật user
                    </h5>
                    <button
                      type="button"
                      className="close"
                      data-dismiss="modal"
                      aria-label="Close"
                      onClick={() => this.props.toggleUpdateU(false)}
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
                            Mã quy trình
                          </label>
                          <div className="col-md-9">
                            <input
                              className="form-control"
                              type="text"
                              name="ApproveCode"
                              value={selectedItem.ApproveCode}
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
                            Bộ phân
                          </label>
                          <div className="col-md-9">
                            <input
                              className="form-control"
                              type="text"
                              name="DeptCode"
                              value={selectedItem.DeptCode}
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
                            <select
                              className="form-control"
                              name="RoleCode"
                              value={selectedItem.RoleCode}
                              onChange={this.handleChange}
                            >
                              <option></option>
                              <option>;NV;</option>
                              <option>;QL;</option>
                              <option>;ĐH;</option>
                            </select>
                          </div>
                        </div>
                      </div>
                      <div className="col-lg-12">
                        <div className="form-group row">
                          <label
                            for="example-text-input"
                            className="col-md-3 col-form-label"
                          >
                            Người dùng
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

                            {this.state.listSearch_UserDefault.length > 0 ? (
                              <div className="suggesAuto">
                                {this.state.listSearch_UserDefault.map(
                                  (people) => (
                                    <div
                                      key={people.Key}
                                      className="suggtAutoItem"
                                      onClick={() =>
                                        this.selectSearch(
                                          people.Key,
                                          "UserDefault"
                                        )
                                      }
                                    >
                                      <i className="fa fa-user"></i>{" "}
                                      {people.DisplayText}
                                      {` (${people.Description}`}
                                      {isNotNull(people.EntityData.Title)
                                        ? ` - ${people.EntityData.Title})`
                                        : `)`}
                                    </div>
                                  )
                                )}
                              </div>
                            ) : (
                              ""
                            )}

                            {this.state.list_UserDefault.length > 0 ? (
                              <div className="tagName">
                                {this.state.list_UserDefault.map(
                                  (users, indexUs) => (
                                    <div key={indexUs} className="wrapName">
                                      <a
                                        type="button"
                                        onClick={() =>
                                          this.removePeople(indexUs)
                                        }
                                      >
                                        <i className="fa fa-close text-danger"></i>
                                      </a>{" "}
                                      {users.UserTitle}
                                    </div>
                                  )
                                )}
                              </div>
                            ) : (
                              ""
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="col-lg-12">
                        <div className="button-items text-center mt-3 mb-3">
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
                            <i className="fa fa-refresh align-middle mr-2"></i>{" "}
                            Làm mới
                          </button>
                          <button
                            type="button"
                            className="btn btn-info btn-md waves-effect waves-light"
                            onClick={() => this.props.toggleUpdateU(false)}
                          >
                            Đóng
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              </Col>
            </Row>
          </Container>
        </div>
      </Fragment>
    );
  }
}
