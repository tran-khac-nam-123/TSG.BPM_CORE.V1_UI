import React, { Component } from "react";
import {
  isNotNull,
  CheckNull,
  CheckNullSetZero,
  returnArray,
  returnObject,
  checkFormCondition,
} from "../../wfShareCmpts/wfShareFunction.js";
import {
  objField,
  arrayTypeCompare,
  arrayTypeCalculation,
} from "../../wfShareCmpts/wfShareModel";

import { Table, Thead, Tbody, Tr, Th, Td } from "react-super-responsive-table";

import ConfirmRequired from "../ConfirmRequired";
import ConfirmDelete from "../ConfirmDelete";
import shareService from "../../wfShareCmpts/wfShareService.js";
import { event } from "jquery";
export default class ConditionStep extends Component {
  constructor(props) {
    super(props);
    // console.log(this.props);

    this.state = {
      stepCondition: this.props.stepCondition,
      listFormField: this.props.listFormField,
      listStepWorkflow: this.props.listStepWorkflow,
      indexCondition: this.props.indexCondition,
      indexStep: this.props.indexStep,
      Required: false,
      RequiredText: "",
      isConfirm: false,
      textConfirm: "",
      objConfirm: {},
      idU: "",
      listSearch_UserApprover: []
    };
    this.callSearchPeople = this.callSearchPeople.bind(this)
    this.modalOpenCloseAlert = this.modalOpenCloseAlert.bind(this);
    this.changeFormStepCondition = this.changeFormStepCondition.bind(this);
    this.changeFormCondition = this.changeFormCondition.bind(this);
    this.AddFormCondition = this.AddFormCondition.bind(this);
    this.removeFormCondition = this.removeFormCondition.bind(this);
    this.closeConfirm = this.closeConfirm.bind(this);
    this.resultConfirm = this.resultConfirm.bind(this);
    this.typingTimeout = null;
    this.fieldSearch = undefined;
  }

  componentWillReceiveProps(nextProps) {
    // console.log(nextProps);
    this.setState({
      stepCondition: nextProps.stepCondition,
      listFormField: nextProps.listFormField,
      listStepWorkflow: nextProps.listStepWorkflow,
      indexCondition: nextProps.indexCondition,
      indexStep: nextProps.indexStep,

    });
  }

  changeFormStepCondition(event) {
    let nameState = event.target.name;
    let valueState = event.target.value;
    let stepCondition = returnObject(this.state.stepCondition);

    if (nameState == "TypeCondition") {
      stepCondition.TypeCondition = valueState;
      if (valueState == "Compare") {
        stepCondition.ObjCondition = [
          {
            Field: "",
            Condition: "",
            ConditionType: "",
            FieldCompare: "",
            Value: "",
            FieldType: "",
            arrFieldCompare: [],
            arrCondition: [],
            typeInputStepWF: "text",
          },
        ];
      } else if (valueState == "Calculate") {
        stepCondition.ObjCondition = [
          {
            Field: {
              FieldType: "",
              FieldNameEnd: "",
              FieldNameStart: "",
              Calculate: "",
            },
            Condition: "",
            ConditionType: "",
            FieldCompare: "",
            Value: "",
            arrFieldCompare: [],
            arrCalculate: [],
            typeInputStepWF: "text",
          },
        ];
      }
    } else if (nameState == "StepNextCondition") {
      let objStepNextC = returnObject(stepCondition.StepNextCondition);

      objStepNextC.StepNextConditionId = valueState;
      objStepNextC.StepNextConditionTitle =
        event.target.selectedOptions[0].text;
      stepCondition.StepNextCondition = objStepNextC;
    } else {
      stepCondition[nameState] = valueState;
    }

    // this.setState({ stepCondition: stepCondition });
    this.props.resultConditionStep(stepCondition, this.state.indexCondition);
  }

