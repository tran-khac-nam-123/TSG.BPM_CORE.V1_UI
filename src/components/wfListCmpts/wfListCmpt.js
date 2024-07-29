import React, { Component, Fragment } from "react";
import { config } from "./../../pages/environment.js";
import configData from "./../../../config/configDatabase.json";
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
import { objField } from "./../wfShareCmpts/wfShareModel";

import shareService from "./../wfShareCmpts/wfShareService";
import "../css/loading.scss";

export default class WorkflowList extends Component {
  constructor(props) {
    super(props);
    this.state = {
      listItem: [],
      TitleSearch: "",
      CodeSearch: "",
      StatusSearch: "",
      startDateSearch: "",
      endDateSearch: "",
      txtPermission: "",
      isShowLoadingPage: true,
      Confirm: false,
      ConfirmText: "",
      TypeConfirm: "",
      ConfirmParameter: "",
      isFormPermission: true,
    };
    sp.setup({ pageContext: { web: { absoluteUrl: config.url.API_URL } } });
    this.currentUser = undefined;
    this.changeFormInput = this.changeFormInput.bind(this);
    this.TemplateEmail = [];
    this.currentUser = undefined;
    this.strFilter = "";
    this.arrDepartment = undefined;
  }

  async componentDidMount() {
    this.checkInstallData();
  }

  async checkInstallData() {
    let checkInstall = await shareService.returnCheckInstallData();
    if (checkInstall) {
      window.location.href = config.pages.wfCreateDatabase;
    } else {
      this.setStateForm();
    }
  }

  async setStateForm() {
    this.currentUser = await shareService.getCurrentUser();

    let depts = await shareService.GetListDepartment();
    this.arrDepartment = depts;

    let permissUser = await shareService.checkPermissionUser(
      this.currentUser.Id,
      depts
    );
    console.log(permissUser);

    if (permissUser.Permission == "Admin") {
      this.strFilter = "";

      await this.Search();

      this.TemplateEmail = await this.GetTemplateEmail();
    } else if (permissUser.Permission == "Manager") {
      if (permissUser.Dept.length > 0) {
        this.strFilter = `WhoIsUsed eq 'Department'`;
        this.strFilter +=
          ` and ( WIUGroup eq '` + permissUser.Dept[0].Code + `'`;
        for (let index = 1; index < permissUser.Dept.length; index++) {
          this.strFilter +=
            ` or WIUGroup eq '` + permissUser.Dept[index].Code + `'`;
        }
        this.strFilter += ` ) `;
        await this.Search();

        this.TemplateEmail = await this.GetTemplateEmail();
      } else {
        this.setState({
          txtPermission: "Bạn không có quyền truy cập",
          isShowLoadingPage: false,
          isFormPermission: false,
        });
      }
    } else {
      this.setState({
        txtPermission: "Bạn không có quyền truy cập",
        isShowLoadingPage: false,
        isFormPermission: false,
      });
    }
  }

  async Search() {
    // console.log(this.state)
    this.setState({ isShowLoadingPage: true });
    let listSearch = await this.SearchList();
    // console.log(listSearch);
    this.setState({
      listItem: listSearch,
      isShowLoadingPage: false,
    });
  }

