import React, { Component, Fragment } from "react";
import * as moment from "moment";
import { sp } from "@pnp/sp";
import "@pnp/sp/webs";
import "@pnp/sp/lists/web";
import "@pnp/sp/items";
import "@pnp/sp/profiles";
import "@pnp/sp/site-users/web";
import "@pnp/sp/site-groups/web";
import { Tree, TreeNode } from "react-organizational-chart";
import ConfirmDelete from "../wfAddNewCmpts/ConfirmDelete.js";
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
import configData from "../../../config/configDatabase.json";
import { config } from "../../pages/environment.js";
import ReactFlow, {
  removeElements,
  addEdge,
  MiniMap,
  Controls,
  Background,
} from "react-flow-renderer";
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
import { objField } from "../wfShareCmpts/wfShareModel";

import shareService from "../wfShareCmpts/wfShareService";
import "../css/loading.scss";
import AddUser from "./wfAddUser.js";
import UpdateUser from "./wfUpdateUser.js";
import UpdateTree from "./wfUpdateTree.js";
import AddDepartment from "./wfListTree.js";
import { object } from "prop-types";

export default class ListUser extends Component {
  constructor(props) {
    super(props);
    this.state = {
      // Title: "",
      // ApproveCode: "",
      // DeptCode: "",
      //RoleCode: this.props.Title,
      // User: "",
      items: [],
      departments: [],
      isShowLoadingPage: false,
      isLoading: false,
      isConfirmDelete: false,
      itemToDelete: null,
      isAddUserOpen: false,
      isUpdateUserOpen: false,
      isUpdateTreeOpen: false,
      isAddDepartmentOpen: false,
      isUserList: null,
      search_UserDefault: null,
      listSearch_UserDefault: [],
      list_UserDefault: [],
      searchTitle: "",
      searchApproveCode: "",
      searchDeptCode: "",
      searchRoleCode: "",
      searchUser: "",
    };
    this.fieldSearch = undefined;
    this.callSearchPeople = this.callSearchPeople.bind(this);
    this.SearchList = this.SearchList.bind(this);
    this.handleReset = this.handleReset.bind(this);
    this.showDepartmentMembers = this.showDepartmentMembers.bind(this);
    this.strFilter = "";
  }

  async componentDidMount() {
    const items = await this.getItemToList("ListMapEmployee");
    this.setState({ items: items });

    const departments = await this.getData();
    this.setState({ departments: departments });
  }

  async getItemToList(listName) {
    //const items = await sp.web.lists.getByTitle(listName).items.getAll();
    let items = [];

    const strSelect = `ID, Title, User/Title,User/Id, ApproveCode, DeptCode, RoleCode`;
    await sp.web.lists
      .getByTitle("ListMapEmployee")
      .items.select(strSelect)
      .expand("User")
      .orderBy("ID", true)
      .get()
      .then((listWFStep) => {
        if (listWFStep.length > 0) {
          listWFStep.map((x) => {
            items.push({
              Id: x.ID,
              UserId: x.User["Id"],
              Title: x.Title,
              ApproveCode: x.ApproveCode,
              DeptCode: x.DeptCode,
              RoleCode: x.RoleCode,
              User: x.User["Title"],
            });
          });
        }
      })
      .catch((error) => {
        console.log(error);
      });
    return items;
  }

  showDepartmentMembers(departmentId) {
    this.setState({ isUserList: departmentId });
  }

  async getData() {
    let items = [];
    await sp.web.lists
      .getByTitle("ListDepartment")
      .items.select(
        "ID, Title, DeptCode, ParentCode, Manager/Id, Manager/Title, Members/Id, Members/Title"
      )
      .expand("Manager, Members")
      .get()
      .then((itemList) => {
        // console.log(itemList);
        itemList.forEach((element) => {
          items.push({
            ID: element.ID,
            Title: element.Title,
            DeptCode: element.DeptCode,
            ManagerId: element.Manager["Id"],
            Manager: element.Manager["Title"],
            Members: element.Members.map((member) => ({
            Title: member.Title,
            })),
            ParentCode: element.ParentCode,
            root: [],
          });
        });
      })
      .catch((error) => {
        console.log(error);
      });

    //let list = this.BuildTree(items, null, '')
    items.map((y) => {
      y.root = items.filter((z) => z.ParentCode == y.DeptCode);
    });

    return items;
  }

