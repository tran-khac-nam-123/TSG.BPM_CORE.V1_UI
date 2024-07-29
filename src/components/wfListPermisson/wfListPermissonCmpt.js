import React, { Component, Fragment } from "react";
import * as moment from "moment";
import { sp } from "@pnp/sp";
import "@pnp/sp/webs";
import "@pnp/sp/lists/web";
import "@pnp/sp/items";
import "@pnp/sp/profiles";
import "@pnp/sp/site-users/web";
import "@pnp/sp/site-groups/web";
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
} from "../wfShareCmpts/wfShareFunction.js";
import { objField } from "../wfShareCmpts/wfShareModel.js";

import shareService from "../wfShareCmpts/wfShareService.js";
import "../css/loading.scss";
import AddPermisson from "./wfAddPermisson.js";
import UpdatePermisson from "./wfUpdatePermisson.js";
import { icon } from "@fortawesome/fontawesome-svg-core";

export default class ListPermisson extends Component {
  constructor(props) {
    super(props);
    this.state = {
        Title: "",
        RoleCode: "",
        PriorityPoint: null,
        Save: false,
        Submit: false,
        Approve: false,
        ReAssignment: false,
        MoveTo: false,
        Reject: false,
        View: false,
        InformTo: false,
        OverWrite: "",
        isAddPermissonOpen: false,
        items: [],
        isShowLoadingPage: false,
        isUpdatePermissonOpen: false,
        isConfirmDelete: false,
        itemToDelete: null,
    };
  }

  async componentDidMount() {
    const items = await this.getItemToList("ListPermissonByRole");
    this.setState({ items: items });
  }

  async getItemToList(listName) {
    const items = await sp.web.lists.getByTitle(listName).items.getAll();
    // let items=[];
    // const strSelect = `ID, Title, RoleCode, PriorityPoint, Save, Submit, Approve, ReAssigment, MoveTo, Reject, View, InformTo, OverWrite`;
    // await sp.web.lists
    //   .getByTitle("ListPermissonByRole")
    //   .items.select(strSelect)
    //   .expand("Permisson")
    //   .orderBy("ID", true)
    //   .get()
    //   .then((listWFStep) => {
    //     if(listWFStep.length > 0){
    //       listWFStep.map(x=>{
    //         items.push({
    //           Id: x.ID,
    //           Title: x.Title,
    //           RoleCode: x.RoleCode,
    //           PriorityPoint: x.PriorityPoint,
    //           Save: x.Save,
    //           Submit: x.Submit,
    //           Approve: x.Approve,
    //           ReAssigment: x.ReAssigment,
    //           MoveTo: x.MoveTo,
    //           Reject: x.Reject,
    //           View: x.View,
    //           InformTo: x.InformTo,
    //           OverWrite: x.OverWrite,
    //         })
    //       })
    //     }
      
    //   })
    //   .catch((error) => {
    //     console.log(error);
    //   });
      return items;
  }

  handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    this.setState({
      [name]: type === 'checkbox' ? checked : value
    });
  }

  handleAddItem = (newItem) => {
    this.setState((prevState) => ({
      items: [...prevState.items, newItem],
    }));
  };

  toggleAddPermisson = () => {
    this.setState({ isAddPermissonOpen: !this.state.isAddPermissonOpen });
  };

  toggleUpdateP = () => {
    this.setState({ isUpdatePermissonOpen: !this.state.isUpdatePermissonOpen });
  };

  toggleUpdatePermisson = (obj) => {
    let a = this.state.items;
    let index = a.findIndex(x=>x.Id == obj.Id);
    a[index] = obj;
    this.setState({ isUpdatePermissonOpen: !this.state.isUpdatePermissonOpen, items: a });
  };

  updateId = (id) => {
    const selectedItem = returnObject(this.state.items.find((item) => item.Id === id)) ;
    this.setState({
      selectedItem: selectedItem,
      selectedId: id,
      isUpdatePermissonOpen: true,
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
          .getByTitle("ListPermissonByRole")
          .items.getById(itemToDelete.Id)
          .delete();
        const items = await this.getItemToList("ListPermissonByRole");
        this.setState({ items, isConfirmDelete: false, itemToDelete: null });
      } catch (error) {
        console.error("Lỗi: ", error);
      }
    }
  }

  render() {
    const {
      items,
      isShowLoadingPage,
      isAddPermissonOpen,
      isUpdatePermissonOpen,
      isConfirmDelete,
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
                    <h5 className="my-0 text-white">Danh sách permisson</h5>
                  </CardHeader>
                  <div className="card-body">
                    <div className="card-title">
                      <h5 className="text-info mb-3">Danh sách permisson đã tạo</h5>
                    </div>
                    
                    <div className="table-responsive">
                      <div className="col-lg-12">
                        <div className="button-items mt-3 mb-3">
                          
                          <button
                            className="btn btn-info btn-md waves-effect waves-light"
                            onClick={this.toggleAddPermisson}
                          >
                            <i className="fa fa-plus mr-2"></i> Thêm mới
                          </button>
                        </div>
                      </div>
                      <table className="table table-striped mb-3 responsiveTable">
                        <thead>
                          <tr className="text-center">
                            <th>Title</th>
                            <th>RoleCode</th>
                            <th>PriotyPoint</th>
                            <th>Save</th>
                            <th>Submit</th>
                            <th>Approve</th>
                            <th>ReAssigment</th>
                            <th>MoveTo</th>
                            <th>Reject</th>
                            <th>View</th>
                            <th>InformTo</th>
                            <th>OverWrite</th>
                            <th className="text-center">Hoạt động</th>
                          </tr>
                        </thead>
                        <tbody>
                          {items.map((item) => (
                            <tr key={item.Id} className="text-center">
                              <td>{item.Title}</td>
                              <td>{item.RoleCode.split(';').join('')}</td>
                              <td>{parseInt(item.PriorityPoint)}</td>
                              <td>{item.Save ? "✓" : ""}</td>
                              <td>{item.Submit ? "✓" : ""}</td>
                              <td>{item.Approve ? "✓" : ""}</td>
                              <td>{item.ReAssigment ? "✓" : ""}</td>
                              <td>{item.MoveTo ? "✓" : ""}</td>
                              <td>{item.Reject ? "✓" : ""}</td>
                              <td>{item.View ? "✓" : ""}</td>
                              <td>{item.InformTo ? "✓" : ""}</td>
                              <td>{item.OverWrite}</td>                            
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
          {isAddPermissonOpen && (
            <Modal isOpen={isAddPermissonOpen} toggle={this.toggleAddPermisson}>
              <AddPermisson 
                toggleAddPermisson={this.toggleAddPermisson} 
                onAddItem = {this.handleAddItem}
              />
            </Modal>
          )}
          {isUpdatePermissonOpen && (
            <Modal isOpen={isUpdatePermissonOpen} toggle={this.toggleUpdatePermisson}>
              <UpdatePermisson
                toggleUpdatePermisson = {this.toggleUpdatePermisson}
                toggleUpdateP = {this.toggleUpdateP}
                selectedItem = {this.state.selectedItem}
                selectedId = {this.state.selectedId}
              />
            </Modal>
          )}
        </div>
      </Fragment>
    );
  }
}



