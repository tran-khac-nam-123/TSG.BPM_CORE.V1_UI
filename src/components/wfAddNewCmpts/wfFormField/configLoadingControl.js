import React, { Component } from "react";

import {
  isNotNull,
  CheckNull,
  CheckNullSetZero,
  getQueryParams,
  returnArray,
  returnObject,
  formatTypeObjField,
  isValidURL,
  checkFormConditionSPLink,
} from "components/wfShareCmpts/wfShareFunction.js";
import {
  objField,
  arrayObjField,
  typeCompare,
  arrayTypeCompare,
  typeCalculation,
  arrayTypeCalculation,
} from "components/wfShareCmpts/wfShareModel";
import shareService from "components/wfShareCmpts/wfShareService";
import { Table } from "reactstrap";

export default class ConfigLoadingControl extends Component {
  constructor(props) {
    super(props);
    this.state = {
      ObjSPLink: this.props.ObjSPLink,
      listWorkflow: this.props.listWorkflow,
    };
    this.callSearchPeopleSPLink = this.callSearchPeopleSPLink.bind(this);
    this.typingTimeout = null;
    this.fieldSearch = "";
  }

  componentWillReceiveProps(nextProps) {
    // console.log(nextProps);
    this.setState({
      ObjSPLink: nextProps.ObjSPLink,
      listWorkflow: nextProps.listWorkflow,
    });
  }

  async componentDidMount() {
    let objSPLink = returnObject(this.state.ObjSPLink);
    if (isNotNull(objSPLink.wfTableId)) {
      let allFieldLoad = await shareService.GetWFFormField(objSPLink.wfTableId);
      let arrFieldSP = returnArray(objSPLink.ArrayFieldSP);
      allFieldLoad.map((fiels) => {
        if (
          arrFieldSP.findIndex(
            (fils) => fils.InternalName == fiels.InternalName
          ) == -1
        ) {
          arrFieldSP.push(fiels);
        }
      });
      objSPLink.ArrayFieldSP = arrFieldSP;
      this.setState({ ObjSPLink: objSPLink });
    }
  }

  async changeFormSPLink(event) {
    let valueState = event.target.value;
    let nameState = event.target.name;

    let objSPLink = returnObject(this.state.ObjSPLink);

    if (nameState == "SPLinkWF") {
      let wfSPLink = this.state.listWorkflow.find(
        (wf) => wf.WFId == valueState
      );
      objSPLink.ArrayFieldSP = [];
      objSPLink.ArrayFieldCondition = [];
      objSPLink.ArrayFieldFilter = [];
      objSPLink.ArrayFieldView = [];

      if (isNotNull(valueState) && isNotNull(wfSPLink)) {
        objSPLink.wfTableId = wfSPLink.WFId;
        objSPLink.wfTableCode = wfSPLink.WFCode;
        objSPLink.ArrayFieldSP = await shareService.GetWFFormField(
          wfSPLink.WFId
        );
        // console.log(objSPLink.ArrayFieldSP);
        objSPLink.ArrayFieldSP.push({
          ID: 0,
          FieldName: "Trạng thái",
          FieldType: objField.Number,
          InternalName: "StatusStep",
          HelpText: "",
          Required: 0,
          ObjValidation: {},
          ObjSPField: "",
        });
        objSPLink.ArrayFieldSP.push({
          ID: 0,
          FieldName: "Người yêu cầu",
          FieldType: objField.User,
          InternalName: "UserRequest",
          HelpText: "",
          Required: 0,
          ObjValidation: {},
          ObjSPField: "",
        });
      } else {
        objSPLink.wfTableId = "";
        objSPLink.wfTableCode = "";
      }
    }
    if (nameState == "TypeSPLinkWF") {
      objSPLink.typeSPLink = valueState;
      objSPLink.ArrayFieldView = [];
    }

    if (nameState == "FieldFilter") {
      let fieldFilter = returnArray(objSPLink.ArrayFieldFilter);
      let fieldCheck1 = objSPLink.ArrayFieldSP.find(
        (fls) => fls.InternalName == valueState
      );
      if (
        isNotNull(fieldCheck1) &&
        fieldFilter.findIndex(
          (fs) => fs.InternalName == fieldCheck1.InternalName
        ) == -1
      ) {
        fieldFilter.push(fieldCheck1);
      }
      objSPLink.ArrayFieldFilter = fieldFilter;
    }

    if (nameState == "FieldView") {
      let fieldViews = returnArray(objSPLink.ArrayFieldView);
      let fieldCheck2 = objSPLink.ArrayFieldSP.find(
        (fls) => fls.InternalName == valueState
      );
      if (
        isNotNull(fieldCheck2) &&
        fieldViews.findIndex(
          (fs) => fs.InternalName == fieldCheck2.InternalName
        ) == -1
      ) {
        fieldViews.push(fieldCheck2);
      }
      objSPLink.ArrayFieldView = fieldViews;
    }

    if (nameState == "TypeFilter") {
      objSPLink[nameState] = valueState;
    }

    await this.setState({ ObjSPLink: objSPLink });
    this.props.resultLoadingControl(objSPLink);
  }