  async SearchList() {
    // console.log(this.state)
    let items = [];
    let queryFilter = "";

    if (this.strFilter != "") {
      queryFilter = this.strFilter;
    }

    if (isNotNull(this.state.TitleSearch)) {
      if (queryFilter != "") {
        queryFilter +=
          ` and substringof('` + this.state.TitleSearch + `', Title)`;
      } else {
        queryFilter += `substringof('` + this.state.TitleSearch + `', Title)`;
      }
    }

    if (isNotNull(this.state.CodeSearch)) {
      if (queryFilter != "") {
        queryFilter +=
          ` and substringof('` + this.state.CodeSearch + `', Code)`;
      } else {
        queryFilter += `substringof('` + this.state.CodeSearch + `', Code)`;
      }
    }
    if (isNotNull(this.state.StatusSearch)) {
      if (this.state.StatusSearch != 0) {
        if (queryFilter != "") {
          queryFilter += ` and Status eq '` + this.state.StatusSearch + `'`;
        } else {
          queryFilter += `Status eq '` + this.state.StatusSearch + `'`;
        }
      } else {
        if (queryFilter != "") {
          queryFilter +=
            ` and (Status eq '` +
            this.state.StatusSearch +
            `' or Status eq null)`;
        } else {
          queryFilter +=
            `(Status eq '` + this.state.StatusSearch + `' or Status eq null)`;
        }
      }
    }
    let start = moment(this.state.startDateSearch).startOf("day").toDate();
    let startDate = ISODateString(start);
    if (isNotNull(this.state.startDateSearch)) {
      if (queryFilter != "") {
        queryFilter += ` and Created ge '` + startDate + `' `;
      } else {
        queryFilter += `Created ge '` + startDate + `' `;
      }
    }
    let end = moment(this.state.endDateSearch).endOf("day").toDate();
    let endDate = ISODateString(end);
    if (isNotNull(this.state.endDateSearch)) {
      if (queryFilter != "") {
        queryFilter += ` and Created le '` + endDate + `' `;
      } else {
        queryFilter += `Created le '` + endDate + `' `;
      }
    }
    await sp.web.lists
      .getByTitle("WFTable")
      .items.select(
        "ID,Title,Code,Description,WhoIsUsed,Created,Status,indexStep,WIUGroup,WIU/Title,WIU/Id,WIU/Name,SLA,TemplateHtml"
      )
      .expand("WIU")
      .filter(queryFilter)
      .get()
      .then((itemList) => {
        // console.log(itemList);
        itemList.forEach((element) => {
          let userDefault = [];
          let WIUId = { results: userDefault };
          let WIUGroup = "";

          if (element.WhoIsUsed == "Department") {
            WIUGroup = element.WIUGroup;
          }
          if (element.WhoIsUsed == "Users") {
            element.WIU.map((x) => {
              userDefault.push({
                UserTitle: x.Title,
                UserEmail: x.Name.split("|")[2],
              });
            });
            WIUId = { results: userDefault };
          }

          items.push({
            ID: element.ID,
            Title: element.Title,
            Code: element.Code,
            Description: isNotNull(element.Description)
              ? element.Description
              : "",
            WhoIsUsed: element.WhoIsUsed,
            Created: element.Created,
            Status: element.Status,
            indexStep: element.indexStep,
            WIUId: WIUId,
            WIUGroup: WIUGroup,
            SLA: CheckNullSetZero(element.SLA),
            TemplateHtml: CheckNull(element.TemplateHtml),
          });
        });
        console.log(items);
      })
      .catch((error) => {
        console.log(error);
      });
    for (let i = 0; i < items.length; i++) {
      let NumberRequest = await this.CountRequest(items[i].Code);
      Object.assign(items[i], { NumberRequest: NumberRequest });
    }

    // console.log(items);
    return items;
  }

  async CountRequest(Code) {
    let count = 0;
    await sp.web.lists
      .getByTitle(Code)
      .items.select("ID")
      .getAll()
      .then((itemList) => {
        count = itemList.length;
      });
    return count;
  }

  async resetItem() {
    await this.setState({
      TitleSearch: "",
      CodeSearch: "",
      StatusSearch: "",
      startDateSearch: "",
      endDateSearch: "",
    });
    console.log(this.state);
    this.Search();
  }

  Active(id) {
    //if (confirm("Bạn có chắc chắn đưa quy trình vào hoạt động")) {
    this.setState({ Confirm: false, isShowLoadingPage: true });
    sp.web.lists
      .getByTitle("WFTable")
      .items.getById(id)
      .update({ Status: 1 })
      .then((items) => {
        // this.setState({ Confirm: false });
        // alert("Đưa quy trình vào hoạt động thành công");
        this.Search();
      })
      .catch((error) => {
        console.log(error);
        this.setState({ isShowLoadingPage: false });
      });
    // }
  }

  DeActive(id) {
    //  if (confirm("Bạn có chắc chắn muốn ngừng hoạt động quy trình này")) {
    this.setState({ Confirm: false, isShowLoadingPage: true });

    sp.web.lists
      .getByTitle("WFTable")
      .items.getById(id)
      .update({ Status: 2 })
      .then((items) => {
        //  alert("Ngừng hoạt động quy trình thành công");
        this.Search();
      })
      .catch((error) => {
        console.log(error);
        this.setState({ isShowLoadingPage: false });
      });
    // }
  }

