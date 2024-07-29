import React, { Component, Fragment } from "react";
import { config } from "./../../pages/environment.js";
import {
  isNotNull,
  CheckNull,
  CheckNullSetZero,
  getQueryParams,
  FindTitleById,
  formatActiveText,
  formatActiveLabel,
  formatTypeObjField,
  returnArray,
  returnObject,
  TotalSLA,
} from "./../wfShareCmpts/wfShareFunction.js";
import { sp } from "@pnp/sp";
import "@pnp/sp/webs";
import "@pnp/sp/lists/web";
import "@pnp/sp/items";
import configData from "./../../../config/configDatabase.json";
import {
  objField,
  arrayTypeCompare,
  objWFStatus,
} from "../wfShareCmpts/wfShareModel";

import FlowDiagrams from "components/wfVisual/FlowDiagrams.js";

import shareService from "./../wfShareCmpts/wfShareService";
import {
  arrayDataTransfer,
  colspan,
} from "components/wfShareCmpts/wfShareModel";
import {
  Row,
  Col,
  Card,
  CardBody,
  CardTitle,
  Container,
  Modal,
  CardHeader,
  Spinner,
} from "reactstrap";
import { Table, Thead, Tbody, Tr, Th, Td } from "react-super-responsive-table";
import DetailFormField from "./DetailFormField";
import DetailFormStep from "./DetailFormStep";
import "../css/loading.scss";
import moment from "moment";
export default class WorkflowView extends Component {
  constructor(props) {
    super(props);
    this.state = {
      txtPermission: "",
      isFormPermission: false,
      detailItem: {
        ID: "",
        Code: "",
        Title: "",
        Description: "",
        WhoIsUsed: "",
        Department: "",
        UserDefault: "",
        Status: "",
        SLA: "",
        TemplateHtml: "",
        AutoSave: false,
      },
      listWFField: [],
      isFieldModal: false,
      detailField: "",
      listWFStep: [],
      isStepModal: false,
      detailStep: "",
      listApproveCode: [],
      listRoleCode: [],
      listFieldSub: [],
      isShowLoadingPage: true,
      isParentProcess: false,
      listTemplateHtml: [],
    };
    this.listDept = [];
    this.ItemId = undefined;
    this.listWorkflow = [];
    this.listStepWorkflow = [];
    sp.setup({ pageContext: { web: { absoluteUrl: config.url.API_URL } } });
    // console.log(sp);
    this.permissUser = {};
    this.modalOpenClose = this.modalOpenClose.bind(this);
  }

  componentDidMount() {
    let param = getQueryParams(window.location.search);
    // console.log(param);
    this.ItemId = param["ItemId"];
    // console.log(this.ItemId);

    this.checkInstallData();
  }

  async checkInstallData() {
    let checkInstall = await shareService.returnCheckInstallData();
    if (checkInstall) {
      window.location.href = config.pages.wfCreateDatabase;
    } else {
      this.currentUser = await shareService.getCurrentUser();

      let depts = await shareService.GetListDepartment();

      this.permissUser = await shareService.checkPermissionUser(
        this.currentUser.Id,
        depts
      );
      console.log(this.permissUser);

      if (this.permissUser.Permission == "Admin") {
        this.setStateForm(depts);
      } else if (this.permissUser.Permission == "Manager") {
        this.setStateForm(this.permissUser.Dept);
      } else {
        this.setState({
          isShowLoadingPage: false,
          isFormPermission: false,
          txtPermission: "Bạn không có quyền truy cập",
        });
      }
    }
  }

