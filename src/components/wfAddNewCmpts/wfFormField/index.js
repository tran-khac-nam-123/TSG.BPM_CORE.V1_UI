import React, { Component } from "react";

import {
  isNotNull,
  returnArray,
  returnObject,
  formatTypeObjField,
} from "components/wfShareCmpts/wfShareFunction.js";
import { objField, arrayObjField } from "components/wfShareCmpts/wfShareModel";
import AddFormField from "./addFormField";

import {
  SortableContainer,
  SortableElement,
  SortableHandle,
} from "../../index";
import arrayMove from "array-move";
import shareService from "../../wfShareCmpts/wfShareService";

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

class WfFormField extends Component {
  constructor(props) {
    super(props);
    // console.log(this.props);

    this.state = {
      listFormField: this.props.listFormField,
      listWorkflow: this.props.listWorkflow,
      listStepWorkflow: this.props.listStepWorkflow,
      ListComponentInfo:this.props.ListComponentInfo,
      detailField: {
        ID: 0,
        FieldName: "",
        FieldType: "Text",
        InternalName: "",
        HelpText: "",
        Required: 0,
        ObjValidation: {
          IsActive: false,
          CalculateCondition: {
            isCalculate: false,
            FieldType: "",
            FieldNameEnd: "",
            FieldNameStart: "",
            Calculation: "",
            arrCalculation: [],
            arrFieldCalculation: [],
            Expression: "",
            typeCalculation: "",
          },
          CompareCondition: [],
          typeInputValidation: "",
        },
        ObjSPField: {
          Type: "",
          ObjField: {},
          TextField: "",
        },
        DefaultValue: "",
        TypeDefaultValue: "",
        listSearch_DefaultValue: [],
        ComponentInfo:''
      },
      isShowModal: false,
      indexField: -1,
      isSorting: false,
      Confirm: false,
      ConfirmText: "",
      TypeConfirm: "",
      ConfirmParameter: "",
      IsCollapse: true,
    };

    this.modalOpenClose = this.modalOpenClose.bind(this);
    this.resutlFormField = this.resutlFormField.bind(this);
    this.setFormField = this.setFormField.bind(this);
    this.deleteField = this.deleteField.bind(this);
    this.DeleteFieldConfirm = this.DeleteFieldConfirm.bind(this);
  }

  componentWillReceiveProps(nextProps) {
    // console.log(nextProps);
    this.setState({
      listFormField: nextProps.listFormField,
      listWorkflow: nextProps.listWorkflow,
      listStepWorkflow: nextProps.listStepWorkflow,
      ListComponentInfo:nextProps.ListComponentInfo
    });
  }

  // Xóa thông tin field trên danh sách
  deleteField(indexField) {
    // console.log(indexField);
    this.setState({
      Confirm: true,
      ConfirmText: "Bạn chắc chắn muốn xóa trường dữ liệu này ?",
      ConfirmParameter: indexField,
    });
    // this.props.deleteEditField(indexField);
  }
  DeleteFieldConfirm(indexField) {
    this.props.deleteEditField(indexField);
    this.setState({ Confirm: false });
  }

  async modalOpenClose() {
    await this.setState({ isShowModal: false });
  }

  async resutlFormField(stepObject, index) {
    // console.log(stepObject);
    let listField = returnArray(this.state.listFormField);

    if (index > -1) {
      listField[index] = stepObject;
    } else {
      listField.push(stepObject);
    }
    await this.setState({ isShowModal: false });
    this.props.setListFormField(listField);
  }