  BuildTree(list) {
    if (list.length > 0) {
      return list.map((x) => (
        <TreeNode
          className="border-left-0"
          label={
            <div>
              <button
                className="btn-light border-0 fa fa-eye"
                // onClick={() => this.showDepartmentMembers(x.ID)}
                onClick={() => this.updateIdT(x.ID)}
              ></button>
              {x.Title}
            </div>
          }
        >
          {x.root.length > 0 ? this.BuildTree(x.root) : ""}{" "}
        </TreeNode>
      ));
    }
  }

  handleChange = (e) => {
    const { name, value } = e.target;
    this.setState({
      [name]: value,
    });
  };

  handleAddItem = (newItem) => {
    this.setState((prevState) => ({
      items: [...prevState.items, newItem],
    }));
  };

  async Search() {
    this.setState({ isShowLoadingPage: true });
    let listSearch = await this.SearchList();
    // console.log(listSearch);
    this.setState({
      items: listSearch,
      isShowLoadingPage: false,
    });
  }

  async SearchList() {
    let items = [];
    let queryFilter = "";
    if (this.strFilter !== "") {
      queryFilter = this.strFilter;
    }

    if (isNotNull(this.state.searchTitle)) {
      if (queryFilter !== "") {
        queryFilter +=
          `and substringof('` + this.state.searchTitle + `', Title)`;
      } else {
        queryFilter += `substringof('` + this.state.searchTitle + `', Title)`;
      }
    }

    if (isNotNull(this.state.searchApproveCode)) {
      if (queryFilter !== "") {
        queryFilter +=
          `and substringof('` +
          this.state.searchApproveCode +
          `', ApproveCode)`;
      } else {
        queryFilter +=
          `substringof('` + this.state.searchTitle + `', ApproveCode)`;
      }
    }

    if (isNotNull(this.state.searchDeptCode)) {
      if (queryFilter !== "") {
        queryFilter +=
          `and substringof('` + this.state.searchDeptCode + `', DeptCode)`;
      } else {
        queryFilter +=
          `substringof('` + this.state.searchDeptCode + `', DeptCode)`;
      }
    }

    if (isNotNull(this.state.searchRoleCode)) {
      if (queryFilter !== "") {
        queryFilter +=
          `and substringof('` + this.state.searchRoleCode + `', RoleCode)`;
      } else {
        queryFilter +=
          `substringof('` + this.state.searchRoleCode + `', RoleCode)`;
      }
    }

    if (this.state.list_UserDefault.length > 0) {
      const searchUser = this.state.list_UserDefault[0].UserId;
      if (isNotNull(searchUser)) {
        if (queryFilter !== "") {
          queryFilter += `and substringof('` + searchUser + `', User)`;
        } else {
          queryFilter += `substringof('` + searchUser + `', User)`;
        }
      }
    }

    const strSelect = `ID, Title, User/Title, User/Id, ApproveCode, DeptCode, RoleCode`;
    await sp.web.lists
      .getByTitle("ListMapEmployee")
      .items.select(strSelect)
      .expand("User")
      .filter(queryFilter)
      .get()
      .then((listWFStep) => {
        if (listWFStep.length > 0) {
          listWFStep.map((x) => {
            items.push({
              Id: x.ID,
              UserId: x.User["Id"],
              Title: x.Title,
              ApproveCode: x.ApproveCode,
              DeptCode: x.DeptCode,
              RoleCode: x.RoleCode,
              User: x.User["Title"],
            });
          });
        }
      })
      .catch((error) => {
        console.log(error);
      });
    return items;
  }

  handleReset = () => {
    this.setState({
      searchTitle: "",
      searchDeptCode: "",
      searchRoleCode: "",
      list_UserDefault: [],
    });
  };

  toggleAddUser = () => {
    this.setState({ isAddUserOpen: !this.state.isAddUserOpen });
  };

  toggleUpdateU = () => {
    this.setState({ isUpdateUserOpen: !this.state.isUpdateUserOpen });
  };

  toggleUpdateT = () => {
    this.setState({ isUpdateTreeOpen: !this.state.isUpdateTreeOpen });
  };

  toggleAddDepartment = () => {
    this.setState({ isAddDepartmentOpen: !this.state.isAddDepartmentOpen });
  };

