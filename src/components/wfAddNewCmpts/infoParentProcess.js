import React, { Component, Fragment } from "react";
import { config } from "./../../pages/environment.js";
import {
  objField,
  objDataTransfer,
  arrayTypeCompare,
} from "./../wfShareCmpts/wfShareModel";
import {
  isNotNull,
  CheckNull,
  CheckNullSetZero,
  ISODateString,
  returnObject,
  returnArray,
  checkFormLoadingController,
} from "./../wfShareCmpts/wfShareFunction.js";
import { sp } from "@pnp/sp";
import "@pnp/sp/webs";
import "@pnp/sp/lists/web";
import "@pnp/sp/items";
import "@pnp/sp/profiles";
import "@pnp/sp/site-users/web";
import "@pnp/sp/attachments";
import "@pnp/sp/site-groups";
import * as moment from "moment";
import shareService from "../wfShareCmpts/wfShareService.js";
import {
  Row,
  Col,
  Card,
  CardHeader,
  CardBody,
  Table,
  Collapse,
  CardTitle,
} from "reactstrap";

export default class InfoParentProcess extends Component {
  constructor(props) {
    super(props);
    // console.log(this.props);
    sp.setup({ pageContext: { web: { absoluteUrl: config.url.API_URL } } });

    this.state = {
      ArrayAllParentProcess: this.props.ArrayAllParentProcess,
      ObjParentProcess: this.props.ObjParentProcess,
      ParentProcessItem: "",
      arrFieldParent: [],
      ParentProcessDateStart: new Date(
        moment(new Date())
          .subtract(30, "day")
          .hours(0)
          .minutes(0)
          .seconds(0)
          .toDate()
      ),
      ParentProcessDateEnd: new Date(
        moment(new Date()).hours(23).minutes(59).seconds(59).toDate()
      ),
      isShow: true,
      listFormField: this.props.listFormField,
    };
    this.callSearchPeopleSPLink = this.callSearchPeopleSPLink.bind(this);
    this.typingTimeout = null;
    this.fieldSearch = "";
  }

  async componentDidMount() {
    if (isNotNull(this.state.ObjParentProcess.ParentProcess)) {
      let wfTableParent = this.state.ObjParentProcess.ArrayParentProcess[
        this.state.ObjParentProcess.ParentProcess
      ];
      let arrFieldParent = [];
      if (
        isNotNull(wfTableParent.wfTable) &&
        isNotNull(wfTableParent.wfTable.WFId)
      ) {
        arrFieldParent = await shareService.GetWFFormField(
          wfTableParent.wfTable.WFId
        );
        arrFieldParent.push({
          ID: 0,
          FieldName: "ID",
          FieldType: objField.Number,
          InternalName: "ID",
          HelpText: "",
          Required: 0,
          ObjValidation: {},
          ObjSPField: "",
        });
        arrFieldParent.push({
          ID: 0,
          FieldName: "Trạng thái",
          FieldType: objField.Number,
          InternalName: "StatusStep",
          HelpText: "",
          Required: 0,
          ObjValidation: {},
          ObjSPField: "",
        });
        arrFieldParent.push({
          ID: 0,
          FieldName: "Người yêu cầu",
          FieldType: objField.User,
          InternalName: "UserRequest",
          HelpText: "",
          Required: 0,
          ObjValidation: {},
          ObjSPField: "",
        });
        arrFieldParent.push({
          ID: 0,
          FieldName: "Người phê duyệt",
          FieldType: objField.User,
          InternalName: "UserApproval",
          HelpText: "",
          Required: 0,
          ObjValidation: {},
          ObjSPField: "",
        });
        arrFieldParent.push({
          ID: 0,
          FieldName: "Đã tạo",
          FieldType: objField.DateTime,
          InternalName: "Created",
          HelpText: "",
          Required: 0,
          ObjValidation: {},
          ObjSPField: "",
        });
      }

      await this.setState({
        arrFieldParent: arrFieldParent,
      });
    }
  }

  componentWillReceiveProps(nextProps) {
    // console.log(nextProps);
    this.setState({
      ObjParentProcess: nextProps.ObjParentProcess,
      listFormField: nextProps.listFormField,
    });
  }

