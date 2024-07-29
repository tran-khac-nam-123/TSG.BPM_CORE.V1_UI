import React, { Component, Fragment } from "react";
import { config } from "../../../pages/environment";

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
  checkFormLinkTags,
} from "../../wfShareCmpts/wfShareFunction.js";
import {
  objField,
  arrayObjField,
  typeCompare,
  arrayTypeCompare,
  typeCalculation,
  arrayTypeCalculation,
} from "../../wfShareCmpts/wfShareModel";
import shareService from "../../wfShareCmpts/wfShareService";
import { Table, CardTitle } from "reactstrap";

export default class ConfigLinkTags extends Component {
  constructor(props) {
    super(props);
    this.state = {
      ChoiceField: this.props.ChoiceField,
      listWorkflow: this.props.listWorkflow,
    };
    this.callSearchPeopleLinkTags = this.callSearchPeopleLinkTags.bind(this);
    this.typingTimeout = null;
    this.fieldSearch = { IndexCon: "", IndexLink: "" };
  }

  componentWillReceiveProps(nextProps) {
    // console.log(nextProps);
    this.setState({
      ChoiceField: nextProps.ChoiceField,
      listWorkflow: nextProps.listWorkflow,
    });
  }

  async componentDidMount() {
    let choiceField = returnArray(this.state.ChoiceField);
    if (choiceField.length > 0) {
      for (let c = 0; c < choiceField.length; c++) {
        let objLinkTags = returnObject(choiceField[c]);
        if (isNotNull(objLinkTags.wfTableId)) {
          let allFieldLoad = await shareService.GetWFFormField(
            objLinkTags.wfTableId
          );
          let arrFieldSP = returnArray(objLinkTags.ArrayFieldSP);
          allFieldLoad.map((fiels) => {
            if (
              fiels.FieldType != objField.LinkTags &&
              fiels.FieldType != objField.SPLinkWF &&
              fiels.FieldType != objField.ProcessControllers &&
              fiels.FieldType != objField.TextArea &&
              arrFieldSP.findIndex(
                (fils) => fils.InternalName == fiels.InternalName
              ) == -1
            ) {
              arrFieldSP.push(fiels);
            }
          });
          objLinkTags.ArrayFieldSP = arrFieldSP;
          choiceField[c] = objLinkTags;
        }
      }
      this.setState({ ChoiceField: choiceField });
    }
  }