  async Export(id) {
    this.setState({ isShowLoadingPage: true });
    let itemList = this.state.listItem.find((x) => x.ID == id);
    let slaWF = itemList.SLA;
    const WorkFlow = {
      Title: itemList.Title,
      Code: itemList.Code,
      Description: itemList.Description,
      WhoIsUsed: itemList.WhoIsUsed,
      Status: itemList.Status,
      indexStep: itemList.indexStep,
      WIUId: itemList.WIUId,
      WIUGroup: itemList.WIUGroup,
      SLA: CheckNullSetZero(slaWF),
    };
    if (CheckNullSetZero(itemList.TemplateHtml) != 0) {
      Object.assign(WorkFlow, {
        TemplateHtml: CheckNullSetZero(itemList.TemplateHtml),
      });
    } else {
      Object.assign(WorkFlow, { TemplateHtml: null });
    }
    const wfListField = await this.GetWFFormField(id);
    let wfListCompare = {
      Number: [],
      DateTime: [],
      DateAndNumber: [],
      AllType: [],
      TypeUsers: [],
    };
    for (let index = 0; index < wfListField.length; index++) {
      if (wfListField[index].FieldType == "DateTime") {
        wfListCompare.DateTime.push({
          InternalName: wfListField[index].InternalName,
          Title: wfListField[index].FieldName,
          FieldType: wfListField[index].FieldType,
        });
        wfListCompare.DateAndNumber.push({
          InternalName: wfListField[index].InternalName,
          Title: wfListField[index].FieldName,
          FieldType: wfListField[index].FieldType,
        });
        wfListCompare.AllType.push({
          InternalName: wfListField[index].InternalName,
          Title: wfListField[index].FieldName,
          FieldType: wfListField[index].FieldType,
        });
      } else if (wfListField[index].FieldType == "Number") {
        wfListCompare.Number.push({
          InternalName: wfListField[index].InternalName,
          Title: wfListField[index].FieldName,
          FieldType: wfListField[index].FieldType,
        });
        wfListCompare.DateAndNumber.push({
          InternalName: wfListField[index].InternalName,
          Title: wfListField[index].FieldName,
          FieldType: wfListField[index].FieldType,
        });
        wfListCompare.AllType.push({
          InternalName: wfListField[index].InternalName,
          Title: wfListField[index].FieldName,
          FieldType: wfListField[index].FieldType,
        });
      } else if (
        wfListField[index].FieldType == "Text" ||
        wfListField[index].FieldType == "TextArea" ||
        wfListField[index].FieldType == "Dropdown"
      ) {
        wfListCompare.AllType.push({
          InternalName: wfListField[index].InternalName,
          Title: wfListField[index].FieldName,
          FieldType: wfListField[index].FieldType,
        });
      } else if (
        wfListField[index].FieldType == "User" ||
        wfListField[index].FieldType == "UserMulti"
      ) {
        wfListCompare.TypeUsers.push({
          InternalName: wfListField[index].InternalName,
          Title: wfListField[index].FieldName,
          FieldType: wfListField[index].FieldType,
        });
      }
    }
    const Field = { listFieldCompare: wfListCompare, wfListField: wfListField };
    const Step = await this.GetWFStepTable(id);
    if (CheckNullSetZero(slaWF) == 0) {
      let stepWF = returnArray(Step.StepWF);
      slaWF = TotalSLA(stepWF, itemList.indexStep);
      Object.assign(WorkFlow, { SLA: slaWF });
    }
    const myJsonContent = { WorkFlow: WorkFlow, Field: Field, Step: Step };
    // console.log(myJsonContent);
    // console.log(this.TemplateEmail);
    // console.log(JSON.stringify(myJsonContent));
    // console.log(encodeURI(JSON.stringify(myJsonContent)));

    let exportdata = document.createElement("a");
    exportdata.href =
      "data:application/json;charset=utf-8," +
      encodeURI(JSON.stringify(myJsonContent));
    exportdata.download = "" + WorkFlow.Code + ".json"; // tên file
    document.body.appendChild(exportdata);
    exportdata.click();
    document.body.removeChild(exportdata);
    this.setState({ isShowLoadingPage: false });
  }

  changeFormInput(event) {
    this.setState({ [event.target.name]: event.target.value });
    console.log(this.state);
  }

  async GetWFFormField(id) {
    let arrStepField = [];
    await sp.web.lists
      .getByTitle("WFFormField")
      .items.select(
        "ID,Title,InternalName,FieldType,HelpText,Required,ObjValidation,ObjSPField,DefaultValue,OrderIndex"
      )
      .filter("WFTableId eq " + id)
      .orderBy("OrderIndex", true)
      .get()
      .then((listWFStep) => {
        listWFStep.forEach((itemDetail) => {
          let ObjValidation = "";
          if (isNotNull(itemDetail.ObjValidation)) {
            ObjValidation = JSON.parse(itemDetail.ObjValidation);
          }
          let ObjSPField = "";
          if (isNotNull(itemDetail.ObjSPField)) {
            ObjSPField = JSON.parse(itemDetail.ObjSPField);
            let objFields = returnObject(ObjSPField.ObjField);
            if (CheckNull(itemDetail.FieldType) == objField.SPLinkWF) {
              if (isNotNull(ObjSPField.TextField)) {
                if (objFields.ObjSPLink === undefined) {
                  let textField = ObjSPField.TextField.split("|");
                  Object.assign(objFields, {
                    ObjSPLink: {
                      wfTableId: textField[1],
                      wfTableCode: textField[0],
                      typeSPLink: "ViewHyperLink",
                      ArrayFieldSP: [],
                      ArrayFieldCondition: [],
                      ArrayFieldFilter: [],
                      ArrayFieldView: [],
                      TypeFilter: "and",
                      TextSearchField: "",
                    },
                  });
                } else {
                  if (objFields.ObjSPLink.ArrayFieldSP === undefined) {
                    let ObjSPLink = returnObject(objFields.ObjSPLink);
                    Object.assign(ObjSPLink, {
                      ArrayFieldSP: [],
                      ArrayFieldCondition: [],
                      ArrayFieldFilter: [],
                      ArrayFieldView: [],
                      TypeFilter: "and",
                      TextSearchField: "",
                    });
                    objFields.ObjSPLink = ObjSPLink;
                  }
                }
              } else {
                if (
                  objFields.ObjSPLink &&
                  objFields.ObjSPLink.ArrayFieldSP === undefined
                ) {
                  let ObjSPLink = returnObject(objFields.ObjSPLink);
                  Object.assign(ObjSPLink, {
                    ArrayFieldSP: [],
                    ArrayFieldCondition: [],
                    ArrayFieldFilter: [],
                    ArrayFieldView: [],
                    TypeFilter: "and",
                    TextSearchField: "",
                  });
                  objFields.ObjSPLink = ObjSPLink;
                }
              }

              ObjSPField.ObjField = objFields;
            }
          }
          let DefaultValue = "";
          if (isNotNull(itemDetail.DefaultValue)) {
            if (itemDetail.FieldType == "User") {
              DefaultValue = JSON.parse(itemDetail.DefaultValue);
            } else {
              DefaultValue = itemDetail.DefaultValue;
            }
          }
          arrStepField.push({
            // ID: CheckNull(itemDetail.ID),
            FieldName: CheckNull(itemDetail.Title),
            FieldType: CheckNull(itemDetail.FieldType),
            InternalName: CheckNull(itemDetail.InternalName),
            HelpText: CheckNull(itemDetail.HelpText),
            Required: CheckNullSetZero(itemDetail.Required),
            ObjValidation: ObjValidation,
            ObjSPField: ObjSPField,
            DefaultValue: DefaultValue,
            listSearch_DefaultValue: [],
          });
        });
      })
      .catch((error) => {
        console.log(error);
      });
    // console.log(arrStepField);
    return arrStepField;
  }

