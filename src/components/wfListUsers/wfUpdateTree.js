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

export default class UpdateTree extends Component {
  constructor(props) {
    super(props);
    this.state = {
      Manager: "",
      Members: [],
      User: "",
      items: [],
      search_ManagerDefault: null,
      search_MembersDefault: null,
      search_UserDefault: null,
      listSearch_UserDefault: [],
      list_UserDefault: [],
      isShowModal: false,
      listSearch_ManagerDefault: [],
      list_ManagerDefault: [],
      listSearch_MembersDefault: [],
      list_MembersDefault: [],
      selectedItemT: this.props.selectedItemT,
      selectedIdT: this.props.selectedIdT,
    };
    this.fieldSearch = undefined;
    this.callSearchPeople = this.callSearchPeople.bind(this);
  }

  componentDidMount() {
    const { selectedItemT } = this.props;
    if (selectedItemT) {
      this.setState({
        search_ManagerDefault: selectedItemT.Manager,
        list_ManagerDefault: [
          { UserId: selectedItemT.ManagerId, UserTitle: selectedItemT.Manager },
        ],
        
        search_MembersDefault: selectedItemT.Members,
        list_MembersDefault: selectedItemT.Members.map(member => (
          { UserTitle: member.Title }
        )),
      
      });
    }
  }

  handleChange = (e) => {
    let selectedItemT = this.state.selectedItemT;
    const { name, value } = e.target;
    selectedItemT[name] = value;
    this.setState({
      selectedItemT: selectedItemT,
    });
  };

  // refreshForm = () => {
  //   this.setState({
  //     Title: "",
  //     list_ManagerDefault: [],
  //   });
  // };

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
    let arrPeople = returnArray(this.state.list_ManagerDefault);
    arrPeople.splice(index, 1);
    this.setState({ list_ManagerDefault: arrPeople });
  }

  removePeople1(index) {
    let arrPeople = returnArray(this.state.list_MembersDefault);
    arrPeople.splice(index, 1);
    this.setState({ list_MembersDefault: arrPeople });
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

  async handleUpdateT() {
    const { selectedIdT, selectedItemT, list_ManagerDefault, list_MembersDefault } = this.state;
    let obj = {
      ManagerId: list_ManagerDefault[0].UserId,
      Members: list_MembersDefault.map(member => ({
        MembersTitle: member.UserTitle
      }))
    };

    const result = await this.updateItemToList(
      "ListDepartment",
      selectedIdT,
      obj
    );
    if (result.success === "success") {
      obj.Manager = list_ManagerDefault[0].UserTitle;
      this.props.toggleUpdateTree(obj);
    }
  }

  render() {
    const { list_ManagerDefault, list_MembersDefault, selectedItem } = this.state;
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
                      Cập nhật nhân viên
                    </h5>
                    <button
                      type="button"
                      className="close"
                      data-dismiss="modal"
                      aria-label="Close"
                      onClick={() => this.props.toggleUpdateT(false)}
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
                            Manager
                          </label>
                          <div className="col-md-9">
                            <input
                              className="form-control"
                              type="text"
                              name="ManagerDefault"
                              onChange={this.changeSearchPeople.bind(this)}
                              value={this.state.search_ManagerDefault}
                              placeholder="Tìm kiếm người dùng"
                            />

                            {this.state.listSearch_ManagerDefault.length > 0 ? (
                              <div className="suggesAuto">
                                {this.state.listSearch_ManagerDefault.map(
                                  (people) => (
                                    <div
                                      key={people.Key}
                                      className="suggtAutoItem"
                                      onClick={() =>
                                        this.selectSearch(
                                          people.Key,
                                          "ManagerDefault"
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

                            {this.state.list_ManagerDefault.length > 0 ? (
                              <div className="tagName">
                                {this.state.list_ManagerDefault.map(
                                  (manager, indexUs) => (
                                    <div key={indexUs} className="wrapName">
                                      <a
                                        type="button"
                                        onClick={() =>
                                          this.removePeople(indexUs)
                                        }
                                      >
                                        <i className="fa fa-close text-danger"></i>
                                      </a>{" "}
                                      {manager.UserTitle}
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
                        <div className="form-group row">
                          <label
                            for="example-text-input"
                            className="col-md-3 col-form-label"
                          >
                            Members
                          </label>
                          <div className="col-md-9">
                            <input
                              className="form-control"
                              type="text"
                              name="MembersDefault"
                              onChange={this.changeSearchPeople.bind(this)}
                              // value={this.state.search_MembersDefault}
                              placeholder="Tìm kiếm người dùng"
                            />

                            {this.state.listSearch_MembersDefault.length > 0 ? (
                              <div className="suggesAuto">
                                {this.state.listSearch_MembersDefault.map(
                                  (people) => (
                                    <div
                                      key={people.Key}
                                      className="suggtAutoItem"
                                      onClick={() =>
                                        this.selectSearch(
                                          people.Key,
                                          "MembersDefault"
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

                            {this.state.list_MembersDefault.length > 0 ? (
                              <div className="tagName">
                                {this.state.list_MembersDefault.map(
                                  (member, indexUs) => (
                                    <div key={indexUs} className="wrapName">
                                      <a
                                        type="button"
                                        onClick={() =>
                                          this.removePeople1(indexUs)
                                        }
                                      >
                                        <i className="fa fa-close text-danger"></i>
                                      </a>{" "}
                                      {member.UserTitle}
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
                        <div className="button-items text-center mt-3">
                          <button
                            type="button"
                            className="btn btn-info btn-md waves-effect waves-light"
                            onClick={() => this.handleUpdateT()}
                          >
                            <i className="fa fa-floppy-o mr-2"></i> Cập nhật
                          </button>
                          <button
                            type="button"
                            className="btn btn-info btn-md waves-effect waves-light"
                            onClick={() => this.props.toggleUpdateT(false)}
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