  async setStateForm(listDepts) {
    this.listDept = [];
    if (isNotNull(this.ItemId)) {
      this.listWorkflow = await this.GetWFTable();
      // console.log(this.listWorkflow);

      this.listStepWorkflow = await shareService.GetArrayWFStepTable();

      let itemDetail = this.listWorkflow.find((x) => x.ID == this.ItemId);
      // console.log(itemDetail);

      if (isNotNull(itemDetail)) {
        if (
          this.permissUser.Dept.findIndex(
            (dp) => dp.Code == itemDetail.Department
          ) == -1 &&
          this.permissUser.Permission == "Manager"
        ) {
          this.setState({
            isFormPermission: false,
            isShowLoadingPage: false,
            txtPermission: "Bạn không có quyền truy cập vào quy trình này",
          });
        } else {
          this.listDept = returnArray(listDepts);
          let wfListStep = await this.GetWFStepTable();
          console.log(wfListStep);

          const wfListField = await this.GetWFFormField();
          console.log(wfListField);

          const wfApprove = await this.GetApproveCode();
          // console.log(wfApprove);

          const wfRole = await this.GetRoleCode();
          // console.log(wfRole);
          let isParentProcess = false;
          let arrParentProcess = itemDetail.ObjParentProcess;
          if (
            isNotNull(arrParentProcess) &&
            arrParentProcess.ArrayParentProcess.length > 0 &&
            isNotNull(arrParentProcess.ParentProcess)
          ) {
            isParentProcess = true;
          }
          // console.log(arrParentProcess);
          // if (arrParentProcess.length > 0) {
          //   isParentProcess = true;
          // }

          const listHtml = await shareService.GetInfoTemplateHtml();

          this.setState({
            isFormPermission: true,
            detailItem: itemDetail,
            listWFStep: wfListStep,
            listWFField: wfListField,
            listApproveCode: wfApprove,
            listRoleCode: wfRole,
            isShowLoadingPage: false,
            isParentProcess: isParentProcess,
            listTemplateHtml: listHtml,
          });
        }
      } else {
        this.setState({
          isFormPermission: false,
          txtPermission: "Bạn không có quyền truy cập vào quy trình này",
          isShowLoadingPage: false,
        });
      }
    } else {
      // alert("Quy trình không tồn tại")
      this.setState({
        isFormPermission: false,
        txtPermission: "Quy trình không tồn tại",
        isShowLoadingPage: false,
      });
    }
  }

  // Load thông tin chi tiết của 1 Workflow
  async GetWFTableDetail() {
    let details = {
      ID: "",
      Code: "",
      Title: "",
      Description: "",
      WhoIsUsed: "",
      Department: "",
      UserDefault: "",
      Status: "",
      SLA: "",
    };
    await sp.web.lists
      .getByTitle("WFTable")
      .items.getById(this.ItemId)
      .select(
        "ID,Title,Code,Description,WhoIsUsed,WIUGroup,WIU/Id,WIU/Title,Status,SLA,TemplateHtml"
      )
      .expand("WIU")
      .get()
      .then((itemDetail) => {
        // console.log(itemDetail);
        if (isNotNull(itemDetail)) {
          let userDefault = "";
          if (isNotNull(itemDetail["WIU"])) {
            // userDefault = itemDetail["WIU"][0]["Title"];
            itemDetail["WIU"].forEach((element) => {
              userDefault += CheckNull(element["Title"]) + ", ";
            });
          }
          details = {
            ID: itemDetail["ID"],
            Code: CheckNull(itemDetail["Code"]),
            Title: CheckNull(itemDetail["Title"]),
            Description: CheckNull(itemDetail["Description"]),
            WhoIsUsed: CheckNull(itemDetail["WhoIsUsed"]),
            Department: CheckNull(itemDetail["WIUGroup"]),
            UserDefault: CheckNull(userDefault),
            Status: CheckNull(itemDetail["Status"]),
            SLA: CheckNullSetZero(itemDetail["SLA"]),
            TemplateHtml: CheckNull(itemDetail["TemplateHtml"]),
          };
        }
      })
      .catch((error) => {
        console.log(error);
      });
    // console.log(details);
    return details;
  }