  async changFormProcess(event) {
    let nameState = event.target.name;
    let valueState = event.target.value;
    let arrAllProcess = returnArray(this.state.ArrayAllParentProcess);
    let objParentProcess = returnObject(this.state.ObjParentProcess);
    if (nameState == "TypeParentProcess") {
      let arrProcess = [];
      if (valueState == "SyncProcess") {
        arrProcess = arrAllProcess.filter((subP1) => subP1.isWaitting == true);
      }
      if (valueState == "AsyncProcess") {
        arrProcess = arrAllProcess.filter((subP1) => subP1.isWaitting == false);
      }
      objParentProcess.TypeParentProcess = valueState;
      objParentProcess.ArrayParentProcess = arrProcess;
      objParentProcess.ParentProcess = "";
      objParentProcess.ItemParentProcess = "";
      await this.props.resultParentProcess(objParentProcess);
    } else if (nameState == "ParentProcess") {
      objParentProcess.ParentProcess = valueState;
      objParentProcess.ItemParentProcess = "";
      let wfTableId = "";
      if (isNotNull(valueState)) {
        wfTableId =
          objParentProcess.ArrayParentProcess[valueState].wfTable.WFId;
      } else {
        objParentProcess.ArrayFieldCondition = [];
      }
      let arrFieldParent = [];
      if (isNotNull(wfTableId)) {
        arrFieldParent = await shareService.GetWFFormField(wfTableId);
        arrFieldParent.push({
          ID: 0,
          FieldName: "ID",
          FieldType: objField.Number,
          InternalName: "ID",
          HelpText: "",
          Required: 0,
          ObjValidation: {},
          ObjSPField: "",
        });
        arrFieldParent.push({
          ID: 0,
          FieldName: "Trạng thái",
          FieldType: objField.Number,
          InternalName: "StatusStep",
          HelpText: "",
          Required: 0,
          ObjValidation: {},
          ObjSPField: "",
        });
        arrFieldParent.push({
          ID: 0,
          FieldName: "Người yêu cầu",
          FieldType: objField.User,
          InternalName: "UserRequest",
          HelpText: "",
          Required: 0,
          ObjValidation: {},
          ObjSPField: "",
        });
        arrFieldParent.push({
          ID: 0,
          FieldName: "Người phê duyệt",
          FieldType: objField.User,
          InternalName: "UserApproval",
          HelpText: "",
          Required: 0,
          ObjValidation: {},
          ObjSPField: "",
        });
        arrFieldParent.push({
          ID: 0,
          FieldName: "Đã tạo",
          FieldType: objField.DateTime,
          InternalName: "Created",
          HelpText: "",
          Required: 0,
          ObjValidation: {},
          ObjSPField: "",
        });
      }

      await this.setState({
        ParentProcessItem: "",
        arrFieldParent: arrFieldParent,
      });
      await this.props.resultParentProcess(objParentProcess);
    } else {
      //  await this.setState({ [nameState]: valueState });
      objParentProcess[nameState] = valueState;
      await this.props.resultParentProcess(objParentProcess);
    }
  }