  toggleUpdateUser = (obj) => {
    let a = this.state.items;
    let index = a.findIndex((x) => x.Id == obj.Id);
    a[index] = obj;
    this.setState({ isUpdateUserOpen: !this.state.isUpdateUserOpen, items: a });
  };

  toggleUpdateTree = (obj) => {
    let a = this.state.items;
    let index = a.findIndex((x) => x.Id == obj.Id);
    a[index] = obj;
    this.setState({ isUpdateTreeOpen: !this.state.isUpdateTreeOpen, items: a });
  };

  updateId = (id) => {
    const selectedItem = returnObject(
      this.state.items.find((item) => item.Id == id)
    );
    this.setState({
      selectedItem: selectedItem,
      selectedId: id,
      isUpdateUserOpen: true,
    });
  };

  updateIdT = (id) => {
    const selectedItemT = returnObject(
      this.state.departments.find((item) => item.ID == id)
    );
    this.setState({
      selectedItemT: selectedItemT,
      selectedIdT: id,
      isUpdateTreeOpen: true,
    });
  };

  confirmDelete = (item) => {
    this.setState({
      isConfirmDelete: !this.state.isConfirmDelete,
      itemToDelete: item || null,
    });
  };

  async deleteItem() {
    const { itemToDelete } = this.state;
    if (itemToDelete) {
      try {
        await sp.web.lists
          .getByTitle("ListMapEmployee")
          .items.getById(itemToDelete.Id)
          .delete();
        const items = await this.getItemToList("ListMapEmployee");
        this.setState({ items, isConfirmDelete: false, itemToDelete: null });
      } catch (error) {
        console.error("Lỗi: ", error);
      }
    }
  }

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

