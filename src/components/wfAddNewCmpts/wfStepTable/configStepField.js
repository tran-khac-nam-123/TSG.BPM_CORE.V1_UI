import React, { Component } from "react";

import {
  isNotNull,
  returnArray,
  returnObject,
  checkFormStepFields,
} from "../../wfShareCmpts/wfShareFunction.js";
import { objField, colspan } from "../../wfShareCmpts/wfShareModel";

import { Col, CardTitle, Collapse } from "reactstrap";
import { Table, Thead, Tbody, Tr, Th, Td } from "react-super-responsive-table";

import {
  SortableContainer,
  SortableElement,
  SortableHandle,
} from "../../index";
import arrayMove from "array-move";
import ConfirmDelete from "../ConfirmDelete";
import ConfirmRequired from "../ConfirmRequired";

export default class ConfigStepField extends Component {
  constructor(props) {
    super(props);
    // console.log(this.props);

    this.state = {
      listFormField: this.props.listFormField,
      listStepField: this.props.listStepField,
      isSorting: false,
      typeStepField: this.props.typeStepField,
      ConfirmParameter: "",
      isConfirm: false,
      textConfirm: "",
      objConfirm: "",
      Required: false,
      RequiredText: "",
      ArrayFieldSelect: [],
      IsCollapse: true,
    };

    this.removeStepField = this.removeStepField.bind(this);
    this.changeStepField = this.changeStepField.bind(this);
    this.closeConfirm = this.closeConfirm.bind(this);
    this.resultConfirm = this.resultConfirm.bind(this);
    this.modalOpenCloseAlert = this.modalOpenCloseAlert.bind(this);
  }

  componentWillReceiveProps(nextProps) {
    // console.log(nextProps);
    this.setState({
      listFormField: nextProps.listFormField,
      listStepField: nextProps.listStepField,
      typeStepField: nextProps.typeStepField,
      ArrayFieldSelect: [],
    });
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
    const { listStepField } = this.state;

    this.props.resultStepField(
      arrayMove(listStepField, oldIndex, newIndex),
      this.state.typeStepField
    );

    if (onSortEnd) {
      onSortEnd(sortEvent, nativeEvent, this.refs.component);
    }
  };

  async changeStepField(event, index) {
    // console.log(event);
    let valueState = event.target.value;
    let nameState = event.target.name;
    let ArrayStepField = returnArray(this.state.listStepField);
    let objStepField = returnObject(ArrayStepField[index]);
    if (nameState == "InternalName") {
      if (isNotNull(valueState)) {
        let arrFieldOther = ArrayStepField.filter((x, inx) => inx !== index);
        if (
          arrFieldOther.findIndex((x) => x.InternalName == valueState) != -1
        ) {
          objStepField.InternalName = "";
          alert("Trường dữ liệu " + valueState + " đã được chọn");
        } else {
          objStepField.InternalName = valueState;
        }
      } else {
        objStepField.InternalName = "";
      }
    }
    if (nameState == "IsFirstColumn") {
      objStepField.IsFirstColumn = event.target.checked;
    }
    if (nameState == "Colspan") {
      objStepField[nameState] = valueState;
    }
    ArrayStepField[index] = objStepField;
    await this.setState({ listStepField: ArrayStepField });
    this.props.resultStepField(ArrayStepField, this.state.typeStepField);
  }

  async addStepField() {
    let ArrayStepField = returnArray(this.state.listStepField);
    let txtAlerRequired = checkFormStepFields(ArrayStepField);
    if (isNotNull(txtAlerRequired)) {
      // alert(
      //   "Thông tin trường dữ liệu " + this.state.typeStepField == "FieldInput"
      //     ? "nhập"
      //     : "hiển thị" + " chưa đầy đủ: \n" + txtAlerRequired
      // );
      this.setState({
        RequiredText:
          "Thông tin trường dữ liệu " + this.state.typeStepField == "FieldInput"
            ? "nhập"
            : "hiển thị" + " chưa đầy đủ: \n" + txtAlerRequired,
        Required: true,
      });
      return;
    }
    ArrayStepField.push({
      InternalName: "",
      Colspan: "",
      IsFirstColumn: false,
    });
    await this.setState({ listStepField: ArrayStepField });
    this.props.resultStepField(ArrayStepField, this.state.typeStepField);
  }