  async setFormField(index) {
    if (index > -1) {
      const listField = returnArray(this.state.listFormField);
      const fiels = returnObject(listField[index]);
      if (
        fiels.FieldType == objField.SPLinkWF &&
        fiels.ObjSPField.ObjField.ObjSPLink &&
        isNotNull(fiels.ObjSPField.ObjField.ObjSPLink.wfTableId) &&
        fiels.ObjSPField.ObjField.ObjSPLink.ArrayFieldSP &&
        fiels.ObjSPField.ObjField.ObjSPLink.ArrayFieldSP.length == 0
      ) {
        let arrField = await shareService.GetWFFormField(
          fiels.ObjSPField.ObjField.ObjSPLink.wfTableId
        );
        fiels.ObjSPField.ObjField.ObjSPLink.ArrayFieldSP = arrField;
      }
      await this.setState({
        isShowModal: true,
        detailField: fiels,
        indexField: index,
      });
    } else {
      await this.setState({
        isShowModal: true,
        detailField: {
          ID: 0,
          FieldName: "",
          FieldType: "Text",
          InternalName: "",
          HelpText: "",
          Required: 0,
          ObjValidation: {
            IsActive: false,
            CalculateCondition: {
              isCalculate: false,
              FieldType: "",
              FieldNameEnd: "",
              FieldNameStart: "",
              Calculation: "",
              arrCalculation: [],
              arrFieldCalculation: [],
              Expression: "",
              typeCalculation: "",
            },
            CompareCondition: [],
            typeInputValidation: "",
          },
          ObjSPField: {
            Type: "",
            ObjField: {},
            TextField: "",
          },
          DefaultValue: "",
          listSearch_DefaultValue: [],
          TypeDefaultValue: "",
          ComponentInfo:''
        },
        indexField: -1,
      });
    }
  }

  onSortStart = (sortEvent, nativeEvent) => {
    // console.log("onSortStart");
    const { onSortStart } = this.props;
    this.setState({ isSorting: true });
    if (onSortStart) {
      onSortStart(sortEvent, nativeEvent, this.refs.component);
    }
  };

  onSortEnd = (sortEvent, nativeEvent) => {
    const { onSortEnd } = this.props;
    const { oldIndex, newIndex } = sortEvent;
    const { listFormField } = this.state;

    this.props.setListFormField(arrayMove(listFormField, oldIndex, newIndex));

    if (onSortEnd) {
      onSortEnd(sortEvent, nativeEvent, this.refs.component);
    }
  };

  render() {
    const {
      listFormField,
      listWorkflow,
      isSorting,
      listStepWorkflow,
      Confirm,
      IsCollapse,
    } = this.state;
    const props = {
      isSorting,
      listFormField,
      onSortEnd: this.onSortEnd,
      onSortStart: this.onSortStart,
      ref: "component",
      useDragHandle: true,
    };
    return (
      <Card outline color="info" className="border p-3">
        <div className="row">
          <Col lg="6">
            <CardTitle className="text-info mb-3">
              Thiết lập cơ sở dữ liệu
            </CardTitle>
          </Col>
          <Col lg="6">
            <div className="text-right">
              <button
                type="button"
                className="btn btn-md btn-primary waves-effect mr-2 waves-light"
                onClick={() => this.setState({ IsCollapse: !IsCollapse })}
                title={IsCollapse ? "Collapse" : "Extend"}
              >
                <i
                  className={`fa fa-${
                    IsCollapse ? "chevron-up" : "chevron-down"
                  } pr-0`}
                ></i>
              </button>

              <button
                type="button"
                className="btn btn-md btn-primary waves-effect waves-light"
                onClick={() => this.setFormField(-1)}
              >
                <i className="fa fa-plus-circle mr-2 align-middle aaa"></i> Thêm
                trường
              </button>
            </div>
          </Col>

          <Col lg="12">
            <Collapse isOpen={IsCollapse}>
              <div className="table-responsive mt-3 mb-3">
                <Table className="table table-striped mb-0">
                  <thead>
                    <tr>
                      <th>Sắp xếp</th>
                      <th>Tên trường</th>
                      <th>Trường nội bộ</th>
                      <th>Kiểu dữ liệu</th>
                      <th style={{ width: "50%" }}>Mô tả</th>
                      <th>Bắt buộc</th>
                      <th>Danh mục</th>
                      <th className="text-right" style={{ minWidth: "80px" }}>
                        Hoạt động
                      </th>
                    </tr>
                  </thead>
                  <FormFieldList
                    shouldUseDragHandle={true}
                    items={listFormField}
                    setEditField={this.setFormField}
                    deleteEditField={this.deleteField}
                    width={400}
                    height={600}
                    {...props}
                  />
                </Table>
              </div>

              {/* addMore */}
              <div className="text-right">
                <button
                  type="button"
                  className="btn btn-md btn-primary waves-effect waves-light"
                  onClick={() => this.setFormField(-1)}
                >
                  <i className="fa fa-plus-circle mr-2 align-middle aaa"></i>{" "}
                  Thêm trường
                </button>
              </div>
            </Collapse>
          </Col>

          {!this.state.isShowModal ? (
            ""
          ) : (
            <AddFormField
              detailField={this.state.detailField}
              listFormField={this.state.listFormField}
              listWorkflow={this.state.listWorkflow}
              listStepWorkflow={this.state.listStepWorkflow}
              modalOpenClose={this.modalOpenClose}
              resutlFormField={this.resutlFormField}
              indexField={this.state.indexField}
              ListComponentInfo={this.state.ListComponentInfo}
            />
          )}
          {!Confirm ? (
            ""
          ) : (
            <Modal size="lg" isOpen={this.state.Confirm} style={{ top: "35%" }}>
              <div
                className="modal-header"
                style={{ backgroundColor: "#ffc107" }}
              >
                <h5 className="modal-title mt-0" id="myLargeModalLabel">
                  {this.state.ConfirmText}
                </h5>
                <button
                  onClick={() => this.setState({ Confirm: false })}
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
                    onClick={() => this.setState({ Confirm: false })}
                    data-dismiss="modal"
                    aria-label="Close"
                  >
                    Không
                  </button>
                  <button
                    style={{ width: "66px" }}
                    type="button"
                    className="btn btn-info  btn-md waves-effect waves-light"
                    onClick={() =>
                      this.DeleteFieldConfirm(this.state.ConfirmParameter)
                    }
                  >
                    Có
                  </button>
                </div>
              </div>
            </Modal>
          )}
        </div>
      </Card>
    );
  }
}