  render() {
    const {
      items,
      isShowLoadingPage,
      isConfirmDelete,
      list_UserDefault,
      isUpdateUserOpen,
      isUpdateTreeOpen,
      isAddUserOpen,
      isAddDepartmentOpen,
      departments,
      isUserList,
      isLoading,
    } = this.state;
    return (
      <Fragment>
        {isShowLoadingPage ? (
          <div className="loadingProcess">
            <Spinner animation="border" className="loadingIcon" />
          </div>
        ) : (
          ""
        )}

        <div className="page-content mt-0 pt-0">
          <Container fluid>
            <Row>
              <Col lg={12} sm={12}>
                <Card>
                  <CardHeader className="bg-info mb-3">
                    <h5 className="my-0 text-white">Danh sách user</h5>
                  </CardHeader>
                  <div className="card-body">
                    <div className="card-title">
                      <h5 className="text-info mb-3">Lọc danh sách user </h5>
                    </div>
                    <div className="row mb-3">
                      <div className="col-lg-6">
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
                              name="searchTitle"
                              value={this.state.searchTitle}
                              onChange={this.handleChange}
                            />
                          </div>
                        </div>
                      </div>
                      <div className="col-lg-6">
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
                              name="searchApproveCode"
                              value={this.state.searchApproveCode}
                              onChange={this.handleChange}
                            />
                          </div>
                        </div>
                      </div>
                      <div className="col-lg-6">
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
                              name="searchDeptCode"
                              value={this.state.searchDeptCode}
                              onChange={this.handleChange}
                            />
                          </div>
                        </div>
                      </div>
                      <div className="col-lg-6">
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
                              name="searchRoleCode"
                              value={this.state.searchRoleCode}
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
                      <div className="col-lg-6">
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

                            {/* {list_UserDefault.map((x) => x.UserTitle)} */}

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
                            onClick={() => this.Search()}
                          >
                            <i className="fa fa-search mr-2"></i> Tìm kiếm
                          </button>
                          <button
                            type="button"
                            className="btn btn-light btn-md waves-effect waves-light"
                            onClick={() => this.handleReset()}
                          >
                            <i className="fa fa-refresh align-middle mr-2"></i>{" "}
                            Làm mới
                          </button>
                        </div>
                      </div>
                    </div>
                    <div className="card-title">
                      <h5 className="text-info mb-3">Danh sách user đã tạo </h5>
                    </div>
                    <div className="table-responsive">
                      <div className="col-lg-12">
                        <div className="button-items mt-3 mb-3">
                          <button
                            className="btn btn-info btn-md waves-effect waves-light"
                            onClick={this.toggleAddUser}
                          >
                            <i className="fa fa-plus mr-2"></i> Thêm mới
                          </button>
                        </div>
                      </div>
                      <table className="table table-striped mb-3 responsiveTable">
                        <thead>
                          <tr>
                            <th>Title</th>
                            <th>ApproveCode</th>
                            <th>DeptCode</th>
                            <th>RoleCode</th>
                            <th>User</th>
                            <th className="text-center">Hoạt động</th>
                          </tr>
                        </thead>
                        <tbody>
                          {items.map((item) => (
                            <tr key={item.Id}>
                              <td>{item.Title}</td>
                              <td>{item.ApproveCode}</td>
                              <td>{item.DeptCode}</td>
                              <td>{item.RoleCode.split(";").join("")}</td>
                              <td>{item.User}</td>
                              <td>
                                <div className="button-items text-center">
                                  <button
                                    className="btn btn-sm waves-effect waves-light"
                                    color="primary"
                                    onClick={() => this.updateId(item.Id)}
                                  >
                                    <i className="fa fa-pencil mr-2 align-middle text-primary font-size-16"></i>
                                  </button>
                                  <button
                                    type="button"
                                    className="btn btn-sm waves-effect waves-light"
                                    color="primary"
                                    onClick={() => this.confirmDelete(item)}
                                  >
                                    <i className="fa fa-trash mr-2 align-middle text-danger font-size-16"></i>
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    <div className="row border-left-0">
                      <Col lg="6">
                        <CardTitle className="text-info mb-3">
                          Sơ đồ cây
                        </CardTitle>
                        <Col lg="6">
                          <button
                            className="btn btn-info btn-md waves-effect waves-light"
                            onClick={this.toggleAddDepartment}
                          >
                            <i className="fa fa-plus mr-2"></i> Thêm mới
                          </button>
                        </Col>
                      </Col>

                      <Col lg="12">
                        {this.state.departments
                          .filter((x) => x.ParentCode == null)
                          .map((y) => (
                            <Tree
                              label={
                                <div>
                                  <button
                                    className="btn-light border-0 fa fa-eye"
                                    onClick={() =>
                                      this.showDepartmentMembers(y.ID)
                                    }
                                  ></button>
                                  {y.Title}
                                </div>
                              }
                            >
                              {this.BuildTree(y.root)}
                            </Tree>
                          ))}

                        <ul>
                          {departments.map((dept) => (
                            <li key={dept.Id}>
                              {isUserList === dept.ID && (
                                <div>
                                  <p>{dept.Manager}</p>
                                  <ul>
                                    {dept.Members.map((member) => (
                                      <li key={member.Id}>{member.Title}</li>
                                    ))}
                                  </ul>
                                </div>
                              )}
                            </li>
                          ))}
                        </ul>
                      </Col>
                    </div>
                  </div>
                </Card>
              </Col>
            </Row>
          </Container>
          {isConfirmDelete && (
            <ConfirmDelete
              textConfirm="Bạn có chắc chắn muốn xóa mục này?"
              closeConfirm={() => this.confirmDelete()}
              resultConfirm={() => this.deleteItem()}
            />
          )}
          {isAddUserOpen && (
            <Modal isOpen={isAddUserOpen} toggle={this.toggleAddUser}>
              <AddUser
                toggleAddUser={this.toggleAddUser}
                onAddItem={this.handleAddItem}
              />
            </Modal>
          )}
          {isUpdateUserOpen && (
            <Modal isOpen={isUpdateUserOpen} toggle={this.toggleUpdateUser}>
              <UpdateUser
                toggleUpdateUser={this.toggleUpdateUser}
                toggleUpdateU={this.toggleUpdateU}
                selectedItem={this.state.selectedItem}
                selectedId={this.state.selectedId}
              />
            </Modal>
          )}

          {isUpdateTreeOpen && (
            <Modal isOpen={isUpdateTreeOpen} toggle={this.toggleUpdateTree}>
              <UpdateTree
                toggleUpdateTree={this.toggleUpdateTree}
                toggleUpdateT={this.toggleUpdateT}
                selectedItemT={this.state.selectedItemT}
                selectedIdT={this.state.selectedIdT}
              />
            </Modal>
          )}
          {isAddDepartmentOpen && (
            <Modal
              isOpen={isAddDepartmentOpen}
              toggle={this.toggleAddDepartment}
            >
              <AddDepartment toggleAddDepartment={this.toggleAddDepartment} />
            </Modal>
          )}
        </div>
      </Fragment>
    );
  }
}