  removeStepField(index) {
    this.setState({
      isConfirm: true,
      textConfirm: "Bạn chắc chắn muốn xóa trường dữ liệu này?",
      objConfirm: { indexArr: index },
    });
  }

  async resultConfirm(objConfirm) {
    let ArrayStepField = returnArray(this.state.listStepField);
    ArrayStepField.splice(objConfirm.indexArr, 1);

    // await this.setState({ listStepField: ArrayStepField, isConfirm: false });
    await this.closeConfirm();

    this.props.resultStepField(ArrayStepField, this.state.typeStepField);
  }

  async closeConfirm() {
    await this.setState({ isConfirm: false, textConfirm: "", objConfirm: {} });
  }

  async modalOpenCloseAlert() {
    await this.setState({ Required: false });
  }

  changeArrayField(event) {
    // console.log(event);
    let ArrayStepField = returnArray(this.state.listStepField);
    let arrFieldSelect = [];
    const valueSelect = event.target.selectedOptions;
    for (let index = 0; index < valueSelect.length; index++) {
      arrFieldSelect.push(valueSelect[index].value);
      if (
        ArrayStepField.findIndex(
          (fils) => fils.InternalName == valueSelect[index].value
        ) == -1
      ) {
        ArrayStepField.push({
          InternalName: valueSelect[index].value,
          Colspan: "6",
          IsFirstColumn: false,
        });
      }
    }
    // this.setState({
    //   listStepField: ArrayStepField,
    //   ArrayFieldSelect: arrFieldSelect,
    // });
    this.props.resultStepField(ArrayStepField, this.state.typeStepField);
  }

  render() {
    const {
      listFormField,
      isSorting,
      listStepField,
      typeStepField,
      isConfirm,
      textConfirm,
      objConfirm,
      ArrayFieldSelect,
      IsCollapse,
    } = this.state;
    const listFormFieldSearch =
      typeStepField == "FieldView"
        ? listFormField
        : listFormField.filter(
            (fiels) =>
              fiels.FieldType != objField.Sum &&
              fiels.FieldType != objField.Average &&
              fiels.FieldType != objField.Percent
          );
    const props = {
      isSorting,
      listStepField,
      onSortEnd: this.onSortEnd,
      onSortStart: this.onSortStart,
      ref: "component",
      useDragHandle: true,
    };
    return (
      <div className="col-lg-12">
        <div className="row border-row mb-3">
          <Col lg="12">
            <div className="row mt-2 mb-2">
              <Col lg="6">
                <CardTitle className="text-info mb-3">
                  {this.state.typeStepField == "FieldView" ? (
                    <span>
                      Trường dữ liệu hiển thị{" "}
                      <span className="text-danger">*</span>
                    </span>
                  ) : (
                    "Trường dữ liệu nhập"
                  )}
                </CardTitle>
              </Col>
              <Col lg="6">
                <div className="text-right">
                  <button
                    type="button"
                    className="btn btn-md btn-primary waves-effect waves-light"
                    onClick={() => this.setState({ IsCollapse: !IsCollapse })}
                    title={IsCollapse ? "Collapse" : "Extend"}
                  >
                    <i
                      className={`fa fa-${
                        IsCollapse ? "chevron-up" : "chevron-down"
                      } pr-0`}
                    ></i>
                  </button>
                </div>
              </Col>
            </div>
            <div className="row mb-2">
              <Col lg="12">
                <select
                  className="form-control"
                  name="FieldType"
                  onChange={(event) => this.changeArrayField(event)}
                  value={ArrayFieldSelect}
                  multiple={true}
                >
                  {listFormFieldSearch.map((objfield) => (
                    <option
                      key={objfield.InternalName}
                      value={objfield.InternalName}
                    >
                      {objfield.FieldName}
                    </option>
                  ))}
                </select>
              </Col>
            </div>
            <div className="row mb-2">
              <Col lg="12">
                <Collapse isOpen={IsCollapse}>
                  <div className="table-responsive mt-3 mb-3">
                    <Table className="table table-striped mb-0">
                      <thead>
                        <tr>
                          <th>Sắp xếp</th>
                          <th>
                            Tên trường<span className="text-danger">*</span>
                          </th>
                          <th>
                            Colspan<span className="text-danger">*</span>
                          </th>
                          <th>Là cột bắt đầu</th>
                          <th className="text-right">Hoạt động</th>
                        </tr>
                      </thead>
                      <SortableField
                        shouldUseDragHandle={true}
                        items={listStepField}
                        listFormField={listFormFieldSearch}
                        removeStepField={this.removeStepField}
                        changeStepField={this.changeStepField}
                        width={400}
                        height={600}
                        {...props}
                      />
                    </Table>
                  </div>

                  <div className="text-right">
                    <button
                      type="button"
                      className="btn btn-md btn-primary waves-effect waves-light"
                      onClick={() => this.addStepField()}
                    >
                      <i className="fa fa-plus-circle mr-2 align-middle"></i>{" "}
                      Thêm trường
                    </button>
                  </div>
                </Collapse>
              </Col>
            </div>
          </Col>
        </div>

        {!this.state.Required ? (
          ""
        ) : (
          <ConfirmRequired
            textRequired={this.state.RequiredText}
            modalOpenCloseAlert={this.modalOpenCloseAlert}
          />
        )}
        {!isConfirm ? (
          ""
        ) : (
          <ConfirmDelete
            textConfirm={textConfirm}
            closeConfirm={this.closeConfirm}
            resultConfirm={this.resultConfirm}
            objConfirm={objConfirm}
          />
        )}
      </div>
    );
  }
}