  // Lấy danh sách các field
  async GetWFFormField() {
    let arrStepField = [];
    const strSelect =
      "ID,Title,InternalName,FieldType,HelpText,Required,ObjValidation,ObjSPField,DefaultValue,TypeDefaultValue,OrderIndex";
    await sp.web.lists
      .getByTitle("WFFormField")
      .items.select(strSelect)
      .filter("WFTableId eq " + this.ItemId)
      .orderBy("OrderIndex", true)
      .get()
      .then((listWFStep) => {
        listWFStep.forEach((itemDetail) => {
          let ObjValidation = "";
          if (isNotNull(itemDetail.ObjValidation)) {
            ObjValidation = JSON.parse(itemDetail.ObjValidation);
            if (
              ObjValidation.CalculateCondition.Expression === undefined ||
              ObjValidation.CalculateCondition.typeCalculation === undefined
            ) {
              if (isNotNull(ObjValidation.CalculateCondition.Calculation)) {
                Object.assign(ObjValidation.CalculateCondition, {
                  Expression: "",
                  typeCalculation: "CalforField",
                });
              } else {
                Object.assign(ObjValidation.CalculateCondition, {
                  Expression: "",
                  typeCalculation: "",
                });
              }
            }
          }
          let ObjSPField = {
            Type: "",
            ObjField: {},
            TextField: "",
          };
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
            if (CheckNull(itemDetail.FieldType) == objField.User) {
              DefaultValue = DefaultValue = CheckNull(
                JSON.parse(itemDetail.DefaultValue)
              );
            } else {
              DefaultValue = CheckNull(itemDetail.DefaultValue);
            }
          }
          arrStepField.push({
            ID: CheckNull(itemDetail.ID),
            Title: CheckNull(itemDetail.Title),
            InternalName: CheckNull(itemDetail.InternalName),
            FieldType: CheckNull(itemDetail.FieldType),
            HelpText: CheckNull(itemDetail.HelpText),
            Required: CheckNullSetZero(itemDetail.Required),
            ObjValidation: ObjValidation,
            ObjSPField: ObjSPField,
            DefaultValue: DefaultValue,
            TypeDefaultValue: CheckNull(itemDetail.TypeDefaultValue),
            listSearch_DefaultValue: [],
            OrderIndex: CheckNullSetZero(itemDetail.OrderIndex),
          });
        });
      })
      .catch((error) => {
        console.log(error);
      });
    // console.log(details);
    return arrStepField;
  }

  // Load danh sách các step của 1 Workflow
  async GetWFStepTable() {
    let arrStepWF = [];
    const strSelect = `ID,Title,Code,indexStep,ClassifyStep,StepWFType,TypeofApprover,ApproveCode,RoleCode,DepartmentCode,ObjStepWFId,StepNextDefault,ObjStepCondition,IsEditApprover,ObjEmailCfg,SLA,ObjFieldStep,GroupApprover,btnAction,ObjBackStep,UserApprover/Title,UserApprover/Id,ApproverInField,ApproverInStep,ApproverInSelect,ApproveRunTime`;
    await sp.web.lists
      .getByTitle("WFStepTable")
      .items.select(strSelect)
      .expand("UserApprover")
      .filter("WFTableId eq " + this.ItemId)
      .orderBy("indexStep", true)
      .get()
      .then((listWFStep) => {
        listWFStep.forEach((itemDetail) => {
          let ObjStepWFId = "";
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
            let objStepCon = returnObject(ObjStepCondition);
            if (!isNotNull(objStepCon.ArrayStepCondition)) {
              ObjStepCondition = {
                IsActive: objStepCon.IsActive,
                ArrayStepCondition: [
                  {
                    Priority: 1,
                    ConditionsCombined: "",
                    TypeCondition: objStepCon.TypeCondition,
                    ObjCondition: objStepCon.ObjCondition,
                    StepNextCondition: objStepCon.StepNextCondition,
                  },
                ],
              };
            }
          }
          let ObjFieldStep = {
            FieldInput: [],
            FieldView: [],
            isAttachments: false,
            isViewAttachments: false,
            isEditAttachments: false,
            isDeleteAttachments: false,
            isDocuSignDocuments: false,
          };
          if (isNotNull(itemDetail.ObjFieldStep)) {
            ObjFieldStep = JSON.parse(itemDetail.ObjFieldStep);
            // ObjFieldStep.FieldInput = ObjFieldStep.FieldInput;
            // ObjFieldStep.FieldView = ObjFieldStep.FieldView.toString();

            if (ObjFieldStep.isViewAttachments == undefined) {
              Object.assign(ObjFieldStep, { isViewAttachments: false });
            }
            if (ObjFieldStep.isDeleteAttachments == undefined) {
              Object.assign(ObjFieldStep, { isDeleteAttachments: false });
            }

            if (ObjFieldStep.isEditAttachments == undefined) {
              Object.assign(ObjFieldStep, { isEditAttachments: false });
            }

            if (ObjFieldStep.isDeleteAttachments == undefined) {
              Object.assign(ObjFieldStep, { isDeleteAttachments: false });
            }

            if (ObjFieldStep.isDocuSignDocuments == undefined) {
              Object.assign(ObjFieldStep, { isDocuSignDocuments: false });
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
            if (!isNotNull(ObjEmailCfg.EmailSendDeadline)) {
              Object.assign(ObjEmailCfg, {
                EmailSendDeadline: {
                  IsActive: false,
                  ObjEmailTemplate: { TemplateId: "", TemplateTitle: "" },
                  NumberHours: "",
                },
              });
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
          let ObjBackStep = [];
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
          arrStepWF.push({
            ID: CheckNull(itemDetail.ID),
            StepTitle: CheckNull(itemDetail.Title),
            StepCode: CheckNull(itemDetail.Code),
            indexStep: CheckNull(itemDetail.indexStep),
            ClassifyStep: CheckNull(itemDetail.ClassifyStep),
            StepWFType: CheckNull(itemDetail.StepWFType),
            SLA: CheckNullSetZero(itemDetail.SLA),
            btnAction: btnAction,
            ObjBackStep: ObjBackStep,
            ObjStepWFId: ObjStepWFId,
            StepNextDefault: StepNextDefault,
            ObjStepCondition: ObjStepCondition,
            ObjEmailCfg: ObjEmailCfg,
            ObjFieldStep: ObjFieldStep,
            TypeofApprover: TypeofApprover,
            ApproveCode: ApproveCode,
            RoleCode: RoleCode,
            DepartmentCode: DepartmentCode,
            UserApprover: userApprover,
            listSearch_UserApprover: [],
            listStepDefault: [],
            listStepCondition: [],
            GroupApprover: GroupApprover,
            IsEditApprover: itemDetail.IsEditApprover,
            ApproverInField: CheckNull(itemDetail.ApproverInField),
            ApproverInStep: CheckNull(itemDetail.ApproverInStep),
            ApproveRunTime: approveRuntime,
            ApproverInSelect:ApproverInSelect
          });
          // console.log(arrStepWF);
        });
        // console.log(arrStepWF);
      })
      .catch((error) => {
        console.log(error);
      });
    return arrStepWF;
  }

  // lấy danh sách quy trình
  async GetWFTable() {
    let arrWF = [];
    const strSelect = `ID,Title,Code,Description,WhoIsUsed,WIUGroup,WIU/Id,WIU/Title,Status,SLA,indexStep,AutoSave,ObjParentProcess,TemplateHtml`;
    await sp.web.lists
      .getByTitle("WFTable")
      .items.select(strSelect)
      .expand("WIU")
      .get()
      .then((listWF) => {
        if (listWF.length > 0) {
          listWF.forEach((itemWF) => {
            let userDefault = "";
            if (isNotNull(itemWF["WIU"])) {
              // userDefault = itemDetail["WIU"][0]["Title"];
              itemWF["WIU"].forEach((element) => {
                userDefault += CheckNull(element["Title"]) + ", ";
              });
            }
            arrWF.push({
              ID: itemWF["ID"],
              Code: CheckNull(itemWF["Code"]),
              Title: CheckNull(itemWF["Title"]),
              Description: CheckNull(itemWF["Description"]),
              WhoIsUsed: CheckNull(itemWF["WhoIsUsed"]),
              Department: CheckNull(itemWF["WIUGroup"]),
              UserDefault: CheckNull(userDefault),
              Status: CheckNull(itemWF["Status"]),
              SLA: CheckNullSetZero(itemWF["SLA"]),
              indexStep:
                CheckNullSetZero(itemWF["indexStep"]) > 0
                  ? CheckNullSetZero(itemWF["indexStep"])
                  : 1,
              TemplateHtml: CheckNull(itemWF["TemplateHtml"]),
              AutoSave: itemWF["AutoSave"] ? "Có" : "Không",
              ObjParentProcess: isNotNull(itemWF["ObjParentProcess"])
                ? JSON.parse(itemWF["ObjParentProcess"])
                : "",
            });

            // arrWF.push({ WFId: itemWF.ID, WFCode: itemWF.Code, WFTitle: itemWF.Title })
          });
        }
      })
      .catch((error) => {
        console.log(error);
      });
    // console.log(details);
    return arrWF;
  }

  // lấy danh sách Mã phê duyệt
  async GetApproveCode() {
    let arrApprove = [];
    await sp.web.lists
      .getByTitle("ListApproveCode")
      .items.select("ID,Title,Code")
      .get()
      .then((listApprove) => {
        listApprove.forEach((itemDetail) => {
          arrApprove.push({
            ID: CheckNull(itemDetail.ID),
            Title: CheckNull(itemDetail.Title),
            Code: CheckNull(itemDetail.Code),
          });
        });
      })
      .catch((error) => {
        console.log(error);
      });
    return arrApprove;
  }

  // lấy danh sách Mã vai trò
  async GetRoleCode() {
    let arrRoleCode = [];
    await sp.web.lists
      .getByTitle("ListRoleCode")
      .items.select("ID,Title,Code")
      .get()
      .then((listRoleCode) => {
        listRoleCode.forEach((itemDetail) => {
          arrRoleCode.push({
            ID: CheckNull(itemDetail.ID),
            Title: CheckNull(itemDetail.Title),
            Code: CheckNull(itemDetail.Code),
          });
        });
      })
      .catch((error) => {
        console.log(error);
      });
    return arrRoleCode;
  }

  modalOpenClose(isModal, typeForm) {
    if (typeForm == "wfField") {
      this.setState({ isFieldModal: isModal });
    } else if (typeForm == "wfStep") {
      this.setState({ isStepModal: isModal });
    }
  }

  async setFieldView(itemView) {
    // console.log(itemView);
    let listFieldSub = [];
    if (
      (itemView.FieldType == "Sum" ||
        itemView.FieldType == "Percent" ||
        itemView.FieldType == "Average") &&
      isNotNull(itemView.ObjSPField.ObjField.ChoiceField[0].WFTableId)
    ) {
      listFieldSub = await shareService.GetWFFormField(
        itemView.ObjSPField.ObjField.ChoiceField[0].WFTableId
      );

      let stepTitle = itemView.ObjSPField.ObjField.ChoiceField[0].indexStep;
      let objStep = this.listStepWorkflow.find(
        (step) =>
          step.WFTableId ==
            itemView.ObjSPField.ObjField.ChoiceField[0].WFTableId &&
          step.indexStep ==
            itemView.ObjSPField.ObjField.ChoiceField[0].indexStep
      );
      if (isNotNull(objStep)) {
        stepTitle = objStep.Title;
      }
      // console.log(stepTitle);
      Object.assign(itemView, { StepTitle: stepTitle });
    }

    this.setState({ detailField: itemView, listFieldSub: listFieldSub });

    this.modalOpenClose(true, "wfField");
  }

  setStepView(itemView) {
    // console.log(itemView);
    this.setState({ detailStep: itemView });
    this.modalOpenClose(true, "wfStep");
  }

  async checkPermissionUser(UserId, ListDepartment) {
    let permissUser = { Permission: "User", Dept: [] };
    const siteGroups = await sp.web.currentUser.groups();
    // console.log(siteGroups);
    if (siteGroups.findIndex((gr) => gr.Title == "BPM Admins") != -1) {
      permissUser.Permission = "Admin";
    } else if (siteGroups.findIndex((gr) => gr.Title == "BPM Managers") != -1) {
      permissUser.Permission = "Manager";
      let dept = ListDepartment.filter(
        (dp) => dp.Manager == UserId || dp.Members.indexOf(UserId) != -1
      );
      permissUser.Dept = dept;
    } else {
      let dept = ListDepartment.filter((dp) => dp.Manager == UserId);
      permissUser.Dept = dept;
      if (dept.length > 0) {
        permissUser.Permission = "Manager";
      }
    }
    // console.log(permissUser);
    return permissUser;
  }

  render() {
    const {
      detailItem,
      listWFStep,
      listWFField,
      isShowLoadingPage,
      isParentProcess,
      listTemplateHtml,
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
          <Container fluid={true}>
            <Row>
              <Col lg={12} sm={12}>
                <Card>
                  <CardHeader className="bg-info">
                    <h5 className="my-0 text-white">Chi tiết quy trình</h5>
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
                      <Row>
                        <Col lg="12" className="align-self-center mb-5">
                          <div className="mt-4 mt-lg-0 row">
                            <Col xs="3">
                              <div className="mt-3">
                                <h6 className="mb-2">Tên quy trình</h6>
                                <p className="text-info text-truncate mb-2">
                                  {detailItem.Title}
                                </p>
                              </div>
                            </Col>
                            <Col xs="3">
                              <div className="mt-3">
                                <h6 className="mb-2">Mã quy trình</h6>
                                <p className="text-info text-truncate mb-2">
                                  {detailItem.Code}
                                </p>
                              </div>
                            </Col>
                            <Col xs="3">
                              <div className="mt-3">
                                <h6 className="mb-2">Tự động lưu</h6>
                                <p className="text-info text-truncate mb-2">
                                  {detailItem.AutoSave}
                                </p>
                              </div>
                            </Col>
                            <Col xs="3">
                              <div className="mt-3">
                                <h6 className="mb-2">Mô tả</h6>
                                <textarea
                                  className="form-control border-0 pl-0"
                                  readOnly={true}
                                  value={detailItem.Description}
                                ></textarea>
                              </div>
                            </Col>
                            <Col xs="3">
                              <div className="mt-3">
                                <h6 className="mb-2">
                                  Ai được sử dụng quy trình
                                </h6>
                                <p className="text-info text-truncate mb-2">
                                  {detailItem.WhoIsUsed == "All Users"
                                    ? "Tất cả người dùng"
                                    : detailItem.WhoIsUsed == "Department"
                                    ? "Phòng ban"
                                    : "Nhóm người dùng"}
                                </p>
                              </div>
                            </Col>

                            <Col xs="3">
                              <div className="mt-3">
                                <h6 className="mb-2">Trạng thái</h6>
                                <p className="text-info text-truncate mb-2">
                                  {" "}
                                  <span
                                    className={formatActiveLabel(
                                      detailItem.Status
                                    )}
                                  >
                                    {formatActiveText(detailItem.Status)}
                                  </span>
                                </p>
                              </div>
                            </Col>
                            {detailItem.WhoIsUsed == "Department" ? (
                              <Col xs="3">
                                <div className="mt-3">
                                  <h6 className="mb-2">Phòng ban</h6>
                                  <p className="text-info text-truncate mb-2">
                                    {" "}
                                    {FindTitleById(
                                      this.listDept,
                                      `Code`,
                                      detailItem.Department,
                                      `Title`
                                    )}
                                  </p>
                                </div>
                              </Col>
                            ) : (
                              ""
                            )}
                            {detailItem.WhoIsUsed == "Users" ? (
                              <Col xs="3">
                                <div className="mt-3">
                                  <h6 className="mb-2">Nhóm người dùng</h6>
                                  <textarea
                                    className="form-control border-0 pl-0"
                                    readOnly={true}
                                    value={detailItem.UserDefault}
                                  ></textarea>
                                </div>
                              </Col>
                            ) : (
                              ""
                            )}
                            <Col xs="3">
                              <div className="mt-3">
                                <h6 className="mb-2">
                                  Bước khởi tạo quy trình
                                </h6>
                                <p className="text-info text-truncate mb-2">
                                  {FindTitleById(
                                    listWFStep,
                                    "indexStep",
                                    detailItem.indexStep,
                                    "StepTitle"
                                  )}
                                </p>
                              </div>
                            </Col>
                            <Col xs="3">
                              <div className="mt-3">
                                <h6 className="mb-2">SLA</h6>
                                <p className="text-info text-truncate mb-2">
                                  {isNotNull(detailItem.SLA)
                                    ? detailItem.SLA
                                    : TotalSLA(
                                        listWFStep,
                                        detailItem.indexStep
                                      )}
                                </p>
                              </div>
                            </Col>
                            <Col xs="3">
                              <div className="mt-3">
                                <h6 className="mb-2">Mẫu xuất tài liệu PDF</h6>
                                <p className="text-info text-truncate mb-2">
                                  {FindTitleById(
                                    listTemplateHtml,
                                    "ID",
                                    detailItem.TemplateHtml,
                                    "Title"
                                  )}
                                </p>
                              </div>
                            </Col>

                            {isParentProcess ? (
                              <Col xl="12">
                                <div className="mt-3">
                                  <h4 className="mb-2">
                                    Quy trình cha mặc định
                                  </h4>
                                </div>
                              </Col>
                            ) : (
                              ""
                            )}

                            {isParentProcess ? (
                              <Col xs="3">
                                <div className="mt-3">
                                  <h6 className="mb-2">Loại quy trình</h6>
                                  <p className="text-info text-truncate mb-2">
                                    {detailItem.ObjParentProcess
                                      .TypeParentProcess == "SyncProcess"
                                      ? "Quy trình nối tiếp"
                                      : "Quy trình song song"}
                                  </p>
                                </div>
                              </Col>
                            ) : (
                              ""
                            )}
                            {isParentProcess ? (
                              <Col xs="3">
                                <div className="mt-3">
                                  <h6 className="mb-2">Quy trình cha</h6>
                                  <p className="text-info text-truncate mb-2">
                                    {
                                      detailItem.ObjParentProcess
                                        .ArrayParentProcess[
                                        detailItem.ObjParentProcess
                                          .ParentProcess
                                      ].wfTable.WFTitle
                                    }{" "}
                                    ({" "}
                                    {
                                      detailItem.ObjParentProcess
                                        .ArrayParentProcess[
                                        detailItem.ObjParentProcess
                                          .ParentProcess
                                      ].StepTitle
                                    }
                                    )
                                  </p>
                                </div>
                              </Col>
                            ) : (
                              ""
                            )}
                            {/* {isParentProcess ? (
                              <Col xs="3">
                                <div className="mt-3">
                                  <h6 className="mb-2">Đã tạo từ</h6>
                                  <p className="text-info text-truncate mb-2">
                                    {isNotNull(
                                      detailItem.ObjParentProcess
                                        .ParentProcessDateStart
                                    )
                                      ? moment(
                                          new Date(
                                            detailItem.ObjParentProcess.ParentProcessDateStart
                                          )
                                        ).format("DD-MM-YYYY")
                                      : ""}
                                  </p>
                                </div>
                              </Col>
                            ) : (
                              ""
                            )}
                            {isParentProcess ? (
                              <Col xs="3">
                                <div className="mt-3">
                                  <h6 className="mb-2">Đã tạo đến</h6>
                                  <p className="text-info text-truncate mb-2">
                                    {isNotNull(
                                      detailItem.ObjParentProcess
                                        .ParentProcessDateEnd
                                    )
                                      ? moment(
                                          new Date(
                                            detailItem.ObjParentProcess.ParentProcessDateEnd
                                          )
                                        ).format("DD-MM-YYYY")
                                      : ""}
                                  </p>
                                </div>
                              </Col>
                            ) : (
                              ""
                            )} */}
                            {isParentProcess &&
                            detailItem.ObjParentProcess.ArrayFieldCondition
                              .length > 0 ? (
                              <Col xl="12">
                                <div className="mt-3">
                                  <Table className="table table-striped">
                                    <thead>
                                      <tr>
                                        <th>Trường dữ liệu</th>
                                        <th>Điều kiện</th>
                                        <th>Loại so sánh</th>
                                        <th>Giá trị điều kiện</th>
                                      </tr>
                                    </thead>
                                    <tbody>
                                      {detailItem.ObjParentProcess.ArrayFieldCondition.map(
                                        (fieldCon, inCon) => (
                                          <tr key={inCon}>
                                            <td>
                                              {CheckNull(
                                                fieldCon.FieldSPLink.FieldName
                                              )}
                                            </td>
                                            <td>
                                              {FindTitleById(
                                                arrayTypeCompare,
                                                "Code",
                                                fieldCon.ConditionType,
                                                "Title"
                                              )}
                                            </td>
                                            <td>
                                              {fieldCon.TypeCompare ==
                                              "UserLogin"
                                                ? "Người đăng nhập"
                                                : fieldCon.TypeCompare ==
                                                  "CompareValue"
                                                ? "Gía trị nhập"
                                                : "Theo trường dữ liệu chính"}
                                            </td>
                                            <td>
                                              {fieldCon.TypeCompare ==
                                              "CompareValueMain"
                                                ? FindTitleById(
                                                    objWFStatus,
                                                    "InternalName",
                                                    fieldCon.CompareValue,
                                                    "Title"
                                                  )
                                                : fieldCon.InternalName ==
                                                  "StatusStep"
                                                ? FindTitleById(
                                                    objWFStatus,
                                                    "Code",
                                                    fieldCon.CompareValue,
                                                    "Title"
                                                  )
                                                : fieldCon.FieldSPLink
                                                    .FieldType == objField.User
                                                ? CheckNull(
                                                    fieldCon.CompareValue
                                                      .UserTitle
                                                  )
                                                : fieldCon.FieldSPLink
                                                    .FieldType ==
                                                  objField.UserMulti
                                                ? fieldCon.listCompareValue
                                                    .length > 0
                                                  ? fieldCon.listCompareValue.map(
                                                      (fls) =>
                                                        fls.UserTitle + ", "
                                                    )
                                                  : ""
                                                : fieldCon.TypeCompare ==
                                                  "CompareValue"
                                                ? CheckNull(
                                                    fieldCon.CompareValue
                                                  )
                                                : ""}
                                            </td>
                                          </tr>
                                        )
                                      )}
                                    </tbody>
                                  </Table>
                                </div>
                              </Col>
                            ) : (
                              ""
                            )}
                          </div>
                        </Col>
                        <Col xl="12" className="text-center mb-3">
                          <a
                            className="btn btn-warning btn-sm waves-effect waves-light"
                            href={config.pages.wfDashboard}
                          >
                            Quay lại
                          </a>
                        </Col>
                      </Row>
                      <CardTitle className="text-primary mb-3">
                        Cấu hình cơ sở dữ liệu
                      </CardTitle>
                      <Row>
                        <Col lg="12">
                          <div className="table-responsive">
                            <Table className="table table-striped mb-5">
                              <thead>
                                <tr>
                                  <th>Tên trường</th>
                                  <th>Trường nội bộ</th>
                                  <th>Kiểu dữ liệu</th>
                                  <th style={{ width: "50%" }}>Mô tả</th>
                                  <th>Bắt buộc</th>
                                  <th className="text-right">Hoạt động</th>
                                </tr>
                              </thead>
                              <tbody>
                                {listWFField.length > 0 ? (
                                  listWFField.map((itemField) => (
                                    <tr key={itemField.ID}>
                                      <td>{itemField.Title}</td>
                                      <td>{itemField.InternalName}</td>
                                      <td>
                                        {formatTypeObjField(
                                          itemField.FieldType
                                        )}
                                      </td>
                                      <td>{itemField.HelpText}</td>
                                      <td>
                                        {itemField.Required == 1
                                          ? "Có"
                                          : "Không"}
                                      </td>
                                      <td className="text-right">
                                        <a
                                          onClick={() =>
                                            this.setFieldView(itemField)
                                          }
                                          className="btn btn-sm waves-effect waves-light"
                                          data-toggle="modal"
                                          data-target=".bs-example-modal-lg"
                                          title="Chi tiết"
                                        >
                                          <i className="fa fa-file-text-o mr-2 align-middle text-primary font-size-16"></i>
                                        </a>
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
                            {!this.state.isFieldModal ? (
                              ""
                            ) : (
                              <DetailFormField
                                detailField={this.state.detailField}
                                listWorkflow={this.listWorkflow}
                                listFieldSub={this.state.listFieldSub}
                                listWFField={this.state.listWFField}
                                modalOpenClose={this.modalOpenClose}
                                listWFStep={this.state.listWFStep}
                              />
                            )}
                          </div>
                        </Col>
                      </Row>
                      <CardTitle className="text-primary mb-3">
                        Cấu hình các bước quy trình
                      </CardTitle>
                      <Row>
                        <Col lg="12">
                          <div className="table-responsive">
                            <Table className="table table-striped">
                              <thead>
                                <tr>
                                  <th>Tên bước</th>
                                  <th>Mã bước</th>
                                  <th>Loại bước</th>
                                  <th>Bước kế tiếp(mặc định)</th>
                                  <th className="text-right">Hoạt động</th>
                                </tr>
                              </thead>
                              <tbody>
                                {listWFStep.length > 0 ? (
                                  listWFStep.map((itemStep) => (
                                    <tr key={itemStep.ID}>
                                      <td scope="row">{itemStep.StepTitle}</td>
                                      <td>{itemStep.StepCode}</td>
                                      <td>{itemStep.StepWFType}</td>
                                      <td>
                                        {
                                          itemStep.StepNextDefault
                                            .StepNextDefaultTitle
                                        }
                                      </td>
                                      <td className="text-right">
                                        <a
                                          onClick={() =>
                                            this.setStepView(itemStep)
                                          }
                                          className="btn btn-sm waves-effect waves-light"
                                          data-toggle="modal"
                                          data-target=".bs-example-modal-lg"
                                          title="Chi tiết"
                                        >
                                          <i className="fa fa-file-text-o mr-2 align-middle text-primary font-size-16"></i>
                                        </a>
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
                            {!this.state.isStepModal ? (
                              ""
                            ) : (
                              <DetailFormStep
                                listWFField={this.state.listWFField}
                                detailStep={this.state.detailStep}
                                modalOpenClose={this.modalOpenClose}
                                listDept={this.listDept}
                                listApproveCode={this.state.listApproveCode}
                                listRoleCode={this.state.listRoleCode}
                                listWFStep={this.state.listWFStep}
                              />
                            )}
                          </div>
                        </Col>
                      </Row>
                    </CardBody>
                  )}
                </Card>
              </Col>
            </Row>
          </Container>
        </div>
      </Fragment>
    );
  }
}
