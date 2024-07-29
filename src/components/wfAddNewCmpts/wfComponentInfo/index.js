import React, { Component } from "react";

import {
  isNotNull,
  returnArray,
  returnObject,
  formatTypeObjField,
} from "components/wfShareCmpts/wfShareFunction.js";
import { objField, arrayObjField } from "components/wfShareCmpts/wfShareModel";

import {
  Row,
  Col,
  Card,
  CardBody,
  CardTitle,
  Container,
  Modal,
  Input,
  Form,
  FormGroup,
  InputGroup,
  Label,
  CardSubtitle,
  CardText,
  CardHeader,
  Collapse,
} from "reactstrap";
import { Table, Thead, Tbody, Tr, Th, Td } from "react-super-responsive-table";

export default class WfFormField extends Component {
  constructor(props) {
    super(props);
    // console.log(this.props);

    this.state = {
      ListComponentInfo: this.props.ListComponentInfo,

    };
    this.AddCategory = this.AddCategory.bind(this)
    this.DeleteCategory = this.DeleteCategory.bind(this)

  }
  //UNSAFE_componentWillReceiveProps(nextProps) {
  componentWillReceiveProps(nextProps) {
    // console.log(nextProps);
    this.setState({
      ListComponentInfo: nextProps.ListComponentInfo,
    });
  }
  async changeFormInput(event, index) {
    let valueState = event.target.value;
    let ListComponentInfo = this.state.ListComponentInfo

    ListComponentInfo[index][event.target.name] = valueState
    await this.setState({ ListComponentInfo: ListComponentInfo })
  }
 async AddCategory() {
    let ListComponentInfo = this.state.ListComponentInfo
    if(!isNotNull(ListComponentInfo)){
      ListComponentInfo=[]
    }
    ListComponentInfo.push({
      Title: "",
      Note: "",
      Data: [],
    })
    await this.setState({ ListComponentInfo: ListComponentInfo })

  }
 async DeleteCategory(index) {
    let ListComponentInfo = this.state.ListComponentInfo

    ListComponentInfo.splice(index, 1)

    await this.setState({ ListComponentInfo: ListComponentInfo })
  }
  render() {
    const {
      ListComponentInfo
    } = this.state;

    return (
      <Card outline color="info" className="border p-3">
        <div className="row">
          <Col lg="6">
            <CardTitle className="text-info mb-3">
              Thiết lập danh mục
            </CardTitle>
          </Col>
          <Col lg="6">
            <div className="text-right">
              <button
                type="button"
                className="btn btn-md btn-primary waves-effect waves-light"
                onClick={() => this.AddCategory()}
              >
                <i className="fa fa-plus-circle mr-2 align-middle aaa"></i>  add
              </button>
            </div>
          </Col>
        </div>
        <CardBody>
          <div className="table-responsive">
            <Table className="table table-striped mb-0">
              <thead>
                <tr>
                  <th>STT</th>
                  <th>Tiêu đề</th>
                  <th>Mô tả</th>
                  <th>Xóa</th>
                </tr>
              </thead>
              <tbody>
                {isNotNull(ListComponentInfo) ?
                  ListComponentInfo.map((x, index) => (
                    <tr key={index} className="MuiTableRow-root">
                      <td className="a">{index + 1}</td>
                      <td>
                        <input
                          className="form-control"
                          type="text"
                          name="Title"
                          value={x.Title}
                          onChange={(event) =>
                            this.changeFormInput(event, index)
                          }
                          autoComplete="off"
                        />

                      </td>

                      <td>
                        <textarea
                          className="form-control"
                          rows="2"
                          name="Note"
                          onChange={(event) =>
                            this.changeFormInput(event, index)
                          }
                          value={x.Note}

                        ></textarea>
                      </td>

                      <td colSpan="7">  <button
                        type="button"
                        className="waves-effect btn btn-link btn-md waves-light text-secondary font-weight-semibold"
                        onClick={() => this.DeleteCategory(index)}
                      >
                        <i className="fa fa-remove mr-1 align-text-bottom text-danger font-size-16"></i>{" "}

                      </button></td>

                    </tr>
                  ))

                  : ''}

              </tbody>

            </Table>
          </div>
        </CardBody>
      </Card>

    )
  }
}   