  async GetNextArrayItemParent(objParent, itemList, arrList) {
    let itemNext = await itemList.getNext();
    itemNext["results"].forEach((itemPNext) => {
      let historyItem = [];
      if (isNotNull(itemPNext["HistoryStep"])) {
        historyItem = JSON.parse(itemPNext["HistoryStep"]);
      }
      if (
        historyItem.findIndex((hst) => hst.indexStep == objParent.indexStep) !=
        -1
      ) {
        let userList = [];
        if (isNotNull(itemPNext["ListUserId"])) {
          userList = itemPNext["ListUserId"];
        }
        let objSubWF = [];
        if (isNotNull(itemPNext["ObjSubWF"])) {
          objSubWF = JSON.parse(itemPNext["ObjSubWF"]);
        }

        if (!objParent.isWaitting) {
          listItems.push({
            ID: itemPNext.ID,
            Title: CheckNull(itemPNext.Title),
            indexStep: CheckNullSetZero(itemPNext.indexStep),
            StatusStep: CheckNullSetZero(itemPNext.StatusStep),
            ListUser: userList,
            ObjSubWF: objSubWF,
            HistoryStep: historyItem,
          });
        } else if (
          objParent.isWaitting &&
          objParent.indexStep == CheckNullSetZero(itemPNext.indexStep) &&
          CheckNullSetZero(itemPNext.StatusStep) != 1 &&
          CheckNullSetZero(itemPNext.StatusStep) != 2
        ) {
          arrList.push({
            ID: itemPNext.ID,
            Title: CheckNull(itemPNext.Title),
            indexStep: CheckNullSetZero(itemPNext.indexStep),
            StatusStep: CheckNullSetZero(itemPNext.StatusStep),
            ListUser: userList,
            ObjSubWF: objSubWF,
            HistoryStep: historyItem,
          });
        }
      }
    });

    if (itemNext.hasNext) {
      await this.GetNextArrayItemParent(objParent, itemNext, arrList);
    }

    return arrList;
  }