  async addFormSPLink() {
    let objSPLink = returnObject(this.state.ObjSPLink);
    let FieldCondition = returnArray(objSPLink.ArrayFieldCondition);
    let checkTextRequired = checkFormConditionSPLink(FieldCondition);
    if (isNotNull(checkTextRequired)) {
      alert("Thông tin điều kiện mặc định: \n" + checkTextRequired);
      return;
    }
    FieldCondition.push({
      InternalName: "",
      FieldSPLink: {},
      ConditionType: "",
      CompareValue: "",
      ArrayCondition: [],
      listCompareValue: [],
      listSearchCompareValue: [],
    });
    objSPLink.ArrayFieldCondition = FieldCondition;
    await this.setState({ ObjSPLink: objSPLink });
    this.props.resultLoadingControl(objSPLink);
  }

  async changeFormConditionSPLink(event, index, typeField) {
    let valueState = event.target.value;
    let nameState = event.target.name;
    let objSPLink = returnObject(this.state.ObjSPLink);
    let FieldCondition = returnArray(objSPLink.ArrayFieldCondition);
    let objFieldCondition = returnObject(FieldCondition[index]);
    if (nameState == "InternalName") {
      let fieldSP = objSPLink.ArrayFieldSP.find(
        (fls) => fls.InternalName == valueState
      );
      if (isNotNull(fieldSP)) {
        objFieldCondition.InternalName = valueState;
        objFieldCondition.FieldSPLink = fieldSP;
        if (
          (fieldSP.FieldType == objField.Number &&
            valueState != "StatusStep") ||
          fieldSP.FieldType == objField.Sum ||
          fieldSP.FieldType == objField.Average ||
          fieldSP.FieldType == objField.Percent ||
          fieldSP.FieldType == objField.DateTime
        ) {
          objFieldCondition.ArrayCondition = arrayTypeCompare;
          objFieldCondition.CompareValue = "";
        } else {
          if (
            fieldSP.FieldType == objField.User ||
            fieldSP.FieldType == objField.UserMulti
          ) {
            objFieldCondition.CompareValue = {
              UserId: "",
              UserTitle: "",
              UserEmail: "",
            };
          } else {
            objFieldCondition.CompareValue = "";
          }
          objFieldCondition.ArrayCondition = [
            { Code: "=", Title: "Bằng" },
            { Code: "!=", Title: "Khác" },
          ];
        }
        objFieldCondition.ConditionType = "";
        objFieldCondition.listCompareValue = [];
        objFieldCondition.listSearchCompareValue = [];
      } else {
        objFieldCondition.InternalName = "";
        objFieldCondition.FieldSPLink = {};
        objFieldCondition.ConditionType = "";
        objFieldCondition.CompareValue = "";
        objFieldCondition.ArrayCondition = [];
        objFieldCondition.listCompareValue = [];
        objFieldCondition.listSearchCompareValue = [];
      }
    }
    if (nameState == "CompareValue") {
      if (typeField == objField.YesNo) {
        objFieldCondition[nameState] = event.target.checked;
      } else {
        objFieldCondition[nameState] = valueState;
      }
    }
    if (nameState == "ConditionType") {
      objFieldCondition[nameState] = valueState;
    }

    FieldCondition[index] = objFieldCondition;
    objSPLink.ArrayFieldCondition = FieldCondition;
    await this.setState({ ObjSPLink: objSPLink });
    this.props.resultLoadingControl(objSPLink);
  }