export default WfFormField;

const FormFieldHandle = SortableHandle(({ tabIndex }) => (
  <td tabIndex={tabIndex} style={{ width: "50px" }}>
    <svg
      viewBox="0 0 50 50"
      style={{ width: "18px", height: "18px", cursor: "grab" }}
    >
      <path
        d="M 0 7.5 L 0 12.5 L 50 12.5 L 50 7.5 L 0 7.5 z M 0 22.5 L 0 27.5 L 50 27.5 L 50 22.5 L 0 22.5 z M 0 37.5 L 0 42.5 L 50 42.5 L 50 37.5 L 0 37.5 z"
        color="#000"
      />
    </svg>
  </td>
));

const FormFieldItem = SortableElement(
  ({
    tabbable,
    className,
    isDisabled,
    height,
    style: propStyle,
    shouldUseDragHandle,
    value,
    itemIndex,
    isSorting,
    setEditField,
    deleteEditField,
  }) => {
    const bodyTabIndex = tabbable && !shouldUseDragHandle ? 0 : -1;
    const handleTabIndex = tabbable && shouldUseDragHandle ? 0 : -1;

    return (
      <tr tabIndex={bodyTabIndex} data-index={itemIndex}>
        {shouldUseDragHandle && <FormFieldHandle tabIndex={handleTabIndex} />}
        <td>{value.FieldName}</td>
        <td>{value.InternalName}</td>
        <td>{formatTypeObjField(value.FieldType)}</td>
        <td>{value.HelpText}</td>
        <td>{value.Required == 1 ? "Có" : "Không"}</td>
        <td>{value.ComponentInfo}</td>
        <td>
          <div className="button-items text-right">
            <button
              type="button"
              className="btn btn-sm waves-effect waves-light p-0 mb-0"
              onClick={() => setEditField(itemIndex)}
              title="Field edit"
            >
              <i className="fa fa-pencil mr-2 align-middle text-primary font-size-16"></i>
            </button>
            <button
              type="button"
              className="btn btn-sm waves-effect waves-light p-0 mb-0"
              onClick={() => deleteEditField(itemIndex)}
              title="Field delete"
            >
              <i className="fa fa-trash text-danger font-size-16" />
            </button>
          </div>
        </td>
      </tr>
    );
  }
);

const FormFieldList = SortableContainer(
  ({
    className,
    items,
    disabledItems = [],
    itemClass,
    isSorting,
    shouldUseDragHandle,
    type,
    setEditField,
    deleteEditField,
  }) => {
    // console.log("FormFieldList");

    return (
      <tbody>
        {items.map((value, index) => {
          const disabled = disabledItems.includes(value);

          return (
            <FormFieldItem
              tabbable
              key={`item-${index}`}
              disabled={disabled}
              isDisabled={disabled}
              className={itemClass}
              index={index}
              itemIndex={index}
              value={value}
              shouldUseDragHandle={shouldUseDragHandle}
              type={type}
              isSorting={isSorting}
              setEditField={setEditField}
              deleteEditField={deleteEditField}
            />
          );
        })}
      </tbody>
    );
  }
);