  // set các giá trị trong 1 điều kiện trong cấu hình của 1 bước
  changeFormCondition(index, typeForm, event) {
    let nameState = event.target.name;
    let valueState = event.target.value;
    if (typeForm == "ConditionCompare") {
      let stepCondition = returnObject(this.state.stepCondition);
      let arrItemCon = returnArray(stepCondition.ObjCondition);
      let itemCon = returnObject(arrItemCon[index]);
      itemCon[nameState] = valueState;

      if (nameState == "Field" && isNotNull(valueState)) {
        let fieldIn = this.state.listFormField.find(
          (f) => f.InternalName == valueState
        );

        itemCon.FieldType = fieldIn.FieldType;
        if (
          fieldIn.FieldType == objField.Text ||
          fieldIn.FieldType == objField.TextArea ||
          fieldIn.FieldType == objField.Dropdown ||
          fieldIn.FieldType == objField.Profile ||
          // cuong them
          fieldIn.FieldType == objField.User
        ) {
          itemCon.arrCondition = [
            { Code: "=", Title: "Bằng" },
            { Code: "!=", Title: "Khác" },
          ];
          itemCon.typeInputStepWF = "text";
        } else if (fieldIn.FieldType == objField.DateTime) {
          itemCon.arrCondition = arrayTypeCompare;
          itemCon.typeInputStepWF = "date";
        } else if (fieldIn.FieldType == objField.Number) {
          itemCon.arrCondition = arrayTypeCompare;
          itemCon.typeInputStepWF = "number";
        }
      }
      if (nameState == "ConditionType" && isNotNull(valueState)) {
        itemCon["FieldCompare"] = "";
        itemCon["Value"] = "";
        if (valueState == "FieldCompare") {
          let fieldIn = this.state.listFormField.find(
            (f) => f.InternalName == itemCon["Field"]
          );

          if (
            fieldIn.FieldType == objField.Text ||
            fieldIn.FieldType == objField.TextArea ||
            fieldIn.FieldType == objField.Dropdown ||
            fieldIn.FieldType == objField.Profile
          ) {
            itemCon.arrFieldCompare = this.state.listFormField.filter(
              (f) =>
                f.InternalName != fieldIn.InternalName &&
                (f.FieldType == objField.Text ||
                  f.FieldType == objField.TextArea ||
                  f.FieldType == objField.Dropdown ||
                  f.FieldType == objField.Profile)
            );
          } else if (fieldIn.FieldType == objField.DateTime) {
            itemCon.arrFieldCompare = this.state.listFormField.filter(
              (f) =>
                f.InternalName != fieldIn.InternalName &&
                f.FieldType == fieldIn.FieldType
            );
          } else if (fieldIn.FieldType == objField.Number) {
            itemCon.arrFieldCompare = this.state.listFormField.filter(
              (f) =>
                f.InternalName != fieldIn.InternalName &&
                f.FieldType == fieldIn.FieldType
            );
          }
        } else {
          itemCon.arrFieldCompare = [];
        }
      }

      arrItemCon[index] = itemCon;
      stepCondition.ObjCondition = arrItemCon;
      // this.setState({ stepCondition: stepCondition });
      this.props.resultConditionStep(stepCondition, this.state.indexCondition);
    } else if (typeForm == "ConditionCalculate") {
      let stepCondition = returnObject(this.state.stepCondition);
      let arrItemCon = returnArray(stepCondition.ObjCondition);
      let itemCon = returnObject(arrItemCon[index]);

      if (nameState == "FieldNameEnd" && isNotNull(valueState)) {
        let fieldCon = returnObject(itemCon.Field);
        const fieldIn = this.state.listFormField.find(
          (f) => f.InternalName == valueState
        );
        fieldCon.FieldNameEnd = valueState;
        fieldCon.FieldType = fieldIn.FieldType;
        if (fieldIn.FieldType == objField.DateTime) {
          itemCon.arrFieldCompare = this.state.listFormField.filter(
            (f) =>
              f.InternalName != fieldIn.InternalName &&
              f.FieldType == fieldIn.FieldType
          );
          itemCon.arrCalculate = [{ Code: "-", Title: "Trừ" }];
          itemCon.typeInputStepWF = "date";
        } else if (fieldIn.FieldType == objField.Number) {
          itemCon.arrFieldCompare = this.state.listFormField.filter(
            (f) =>
              f.InternalName != fieldIn.InternalName &&
              f.FieldType == fieldIn.FieldType
          );
          itemCon.arrCalculate = arrayTypeCalculation;
          itemCon.typeInputStepWF = "number";
        }
        itemCon.Field = fieldCon;
      } else if (nameState == "Calculate") {
        let fieldCon = returnObject(itemCon.Field);
        fieldCon.Calculate = valueState;
        itemCon.Field = fieldCon;
      } else if (nameState == "FieldNameStart") {
        let fieldCon = returnObject(itemCon.Field);
        fieldCon.FieldNameStart = valueState;
        itemCon.Field = fieldCon;
      } else {
        itemCon[nameState] = valueState;
        if (nameState == "ConditionType" && isNotNull(valueState)) {
          itemCon["FieldCompare"] = "";
          itemCon["Value"] = "";
        }
      }
      arrItemCon[index] = itemCon;
      stepCondition.ObjCondition = arrItemCon;
      // this.setState({ stepCondition: stepCondition });
      this.props.resultConditionStep(stepCondition, this.state.indexCondition);
    }
  }