  async removeFormSPLink(typeForm, index) {
    let objSPLink = returnObject(this.state.ObjSPLink);
    if (typeForm == "FieldCondition") {
      let FieldCondition = returnArray(objSPLink.ArrayFieldCondition);
      FieldCondition.splice(index, 1);
      objSPLink.ArrayFieldCondition = FieldCondition;
    } else if (typeForm == "FieldFilter") {
      let FieldFilter = returnArray(objSPLink.ArrayFieldFilter);
      FieldFilter.splice(index, 1);
      objSPLink.ArrayFieldFilter = FieldFilter;
    } else if (typeForm == "FieldView") {
      let FieldView = returnArray(objSPLink.ArrayFieldView);
      FieldView.splice(index, 1);
      objSPLink.ArrayFieldView = FieldView;
    }

    await this.setState({ ObjSPLink: objSPLink });
    this.props.resultLoadingControl(objSPLink);
  }

  // nhập giá trị để tìm kiếm người
  changeSearchPeopleSPLink(event, index) {
    this.fieldSearch = index;
    let objSPLink = returnObject(this.state.ObjSPLink);
    let FieldCondition = returnArray(objSPLink.ArrayFieldCondition);
    let objFieldCondition = returnObject(FieldCondition[index]);

    objFieldCondition.CompareValue.UserTitle = event.target.value;

    FieldCondition[index] = objFieldCondition;
    objSPLink.ArrayFieldCondition = FieldCondition;
    this.setState({ ObjSPLink: objSPLink });

    clearTimeout(this.typingTimeout);
    this.typingTimeout = setTimeout(this.callSearchPeopleSPLink, 1000);
  }

  // set giá trị cho danh sách người tìm kiếm
  async callSearchPeopleSPLink() {
    let objSPLink = returnObject(this.state.ObjSPLink);
    let FieldCondition = returnArray(objSPLink.ArrayFieldCondition);
    let objFieldCondition = returnObject(FieldCondition[this.fieldSearch]);

    let PeoplePicker = await shareService.searchPeoplePicker(
      objFieldCondition.CompareValue.UserTitle
    );

    objFieldCondition.listSearchCompareValue = PeoplePicker;
    FieldCondition[this.fieldSearch] = objFieldCondition;
    objSPLink.ArrayFieldCondition = FieldCondition;
    this.fieldSearch = "";
    await this.setState({ ObjSPLink: objSPLink });
    this.props.resultLoadingControl(objSPLink);
  }

  // Chọn người từ trong danh sách tìm kiếm
  async selectSearchSPLink(Key, typeUser, index) {
    let objSPLink = returnObject(this.state.ObjSPLink);
    let FieldCondition = returnArray(objSPLink.ArrayFieldCondition);
    let objFieldCondition = returnObject(FieldCondition[index]);

    let objUser = await shareService.getInforUser(Key);
    if (typeUser == objField.UserMulti) {
      objFieldCondition.CompareValue = {
        UserId: "",
        UserTitle: "",
        UserEmail: "",
      };
      let listUsers = returnArray(objFieldCondition.listCompareValue);
      if (
        isNotNull(objUser.UserId) &&
        listUsers.findIndex((us) => us.UserId == objUser.UserId) == -1
      ) {
        listUsers.push(objUser);
      }
      objFieldCondition.listCompareValue = listUsers;
    } else {
      objFieldCondition.CompareValue = objUser;
      objFieldCondition.listCompareValue = [];
    }
    objFieldCondition.listSearchCompareValue = [];

    FieldCondition[index] = objFieldCondition;
    objSPLink.ArrayFieldCondition = FieldCondition;
    await this.setState({ ObjSPLink: objSPLink });
    this.props.resultLoadingControl(objSPLink);
  }