  async GetWFStepTable(id) {
    let arrStepWF = { StepWF: [], TempEmail: [] };
    await sp.web.lists
      .getByTitle("WFStepTable")
      .items.select(
        "ID,Title,Code,indexStep,TypeofApprover,DepartmentCode,ApproveCode,RoleCode,ClassifyStep,StepWFType,ObjStepWFId,StepNextDefault,ObjStepCondition,ObjEmailCfg,SLA,ObjFieldStep,btnAction,GroupApprover,IsEditApprover,ObjBackStep,UserApprover/Title,UserApprover/Id,UserApprover/Name,ApproverInField,ApproverInStep,ApproverInSelect,ApproveRunTime"
      )
      .expand("UserApprover")
      .filter("WFTableId eq " + id)
      .orderBy("indexStep", true)
      .get()
      .then((listWFStep) => {
        listWFStep.forEach((itemDetail) => {
          let ObjStepWFId = [];
          if (isNotNull(itemDetail.ObjStepWFId)) {
            ObjStepWFId = JSON.parse(itemDetail.ObjStepWFId);
            if (ObjStepWFId.length > 0) {
              for (let index = 0; index < ObjStepWFId.length; index++) {
                let subProcess = returnObject(ObjStepWFId[index]);
                if (subProcess.ObjInitialization === undefined) {
                  Object.assign(subProcess, {
                    ObjInitialization: {
                      AlowLaunch: false,
                      TypeUserApproval: "",
                      UserApprover: [],
                    },
                  });
                }
                if (subProcess.TypeOfInitialization === undefined) {
                  Object.assign(subProcess, {
                    TypeOfInitialization: "Save",
                  });
                }
                ObjStepWFId[index] = subProcess;
              }
            }
          }
          let StepNextDefault = "";
          if (isNotNull(itemDetail.StepNextDefault)) {
            StepNextDefault = JSON.parse(itemDetail.StepNextDefault);
          }
          let ObjStepCondition = "";
          if (isNotNull(itemDetail.ObjStepCondition)) {
            ObjStepCondition = JSON.parse(itemDetail.ObjStepCondition);
          }
          let ObjFieldStep = "";
          if (isNotNull(itemDetail.ObjFieldStep)) {
            ObjFieldStep = JSON.parse(itemDetail.ObjFieldStep);

            if (ObjFieldStep.isViewAttachments == undefined) {
              Object.assign(ObjFieldStep, { isViewAttachments: false });
            }
            if (
              ObjFieldStep.FieldInput.length > 0 &&
              ObjFieldStep.FieldInput[0].IsFirstColumn === undefined
            ) {
              let arrayFieldOld = returnArray(ObjFieldStep.FieldInput);
              let arrayFieldNew = [];
              arrayFieldOld.map((field, indexF) => {
                if (indexF % 2 == 0) {
                  arrayFieldNew.push({
                    InternalName: field,
                    Colspan: "6",
                    IsFirstColumn: true,
                  });
                } else {
                  arrayFieldNew.push({
                    InternalName: field,
                    Colspan: "6",
                    IsFirstColumn: false,
                  });
                }
              });
              ObjFieldStep.FieldInput = arrayFieldNew;
            }
            if (
              ObjFieldStep.FieldView.length > 0 &&
              ObjFieldStep.FieldView[0].IsFirstColumn === undefined
            ) {
              let arrayFieldViewOld = returnArray(ObjFieldStep.FieldView);
              let arrayFieldViewNew = [];
              arrayFieldViewOld.map((field, indexF) => {
                if (indexF % 2 == 0) {
                  arrayFieldViewNew.push({
                    InternalName: field,
                    Colspan: "6",
                    IsFirstColumn: true,
                  });
                } else {
                  arrayFieldViewNew.push({
                    InternalName: field,
                    Colspan: "6",
                    IsFirstColumn: false,
                  });
                }
              });
              ObjFieldStep.FieldView = arrayFieldViewNew;
            }
          }
          let ObjEmailCfg = "";
          if (isNotNull(itemDetail.ObjEmailCfg)) {
            ObjEmailCfg = JSON.parse(itemDetail.ObjEmailCfg);

            if (ObjEmailCfg.EmailSendApprover.IsActive) {
              let indexTempA = this.TemplateEmail.findIndex(
                (t) =>
                  t.IdTemp ==
                  ObjEmailCfg.EmailSendApprover.ObjEmailTemplate.TemplateId
              );
              let indexArrTempA = arrStepWF.TempEmail.findIndex(
                (t) =>
                  t.IdTemp ==
                  ObjEmailCfg.EmailSendApprover.ObjEmailTemplate.TemplateId
              );
              if (indexArrTempA == -1 && indexTempA != -1) {
                arrStepWF.TempEmail.push(this.TemplateEmail[indexTempA]);
              }
            }

            if (ObjEmailCfg.EmailSendUserRequest.IsActive) {
              let indexTempU = this.TemplateEmail.findIndex(
                (t) =>
                  t.IdTemp ==
                  ObjEmailCfg.EmailSendUserRequest.ObjEmailTemplate.TemplateId
              );
              let indexArrTempU = arrStepWF.TempEmail.findIndex(
                (t) =>
                  t.IdTemp ==
                  ObjEmailCfg.EmailSendUserRequest.ObjEmailTemplate.TemplateId
              );
              if (indexArrTempU == -1 && indexTempU != -1) {
                arrStepWF.TempEmail.push(this.TemplateEmail[indexTempU]);
              }
            }
            if (!isNotNull(ObjEmailCfg.EmailSendDeadline)) {
              Object.assign(ObjEmailCfg, {
                EmailSendDeadline: {
                  IsActive: false,
                  ObjEmailTemplate: { TemplateId: "", TemplateTitle: "" },
                  NumberHours: "",
                },
              });
            }
            if (
              isNotNull(ObjEmailCfg.EmailSendDeadline) &&
              ObjEmailCfg.EmailSendUserRequest.IsActive
            ) {
              let indexTempK = this.TemplateEmail.findIndex(
                (t) =>
                  t.IdTemp ==
                  ObjEmailCfg.EmailSendDeadline.ObjEmailTemplate.TemplateId
              );
              let indexArrTempK = arrStepWF.TempEmail.findIndex(
                (t) =>
                  t.IdTemp ==
                  ObjEmailCfg.EmailSendDeadline.ObjEmailTemplate.TemplateId
              );
              if (indexArrTempK == -1 && indexTempK != -1) {
                arrStepWF.TempEmail.push(this.TemplateEmail[indexTempK]);
              }
            }
            if (ObjEmailCfg.EmailSendInform.IsActive) {
              const objUserField = ObjEmailCfg.EmailSendInform.ObjUserField;
              const objUserDefault = ObjEmailCfg.EmailSendInform.ObjUserDefault;

              // if (objUserField != undefined) {
              //   let arrField = [];
              //   for (let f = 0; f < objUserField.length; f++) {
              //     if (isNotNull(objUserField[f])) {
              //       arrField.push(objUserField[f].InternalName);
              //     }
              //   }
              //   ObjEmailCfg.EmailSendInform.ObjUserField = arrField;
              // }
              // else {
              //   Object.assign(ObjEmailCfg.EmailSendInform, { ObjUserField: [] });
              // }
              if (objUserField == undefined) {
                Object.assign(ObjEmailCfg.EmailSendInform, {
                  ObjUserField: [],
                });
              }
              if (objUserDefault == undefined) {
                Object.assign(ObjEmailCfg.EmailSendInform, {
                  ObjUserDefault: [],
                });
              }
              if (
                ObjEmailCfg.EmailSendInform.search_InformToUserDefault ==
                undefined
              ) {
                Object.assign(ObjEmailCfg.EmailSendInform, {
                  search_InformToUserDefault: "",
                });
              }
              if (
                ObjEmailCfg.EmailSendInform.listSearch_InformToUserDefault ==
                undefined
              ) {
                Object.assign(ObjEmailCfg.EmailSendInform, {
                  listSearch_InformToUserDefault: [],
                });
              }

              let indexTempI = this.TemplateEmail.findIndex(
                (t) =>
                  t.IdTemp ==
                  ObjEmailCfg.EmailSendInform.ObjEmailTemplate.TemplateId
              );
              let indexArrTempI = arrStepWF.TempEmail.findIndex(
                (t) =>
                  t.IdTemp ==
                  ObjEmailCfg.EmailSendInform.ObjEmailTemplate.TemplateId
              );
              if (indexArrTempI == -1 && indexTempI != -1) {
                arrStepWF.TempEmail.push(this.TemplateEmail[indexTempI]);
              }
            } else {
              ObjEmailCfg.EmailSendInform = {
                IsActive: false,
                ObjEmailTemplate: { TemplateId: "", TemplateTitle: "" },
                ObjUserDefault: [],
                ObjUserField: [],
                search_InformToUserDefault: "",
                listSearch_InformToUserDefault: [],
              };
            }
          }
          let userApprover = {
            UserId: "",
            UserTitle: "",
          };
          let TypeofApprover = CheckNull(itemDetail.TypeofApprover),
            ApproveCode = "",
            RoleCode = "",
            DepartmentCode = "";
          let GroupApprover = {
            TypeUserApproval: "",
            Group: { ID: "", Title: "" },
          };
          if (isNotNull(TypeofApprover)) {
            if (TypeofApprover == "Người phê duyệt") {
              if (isNotNull(itemDetail.UserApprover)) {
                userApprover = {
                  UserId: itemDetail.UserApprover["Id"],
                  UserTitle: itemDetail.UserApprover["Title"],
                  UserEmail: CheckNull(
                    itemDetail.UserApprover["Name"].split("|")[2]
                  ),
                };
                GroupApprover = {
                  TypeUserApproval: "Một người phê duyệt",
                  Group: { ID: "", Title: "" },
                };
              } else if (isNotNull(itemDetail.GroupApprover)) {
                GroupApprover = JSON.parse(itemDetail.GroupApprover);
              }
            } else {
              ApproveCode = CheckNull(itemDetail.ApproveCode);
              RoleCode = CheckNull(itemDetail.RoleCode);
              DepartmentCode = CheckNull(itemDetail.DepartmentCode);
            }
          } else {
            TypeofApprover = "Người phê duyệt";
            if (isNotNull(itemDetail.UserApprover)) {
              userApprover = {
                UserId: itemDetail.UserApprover["Id"],
                UserTitle: itemDetail.UserApprover["Title"],
                UserEmail: CheckNull(
                  itemDetail.UserApprover["Name"].split("|")[2]
                ),
              };
              GroupApprover = {
                TypeUserApproval: "Một người phê duyệt",
                Group: { ID: "", Title: "" },
              };
            }
          }
          let btnAction = "";
          if (isNotNull(itemDetail.btnAction)) {
            btnAction = JSON.parse(itemDetail.btnAction);
          }
          let ObjBackStep = "";
          if (isNotNull(itemDetail.ObjBackStep)) {
            ObjBackStep = JSON.parse(itemDetail.ObjBackStep);
          }

          let approveRuntime = {
            IsActive: false,
          };
          if (isNotNull(itemDetail.ApproveRunTime)) {
            approveRuntime = JSON.parse(itemDetail.ApproveRunTime);
          }
          let ApproverInSelect = ''
          if (isNotNull(itemDetail.ApproverInSelect)) {
            ApproverInSelect = JSON.parse(itemDetail.ApproverInSelect);
          }
          arrStepWF.StepWF.push({
            //    ID: CheckNull(itemDetail.ID),
            StepTitle: CheckNull(itemDetail.Title),
            StepCode: CheckNull(itemDetail.Code),
            indexStep: CheckNull(itemDetail.indexStep),
            ClassifyStep: CheckNull(itemDetail.ClassifyStep),
            StepWFType: CheckNull(itemDetail.StepWFType),
            SLA: CheckNullSetZero(itemDetail.SLA),
            btnAction: btnAction,
            ObjBackStep: ObjBackStep,
            GroupApprover: GroupApprover,
            IsEditApprover: itemDetail.IsEditApprover,
            ObjStepWFId: ObjStepWFId,
            StepNextDefault: StepNextDefault,
            ObjStepCondition: ObjStepCondition,
            ObjEmailCfg: ObjEmailCfg,
            ObjFieldStep: ObjFieldStep,
            TypeofApprover: TypeofApprover,
            DepartmentCode: DepartmentCode,
            ApproveCode: ApproveCode,
            RoleCode: RoleCode,
            UserApprover: userApprover,
            listSearch_UserApprover: [],
            listStepDefault: [],
            listStepCondition: [],
            ApproverInField: CheckNull(itemDetail.ApproverInField),
            ApproverInStep: CheckNull(itemDetail.ApproverInStep),
            ApproveRunTime: approveRuntime,
            ApproverInSelect:ApproverInSelect
          });
        });
        // console.log(arrStepWF);
      })
      .catch((error) => {
        console.log(error);
      });
    // console.log(details);
    return arrStepWF;
  }