const HandleField = SortableHandle(({ tabIndex }) => (
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

const ItemField = SortableElement(
  ({
    tabbable,
    className,
    isDisabled,
    height,
    style: propStyle,
    shouldUseDragHandle,
    objStepField,
    itemIndex,
    isSorting,
    listFormField,
    changeStepField,
    removeStepField,
  }) => {
    const bodyTabIndex = tabbable && !shouldUseDragHandle ? 0 : -1;
    const handleTabIndex = tabbable && shouldUseDragHandle ? 0 : -1;

    return (
      <tr tabIndex={bodyTabIndex} data-index={itemIndex}>
        {shouldUseDragHandle && <HandleField tabIndex={handleTabIndex} />}
        <td>
          <select
            className="form-control"
            name="InternalName"
            onChange={(event) => changeStepField(event, itemIndex)}
            value={objStepField.InternalName}
          >
            <option value=""></option>
            {listFormField.map((fieldInput, indexFieldInput) => (
              <option
                value={fieldInput.InternalName}
                label={fieldInput.FieldName}
                key={indexFieldInput}
              ></option>
            ))}
          </select>
        </td>
        <td>
          <select
            className="form-control"
            name="Colspan"
            onChange={(event) => changeStepField(event, itemIndex)}
            value={objStepField.Colspan}
          >
            <option value=""></option>
            {colspan.map((col, indexCol) => (
              <option
                value={col.Code}
                label={col.Title}
                key={indexCol}
              ></option>
            ))}
          </select>
        </td>
        <td>
          <input
            type="checkbox"
            name="IsFirstColumn"
            onChange={(event) => changeStepField(event, itemIndex)}
            checked={objStepField.IsFirstColumn}
          />
        </td>
        <td>
          <div className="button-items text-right">
            <button
              title="Xóa trường dữ liệu"
              type="button"
              className="btn"
              onClick={() => removeStepField(itemIndex)}
            >
              <i className="fa fa-trash text-danger font-size-16" />
            </button>
          </div>
        </td>
      </tr>
    );
  }
);

const SortableField = SortableContainer(
  ({
    className,
    items,
    disabledItems = [],
    itemClass,
    isSorting,
    shouldUseDragHandle,
    type,
    listFormField,
    removeStepField,
    changeStepField,
  }) => {
    // console.log("SortableList");

    return (
      <tbody>
        {items.map((objStepField, index) => {
          const disabled = disabledItems.includes(objStepField);

          return (
            <ItemField
              tabbable
              key={`item-${index}`}
              disabled={disabled}
              isDisabled={disabled}
              className={itemClass}
              index={index}
              itemIndex={index}
              objStepField={objStepField}
              shouldUseDragHandle={shouldUseDragHandle}
              type={type}
              isSorting={isSorting}
              listFormField={listFormField}
              removeStepField={removeStepField}
              changeStepField={changeStepField}
            />
          );
        })}
      </tbody>
    );
  }
);