  // Thêm 1 điều kiện trong cấu hình của 1 bước
  AddFormCondition(typeForm) {
    if (typeForm == "ConditionCompare") {
      let stepCondition = returnObject(this.state.stepCondition);
      let arrItemCon = returnArray(stepCondition.ObjCondition);

      if (arrItemCon.length > 0) {
        const txtAlerRequired = checkFormCondition(typeForm, arrItemCon);
        if (isNotNull(txtAlerRequired)) {
          this.setState({
            RequiredText:
              "Bạn chưa điền đủ thông tin điều kiện: \n " +
              txtAlerRequired +
              "",
            Required: true,
          });
          return;
        } else {
          arrItemCon.push({
            Field: "",
            Condition: "",
            ConditionType: "",
            FieldCompare: "",
            Value: "",
            FieldType: "",
            arrFieldCompare: [],
            arrCondition: [],
            typeInputStepWF: "text",
          });
        }
      } else {
        arrItemCon.push({
          Field: "",
          Condition: "",
          ConditionType: "",
          FieldCompare: "",
          Value: "",
          FieldType: "",
          arrFieldCompare: [],
          arrCondition: [],
          typeInputStepWF: "text",
        });
      }

      stepCondition.ObjCondition = arrItemCon;
      // this.setState({ stepCondition: stepCondition });
      this.props.resultConditionStep(stepCondition, this.state.indexCondition);
    } else if (typeForm == "ConditionCalculate") {
      let stepCondition = returnObject(this.state.stepCondition);
      let arrItemCon = returnArray(stepCondition.ObjCondition);

      if (arrItemCon.length > 0) {
        const txtAlerRequired = checkFormCondition(typeForm, arrItemCon);
        if (isNotNull(txtAlerRequired)) {
          this.setState({
            RequiredText:
              "Bạn chưa điền đủ thông tin điều kiện: \n " +
              txtAlerRequired +
              "",
            Required: true,
          });
          //  alert("Bạn chưa điền đủ thông tin điều kiện: \n" + txtAlerRequired);
          return;
        } else {
          arrItemCon.push({
            Field: {
              FieldType: "",
              FieldNameEnd: "",
              FieldNameStart: "",
              Calculate: "",
            },
            Condition: "",
            ConditionType: "",
            FieldCompare: "",
            Value: "",
            arrFieldCompare: [],
            arrCalculate: [],
            typeInputStepWF: "text",
          });
        }
      } else {
        arrItemCon.push({
          Field: {
            FieldType: "",
            FieldNameEnd: "",
            FieldNameStart: "",
            Calculate: "",
          },
          Condition: "",
          ConditionType: "",
          FieldCompare: "",
          Value: "",
          arrFieldCompare: [],
          arrCalculate: [],
          typeInputStepWF: "text",
        });
      }
      stepCondition.ObjCondition = arrItemCon;
      // this.setState({ stepCondition: stepCondition });
      this.props.resultConditionStep(stepCondition, this.state.indexCondition);
    }
  }
  changeSearchPeople(index,event) {
    let valueState = event.target.value;
    let stepCondition = returnObject(this.state.stepCondition);
    let arrItemCon = returnArray(stepCondition.ObjCondition);
    let itemCon = returnObject(arrItemCon[index]);
    itemCon['Value'] = valueState;
    arrItemCon[index]=itemCon
    stepCondition.ObjCondition = arrItemCon;
    this.setState({stepCondition:stepCondition, idU: index });

    clearTimeout(this.typingTimeout);
    this.typingTimeout = setTimeout(this.callSearchPeople, 1000);
  }
  async callSearchPeople() {
    let textUser = this.state.stepCondition.ObjCondition[this.state.idU]
    let PeoplePicker = await shareService.searchPeoplePicker(
      textUser.Value
    );

    this.setState({ listSearch_UserApprover: PeoplePicker });

  }
  async selectSearch(Key) {
    let objUser = await shareService.getInforUser(Key);
    let index= this.state.idU
    let stepCondition = returnObject(this.state.stepCondition);
    let arrItemCon = returnArray(stepCondition.ObjCondition);
    let itemCon = returnObject(arrItemCon[index]);
    itemCon['Value'] = objUser.UserEmail;
    arrItemCon[index]=itemCon;
    stepCondition.ObjCondition = arrItemCon;

    this.setState({ stepCondition: stepCondition, listSearch_UserApprover: [] });
    this.props.resultConditionStep(stepCondition, this.state.indexCondition);

  }
  removeFormCondition(index, typeForm) {
    // if (typeForm == "ConditionCompare" || typeForm == "ConditionCalculate") {
    this.setState({
      isConfirm: true,
      textConfirm: "Bạn có chắc chắn muốn xóa điều kiện này?",
      objConfirm: {
        typeForm: typeForm,
        indexArr: index,
      },
    });
    // }
  }