  // lấy danh sách Template Email
  async GetTemplateEmail() {
    let arrTemplate = [];
    await sp.web.lists
      .getByTitle("WFTemplateEmail")
      .items.select(
        "ID,Title,SubjectEmail,BodyEmail,FieldReplateText,TypeTemplate"
      )
      .get()
      .then((listTemplate) => {
        listTemplate.forEach((itemDetail) => {
          arrTemplate.push({
            IdTemp: CheckNull(itemDetail.ID),
            ContentTemp: {
              Title: CheckNull(itemDetail.Title),
              SubjectEmail: CheckNull(itemDetail.SubjectEmail),
              BodyEmail: CheckNull(itemDetail.BodyEmail),
              FieldReplateText: CheckNull(itemDetail.FieldReplateText),
              TypeTemplate: CheckNull(itemDetail.TypeTemplate),
            },
          });
        });
      })
      .catch((error) => {
        console.log(error);
      });
    return arrTemplate;
  }

  Confirm(status, id) {
    if (status == "Active") {
      this.setState({
        Confirm: true,
        ConfirmText: "Bạn chắc chắn muốn đưa vào hoạt động quy trình này ?",
        TypeConfirm: status,
        ConfirmParameter: id,
      });
    } else {
      this.setState({
        Confirm: true,
        ConfirmText: "Bạn chắc chắn muốn ngưng hoạt động quy trình này ?",
        TypeConfirm: status,
        ConfirmParameter: id,
      });
    }
    // this.modalOpenClose(true);
  }