  async removeSearchPeopleSPLink(indexField, index) {
    let objSPLink = returnObject(this.state.ObjSPLink);
    let FieldCondition = returnArray(objSPLink.ArrayFieldCondition);
    let objFieldCondition = returnObject(FieldCondition[indexField]);

    let listUsers = returnArray(objFieldCondition.listCompareValue);
    listUsers.splice(index, 1);
    objFieldCondition.listCompareValue = listUsers;

    FieldCondition[indexField] = objFieldCondition;
    objSPLink.ArrayFieldCondition = FieldCondition;
    await this.setState({ ObjSPLink: objSPLink });
    this.props.resultLoadingControl(objSPLink);
  }

  render() {
    const { ObjSPLink, listWorkflow } = this.state;
    return (
      <div className="col-lg-12">
        <div className="form-group row">
          <div className="col-lg-12">
            <div className="form-group row">
              <label htmlFor="example-text-input" className="col-md-3">
                Link đến quy trình <span className="text-danger">*</span>
              </label>
              <div className="col-md-9">
                <select
                  className="form-control"
                  name="SPLinkWF"
                  onChange={(event) => this.changeFormSPLink(event)}
                  value={ObjSPLink.wfTableId}
                >
                  <option value=""></option>
                  {listWorkflow.map((wfL) => (
                    <option value={wfL.WFId} key={wfL.WFId}>
                      {wfL.WFTitle}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {isNotNull(ObjSPLink.wfTableId) ? (
            <div className="col-lg-12">
              <div className="form-group row">
                <label htmlFor="example-text-input" className="col-md-3">
                  Loại hiển thị quy trình <span className="text-danger">*</span>
                </label>
                <div className="col-md-9">
                  <select
                    className="form-control"
                    name="TypeSPLinkWF"
                    onChange={(event) => this.changeFormSPLink(event)}
                    value={ObjSPLink.typeSPLink}
                  >
                    <option value=""></option>
                    <option value="ViewDetail">Chi tiết quy trình</option>
                    <option value="ViewHyperLink">Đường dẫn Link</option>
                  </select>
                </div>
              </div>
            </div>
          ) : (
            ""
          )}

          {isNotNull(ObjSPLink.wfTableId) ? (
            <div className="col-lg-12">
              <div className="form-group row">
                <label htmlFor="example-text-input" className="col-md-3">
                  Điều kiện mặc định
                </label>
                <div className="col-md-9">
                  <Table>
                    <thead>
                      <tr>
                        <th>Trường dữ liệu</th>
                        <th>Điều kiện</th>
                        <th>Giá trị điều kiện</th>
                        <th className="text-right">Hoạt động</th>
                      </tr>
                    </thead>
                    {ObjSPLink.ArrayFieldCondition.length > 0 ? (
                      <tbody>
                        {ObjSPLink.ArrayFieldCondition.map(
                          (fieldCon, indexF) => (
                            <tr key={indexF}>
                              <td>
                                <select
                                  className="form-control"
                                  name="InternalName"
                                  onChange={(event) =>
                                    this.changeFormConditionSPLink(
                                      event,
                                      indexF
                                    )
                                  }
                                  value={fieldCon.InternalName}
                                >
                                  <option value=""></option>
                                  {ObjSPLink.ArrayFieldSP.filter(
                                    (fls) =>
                                      fls.FieldType != objField.TextArea &&
                                      fls.FieldType != objField.SPLinkWF &&
                                      fls.FieldType != objField.PictureLink &&
                                      fls.FieldType != objField.Label &&
                                      fls.FieldType != objField.Hyperlink
                                  ).map((fiels) => (
                                    <option
                                      key={fiels.InternalName}
                                      value={fiels.InternalName}
                                    >
                                      {fiels.FieldName}
                                    </option>
                                  ))}
                                </select>
                              </td>
                              <td>
                                <select
                                  className="form-control"
                                  name="ConditionType"
                                  onChange={(event) =>
                                    this.changeFormConditionSPLink(
                                      event,
                                      indexF
                                    )
                                  }
                                  value={fieldCon.ConditionType}
                                >
                                  <option value=""></option>
                                  {fieldCon.ArrayCondition.map(
                                    (cons, index) => (
                                      <option key={index} value={cons.Code}>
                                        {cons.Title}
                                      </option>
                                    )
                                  )}
                                </select>
                              </td>
                              <td>
                                {fieldCon.InternalName == "StatusStep" ? (
                                  <select
                                    className="form-control"
                                    name="CompareValue"
                                    onChange={(event) =>
                                      this.changeFormConditionSPLink(
                                        event,
                                        indexF,
                                        objField.Text
                                      )
                                    }
                                    value={fieldCon.CompareValue}
                                  >
                                    <option value=""></option>
                                    <option value="0">Đang xử lý</option>
                                    <option value="1">Hoàn thành</option>
                                    <option value="2">Từ chối</option>
                                    <option value="3">Đã lưu</option>
                                    <option value="4">Yêu cầu chỉnh sửa</option>
                                  </select>
                                ) : fieldCon.FieldSPLink.FieldType ==
                                    objField.Number ||
                                  fieldCon.FieldSPLink.FieldType ==
                                    objField.Sum ||
                                  fieldCon.FieldSPLink.FieldType ==
                                    objField.Average ||
                                  fieldCon.FieldSPLink.FieldType ==
                                    objField.Percent ? (
                                  <input
                                    className="form-control"
                                    type="number"
                                    name="CompareValue"
                                    onChange={(event) =>
                                      this.changeFormConditionSPLink(
                                        event,
                                        indexF,
                                        objField.Number
                                      )
                                    }
                                    value={fieldCon.CompareValue}
                                  />
                                ) : fieldCon.FieldSPLink.FieldType ==
                                  objField.DateTime ? (
                                  <input
                                    className="form-control"
                                    type="date"
                                    name="CompareValue"
                                    onChange={(event) =>
                                      this.changeFormConditionSPLink(
                                        event,
                                        indexF,
                                        objField.DateTime
                                      )
                                    }
                                    value={fieldCon.CompareValue}
                                  />
                                ) : fieldCon.FieldSPLink.FieldType ==
                                  objField.User ? (
                                  <div>
                                    <input
                                      type="text"
                                      placeholder="Search users"
                                      className="form-control"
                                      name="CompareValue"
                                      onChange={(event) =>
                                        this.changeSearchPeopleSPLink(
                                          event,
                                          indexF
                                        )
                                      }
                                      value={fieldCon.CompareValue.UserTitle}
                                    />
                                    {fieldCon.listSearchCompareValue.length >
                                    0 ? (
                                      <div className="suggesAuto">
                                        {fieldCon.listSearchCompareValue.map(
                                          (people) => (
                                            <div
                                              key={people.Key}
                                              className="suggtAutoItem"
                                              onClick={() =>
                                                this.selectSearchSPLink(
                                                  people.Key,
                                                  objField.User,
                                                  indexF
                                                )
                                              }
                                            >
                                              <i className="fa fa-user"></i>{" "}
                                              {people.DisplayText}
                                              {` (${people.Description}`}
                                              {isNotNull(
                                                people.EntityData.Title
                                              )
                                                ? ` - ${people.EntityData.Title})`
                                                : `)`}
                                            </div>
                                          )
                                        )}
                                      </div>
                                    ) : (
                                      ""
                                    )}
                                  </div>
                                ) : fieldCon.FieldSPLink.FieldType ==
                                  objField.UserMulti ? (
                                  <div>
                                    <input
                                      type="text"
                                      placeholder="Search users"
                                      className="form-control"
                                      name="CompareValue"
                                      onChange={(event) =>
                                        this.changeSearchPeopleSPLink(
                                          event,
                                          indexF
                                        )
                                      }
                                      value={fieldCon.CompareValue.UserTitle}
                                    />
                                    {fieldCon.listSearchCompareValue.length >
                                    0 ? (
                                      <div className="suggesAuto">
                                        {fieldCon.listSearchCompareValue.map(
                                          (people) => (
                                            <div
                                              key={people.Key}
                                              className="suggtAutoItem"
                                              onClick={() =>
                                                this.selectSearchSPLink(
                                                  people.Key,
                                                  objField.UserMulti,
                                                  indexF
                                                )
                                              }
                                            >
                                              <i className="fa fa-user"></i>{" "}
                                              {people.DisplayText}
                                              {` (${people.Description}`}
                                              {isNotNull(
                                                people.EntityData.Title
                                              )
                                                ? ` - ${people.EntityData.Title})`
                                                : `)`}
                                            </div>
                                          )
                                        )}
                                      </div>
                                    ) : (
                                      ""
                                    )}
                                    {fieldCon.listCompareValue.length > 0 ? (
                                      <div className="tagName">
                                        {fieldCon.listCompareValue.map(
                                          (users, inUser) => (
                                            <div
                                              key={inUser}
                                              className="wrapName"
                                            >
                                              <a
                                                type="button"
                                                onClick={() =>
                                                  this.removeSearchPeopleSPLink(
                                                    indexF,
                                                    inUser
                                                  )
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
                                ) : fieldCon.FieldSPLink.FieldType ==
                                  objField.YesNo ? (
                                  <input
                                    type="checkbox"
                                    name="CompareValue"
                                    onChange={(event) =>
                                      this.changeFormConditionSPLink(
                                        event,
                                        indexF,
                                        objField.YesNo
                                      )
                                    }
                                    checked={fieldCon.CompareValue}
                                  />
                                ) : fieldCon.FieldSPLink.FieldType ==
                                    objField.Dropdown ||
                                   fieldCon.FieldSPLink.FieldType ==
                                    objField.DropdownMulti ||
                                  fieldCon.FieldSPLink.FieldType ==
                                    objField.CheckBox ||
                                  fieldCon.FieldSPLink.FieldType ==
                                    objField.RadioButton ? (
                                  <select
                                    className="form-control"
                                    name="CompareValue"
                                    onChange={(event) =>
                                      this.changeFormConditionSPLink(
                                        event,
                                        indexF,
                                        objField.Text
                                      )
                                    }
                                    value={fieldCon.CompareValue}
                                  >
                                    <option value=""></option>
                                    {fieldCon.FieldSPLink.ObjSPField.ObjField.ChoiceField.map(
                                      (dfField, dfKey) => (
                                        <option value={dfField} key={dfKey}>
                                          {dfField}
                                        </option>
                                      )
                                    )}
                                  </select>
                                ) : (
                                  <input
                                    className="form-control"
                                    type="text"
                                    name="CompareValue"
                                    onChange={(event) =>
                                      this.changeFormConditionSPLink(
                                        event,
                                        indexF,
                                        objField.Text
                                      )
                                    }
                                    value={fieldCon.CompareValue}
                                  />
                                )}
                              </td>
                              <td>
                                <div className="button-items text-right">
                                  <button
                                    type="button"
                                    className="btn"
                                    onClick={() =>
                                      this.removeFormSPLink(
                                        `FieldCondition`,
                                        indexF
                                      )
                                    }
                                  >
                                    <i className="fa fa-trash text-danger font-size-16"></i>
                                  </button>
                                </div>
                              </td>
                            </tr>
                          )
                        )}
                      </tbody>
                    ) : (
                      <tbody></tbody>
                    )}
                  </Table>
                </div>
              </div>
              <div className="text-right">
                <button
                  type="button"
                  className="btn btn-md btn-primary waves-effect waves-light"
                  onClick={() => this.addFormSPLink()}
                >
                  <i className="fa fa-plus-circle mr-2 align-middle"></i> Thêm
                  điều kiện
                </button>
              </div>
            </div>
          ) : (
            ""
          )}

          {isNotNull(ObjSPLink.wfTableId) ? (
            <div className="col-lg-12">
              <div className="form-group row">
                <label htmlFor="example-text-input" className="col-md-3">
                  Trường tìm kiếm
                </label>
                <div className="col-md-9">
                  <select
                    className="form-control"
                    name="FieldFilter"
                    onChange={(event) => this.changeFormSPLink(event)}
                    value={ObjSPLink.TextSearchField}
                  >
                    <option value=""></option>
                    {ObjSPLink.ArrayFieldSP.length > 0
                      ? ObjSPLink.ArrayFieldSP.filter(
                          (fls) =>
                            fls.FieldType != objField.TextArea &&
                            fls.FieldType != objField.SPLinkWF &&
                            fls.FieldType != objField.PictureLink &&
                            fls.FieldType != objField.Label &&
                            fls.FieldType != objField.Hyperlink
                        ).map((fiels, ind) => (
                          <option value={fiels.InternalName} key={ind}>
                            {fiels.FieldName}
                          </option>
                        ))
                      : ""}
                  </select>

                  {ObjSPLink.ArrayFieldFilter.length > 0 ? (
                    <div className="tagName">
                      {ObjSPLink.ArrayFieldFilter.map((fieldF, inField) => (
                        <div key={inField} className="wrapName">
                          <a
                            type="button"
                            onClick={() =>
                              this.removeFormSPLink("FieldFilter", inField)
                            }
                          >
                            <i className="fa fa-close text-danger"></i>
                          </a>{" "}
                          {fieldF.FieldName}
                        </div>
                      ))}
                    </div>
                  ) : (
                    ""
                  )}
                </div>
              </div>
            </div>
          ) : (
            ""
          )}

          {isNotNull(ObjSPLink.wfTableId) &&
          ObjSPLink.ArrayFieldFilter.length > 1 ? (
            <div className="col-lg-12">
              <div className="form-group row">
                <label htmlFor="example-text-input" className="col-md-3">
                  Kiểu kết hợp tìm kiếm <span className="text-danger">*</span>
                </label>
                <div className="col-md-9">
                  <select
                    className="form-control"
                    name="TypeFilter"
                    onChange={(event) => this.changeFormSPLink(event)}
                    value={ObjSPLink.TypeFilter}
                  >
                    <option value="and">Kết hợp và</option>
                    <option value="or">Kết hợp hoặc</option>
                  </select>
                </div>
              </div>
            </div>
          ) : (
            ""
          )}

          {isNotNull(ObjSPLink.wfTableId) &&
          ObjSPLink.typeSPLink == "ViewDetail" ? (
            <div className="col-lg-12">
              <div className="form-group row">
                <label htmlFor="example-text-input" className="col-md-3">
                  Trường hiển thị <span className="text-danger">*</span>
                </label>
                <div className="col-md-9">
                  <select
                    className="form-control"
                    name="FieldView"
                    onChange={(event) => this.changeFormSPLink(event)}
                    value={ObjSPLink.TextSearchField}
                  >
                    <option value=""></option>
                    {ObjSPLink.ArrayFieldSP.length > 0
                      ? ObjSPLink.ArrayFieldSP.map((fiels, ind) => (
                          <option value={fiels.InternalName} key={ind}>
                            {fiels.FieldName}
                          </option>
                        ))
                      : ""}
                  </select>

                  {ObjSPLink.ArrayFieldView.length > 0 ? (
                    <div className="tagName">
                      {ObjSPLink.ArrayFieldView.map((fieldV, inField) => (
                        <div key={inField} className="wrapName">
                          <a
                            type="button"
                            onClick={() =>
                              this.removeFormSPLink("FieldView", inField)
                            }
                          >
                            <i className="fa fa-close text-danger"></i>
                          </a>{" "}
                          {fieldV.FieldName}
                        </div>
                      ))}
                    </div>
                  ) : (
                    ""
                  )}
                </div>
              </div>
            </div>
          ) : (
            ""
          )}
        </div>
      </div>
    );
  }
}