  async changeFormLinkTags(event, indexLink) {
    let valueState = event.target.value;
    let nameState = event.target.name;

    let choiceField = returnArray(this.state.ChoiceField);
    let objLinkTags = returnObject(choiceField[indexLink]);

    if (nameState == "LinkTagsWF") {
      let wfSPLink = this.state.listWorkflow.find(
        (wf) => wf.WFId == valueState
      );
      objLinkTags.ArrayFieldSP = [];
      objLinkTags.ArrayFieldCondition = [];
      objLinkTags.ArrayFieldFilter = [];
      objLinkTags.ArrayFieldView = [];

      if (isNotNull(valueState) && isNotNull(wfSPLink)) {
        objLinkTags.wfTableId = wfSPLink.WFId;
        objLinkTags.wfTableCode = wfSPLink.WFCode;
        objLinkTags.wfTableTitle = wfSPLink.WFTitle;

        let arrField = await shareService.GetWFFormField(wfSPLink.WFId);
        objLinkTags.ArrayFieldSP = arrField.filter(
          (f) =>
            f.FieldType != objField.LinkTags &&
            f.FieldType != objField.SPLinkWF &&
            f.FieldType != objField.ProcessControllers &&
            f.FieldType != objField.TextArea
        );
        objLinkTags.ArrayFieldSP.push({
          ID: 0,
          FieldName: "Trạng thái",
          FieldType: objField.Number,
          InternalName: "StatusStep",
          HelpText: "",
          Required: 0,
          ObjValidation: {},
          ObjSPField: "",
        });
        objLinkTags.ArrayFieldSP.push({
          ID: 0,
          FieldName: "Người yêu cầu",
          FieldType: objField.User,
          InternalName: "UserRequest",
          HelpText: "",
          Required: 0,
          ObjValidation: {},
          ObjSPField: "",
        });
        objLinkTags.ArrayFieldSP.push({
          ID: 0,
          FieldName: "Ngày tạo",
          FieldType: objField.DateTime,
          InternalName: "Created",
          HelpText: "",
          Required: 0,
          ObjValidation: {},
          ObjSPField: "",
        });
      } else {
        objLinkTags.wfTableId = "";
        objLinkTags.wfTableCode = "";
        objLinkTags.wfTableTitle = "";
      }
    }

    if (nameState == "FieldFilter") {
      let fieldFilter = returnArray(objLinkTags.ArrayFieldFilter);
      let fieldCheck1 = objLinkTags.ArrayFieldSP.find(
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
      objLinkTags.ArrayFieldFilter = fieldFilter;
    }

    choiceField[indexLink] = objLinkTags;

    // await this.setState({ ChoiceField: choiceField });
    this.props.resultLinkTags(choiceField);
  }

  async changeFormConditionLinkTags(event, index, typeField, indexLink) {
    let choiceField = returnArray(this.state.ChoiceField);
    let objLinkTags = returnObject(choiceField[indexLink]);

    let valueState = event.target.value;
    let nameState = event.target.name;
    let FieldCondition = returnArray(objLinkTags.ArrayFieldCondition);
    let objFieldCondition = returnObject(FieldCondition[index]);
    if (nameState == "InternalName") {
      let fieldSP = objLinkTags.ArrayFieldSP.find(
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
    objLinkTags.ArrayFieldCondition = FieldCondition;

    choiceField[indexLink] = objLinkTags;

    // await this.setState({ ChoiceField: choiceField });
    this.props.resultLinkTags(choiceField);
  }

  async addFormLinkTags(indexLink) {
    let choiceField = returnArray(this.state.ChoiceField);
    let objLinkTags = returnObject(choiceField[indexLink]);

    let FieldCondition = returnArray(objLinkTags.ArrayFieldCondition);
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
    objLinkTags.ArrayFieldCondition = FieldCondition;

    choiceField[indexLink] = objLinkTags;

    // await this.setState({ ChoiceField: choiceField });
    this.props.resultLinkTags(choiceField);
  }

  async removeFormLinkTags(typeForm, index, indexLink) {
    let choiceField = returnArray(this.state.ChoiceField);
    let objLinkTags = returnObject(choiceField[indexLink]);

    if (typeForm == "FieldCondition") {
      let FieldCondition = returnArray(objLinkTags.ArrayFieldCondition);
      FieldCondition.splice(index, 1);
      objLinkTags.ArrayFieldCondition = FieldCondition;
    } else if (typeForm == "FieldFilter") {
      let FieldFilter = returnArray(objLinkTags.ArrayFieldFilter);
      FieldFilter.splice(index, 1);
      objLinkTags.ArrayFieldFilter = FieldFilter;
    } else if (typeForm == "FieldView") {
      let FieldView = returnArray(objLinkTags.ArrayFieldView);
      FieldView.splice(index, 1);
      objLinkTags.ArrayFieldView = FieldView;
    }
    choiceField[indexLink] = objLinkTags;

    // await this.setState({ ChoiceField: choiceField });
    this.props.resultLinkTags(choiceField);
  }

  async addLinkTags() {
    let choiceField = returnArray(this.state.ChoiceField);

    let textCheckForm = checkFormLinkTags(choiceField);
    if (isNotNull(textCheckForm)) {
      alert(textCheckForm);
      return;
    }
    choiceField.push({
      wfTableId: "",
      wfTableCode: "",
      wfTableTitle: "",
      typeSPLink: "",
      ArrayFieldSP: [],
      ArrayFieldCondition: [],
      ArrayFieldFilter: [],
      ArrayFieldView: [],
      TypeFilter: "and",
      TextSearchField: "",
    });

    // await this.setState({ ChoiceField: choiceField });
    this.props.resultLinkTags(choiceField);
  }

  async removeLinkTags(indexLink) {
    let choiceField = returnArray(this.state.ChoiceField);
    choiceField.splice(indexLink, 1);
    // await this.setState({ ChoiceField: choiceField });
    this.props.resultLinkTags(choiceField);
  }

  // nhập giá trị để tìm kiếm người
  changeSearchPeopleLinkTags(event, index, indexLink) {
    let choiceField = returnArray(this.state.ChoiceField);
    let objLinkTags = returnObject(choiceField[indexLink]);

    this.fieldSearch = { IndexCon: index, IndexLink: indexLink };
    let FieldCondition = returnArray(objLinkTags.ArrayFieldCondition);
    let objFieldCondition = returnObject(FieldCondition[index]);

    objFieldCondition.CompareValue.UserTitle = event.target.value;

    FieldCondition[index] = objFieldCondition;
    objLinkTags.ArrayFieldCondition = FieldCondition;

    choiceField[indexLink] = objLinkTags;
    // await this.setState({ ChoiceField: choiceField });
    this.props.resultLinkTags(choiceField);

    clearTimeout(this.typingTimeout);
    this.typingTimeout = setTimeout(this.callSearchPeopleLinkTags, 1000);
  }

  // set giá trị cho danh sách người tìm kiếm
  async callSearchPeopleLinkTags() {
    let choiceField = returnArray(this.state.ChoiceField);
    let objLinkTags = returnObject(choiceField[this.fieldSearch.IndexLink]);

    let FieldCondition = returnArray(objLinkTags.ArrayFieldCondition);
    let objFieldCondition = returnObject(
      FieldCondition[this.fieldSearch.IndexCon]
    );

    let PeoplePicker = await shareService.searchPeoplePicker(
      objFieldCondition.CompareValue.UserTitle
    );

    objFieldCondition.listSearchCompareValue = PeoplePicker;
    FieldCondition[this.fieldSearch.IndexCon] = objFieldCondition;
    objLinkTags.ArrayFieldCondition = FieldCondition;

    choiceField[this.fieldSearch.IndexLink] = objLinkTags;
    this.fieldSearch = { IndexCon: "", IndexLink: "" };

    // await this.setState({ ChoiceField: choiceField });
    this.props.resultLinkTags(choiceField);
  }

  // Chọn người từ trong danh sách tìm kiếm
  async selectSearchLinkTags(Key, typeUser, index, indexLink) {
    let choiceField = returnArray(this.state.ChoiceField);
    let objLinkTags = returnObject(choiceField[indexLink]);

    let FieldCondition = returnArray(objLinkTags.ArrayFieldCondition);
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
    objLinkTags.ArrayFieldCondition = FieldCondition;

    choiceField[indexLink] = objLinkTags;
    // await this.setState({ ChoiceField: choiceField });
    this.props.resultLinkTags(choiceField);
  }

  async removeSearchPeopleLinkTags(indexField, index, indexLink) {
    let choiceField = returnArray(this.state.ChoiceField);
    let objLinkTags = returnObject(choiceField[indexLink]);

    let FieldCondition = returnArray(objLinkTags.ArrayFieldCondition);
    let objFieldCondition = returnObject(FieldCondition[indexField]);

    let listUsers = returnArray(objFieldCondition.listCompareValue);
    listUsers.splice(index, 1);
    objFieldCondition.listCompareValue = listUsers;

    FieldCondition[indexField] = objFieldCondition;
    objLinkTags.ArrayFieldCondition = FieldCondition;

    choiceField[indexLink] = objLinkTags;
    // await this.setState({ ChoiceField: choiceField });
    this.props.resultLinkTags(choiceField);
  }

  render() {
    const { ChoiceField, listWorkflow } = this.state;
    return (
      <Fragment>
        <div className="col-lg-12">
          {ChoiceField.map((links, linkIndex) => (
            <div className="row border-row pt-3 mb-3" key={linkIndex}>
              <div className="col-lg-6">
                <CardTitle className="text-info mb-3">
                  Liên kết thứ {linkIndex + 1}
                </CardTitle>
              </div>
              <div className="col-lg-6">
                <div className="text-right mb-3">
                  <button
                    type="button"
                    className="btn"
                    onClick={() => this.removeLinkTags(linkIndex)}
                  >
                    <i className="fa fa-trash text-danger font-size-16"></i>
                  </button>
                </div>
              </div>

              <div className="col-lg-12">
                <div className="form-group row">
                  <label htmlFor="example-text-input" className="col-md-3">
                    Liên kết đến quy trình{" "}
                    <span className="text-danger">*</span>
                  </label>
                  <div className="col-md-9">
                    <select
                      className="form-control"
                      name="LinkTagsWF"
                      onChange={(event) =>
                        this.changeFormLinkTags(event, linkIndex)
                      }
                      value={links.wfTableId}
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

              {isNotNull(links.wfTableId) ? (
                <div className="col-lg-12">
                  <div className="form-group row mb-0">
                    <label htmlFor="example-text-input" className="col-md-3">
                      Điều kiện mặc định
                    </label>
                    <div className="col-md-9">
                      <Table>
                        <thead>
                          <tr>
                            <th>
                              Trường dữ liệu{" "}
                              <span className="text-danger">*</span>
                            </th>
                            <th>
                              Điều kiện <span className="text-danger">*</span>
                            </th>
                            <th>Giá trị điều kiện</th>
                            <th className="text-right">Hoạt động</th>
                          </tr>
                        </thead>
                        {links.ArrayFieldCondition.length > 0 ? (
                          <tbody>
                            {links.ArrayFieldCondition.map(
                              (fieldCon, indexF) => (
                                <tr key={indexF}>
                                  <td>
                                    <select
                                      className="form-control"
                                      name="InternalName"
                                      onChange={(event) =>
                                        this.changeFormConditionLinkTags(
                                          event,
                                          indexF,
                                          "",
                                          linkIndex
                                        )
                                      }
                                      value={fieldCon.InternalName}
                                    >
                                      <option value=""></option>
                                      {links.ArrayFieldSP.filter(
                                        (fls) =>
                                          fls.FieldType != objField.TextArea &&
                                          fls.FieldType != objField.SPLinkWF &&
                                          fls.FieldType !=
                                            objField.PictureLink &&
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
                                        this.changeFormConditionLinkTags(
                                          event,
                                          indexF,
                                          "",
                                          linkIndex
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
                                          this.changeFormConditionLinkTags(
                                            event,
                                            indexF,
                                            objField.Text,
                                            linkIndex
                                          )
                                        }
                                        value={fieldCon.CompareValue}
                                      >
                                        <option value=""></option>
                                        <option value="0">Đang xử lý</option>
                                        <option value="1">Hoàn thành</option>
                                        <option value="2">Từ chối</option>
                                        <option value="3">Đã lưu</option>
                                        <option value="4">
                                          Yêu cầu chỉnh sửa
                                        </option>
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
                                          this.changeFormConditionLinkTags(
                                            event,
                                            indexF,
                                            objField.Number,
                                            linkIndex
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
                                          this.changeFormConditionLinkTags(
                                            event,
                                            indexF,
                                            objField.DateTime,
                                            linkIndex
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
                                            this.changeSearchPeopleLinkTags(
                                              event,
                                              indexF,
                                              linkIndex
                                            )
                                          }
                                          value={
                                            fieldCon.CompareValue.UserTitle
                                          }
                                        />
                                        {fieldCon.listSearchCompareValue
                                          .length > 0 ? (
                                          <div className="suggesAuto">
                                            {fieldCon.listSearchCompareValue.map(
                                              (people) => (
                                                <div
                                                  key={people.Key}
                                                  className="suggtAutoItem"
                                                  onClick={() =>
                                                    this.selectSearchLinkTags(
                                                      people.Key,
                                                      objField.User,
                                                      indexF,
                                                      linkIndex
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
                                            this.changeSearchPeopleLinkTags(
                                              event,
                                              indexF,
                                              linkIndex
                                            )
                                          }
                                          value={
                                            fieldCon.CompareValue.UserTitle
                                          }
                                        />
                                        {fieldCon.listSearchCompareValue
                                          .length > 0 ? (
                                          <div className="suggesAuto">
                                            {fieldCon.listSearchCompareValue.map(
                                              (people) => (
                                                <div
                                                  key={people.Key}
                                                  className="suggtAutoItem"
                                                  onClick={() =>
                                                    this.selectSearchLinkTags(
                                                      people.Key,
                                                      objField.UserMulti,
                                                      indexF,
                                                      linkIndex
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
                                        {fieldCon.listCompareValue.length >
                                        0 ? (
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
                                                      this.removeSearchPeopleLinkTags(
                                                        indexF,
                                                        inUser,
                                                        linkIndex
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
                                          this.changeFormConditionLinkTags(
                                            event,
                                            indexF,
                                            objField.YesNo,
                                            linkIndex
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
                                          this.changeFormConditionLinkTags(
                                            event,
                                            indexF,
                                            objField.Text,
                                            linkIndex
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
                                          this.changeFormConditionLinkTags(
                                            event,
                                            indexF,
                                            objField.Text,
                                            linkIndex
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
                                          this.removeFormLinkTags(
                                            `FieldCondition`,
                                            indexF,
                                            linkIndex
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
                  <div className="text-right mb-3">
                    <button
                      type="button"
                      className="btn btn-md btn-info waves-effect waves-light"
                      onClick={() => this.addFormLinkTags(linkIndex)}
                    >
                      <i className="fa fa-plus-circle mr-2 align-middle"></i>{" "}
                      Thêm điều kiện
                    </button>
                  </div>
                </div>
              ) : (
                ""
              )}

              {isNotNull(links.wfTableId) ? (
                <div className="col-lg-12">
                  <div className="form-group row">
                    <label htmlFor="example-text-input" className="col-md-3">
                      Trường tìm kiếm
                    </label>
                    <div className="col-md-9">
                      <select
                        className="form-control"
                        name="FieldFilter"
                        onChange={(event) =>
                          this.changeFormLinkTags(event, linkIndex)
                        }
                        value={links.TextSearchField}
                      >
                        <option value=""></option>
                        {links.ArrayFieldSP.length > 0
                          ? links.ArrayFieldSP.filter(
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

                      {links.ArrayFieldFilter.length > 0 ? (
                        <div className="tagName">
                          {links.ArrayFieldFilter.map((fieldF, inField) => (
                            <div key={inField} className="wrapName">
                              <a
                                type="button"
                                onClick={() =>
                                  this.removeFormLinkTags(
                                    "FieldFilter",
                                    inField,
                                    linkIndex
                                  )
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
            </div>
          ))}
          <div className="text-right mb-3">
            <button
              type="button"
              className="btn btn-md btn-primary waves-effect waves-light"
              onClick={() => this.addLinkTags()}
            >
              <i className="fa fa-plus-circle mr-2 align-middle"></i> Thêm liên
              kết
            </button>
          </div>
        </div>
      </Fragment>
    );
  }
}