  async modalOpenCloseAlert() {
    await this.setState({ Required: false });
  }

  async closeConfirm() {
    await this.setState({ isConfirm: false, textConfirm: "", objConfirm: {} });
  }

  async resultConfirm(objConfirm) {
    if (
      objConfirm.typeForm == "ConditionCompare" ||
      objConfirm.typeForm == "ConditionCalculate"
    ) {
      let stepCondition = returnObject(this.state.stepCondition);
      let arrItemCon = returnArray(stepCondition.ObjCondition);
      arrItemCon.splice(objConfirm.indexArr, 1);
      stepCondition.ObjCondition = arrItemCon;
      // this.setState({ stepCondition: stepCondition });
      await this.closeConfirm();
      this.props.resultConditionStep(stepCondition, this.state.indexCondition);
    }
  }

  render() {
    const {
      stepCondition,
      listFormField,
      listStepWorkflow,
      indexStep,
      isConfirm,
      textConfirm,
      objConfirm,
    } = this.state;
    return (
      <div className="col-lg-12">
        <div className="row">
          <div className="col-lg-12">
            <div className="form-group row">
              <label htmlFor="example-text-input" className="col-md-3">
                Độ ưu tiên
              </label>
              <div className="col-md-9">
                <input
                  className="form-control"
                  type="number"
                  name="Priority"
                  onChange={(event) => this.changeFormStepCondition(event)}
                  value={stepCondition.Priority}
                />
              </div>
            </div>
          </div>

          <div className="col-lg-12">
            <div className="form-group row">
              <label htmlFor="example-text-input" className="col-md-3">
                Loại điều kiện <span className="text-danger">*</span>
              </label>
              <div className="col-md-9">
                <select
                  className="form-control"
                  name="TypeCondition"
                  onChange={(event) => this.changeFormStepCondition(event)}
                  value={stepCondition.TypeCondition}
                >
                  <option value=""></option>
                  <option value="Calculate">Tính toán</option>
                  <option value="Compare">So sánh</option>
                </select>
              </div>
            </div>
          </div>

          {!isNotNull(stepCondition.TypeCondition) ||
            stepCondition.ObjCondition.length <= 1 ? (
            ""
          ) : (
            <div className="col-lg-12">
              <div className="form-group row">
                <label htmlFor="example-text-input" className="col-md-3">
                  Điều kiện kết hợp <span className="text-danger">*</span>
                </label>
                <div className="col-md-9">
                  <select
                    className="form-control"
                    name="ConditionsCombined"
                    onChange={(event) => this.changeFormStepCondition(event)}
                    value={stepCondition.ConditionsCombined}
                  >
                    <option value=""></option>
                    <option value="And">Điều kiện và</option>
                    <option value="Or">Điều kiện hoặc</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {stepCondition.TypeCondition == "Compare" ? (
            <div className="col-lg-12">
              <div className="form-group row">
                <div className="col-md-12">
                  <div className="table-responsive mt-3">
                    <Table className="table table-striped mb-0">
                      <thead>
                        <tr>
                          <th>
                            Trường dữ liệu{" "}
                            <span className="text-danger">*</span>
                          </th>
                          <th>
                            Điều kiện <span className="text-danger">*</span>
                          </th>
                          <th>
                            Loại so sánh <span className="text-danger">*</span>
                          </th>
                          <th>
                            Trường so sánh || Giá trị nhập{" "}
                            <span className="text-danger">*</span>
                          </th>
                          <th className="text-right">Hoạt động</th>
                        </tr>
                      </thead>
                      <tbody>
                        {stepCondition.ObjCondition.map((stepCon, index) => (
                          <tr key={index}>
                            <td>
                              <select
                                className="form-control"
                                name="Field"
                                onChange={(event) =>
                                  this.changeFormCondition(
                                    index,
                                    `ConditionCompare`,
                                    event
                                  )
                                }
                                value={stepCon.Field}
                              >
                                <option value=""></option>
                                {listFormField
                                  .filter(
                                    (fc) =>
                                      fc.FieldType == objField.Text ||
                                      fc.FieldType == objField.TextArea ||
                                      fc.FieldType == objField.Number ||
                                      fc.FieldType == objField.DateTime ||
                                      fc.FieldType == objField.Dropdown ||
                                      fc.FieldType == objField.Profile ||
                                      fc.FieldType == objField.User
                                  )
                                  .map((fieldCompare, cpF) => (
                                    <option
                                      value={fieldCompare.InternalName}
                                      key={cpF}
                                    >
                                      {fieldCompare.FieldName}
                                    </option>
                                  ))}
                              </select>
                            </td>
                            <td>
                              <select
                                className="form-control"
                                name="Condition"
                                onChange={(event) =>
                                  this.changeFormCondition(
                                    index,
                                    `ConditionCompare`,
                                    event
                                  )
                                }
                                value={stepCon.Condition}
                              >
                                <option value=""></option>
                                {stepCon.arrCondition.map((conArr) => (
                                  <option value={conArr.Code} key={conArr.Code}>
                                    {conArr.Title}
                                  </option>
                                ))}
                              </select>
                            </td>
                            <td>
                              <select
                                className="form-control"
                                name="ConditionType"
                                onChange={(event) =>
                                  this.changeFormCondition(
                                    index,
                                    `ConditionCompare`,
                                    event
                                  )
                                }
                                value={stepCon.ConditionType}
                              >
                                <option value=""></option>
                                <option value="FieldCompare">
                                  Trường so sánh
                                </option>
                                <option value="FieldValue">Giá trị nhập</option>
                              </select>
                            </td>
                            <td>
                              {stepCon.ConditionType == "FieldCompare" ? (
                                <select
                                  className="form-control"
                                  name="FieldCompare"
                                  onChange={(event) =>
                                    this.changeFormCondition(
                                      index,
                                      `ConditionCompare`,
                                      event
                                    )
                                  }
                                  value={stepCon.FieldCompare}
                                >
                                  <option value=""></option>
                                  {stepCon.arrFieldCompare.map((fieldArr) => (
                                    <option
                                      value={fieldArr.InternalName}
                                      key={fieldArr.InternalName}
                                    >
                                      {fieldArr.FieldName}
                                    </option>
                                  ))}
                                </select>
                              )
                                :
                                stepCon.FieldType == objField.User ? (
                                  <div className="col-md-9">
                                    <input
                                      className="form-control"
                                      type="text"
                                      placeholder="Search users"
                                      name="UserApprover"
                                      onChange={(event)=> this.changeSearchPeople(index,event)}
                                      value={stepCon.Value}
                                    />
                                    {this.state.listSearch_UserApprover.length > 0 ? (
                                      <div className="suggesAuto">
                                        {this.state.listSearch_UserApprover.map((people) => (
                                          <div
                                            key={people.Key}
                                            className="suggtAutoItem"
                                            onClick={() =>
                                              this.selectSearch(people.Key)
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
                                  </div>
                                )
                                  : (
                                    <input
                                      type={stepCon.typeInputStepWF}
                                      className="form-control"
                                      name="Value"
                                      onChange={(event) =>
                                        this.changeFormCondition(
                                          index,
                                          `ConditionCompare`,
                                          event
                                        )
                                      }
                                      value={stepCon.Value}
                                    />
                                  )}
                            </td>
                            <td>
                              <div className="button-items text-right">
                                <button
                                  type="button"
                                  className="btn"
                                  onClick={() =>
                                    this.removeFormCondition(
                                      index,
                                      `ConditionCompare`
                                    )
                                  }
                                >
                                  <i className="fa fa-trash text-danger font-size-16"></i>
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </Table>
                  </div>
                </div>
              </div>
              <div className="text-right mb-3">
                <button
                  type="button"
                  className="btn btn-md btn-primary waves-effect waves-light"
                  onClick={() => this.AddFormCondition(`ConditionCompare`)}
                >
                  <i className="fa fa-plus-circle mr-2 align-middle"></i> Thêm
                  điều kiện
                </button>
              </div>
            </div>
          ) : (
            ""
          )}

          {stepCondition.TypeCondition == "Calculate" ? (
            <div className="col-lg-12">
              <div className="form-group row">
                <div className="col-md-12">
                  <div className="table-responsive mt-3">
                    <Table className="table table-striped mb-0">
                      <thead>
                        <tr>
                          <th>
                            Trường dữ liệu{" "}
                            <span className="text-danger">*</span>
                          </th>
                          <th>
                            Phép tính <span className="text-danger">*</span>
                          </th>
                          <th>
                            Trường tính <span className="text-danger">*</span>
                          </th>
                          <th>
                            Điều kiện <span className="text-danger">*</span>
                          </th>
                          <th>
                            Loại so sánh <span className="text-danger">*</span>
                          </th>
                          <th>
                            Trường so sánh || Giá trị nhập{" "}
                            <span className="text-danger">*</span>
                          </th>
                          <th className="text-right">Hoạt động</th>
                        </tr>
                      </thead>
                      <tbody>
                        {stepCondition.ObjCondition.map((stepCon, index) => (
                          <tr key={index}>
                            <td>
                              <select
                                className="form-control"
                                name="FieldNameEnd"
                                onChange={(event) =>
                                  this.changeFormCondition(
                                    index,
                                    `ConditionCalculate`,
                                    event
                                  )
                                }
                                value={stepCon.Field.FieldNameEnd}
                              >
                                <option value=""></option>
                                {listFormField
                                  .filter(
                                    (fc) =>
                                      fc.FieldType == objField.Number ||
                                      fc.FieldType == objField.DateTime
                                  )
                                  .map((fieldCompare, enF) => (
                                    <option
                                      value={fieldCompare.InternalName}
                                      key={enF}
                                    >
                                      {fieldCompare.FieldName}
                                    </option>
                                  ))}
                              </select>
                            </td>
                            <td>
                              <select
                                className="form-control"
                                name="Calculate"
                                onChange={(event) =>
                                  this.changeFormCondition(
                                    index,
                                    `ConditionCalculate`,
                                    event
                                  )
                                }
                                value={stepCon.Field.Calculate}
                              >
                                <option value=""></option>
                                {stepCon.arrCalculate.map((conArr) => (
                                  <option value={conArr.Code} key={conArr.Code}>
                                    {conArr.Title}
                                  </option>
                                ))}
                              </select>
                            </td>
                            <td>
                              <select
                                className="form-control"
                                name="FieldNameStart"
                                onChange={(event) =>
                                  this.changeFormCondition(
                                    index,
                                    `ConditionCalculate`,
                                    event
                                  )
                                }
                                value={stepCon.Field.FieldNameStart}
                              >
                                <option value=""></option>
                                {stepCon.arrFieldCompare.map(
                                  (fieldCompare, stF) => (
                                    <option
                                      value={fieldCompare.InternalName}
                                      key={stF}
                                    >
                                      {fieldCompare.FieldName}
                                    </option>
                                  )
                                )}
                              </select>
                            </td>
                            <td>
                              <select
                                className="form-control"
                                name="Condition"
                                onChange={(event) =>
                                  this.changeFormCondition(
                                    index,
                                    `ConditionCalculate`,
                                    event
                                  )
                                }
                                value={stepCon.Condition}
                              >
                                <option value=""></option>
                                {arrayTypeCompare.map((conArr) => (
                                  <option value={conArr.Code} key={conArr.Code}>
                                    {conArr.Title}
                                  </option>
                                ))}
                              </select>
                            </td>
                            <td>
                              <select
                                className="form-control"
                                name="ConditionType"
                                onChange={(event) =>
                                  this.changeFormCondition(
                                    index,
                                    `ConditionCalculate`,
                                    event
                                  )
                                }
                                value={stepCon.ConditionType}
                              >
                                <option value=""></option>
                                <option value="FieldCompare">
                                  Trường so sánh
                                </option>
                                <option value="FieldValue">Giá trị nhập</option>
                              </select>
                            </td>
                            <td>
                              {stepCon.ConditionType == "FieldCompare" ? (
                                <select
                                  className="form-control"
                                  name="FieldCompare"
                                  onChange={(event) =>
                                    this.changeFormCondition(
                                      index,
                                      `ConditionCalculate`,
                                      event
                                    )
                                  }
                                  value={stepCon.FieldCompare}
                                >
                                  <option value=""></option>
                                  {listFormField
                                    .filter(
                                      (fc) => fc.FieldType == objField.Number
                                    )
                                    .map((fieldArr) => (
                                      <option
                                        value={fieldArr.InternalName}
                                        key={fieldArr.InternalName}
                                      >
                                        {fieldArr.FieldName}
                                      </option>
                                    ))}
                                </select>
                              ) : (
                                <input
                                  type="number"
                                  className="form-control"
                                  name="Value"
                                  onChange={(event) =>
                                    this.changeFormCondition(
                                      index,
                                      `ConditionCalculate`,
                                      event
                                    )
                                  }
                                  value={stepCon.Value}
                                />
                              )}
                            </td>
                            <td>
                              <div className="button-items text-right">
                                <button
                                  type="button"
                                  className="btn"
                                  onClick={() =>
                                    this.removeFormCondition(
                                      index,
                                      `ConditionCalculate`
                                    )
                                  }
                                >
                                  <i className="fa fa-trash text-danger font-size-16"></i>
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </Table>
                  </div>
                </div>
              </div>
              <div className="text-right mb-3">
                <button
                  type="button"
                  className="btn btn-md btn-primary waves-effect waves-light"
                  onClick={() => this.AddFormCondition(`ConditionCalculate`)}
                >
                  <i className="fa fa-plus-circle mr-2 align-middle"></i> Thêm
                  điều kiện
                </button>
              </div>
            </div>
          ) : (
            ""
          )}

          <div className="col-lg-12">
            <div className="form-group row">
              <label htmlFor="example-text-input" className="col-md-3">
                Bước kế tiếp(theo điều kiện){" "}
                <span className="text-danger">*</span>
              </label>
              <div className="col-md-9">
                <select
                  className="form-control"
                  name="StepNextCondition"
                  onChange={(event) => this.changeFormStepCondition(event)}
                  value={stepCondition.StepNextCondition.StepNextConditionId}
                >
                  {listStepWorkflow
                    .filter((step) => step.indexStep != indexStep)
                    .map((steps) => (
                      <option value={steps.indexStep} key={steps.indexStep}>
                        {steps.StepTitle}
                      </option>
                    ))}
                  <option value="">Hoàn thành</option>
                </select>
              </div>
            </div>
          </div>
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