  async addFormSPLink() {
    let ObjParentProcess = returnObject(this.state.ObjParentProcess);
    let FieldCondition = returnArray(ObjParentProcess.ArrayFieldCondition);
    let checkTextRequired = checkFormLoadingController(FieldCondition);
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
      TypeCompare: "",
    });
    ObjParentProcess.ArrayFieldCondition = FieldCondition;
    await this.setState({ ObjParentProcess: ObjParentProcess });
  }

  async changeFormConditionSPLink(event, index, typeField) {
    let valueState = event.target.value;
    let nameState = event.target.name;
    let ObjParentProcess = returnObject(this.state.ObjParentProcess);
    let FieldCondition = returnArray(ObjParentProcess.ArrayFieldCondition);
    let objFieldCondition = returnObject(FieldCondition[index]);
    if (nameState == "InternalName") {
      let fieldSP = this.state.arrFieldParent.find(
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
      objFieldCondition.TypeCompare = "";
    }
    if (nameState == "CompareValue") {
      if (typeField == objField.YesNo) {
        objFieldCondition[nameState] = event.target.checked;
      } else {
        objFieldCondition[nameState] = valueState;
      }
    }
    if (nameState == "ConditionType" || nameState == "TypeCompare") {
      objFieldCondition[nameState] = valueState;
    }

    FieldCondition[index] = objFieldCondition;
    ObjParentProcess.ArrayFieldCondition = FieldCondition;
    await this.setState({ ObjParentProcess: ObjParentProcess });
    await this.props.resultParentProcess(ObjParentProcess);
  }

  async removeFormSPLink(typeForm, index) {
    let ObjParentProcess = returnObject(this.state.ObjParentProcess);
    if (typeForm == "FieldCondition") {
      let FieldCondition = returnArray(ObjParentProcess.ArrayFieldCondition);
      FieldCondition.splice(index, 1);
      ObjParentProcess.ArrayFieldCondition = FieldCondition;
    }
    await this.setState({ ObjParentProcess: ObjParentProcess });
    await this.props.resultParentProcess(ObjParentProcess);
  }
  // nhập giá trị để tìm kiếm người
  changeSearchPeopleSPLink(event, index) {
    this.fieldSearch = index;
    let ObjParentProcess = returnObject(this.state.ObjParentProcess);
    let FieldCondition = returnArray(ObjParentProcess.ArrayFieldCondition);
    let objFieldCondition = returnObject(FieldCondition[index]);

    objFieldCondition.CompareValue.UserTitle = event.target.value;

    FieldCondition[index] = objFieldCondition;
    ObjParentProcess.ArrayFieldCondition = FieldCondition;
    this.setState({ ObjParentProcess: ObjParentProcess });

    clearTimeout(this.typingTimeout);
    this.typingTimeout = setTimeout(this.callSearchPeopleSPLink, 1000);
  }

  // set giá trị cho danh sách người tìm kiếm
  async callSearchPeopleSPLink() {
    let ObjParentProcess = returnObject(this.state.ObjParentProcess);
    let FieldCondition = returnArray(ObjParentProcess.ArrayFieldCondition);
    let objFieldCondition = returnObject(FieldCondition[this.fieldSearch]);

    let PeoplePicker = await shareService.searchPeoplePicker(
      objFieldCondition.CompareValue.UserTitle
    );

    objFieldCondition.listSearchCompareValue = PeoplePicker;
    FieldCondition[this.fieldSearch] = objFieldCondition;
    ObjParentProcess.ArrayFieldCondition = FieldCondition;
    this.fieldSearch = "";
    await this.setState({ ObjParentProcess: ObjParentProcess });
    this.props.resultParentProcess(ObjParentProcess);
  }

  // Chọn người từ trong danh sách tìm kiếm
  async selectSearchSPLink(Key, typeUser, index) {
    let ObjParentProcess = returnObject(this.state.ObjParentProcess);
    let FieldCondition = returnArray(ObjParentProcess.ArrayFieldCondition);
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
    ObjParentProcess.ArrayFieldCondition = FieldCondition;
    await this.setState({ ObjParentProcess: ObjParentProcess });
    this.props.resultParentProcess(ObjParentProcess);
  }

  async removeSearchPeopleSPLink(indexField, index) {
    let ObjParentProcess = returnObject(this.state.ObjParentProcess);
    let FieldCondition = returnArray(ObjParentProcess.ArrayFieldCondition);
    let objFieldCondition = returnObject(FieldCondition[indexField]);

    let listUsers = returnArray(objFieldCondition.listCompareValue);
    listUsers.splice(index, 1);
    objFieldCondition.listCompareValue = listUsers;

    FieldCondition[indexField] = objFieldCondition;
    ObjParentProcess.ArrayFieldCondition = FieldCondition;
    await this.setState({ ObjParentProcess: ObjParentProcess });
    this.props.resultParentProcess(ObjParentProcess);
  }

  render() {
    const {
      ObjParentProcess,
      arrFieldParent,
      isShow,
      listFormField,
    } = this.state;
    // console.log(InfoStepWorkflow);
    return (
      <Fragment>
        <Card outline color="info" className="border mb-0">
          <CardHeader className="bg-transparent">
            <CardTitle
              className="text-info mb-3"
              onClick={() => this.setState({ isShow: !isShow })}
            >
              Quy trình cha mặc định
              <span
                className={
                  "float-right " +
                  (this.state.isShow
                    ? "fa fa-chevron-up"
                    : "fa fa-chevron-down")
                }
              ></span>
            </CardTitle>
          </CardHeader>
          <Collapse isOpen={this.state.isShow}>
            <CardBody>
              <Row>
                <Col lg={12}>
                  <Row>
                    <div className="col-lg-6">
                      <div className="form-group row">
                        <label
                          htmlFor="example-text-input"
                          className="col-md-4 col-form-label"
                        >
                          Loại quy trình
                        </label>
                        <div className="col-md-8">
                          <select
                            className="form-control"
                            name="TypeParentProcess"
                            onChange={(event) => this.changFormProcess(event)}
                            value={ObjParentProcess.TypeParentProcess}
                          >
                            <option value="">--Lựa chọn--</option>
                            <option value="SyncProcess">
                              Quy trình nối tiếp
                            </option>
                            <option value="AsyncProcess">
                              Quy trình song song
                            </option>
                          </select>
                        </div>
                      </div>
                    </div>
                    <div className="col-lg-6">
                      <div className="form-group row">
                        <label
                          htmlFor="example-text-input"
                          className="col-md-4 col-form-label"
                        >
                          Quy trình cha
                        </label>
                        <div className="col-md-8">
                          <select
                            className="form-control"
                            name="ParentProcess"
                            onChange={(event) => this.changFormProcess(event)}
                            value={ObjParentProcess.ParentProcess}
                          >
                            <option value="">--Lựa chọn--</option>
                            {ObjParentProcess.ArrayParentProcess.map(
                              (parent, indexP) => (
                                <option
                                  key={indexP}
                                  value={indexP}
                                >{`${parent.wfTable.WFTitle} (${parent.StepTitle})`}</option>
                              )
                            )}
                          </select>
                        </div>
                      </div>
                    </div>
                  </Row>
                  {/* <Row>
                    <div className="col-lg-6">
                      <div className="form-group row">
                        <label
                          htmlFor="example-text-input"
                          className="col-md-4 col-form-label"
                        >
                          Đã tạo từ
                        </label>
                        <div className="col-md-8">
                          <input
                            className="form-control"
                            type="date"
                            name="ParentProcessDateStart"
                            onChange={(event) => this.changFormProcess(event)}
                            value={
                              isNotNull(ObjParentProcess.ParentProcessDateStart)
                                ? CheckNull(
                                    moment(
                                      ObjParentProcess.ParentProcessDateStart
                                    ).format("YYYY-MM-DD")
                                  )
                                : CheckNull(
                                    moment(
                                      this.state.ParentProcessDateStart
                                    ).format("YYYY-MM-DD")
                                  )
                            }
                            autoComplete="off"
                          />
                        </div>
                      </div>
                    </div>
                    <div className="col-lg-6">
                      <div className="form-group row">
                        <label
                          htmlFor="example-text-input"
                          className="col-md-4 col-form-label"
                        >
                          Đã tạo đến
                        </label>
                        <div className="col-md-8">
                          <input
                            className="form-control"
                            type="date"
                            name="ParentProcessDateEnd"
                            onChange={(event) => this.changFormProcess(event)}
                            value={
                              isNotNull(ObjParentProcess.ParentProcessDateEnd)
                                ? CheckNull(
                                    moment(
                                      ObjParentProcess.ParentProcessDateEnd
                                    ).format("YYYY-MM-DD")
                                  )
                                : CheckNull(
                                    moment(
                                      this.state.ParentProcessDateEnd
                                    ).format("YYYY-MM-DD")
                                  )
                            }
                            autoComplete="off"
                          />
                        </div>
                      </div>
                    </div>
                  </Row> */}
                  <Row>
                    {isNotNull(ObjParentProcess.ParentProcess) &&
                    isNotNull(
                      ObjParentProcess.ArrayParentProcess[
                        ObjParentProcess.ParentProcess
                      ].wfTable.WFId
                    ) ? (
                      <div className="col-lg-12">
                        <div className="form-group row">
                          <label
                            htmlFor="example-text-input"
                            className="col-md-2"
                          >
                            Điều kiện mặc định
                          </label>
                          <div className="col-md-10">
                            <Table>
                              <thead>
                                <tr>
                                  <th>Trường dữ liệu</th>
                                  <th>Điều kiện</th>
                                  <th>Loại so sánh</th>
                                  <th>Giá trị điều kiện</th>
                                </tr>
                              </thead>
                              {ObjParentProcess.ArrayFieldCondition.length >
                              0 ? (
                                <tbody>
                                  {ObjParentProcess.ArrayFieldCondition.map(
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
                                            {arrFieldParent
                                              .filter(
                                                (fls) =>
                                                  fls.FieldType !=
                                                    objField.TextArea &&
                                                  fls.FieldType !=
                                                    objField.SPLinkWF &&
                                                  fls.FieldType !=
                                                    objField.PictureLink &&
                                                  fls.FieldType !=
                                                    objField.Label &&
                                                  fls.FieldType !=
                                                    objField.Hyperlink
                                              )
                                              .map((fiels) => (
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
                                                <option
                                                  key={index}
                                                  value={cons.Code}
                                                >
                                                  {cons.Title}
                                                </option>
                                              )
                                            )}
                                          </select>
                                        </td>
                                        <td>
                                          <select
                                            className="form-control"
                                            name="TypeCompare"
                                            onChange={(event) =>
                                              this.changeFormConditionSPLink(
                                                event,
                                                indexF
                                              )
                                            }
                                            value={fieldCon.TypeCompare}
                                          >
                                            <option value=""></option>
                                            <option value="CompareValue">
                                              Gía trị nhập
                                            </option>
                                            <option value="CompareValueMain">
                                              Theo trường dữ liệu chính
                                            </option>
                                            {fieldCon.FieldSPLink.FieldType ==
                                            objField.User ? (
                                              <option value="UserLogin">
                                                Người đăng nhập
                                              </option>
                                            ) : (
                                              ""
                                            )}
                                          </select>
                                        </td>
                                        <td>
                                          {fieldCon.TypeCompare !=
                                          "CompareValueMain" ? (
                                            fieldCon.InternalName ==
                                            "StatusStep" ? (
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
                                                <option value="0">
                                                  Đang xử lý
                                                </option>
                                                <option value="1">
                                                  Hoàn thành
                                                </option>
                                                <option value="2">
                                                  Từ chối
                                                </option>
                                                <option value="3">
                                                  Đã lưu
                                                </option>
                                                <option value="4">
                                                  Yêu cầu chỉnh sửa
                                                </option>
                                              </select>
                                            ) : fieldCon.FieldSPLink
                                                .FieldType == objField.Number ||
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
                                            ) : fieldCon.FieldSPLink
                                                .FieldType ==
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
                                            ) : fieldCon.FieldSPLink
                                                .FieldType == objField.User ? (
                                              fieldCon.TypeCompare ==
                                              "UserLogin" ? (
                                                ""
                                              ) : (
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
                                                    value={
                                                      fieldCon.CompareValue
                                                        .UserTitle
                                                    }
                                                  />
                                                  {fieldCon
                                                    .listSearchCompareValue
                                                    .length > 0 ? (
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
                                                              people.EntityData
                                                                .Title
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
                                              )
                                            ) : fieldCon.FieldSPLink
                                                .FieldType ==
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
                                                  value={
                                                    fieldCon.CompareValue
                                                      .UserTitle
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
                                                            people.EntityData
                                                              .Title
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
                                                {fieldCon.listCompareValue
                                                  .length > 0 ? (
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
                                            ) : fieldCon.FieldSPLink
                                                .FieldType == objField.YesNo ? (
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
                                            ) : fieldCon.FieldSPLink
                                                .FieldType ==
                                                objField.Dropdown || objField.DropdownMulti ||
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
                                                    <option
                                                      value={dfField}
                                                      key={dfKey}
                                                    >
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
                                            )
                                          ) : (
                                            ""
                                          )}
                                          {fieldCon.TypeCompare ==
                                            "CompareValueMain" &&
                                          fieldCon.InternalName !=
                                            "StatusStep" ? (
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
                                              {listFormField
                                                .filter(
                                                  (x) =>
                                                    x.FieldType ==
                                                    fieldCon.FieldSPLink
                                                      .FieldType
                                                )
                                                .map((field, FKey) => (
                                                  <option
                                                    value={field.InternalName}
                                                    key={FKey}
                                                  >
                                                    {field.FieldName}
                                                  </option>
                                                ))}
                                              {fieldCon.FieldSPLink.FieldType ==
                                              objField.User ? (
                                                <option value="UserRequest">
                                                  Người yêu cầu
                                                </option>
                                              ) : (
                                                ""
                                              )}
                                              {fieldCon.FieldSPLink.FieldType ==
                                              objField.User ? (
                                                <option value="UserApproval">
                                                  Người phê duyệt
                                                </option>
                                              ) : (
                                                ""
                                              )}
                                              {fieldCon.FieldSPLink.FieldType ==
                                              objField.Number ? (
                                                <option value="ID">ID</option>
                                              ) : (
                                                ""
                                              )}
                                            </select>
                                          ) : (
                                            ""
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
                        <div className="text-right mb-3">
                          <button
                            type="button"
                            className="btn btn-md btn-primary waves-effect waves-light"
                            onClick={() => this.addFormSPLink()}
                          >
                            <i className="fa fa-plus-circle mr-2 align-middle"></i>{" "}
                            Thêm điều kiện
                          </button>
                        </div>
                      </div>
                    ) : (
                      ""
                    )}
                  </Row>
                </Col>
              </Row>
            </CardBody>
          </Collapse>
        </Card>
      </Fragment>
    );
  }
}