  render() {
    const { listItem, isShowLoadingPage } = this.state;
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
          <Container fluid={true}>
            <Row>
              <Col lg={12} sm={12}>
                <Card>
                  <CardHeader className="bg-info mb-3">
                    <h5 className="my-0 text-white">Danh sách quy trình</h5>
                  </CardHeader>
                  {!this.state.isFormPermission ? (
                    <CardBody>
                      <div className="row mt-3 mb-3">
                        <Col lg="12">
                          <CardTitle className="text-info mb-3">
                            {this.state.txtPermission}
                          </CardTitle>
                        </Col>
                      </div>
                    </CardBody>
                  ) : (
                    <CardBody>
                      <CardTitle>
                        <h5 className="text-info mb-3">
                          Lọc danh sách quy trình
                        </h5>
                      </CardTitle>
                      {/* ---Begin--- */}
                      <div className="row mb-3">
                        <div className="col-lg-6">
                          <div className="form-group row">
                            <label
                              htmlFor="example-text-input"
                              className="col-md-3 col-form-label"
                            >
                              Tên quy trình
                            </label>
                            <div className="col-md-9">
                              <input
                                className="form-control"
                                type="text"
                                name={Object.keys(this.state)[1]}
                                onChange={this.changeFormInput}
                                value={this.state.TitleSearch}
                              />
                            </div>
                          </div>
                        </div>
                        <div className="col-lg-6">
                          <div className="form-group row">
                            <label
                              htmlFor="example-text-input"
                              className="col-md-3 col-form-label"
                            >
                              Mã quy trình
                            </label>
                            <div className="col-md-9">
                              <input
                                className="form-control"
                                type="text"
                                name={Object.keys(this.state)[2]}
                                onChange={this.changeFormInput}
                                value={this.state.CodeSearch}
                              />
                            </div>
                          </div>
                        </div>
                        <div className="col-lg-6">
                          <div className="form-group row">
                            <label
                              htmlFor="example-text-input"
                              className="col-md-3 col-form-label"
                            >
                              Đã tạo từ
                            </label>
                            <div className="col-md-9">
                              <input
                                className="form-control"
                                type="date"
                                id="example-datetime-local-input"
                                name={Object.keys(this.state)[4]}
                                onChange={this.changeFormInput}
                                value={this.state.startDateSearch}
                              />
                            </div>
                          </div>
                        </div>
                        <div className="col-lg-6">
                          <div className="form-group row">
                            <label
                              htmlFor="example-text-input"
                              className="col-md-3 col-form-label"
                            >
                              Đã tạo đến
                            </label>
                            <div className="col-md-9">
                              <input
                                className="form-control"
                                type="date"
                                id="example-datetime-local-input"
                                name={Object.keys(this.state)[5]}
                                onChange={this.changeFormInput}
                                value={this.state.endDateSearch}
                              />
                            </div>
                          </div>
                        </div>
                        <div className="col-lg-6">
                          <div className="form-group row">
                            <label
                              htmlFor="example-text-input"
                              className="col-md-3 col-form-label"
                            >
                              Trạng thái
                            </label>
                            <div className="col-md-9">
                              <select
                                className="form-control"
                                name={Object.keys(this.state)[3]}
                                onChange={this.changeFormInput}
                                value={this.state.StatusSearch}
                              >
                                <option value=""></option>
                                <option value="0">Đang khởi tạo</option>
                                <option value="1">Đang hoạt động</option>
                                <option value="2">Ngừng hoạt động</option>
                              </select>
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
                              onClick={() => this.resetItem()}
                            >
                              <i className="fa fa-refresh align-middle mr-2"></i>{" "}
                              Làm mới
                            </button>
                          </div>
                        </div>
                      </div>
                      {/* listWF */}
                      <CardTitle>
                        <h5 className="text-info mb-3">
                          Danh sách quy trình đã tạo
                        </h5>
                      </CardTitle>
                      <div className="table-responsive">
                        <Table className="table table-striped mb-3">
                          <thead>
                            <tr>
                              <th>Tên quy trình</th>
                              <th>Mã quy trình</th>
                              <th>Ngày tạo</th>
                              <th>Trạng thái</th>
                              <th style={{ width: "30%" }}>Người sử dụng</th>
                              <th>Số lượng yêu cầu</th>
                              <th className="text-center">Hoạt động</th>
                            </tr>
                          </thead>
                          <tbody>
                            {listItem ? (
                              listItem.map((item) => (
                                <tr key={item.ID}>
                                  <th scope="row">
                                    <a
                                      href={`${config.pages.wfView}?ItemId=${item.ID}`}
                                    >
                                      {item.Title}
                                    </a>
                                  </th>
                                  <td>{item.Code}</td>
                                  <td>{formatDate(item.Created)}</td>
                                  <td>
                                    <span
                                      className={formatActiveLabel(item.Status)}
                                    >
                                      {formatActiveText(item.Status)}
                                    </span>
                                  </td>
                                  <td>
                                    {item.WhoIsUsed == "All Users"
                                      ? "Tất cả mọi người"
                                      : item.WhoIsUsed == "Department"
                                      ? FindTitleById(
                                          this.arrDepartment,
                                          "Code",
                                          item.WIUGroup,
                                          "Title"
                                        )
                                      : item.WhoIsUsed == "Users" &&
                                        item.WIUId.results.length > 0
                                      ? item.WIUId.results.map(
                                          (x) => x.UserTitle + ", "
                                        )
                                      : ""}
                                  </td>
                                  <td>{item.NumberRequest}</td>
                                  <td>
                                    <div className="button-items text-right">
                                      {config.productVersion == 1 ? (
                                        ""
                                      ) : (
                                        <a
                                          className="waves-effect btn btn-sm waves-light"
                                          color="primary"
                                          href={`${config.pages.wfAddNew}?ItemId=${item.ID}`}
                                          title="Chỉnh sửa"
                                        >
                                          <i className="fa fa-pencil mr-2 align-middle text-primary font-size-16"></i>
                                        </a>
                                      )}

                                      <a
                                        href={`${config.pages.wfView}?ItemId=${item.ID}`}
                                        color="primary"
                                        className="waves-effect btn btn-sm waves-light"
                                        title="Chi tiết"
                                      >
                                        <i className="fa fa-file-text-o mr-2 align-middle text-primary font-size-16"></i>
                                      </a>

                                      {config.productVersion == 1 ? (
                                        ""
                                      ) : item.Status == 1 ? (
                                        <a
                                          className="waves-effect btn btn-sm waves-light"
                                          onClick={() =>
                                            this.Confirm("DeActive", item.ID)
                                          }
                                          //   onClick={() => this.DeActive(item.ID)}
                                          title="Ngừng hoạt động"
                                          data-toggle="modal"
                                          data-target=".bs-example-modal-lg"
                                        >
                                          <i className="fa fa-stop-circle-o mr-2 align-middle text-danger font-size-16"></i>
                                        </a>
                                      ) : item.Status == 2 ? (
                                        <a
                                          className="waves-effect btn btn-sm waves-light"
                                          onClick={() =>
                                            this.Confirm("Active", item.ID)
                                          }
                                          // onClick={() => this.Active(item.ID)}
                                          data-toggle="modal"
                                          data-target=".bs-example-modal-lg"
                                          title="Đưa vào hoạt động"
                                        >
                                          <i className="fa fa-check-circle mr-2 align-middle text-success font-size-16"></i>
                                        </a>
                                      ) : (
                                        ""
                                      )}
                                      {config.devSetting ? (
                                        <a
                                          onClick={() => this.Export(item.ID)}
                                          className="waves-effect btn btn-sm waves-light"
                                          title="Export File Json"
                                        >
                                          <i className="fa fa-file-archive-o mr-2 align-middle text-primary font-size-16"></i>
                                        </a>
                                      ) : (
                                        ""
                                      )}
                                    </div>
                                  </td>
                                </tr>
                              ))
                            ) : (
                              <tr>
                                <td colSpan="5">Không có dữ liệu</td>
                              </tr>
                            )}
                          </tbody>
                        </Table>
                      </div>
                    </CardBody>
                  )}
                </Card>
              </Col>
            </Row>
          </Container>
        </div>
        <Modal size="lg" isOpen={this.state.Confirm} style={{ top: "35%" }}>
          <div className="modal-header" style={{ backgroundColor: "#ffc107" }}>
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
                  this.state.TypeConfirm == "Active"
                    ? this.Active(this.state.ConfirmParameter)
                    : this.DeActive(this.state.ConfirmParameter)
                }
              >
                Có
              </button>
            </div>
          </div>
        </Modal>
      </Fragment>
    );
  }
}
