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
  checkFormCondition,
  checkAddStepCondition,
  checkSaveStepForm,
  checkaddStepSubWF,
  checkFormCorrespondingFields,
} from "../../wfShareCmpts/wfShareFunction.js";
import {
  objField,
  arrayTypeCompare,
  arrayTypeCalculation,
  objDataTransfer,
  arrayDataTransfer,
  colspan,
} from "../../wfShareCmpts/wfShareModel";

import { Col, CardTitle, Modal } from "reactstrap";
import { Table, Thead, Tbody, Tr, Th, Td } from "react-super-responsive-table";

import shareService from "../../wfShareCmpts/wfShareService";
import ConditionStep from "./conditionStep";
import ConfigStepField from "./configStepField";
import ConfigSubProcess from "./configSubProcess";
import { FindTitleById } from "../../wfShareCmpts/wfShareFunction";
import ConfirmRequired from "../ConfirmRequired";
import ConfirmDelete from "../ConfirmDelete";

class AddStepTable extends Component {
  constructor(props) {
    super(props);
    // console.log(this.props);

    this.state = {
      detailStep: this.props.detailStep,
      listDept: this.props.listDept,
      listStepWorkflow: this.props.listStepWorkflow,
      listFormField: this.props.listFormField,
      indexFormStep: this.props.indexFormStep,
      listEmailTemplate: this.props.listEmailTemplate,
      listApproveCode: this.props.listApproveCode,
      listRoleCode: this.props.listRoleCode,
      listGroup: this.props.listGroup,
      listWorkflow: this.props.listWorkflow,
      arrRoleCode: !isNotNull(this.props.detailStep.DepartmentCode)
        ? this.props.listRoleCode
        : this.props.listRoleCode.filter(
          (x) =>
            isNotNull(x.DeptCode) &&
            x.DeptCode.findIndex(
              (y) => y == this.props.detailStep.DepartmentCode
            ) != -1
        ),
      arrApproveCode: !isNotNull(this.props.detailStep.DepartmentCode)
        ? this.props.listApproveCode
        : this.props.listApproveCode.filter(
          (x) =>
            isNotNull(x.DeptCode) &&
            x.DeptCode.findIndex(
              (y) => y == this.props.detailStep.DepartmentCode
            ) != -1
        ),
      autuNull: "",
      Required: false,
      RequiredText: "",
      isConfirm: false,
      textConfirm: "",
      objConfirm: {},
    };

    this.changeFormStepModal = this.changeFormStepModal.bind(this);
    this.callSearchPeople = this.callSearchPeople.bind(this);
    this.callSearchPeople1 = this.callSearchPeople1.bind(this);
    this.modalOpenCloseAlert = this.modalOpenCloseAlert.bind(this);
    this.resultStepField = this.resultStepField.bind(this);
    this.resultSubProcess = this.resultSubProcess.bind(this);
    this.closeConfirm = this.closeConfirm.bind(this);
    this.resultConfirm = this.resultConfirm.bind(this);
    this.resultConditionStep = this.resultConditionStep.bind(this);
    this.typingTimeout = null;
    this.fieldSearch = undefined;
  }

  componentWillReceiveProps(nextProps) {
    // console.log(nextProps);
    // console.log(this.props);
    this.setState({
      detailStep: nextProps.detailStep,
      listDept: nextProps.listDept,
      listStepWorkflow: nextProps.listStepWorkflow,
      listFormField: nextProps.listFormField,
      indexFormStep: nextProps.indexFormStep,
      listEmailTemplate: nextProps.listEmailTemplate,
      istApproveCode: nextProps.listApproveCode,
      listRoleCode: nextProps.listRoleCode,
      listGroup: nextProps.listGroup,
      listWorkflow: nextProps.listWorkflow,
    });
  }

  saveFormStepWorkflow() {
    // console.log(this.props);
    let detailStep = returnObject(this.state.detailStep);
    let checkRequired = checkSaveStepForm(detailStep);

    if (isNotNull(checkRequired)) {
      this.setState({
        RequiredText:
          "Bạn chưa nhập đầy đủ thông tin bước: \n " + checkRequired + "",
        Required: true,
      });
      // alert("Bạn chưa nhập đầy đủ thông tin bước: \n" + checkRequired);
      return;
    }
    let index = this.state.listStepWorkflow.findIndex(
      (x) => x.indexStep == detailStep.indexStep
    );
    if (
      detailStep.ID == 0 &&
      this.state.listStepWorkflow.findIndex(
        (x) => x.StepCode == detailStep.StepCode
      ) != -1 &&
      index == -1
    ) {
      this.setState({ RequiredText: "Mã bước đã tồn tại", Required: true });
      //  alert("Mã bước đã tồn tại  \n");
      return;
    }

    this.props.resutlStepTable(this.state.detailStep, index);
  }

  // làm mới form cấu hình bước
  resetFormStepWorkflow() {
    let stepObject = returnObject(this.state.detailStep);
    const detailStep = {
      ID: stepObject.ID,
      StepTitle: "",
      StepCode: "",
      indexStep: stepObject.indexStep,
      ClassifyStep: "Step",
      StepWFType: "",
      SLA: "",
      DepartmentCode: "",
      btnAction: [],
      ObjBackStep: [],
      ObjStepWFId: [],
      StepNextDefault: {
        StepNextDefaultId: "",
        StepNextDefaultTitle: "Hoàn thành",
      },
      ObjStepCondition: {
        IsActive: false,
        ArrayStepCondition: [],
      },
      IsEditApprover: false,
      GroupApprover: { TypeUserApproval: "", Group: { ID: "", Title: "" } },
      ObjEmailCfg: {
        EmailSendApprover: {
          IsActive: false,
          ObjEmailTemplate: { TemplateId: "", TemplateTitle: "" },
        },
        EmailSendUserRequest: {
          IsActive: false,
          ObjEmailTemplate: { TemplateId: "", TemplateTitle: "" },
        },
        EmailSendInform: {
          IsActive: false,
          ObjEmailTemplate: { TemplateId: "", TemplateTitle: "" },
          ObjUserDefault: [],
          ObjUserField: [],
          search_InformToUserDefault: "",
          listSearch_InformToUserDefault: [],
          AlowSaveSendMail: false,
        },
        EmailSendDeadline: {
          IsActive: false,
          ObjEmailTemplate: { TemplateId: "", TemplateTitle: "" },
          NumberHours: "",
        },
      },
      ObjFieldStep: {
        FieldInput: [],
        FieldView: [],
        isAttachments: false,
        isViewAttachments: false,
        isEditAttachments: false,
        isDeleteAttachments: false,
        isDocuSignDocuments: false,
      },
      TypeofApprover: "",
      ApproveCode: "",
      RoleCode: "",
      UserApprover: { UserId: "", UserTitle: "" },
      listSearch_UserApprover: [],
      ApproverInField: "",
      ApproverInStep: "",
      ApproverInSelect: "",
      ApproveRunTime: {
        IsActive: false,
      },
    };
    this.setState({
      detailStep: detailStep,
      isConfirm: false,
      textConfirm: "",
      objConfirm: {},
    });
  }

  setNextStep() {
    this.props.setNextStepTable(this.state.detailStep);
  }

  // set các giá trị trong cấu hình của 1 bước
  async changeFormStepModal(event) {
    let nameState = event.target.name;
    let valueState = event.target.value;
    let detailStep = returnObject(this.state.detailStep);
    if (nameState == "StepWFType") {
      detailStep.StepWFType = valueState;
      let objWFId = returnArray(detailStep.ObjStepWFId);
      if (valueState == "Quy trình") {
        objWFId = [
          {
            IsActive: false,
            WFTableId: "",
            WFTableCode: "",
            WFTableTitle: "",
            Waitting: false,
            TypeOfInitialization: "Save",
            ObjCondition: {
              IsActive: false,
              TypeCondition: "",
              ArrCondition: [],
            },
            CorrespondingFields: [],
            ArrayFieldSub: [],
            AlowDataTransfer: false,
            ObjInitialization: {
              AlowLaunch: false,
              TypeUserApproval: "",
              UserApprover: [],
              Step: "",
              Field: "",
            },
          },
        ];
      } else {
        objWFId = [];
      }
      detailStep.ObjStepWFId = objWFId;
      detailStep.ApproveRunTime = { IsActive: false };
    } else if (nameState == "TypeofApprover") {
      detailStep.TypeofApprover = valueState;
      let objUserApp = { UserId: "", UserTitle: "" };
      detailStep.UserApprover = objUserApp;
      detailStep.ApproveCode = "";
      detailStep.RoleCode = "";
      detailStep.DepartmentCode = "";
      detailStep.ApproverInStep = "";
      detailStep.ApproverInSelect = ""
      detailStep.ApproverInField = "";
      detailStep.IsEditApprover = false;
      let objgroup = { ID: "", Title: "" };
      let GroupApprover = returnObject(detailStep.GroupApprover);
      GroupApprover.Group = objgroup;
      GroupApprover.TypeUserApproval = "";
      detailStep.GroupApprover = GroupApprover;
    } else if (nameState == "DepartmentCode") {
      detailStep.DepartmentCode = valueState;
      let arrRoleCode = this.state.listRoleCode;
      let arrApproveCode = this.state.listApproveCode;
      if (isNotNull(valueState)) {
        arrRoleCode = this.state.listRoleCode.filter(
          (x) =>
            isNotNull(x.DeptCode) &&
            x.DeptCode.findIndex((y) => y == valueState) != -1
        );
        arrApproveCode = this.state.listApproveCode.filter(
          (x) =>
            isNotNull(x.DeptCode) &&
            x.DeptCode.findIndex((y) => y == valueState) != -1
        );
      }

      this.setState({
        arrRoleCode: arrRoleCode,
        arrApproveCode: arrApproveCode,
      });
    } else if (nameState == "TypeUserApproval") {
      let objUserApp = returnObject(detailStep.UserApprover);
      let GroupApprover = returnObject(detailStep.GroupApprover);
      objUserApp = { UserId: "", UserTitle: "" };
      detailStep.UserApprover = objUserApp;
      GroupApprover.TypeUserApproval = valueState;
      detailStep.IsEditApprover = false;
      let objgroup = { ID: "", Title: "" };
      GroupApprover.Group = objgroup;
      detailStep.GroupApprover = GroupApprover;
    } else if (nameState == "Group") {
      let groupApprover = returnObject(detailStep.GroupApprover);
      groupApprover.Group = {
        ID: valueState,
        Title: event.target.selectedOptions[0].text,
      };
      detailStep.GroupApprover = groupApprover;
    } else if (nameState == "IsEditApprover") {
      detailStep.IsEditApprover = event.target.checked;
    } else if (nameState == "ApproveRunTime") {
      let approveRuntime = returnObject(detailStep.ApproveRunTime);
      approveRuntime.IsActive = event.target.checked;
      detailStep.ApproveRunTime = approveRuntime;
    } else if (nameState == "StepCondition") {
      let objStepCon = returnObject(detailStep.ObjStepCondition);
      objStepCon.IsActive = event.target.checked;
      if (event.target.checked) {
        objStepCon.ArrayStepCondition = [
          {
            Priority: 1,
            ConditionsCombined: "",
            TypeCondition: "",
            ObjCondition: [],
            StepNextCondition: {
              StepNextConditionId: "",
              StepNextConditionTitle: "Hoàn thành",
            },
          },
        ];
      } else {
        objStepCon.ArrayStepCondition = [];
      }

      detailStep.ObjStepCondition = objStepCon;
    } else if (nameState == "StepNextDefault") {
      let objStepNextD = returnObject(detailStep.StepNextDefault);

      objStepNextD.StepNextDefaultId = valueState;
      objStepNextD.StepNextDefaultTitle = event.target.selectedOptions[0].text;
      detailStep.StepNextDefault = objStepNextD;
    } else if (nameState == "isAttachments") {
      let objStepField = returnObject(detailStep.ObjFieldStep);
      objStepField[nameState] = event.target.checked;
      detailStep.ObjFieldStep = objStepField;
    } else if (nameState == "isViewAttachments") {
      let objStepField = returnObject(detailStep.ObjFieldStep);
      objStepField[nameState] = event.target.checked;
      detailStep.ObjFieldStep = objStepField;
    } else if (nameState == "isEditAttachments") {
      let objStepField = returnObject(detailStep.ObjFieldStep);
      objStepField[nameState] = event.target.checked;
      detailStep.ObjFieldStep = objStepField;
    } else if (nameState == "isDeleteAttachments") {
      let objStepField = returnObject(detailStep.ObjFieldStep);
      objStepField[nameState] = event.target.checked;
      detailStep.ObjFieldStep = objStepField;
    } else if (nameState == "isDocuSignDocuments") {
      let objStepField = returnObject(detailStep.ObjFieldStep);
      objStepField[nameState] = event.target.checked;
      detailStep.ObjFieldStep = objStepField;
    } else if (nameState == "EmailSendApprover") {
      let objEmail = returnObject(detailStep.ObjEmailCfg);
      let objEmailAppro = returnObject(
        detailStep.ObjEmailCfg.EmailSendApprover
      );
      if (isNotNull(valueState)) {
        objEmailAppro.IsActive = true;
        objEmailAppro.ObjEmailTemplate = {
          TemplateId: valueState,
          TemplateTitle: event.target.selectedOptions[0].text,
        };
      } else {
        objEmailAppro.IsActive = false;
        objEmailAppro.ObjEmailTemplate = { TemplateId: "", TemplateTitle: "" };
      }
      objEmail.EmailSendApprover = objEmailAppro;
      detailStep.ObjEmailCfg = objEmail;
    } else if (nameState == "EmailSendUserRequest") {
      let objEmail = returnObject(detailStep.ObjEmailCfg);
      let objEmailRequest = returnObject(
        detailStep.ObjEmailCfg.EmailSendUserRequest
      );
      if (isNotNull(valueState)) {
        objEmailRequest.IsActive = true;
        objEmailRequest.ObjEmailTemplate = {
          TemplateId: valueState,
          TemplateTitle: event.target.selectedOptions[0].text,
        };
      } else {
        objEmailRequest.IsActive = false;
        objEmailRequest.ObjEmailTemplate = {
          TemplateId: "",
          TemplateTitle: "",
        };
      }
      objEmail.EmailSendUserRequest = objEmailRequest;
      detailStep.ObjEmailCfg = objEmail;
    } else if (nameState == "EmailSendDeadline") {
      let objEmail = returnObject(detailStep.ObjEmailCfg);
      let objEmailDeadline = returnObject(
        detailStep.ObjEmailCfg.EmailSendDeadline
      );
      if (isNotNull(valueState)) {
        objEmailDeadline.IsActive = true;
        objEmailDeadline.ObjEmailTemplate = {
          TemplateId: valueState,
          TemplateTitle: event.target.selectedOptions[0].text,
        };
      } else {
        objEmailDeadline.IsActive = false;
        objEmailDeadline.ObjEmailTemplate = {
          TemplateId: "",
          TemplateTitle: "",
        };
      }
      objEmail.EmailSendDeadline = objEmailDeadline;
      detailStep.ObjEmailCfg = objEmail;
    } else if (nameState == "EmailSendInform") {
      let objEmail = returnObject(detailStep.ObjEmailCfg);
      let objEmailInform = returnObject(detailStep.ObjEmailCfg.EmailSendInform);
      if (isNotNull(valueState)) {
        objEmailInform.IsActive = true;
        objEmailInform.ObjEmailTemplate = {
          TemplateId: valueState,
          TemplateTitle: event.target.selectedOptions[0].text,
        };
        objEmailInform.ObjUserDefault = [];
        objEmailInform.ObjUserField = [];
      } else {
        objEmailInform.IsActive = false;
        objEmailInform.ObjEmailTemplate = { TemplateId: "", TemplateTitle: "" };
        objEmailInform.ObjUserDefault = [];
        objEmailInform.ObjUserField = [];
      }
      objEmail.EmailSendInform = objEmailInform;
      detailStep.ObjEmailCfg = objEmail;
    } else if (nameState == "NumberHours") {
      let objEmail = returnObject(detailStep.ObjEmailCfg);
      let objEmailDeadline = returnObject(
        detailStep.ObjEmailCfg.EmailSendDeadline
      );
      if (parseInt(valueState) < 0) {
        detailStep.SLA = "";
        this.setState({
          RequiredText: "Thời gian gửi deadline phải lớn hơn 0",
          Required: true,
        });
        //  alert("SLA phải lớn hơn 0");
      } else {
        objEmailDeadline.NumberHours = valueState;
      }

      objEmail.EmailSendDeadline = objEmailDeadline;
      detailStep.ObjEmailCfg = objEmail;
    } else if (nameState == "InformUserField") {
      let objEmail = returnObject(detailStep.ObjEmailCfg);
      let objEmailInform = returnObject(objEmail.EmailSendInform);
      let objUserFields = returnArray(objEmailInform.ObjUserField);
      if (isNotNull(valueState) && objUserFields.indexOf(valueState) == -1) {
        objUserFields.push(valueState);
        objEmailInform.ObjUserField = objUserFields;
      }
      // objEmailInform.ObjUserField = [];
      // const valueSelect = event.target.selectedOptions;
      // for (let is = 0; is < valueSelect.length; is++) {
      //   if (isNotNull(valueSelect[is].value)) {
      //     objEmailInform.ObjUserField.push(valueSelect[is].value);
      //   }
      // }
      objEmail.EmailSendInform = objEmailInform;
      detailStep.ObjEmailCfg = objEmail;
    } else if (nameState == "AlowSaveSendMail") {
      let objEmail = returnObject(detailStep.ObjEmailCfg);
      let objEmailInform = returnObject(objEmail.EmailSendInform);
      objEmailInform.AlowSaveSendMail = event.target.checked;
      objEmail.EmailSendInform = objEmailInform;
      detailStep.ObjEmailCfg = objEmail;
    } else if (nameState == "btnAction") {
      const btnArr = [];
      const valueSelect = event.target.selectedOptions;
      for (let is = 0; is < valueSelect.length; is++) {
        if (isNotNull(valueSelect[is]) && isNotNull(valueSelect[is].value)) {
          btnArr.push(valueSelect[is].value);
        }
      }
      detailStep.btnAction = btnArr;
      if (btnArr.findIndex((x) => x == "BackStep") == -1) {
        detailStep.ObjBackStep = [];
      }
    } else if (nameState == "ObjBackStep") {
      const backStepArr = [];
      const valueSelect = event.target.selectedOptions;
      for (let is = 0; is < valueSelect.length; is++) {
        if (isNotNull(valueSelect[is]) && isNotNull(valueSelect[is].value)) {
          backStepArr.push(valueSelect[is].value);
        }
      }
      detailStep.ObjBackStep = backStepArr;
    } else if (nameState == "SLA") {
      if (!isNotNull(valueState)) {
        let objEmail = returnObject(detailStep.ObjEmailCfg);
        let objEmailDeadline = returnObject(
          detailStep.ObjEmailCfg.EmailSendDeadline
        );
        objEmailDeadline.IsActive = false;
        objEmailDeadline.NumberHours = "";
        objEmailDeadline.ObjEmailTemplate = {
          TemplateId: "",
          TemplateTitle: "",
        };
        objEmail.EmailSendDeadline = objEmailDeadline;
        detailStep.ObjEmailCfg = objEmail;
      }
      if (parseInt(valueState) < 0) {
        detailStep.SLA = "";
        this.setState({ RequiredText: "SLA phải lớn hơn 0", Required: true });
        //  alert("SLA phải lớn hơn 0");
      } else {
        detailStep[nameState] = valueState;
      }
    } else if (nameState == "StepCode") {
      valueState = valueState.replace(/\s/g, "");
      detailStep[nameState] = valueState;
    } else {
      detailStep[nameState] = valueState;
      if (detailStep.TypeofApprover == "Select" && isNotNull(detailStep.ApproverInField)) {
        detailStep.ApproverInSelect = []
        let us = this.state.listFormField.find(x => x.InternalName == detailStep.ApproverInField).ObjSPField.ObjField.ChoiceField
        us.map((y, idy) => {
          detailStep.ApproverInSelect.push({ TitleS: y, [y]: { UserId: "", UserTitle: "" } })
        })

      }
    }
    this.setState({ detailStep: detailStep });
  }
// cuong
changeSearchPeople1(event) {
  let nameState = event.target.name;
  let valueState = event.target.value;
  this.fieldSearch = nameState;
  let detailStep = returnObject(this.state.detailStep);

  detailStep.ApproverInSelect.find(x => x.TitleS == nameState)[nameState] = { UserId: "", UserTitle: valueState };
  this.setState({ detailStep: detailStep });

  clearTimeout(this.typingTimeout);
  this.typingTimeout = setTimeout(this.callSearchPeople1, 1000);
}
async callSearchPeople1() {
  const detailStep = returnObject(this.state.detailStep);
  let PeoplePicker = await shareService.searchPeoplePicker(
    detailStep.ApproverInSelect.find(x => x.TitleS == this.fieldSearch)[this.fieldSearch].UserTitle
  );
  detailStep.listSearch_UserApprover = PeoplePicker;
  this.setState({ detailStep: detailStep });

}
async selectSearch1(Key, nameState) {
  let objUser = await shareService.getInforUser(Key);

  let detailStep = returnObject(this.state.detailStep);
  detailStep.ApproverInSelect.find(x => x.TitleS == nameState)[nameState] = {
    UserId: objUser.UserId,
    UserTitle: objUser.UserTitle,
  };
  detailStep.listSearch_UserApprover = [];
  this.setState({ detailStep: detailStep });

}
// cuong
  // nhập giá trị để tìm kiếm người
  changeSearchPeople(event) {
    let nameState = event.target.name;
    let valueState = event.target.value;
    this.fieldSearch = nameState;
    const detailStep = returnObject(this.state.detailStep);
    if (nameState == "UserApprover") {
      detailStep.UserApprover = { UserId: "", UserTitle: valueState };
      this.setState({ detailStep: detailStep });
    } else if (nameState == "InformToUserDefault") {
      let objEmail = returnObject(detailStep.ObjEmailCfg);
      let objEmailInform = returnObject(detailStep.ObjEmailCfg.EmailSendInform);
      objEmailInform.search_InformToUserDefault = valueState;

      objEmail.EmailSendInform = objEmailInform;
      detailStep.ObjEmailCfg = objEmail;
      this.setState({ detailStep: detailStep });
    } else {
      this.fieldSearch = "search_" + nameState + "";
      this.setState({ ["search_" + nameState + ""]: valueState });
    }

    clearTimeout(this.typingTimeout);
    this.typingTimeout = setTimeout(this.callSearchPeople, 1000);
  }

  // set giá trị cho danh sách người tìm kiếm
  async callSearchPeople() {
    if (this.fieldSearch == "UserApprover") {
      let PeoplePicker = await shareService.searchPeoplePicker(
        this.state.detailStep.UserApprover.UserTitle
      );
      const detailStep = returnObject(this.state.detailStep);
      detailStep.listSearch_UserApprover = PeoplePicker;
      this.setState({ detailStep: detailStep });
    } else if (this.fieldSearch == "InformToUserDefault") {
      let PeoplePicker = await shareService.searchPeoplePicker(
        this.state.detailStep.ObjEmailCfg.EmailSendInform
          .search_InformToUserDefault
      );
      const detailStep = returnObject(this.state.detailStep);

      let objEmail = returnObject(detailStep.ObjEmailCfg);
      let objEmailInform = returnObject(detailStep.ObjEmailCfg.EmailSendInform);
      objEmailInform.listSearch_InformToUserDefault = PeoplePicker;

      objEmail.EmailSendInform = objEmailInform;
      detailStep.ObjEmailCfg = objEmail;
      this.setState({ detailStep: detailStep });
    } else {
      let PeoplePicker = await shareService.searchPeoplePicker(
        this.state[this.fieldSearch]
      );
      let name = this.fieldSearch.replace("search_", "");
      this.setState({ ["listSearch_" + name + ""]: PeoplePicker });
    }
  }

  // Chọn người từ trong danh sách tìm kiếm
  async selectSearch(Key, nameState, indexWFSub) {
    let objUser = await shareService.getInforUser(Key);
    if (!isNotNull(indexWFSub)) {
      if (nameState == "UserApprover") {
        let detailStep = returnObject(this.state.detailStep);
        detailStep.UserApprover = {
          UserId: objUser.UserId,
          UserTitle: objUser.UserTitle,
        };
        detailStep.listSearch_UserApprover = [];
        this.setState({ detailStep: detailStep });
      } else {
        const detailStep = returnObject(this.state.detailStep);
        let objEmail = returnObject(detailStep.ObjEmailCfg);
        let objEmailInform = returnObject(
          detailStep.ObjEmailCfg.EmailSendInform
        );
        let arrUserDefault = returnArray(
          detailStep.ObjEmailCfg.EmailSendInform.ObjUserDefault
        );
        if (arrUserDefault.findIndex((x) => x.UserId == objUser.UserId) == -1) {
          arrUserDefault.push(objUser);
        }
        objEmailInform.search_InformToUserDefault = "";
        objEmailInform.listSearch_InformToUserDefault = [];
        objEmailInform.ObjUserDefault = arrUserDefault;
        objEmail.EmailSendInform = objEmailInform;
        detailStep.ObjEmailCfg = objEmail;
        this.setState({ detailStep: detailStep });
      }
    } else {
      const detailStep = returnObject(this.state.detailStep);
      let ObjStepWFId = returnArray(detailStep.ObjStepWFId);
      let ObjStepWFIdItem = returnObject(ObjStepWFId[indexWFSub]);
      let ObjInitialization = returnObject(ObjStepWFIdItem.ObjInitialization);
      let UserApprover = returnArray(ObjInitialization.UserApprover);
      if (
        UserApprover.findIndex((x) => x.UserEmail == objUser.UserEmail) == -1
      ) {
        UserApprover.push(objUser);
      }
      ObjInitialization.UserApprover = UserApprover;
      ObjStepWFIdItem.ObjInitialization = ObjInitialization;
      ObjStepWFId[indexWFSub] = ObjStepWFIdItem;
      detailStep.ObjStepWFId = ObjStepWFId;
      this.setState({
        detailStep: detailStep,
        ["listSearch_" + nameState + "_" + indexWFSub]: [],
        ["search_" + nameState + "_" + indexWFSub]: "",
      });
    }
  }

  // Xóa danh sách người đã chọn
  removePeople(IdUser, indexWFSub) {
    let detailStep = returnObject(this.state.detailStep);
    if (isNotNull(indexWFSub)) {
      let ObjStepWFId = returnArray(detailStep.ObjStepWFId);
      let ObjStepWFIdItem = returnObject(ObjStepWFId[indexWFSub]);
      let ObjInitialization = returnObject(ObjStepWFIdItem.ObjInitialization);
      let UserApprover = returnArray(ObjInitialization.UserApprover);
      UserApprover.splice(IdUser, 1);
      ObjInitialization.UserApprover = UserApprover;
      ObjStepWFIdItem.ObjInitialization = ObjInitialization;
      ObjStepWFId[indexWFSub] = ObjStepWFIdItem;
      detailStep.ObjStepWFId = ObjStepWFId;
    } else {
      let objEmail = returnObject(detailStep.ObjEmailCfg);
      let objEmailInform = returnObject(detailStep.ObjEmailCfg.EmailSendInform);
      let arrUserDefault = returnArray(
        detailStep.ObjEmailCfg.EmailSendInform.ObjUserDefault
      );
      let index = arrUserDefault.findIndex((x) => x.UserId == IdUser);
      arrUserDefault.splice(index, 1);
      objEmailInform.ObjUserDefault = arrUserDefault;
      objEmail.EmailSendInform = objEmailInform;
      detailStep.ObjEmailCfg = objEmail;
    }
    this.setState({ detailStep: detailStep });
  }

  addConditionStep() {
    let detailStep = returnObject(this.state.detailStep);
    let objStepCon = returnObject(detailStep.ObjStepCondition);
    let arrConditions = returnArray(objStepCon.ArrayStepCondition);

    let txtRequird = checkAddStepCondition(arrConditions);
    if (isNotNull(txtRequird)) {
      this.setState({ RequiredText: txtRequird, Required: true });
      // alert(txtRequird);
      return;
    } else {
      let prio = arrConditions.length + 1;
      arrConditions.push({
        Priority: prio,
        ConditionsCombined: "",
        TypeCondition: "",
        ObjCondition: [],
        StepNextCondition: {
          StepNextConditionId: "",
          StepNextConditionTitle: "Hoàn thành",
        },
      });
      objStepCon.ArrayStepCondition = arrConditions;
      detailStep.ObjStepCondition = objStepCon;
      this.setState({ detailStep: detailStep });
    }
  }

  async resultConditionStep(stepCondition, indexCon) {
    // console.log(stepCondition);
    // console.log(indexCon);
    let detailStep = returnObject(this.state.detailStep);
    let objStepCon = returnObject(detailStep.ObjStepCondition);
    let arrConditions = returnArray(objStepCon.ArrayStepCondition);

    arrConditions[indexCon] = stepCondition;
    objStepCon.ArrayStepCondition = arrConditions;
    detailStep.ObjStepCondition = objStepCon;

    this.setState({ detailStep, detailStep });
  }

  resultStepField(listStepField, typeStepField) {
    let detailStep = returnObject(this.state.detailStep);
    let ObjFieldStep = returnObject(detailStep.ObjFieldStep);
    ObjFieldStep[typeStepField] = listStepField;
    detailStep.ObjFieldStep = ObjFieldStep;
    this.setState({ detailStep: detailStep });
  }

  removeInformUserField(indexF) {
    let detailStep = returnObject(this.state.detailStep);
    let objEmail = returnObject(detailStep.ObjEmailCfg);
    let objEmailInform = returnObject(objEmail.EmailSendInform);
    let objUserFields = returnArray(objEmailInform.ObjUserField);
    objUserFields.splice(indexF, 1);
    objEmailInform.ObjUserField = objUserFields;
    objEmail.EmailSendInform = objEmailInform;
    detailStep.ObjEmailCfg = objEmail;
    this.setState({ detailStep: detailStep });
  }

  async modalOpenCloseAlert() {
    await this.setState({ Required: false });
  }

  addSubProcess() {
    let detailStep = returnObject(this.state.detailStep);
    let ObjStepWFId = returnArray(detailStep.ObjStepWFId);
    let objSubWF = {
      IsActive: false,
      WFTableId: "",
      WFTableCode: "",
      WFTableTitle: "",
      Waitting: false,
      TypeOfInitialization: "Save",
      ObjCondition: { IsActive: false, TypeCondition: "", ArrCondition: [] },
      CorrespondingFields: [],
      ArrayFieldSub: [],
      AlowDataTransfer: false,
      ObjInitialization: {
        AlowLaunch: false,
        TypeUserApproval: "",
        UserApprover: [],
        Step: "",
        Field: "",
      },
    };
    if (ObjStepWFId.length > 0) {
      let txtValid = checkaddStepSubWF(ObjStepWFId);
      if (isNotNull(txtValid)) {
        this.setState({
          RequiredText: "Bạn chưa nhập đủ thông tin: \n " + txtValid + "",
          Required: true,
        });
        return;
      } else {
        ObjStepWFId.push(objSubWF);
      }
    } else {
      ObjStepWFId.push(objSubWF);
    }
    detailStep.ObjStepWFId = ObjStepWFId;
    this.setState({ detailStep: detailStep });
  }

  async resultSubProcess(processSub, indexSub) {
    let detailStep = returnObject(this.state.detailStep);
    let ObjStepWFId = returnArray(detailStep.ObjStepWFId);
    ObjStepWFId[indexSub] = processSub;
    detailStep.ObjStepWFId = ObjStepWFId;
    this.setState({ detailStep, detailStep });
  }

  async showConfirmDelete(typeDel, index) {
    if (typeDel == "ConfigSubProcess") {
      this.setState({
        isConfirm: true,
        textConfirm: "Bạn chắc chắn muốn xóa quy trình con này?",
        objConfirm: {
          typeForm: typeDel,
          indexArr: index,
        },
      });
    } else if (typeDel == "ConfigConditionStep") {
      this.setState({
        isConfirm: true,
        textConfirm: "Bạn chắc chắn muốn xóa nhánh chuyển hướng này ?",
        objConfirm: {
          typeForm: typeDel,
          indexArr: index,
        },
      });
    }
  }

  async resultConfirm(objConfirm) {
    // console.log("result confirm");
    await this.closeConfirm();

    if (objConfirm.typeForm == "ConfigConditionStep") {
      let detailStep = returnObject(this.state.detailStep);
      let objStepCon = returnObject(detailStep.ObjStepCondition);
      let arrConditions = returnArray(objStepCon.ArrayStepCondition);
      arrConditions.splice(objConfirm.indexArr, 1);

      objStepCon.ArrayStepCondition = arrConditions;
      detailStep.ObjStepCondition = objStepCon;

      this.setState({ detailStep, detailStep });
    } else if (objConfirm.typeForm == "ConfigSubProcess") {
      let detailStep = returnObject(this.state.detailStep);
      let processSubs = returnArray(detailStep.ObjStepWFId);
      processSubs.splice(objConfirm.indexArr, 1);
      detailStep.ObjStepWFId = processSubs;

      this.setState({ detailStep, detailStep });
    }
  }

  async closeConfirm() {
    await this.setState({ isConfirm: false, textConfirm: "", objConfirm: {} });
  }

  render() {
    const {
      detailStep,
      listFormField,
      listDept,
      listStepWorkflow,
      listEmailTemplate,
      listApproveCode,
      listRoleCode,
      listGroup,
      listWorkflow,
      arrRoleCode,
      arrApproveCode,
      isConfirm,
      textConfirm,
      objConfirm,
    } = this.state;
    // console.log(detailStep);
    return (
      <Modal size="xl" isOpen={true}>
        <div className="modal-header">
          <h5 className="modal-title mt-0 text-primary" id="myLargeModalLabel">
            Cấu hình bước quy trình
          </h5>
          <button
            onClick={() => this.props.modalOpenClose(false, "wfStep")}
            type="button"
            className="close"
            data-dismiss="modal"
            aria-label="Close"
          >
            <span aria-hidden="true">&times;</span>
          </button>
        </div>
        <div className="modal-body">
          <div className="row">
            <div className="col-lg-12">
              <div className="form-group row">
                <label htmlFor="example-text-input" className="col-md-3">
                  Tiêu đề bước <span className="text-danger">*</span>
                </label>
                <div className="col-md-9">
                  <input
                    className="form-control"
                    type="text"
                    name="StepTitle"
                    onChange={this.changeFormStepModal}
                    value={detailStep.StepTitle}
                  />
                </div>
              </div>
            </div>

            <div className="col-lg-12">
              <div className="form-group row">
                <label htmlFor="example-text-input" className="col-md-3">
                  Mã bước <span className="text-danger">*</span>
                </label>
                <div className="col-md-9">
                  <input
                    className="form-control"
                    type="text"
                    name="StepCode"
                    onChange={this.changeFormStepModal}
                    value={detailStep.StepCode}
                    disabled={this.state.indexFormStep == -1 ? false : true}
                  />
                </div>
              </div>
            </div>

            <div className="col-lg-12">
              <div className="form-group row">
                <label htmlFor="example-text-input" className="col-md-3">
                  Loại bước <span className="text-danger">*</span>
                </label>
                <div className="col-md-9">
                  <select
                    className="form-control"
                    name="StepWFType"
                    onChange={this.changeFormStepModal}
                    value={detailStep.StepWFType}
                  >
                    <option value=""></option>
                    <option value="Phê duyệt">Phê duyệt</option>
                    <option value="Quy trình">Quy trình</option>
                  </select>
                </div>
              </div>
            </div>

            {detailStep.StepWFType == "Quy trình" ? (
              <div className="col-lg-12">
                {detailStep.ObjStepWFId.length > 0
                  ? detailStep.ObjStepWFId.map((WFSub, indexWFSub) => (
                    <div className="row mb-3 border-row" key={indexWFSub}>
                      <Col lg="6">
                        <CardTitle className="text-info mb-3">
                          Quy trình con {indexWFSub + 1}
                        </CardTitle>
                      </Col>
                      <Col lg="6">
                        <div className="text-right">
                          <button
                            title="Xóa quy trình con"
                            type="button"
                            className="btn"
                            data-toggle="modal"
                            data-target=".bs-example-modal-lg"
                            onClick={() =>
                              this.showConfirmDelete(
                                "ConfigSubProcess",
                                indexWFSub
                              )
                            }
                          >
                            <i className="fa fa-trash text-danger font-size-16"></i>
                          </button>
                        </div>
                      </Col>
                      <ConfigSubProcess
                        subProcess={WFSub}
                        listFormField={listFormField}
                        listWorkflow={listWorkflow}
                        listDept={listDept}
                        indexSubProcess={indexWFSub}
                        resultSubProcess={this.resultSubProcess}
                        listStepWorkflow={listStepWorkflow}
                      />
                    </div>
                  ))
                  : ""}

                <div className="text-right mb-3">
                  <button
                    type="button"
                    className="btn btn-md btn-primary waves-effect waves-light"
                    onClick={() => this.addSubProcess()}
                  >
                    <i className="fa fa-plus-circle mr-2 align-middle"></i> Thêm
                    quy trình con
                  </button>
                </div>
              </div>
            ) : (
              ""
            )}

            <div className="col-lg-12">
              <div className="form-group row">
                <label htmlFor="example-text-input" className="col-md-3">
                  Phê duyệt theo <span className="text-danger">*</span>
                </label>
                <div className="col-md-9">
                  <select
                    className="form-control"
                    name="TypeofApprover"
                    onChange={this.changeFormStepModal}
                    value={detailStep.TypeofApprover}
                  >
                    <option value=""></option>
                    <option value="Phòng ban và mã phê duyệt">
                      Phòng ban và mã phê duyệt
                    </option>
                    <option value="Phòng ban và mã vai trò">
                      Phòng ban và mã vai trò
                    </option>
                    <option value="Mã và vai trò phê duyệt">
                      Mã và vai trò phê duyệt
                    </option>
                    <option value="Người phê duyệt">Người phê duyệt</option>
                    <option value="Người xử lý tại bước">
                      Người xử lý tại bước
                    </option>
                    <option value="Trường dữ liệu">Trường dữ liệu</option>
                    {/* cuong */}
                    <option value="Select">Phê duyệt theo option</option>
                  </select>
                </div>
              </div>
            </div>

            {detailStep.TypeofApprover == "Phòng ban và mã vai trò" ||
              detailStep.TypeofApprover == "Phòng ban và mã phê duyệt" ? (
              <div className="col-lg-12">
                <div className="form-group row">
                  <label htmlFor="example-text-input" className="col-md-3">
                    Phòng ban
                  </label>
                  <div className="col-md-9">
                    <select
                      className="form-control"
                      name="DepartmentCode"
                      onChange={this.changeFormStepModal}
                      value={detailStep.DepartmentCode}
                    >
                      <option value="">Phòng ban người đăng nhập</option>
                      {listDept.map((wfApp) => (
                        <option value={wfApp.Code} key={wfApp.ID}>
                          {wfApp.Title}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            ) : (
              ""
            )}

            {detailStep.TypeofApprover == "Phòng ban và mã phê duyệt" ? (
              <div className="col-lg-12">
                <div className="form-group row">
                  <label htmlFor="example-text-input" className="col-md-3">
                    Mã phê duyệt
                  </label>
                  <div className="col-md-9">
                    <select
                      className="form-control"
                      name="ApproveCode"
                      onChange={this.changeFormStepModal}
                      value={detailStep.ApproveCode}
                    >
                      <option value="">Người đăng nhập chỉ định</option>
                      {arrApproveCode.map((wfApp) => (
                        <option value={wfApp.Code} key={wfApp.ID}>
                          {wfApp.Title}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            ) : (
              ""
            )}

            {detailStep.TypeofApprover == "Phòng ban và mã vai trò" ? (
              <div className="col-lg-12">
                <div className="form-group row">
                  <label htmlFor="example-text-input" className="col-md-3">
                    Mã vai trò <span className="text-danger">*</span>
                  </label>
                  <div className="col-md-9">
                    <select
                      className="form-control"
                      name="RoleCode"
                      onChange={this.changeFormStepModal}
                      value={detailStep.RoleCode}
                    >
                      <option value=""></option>
                      {arrRoleCode.map((wfRole) => (
                        <option value={wfRole.Code} key={wfRole.ID}>
                          {wfRole.Title}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            ) : (
              ""
            )}

            {detailStep.TypeofApprover == "Mã và vai trò phê duyệt" ? (
              <div className="col-lg-12">
                <div className="form-group row">
                  <label htmlFor="example-text-input" className="col-md-3">
                    Mã phê duyệt <span className="text-danger">*</span>
                  </label>
                  <div className="col-md-9">
                    <select
                      className="form-control"
                      name="ApproveCode"
                      onChange={this.changeFormStepModal}
                      value={detailStep.ApproveCode}
                    >
                      <option value=""></option>
                      {listApproveCode.map((wfApp) => (
                        <option value={wfApp.Code} key={wfApp.ID}>
                          {wfApp.Title}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            ) : (
              ""
            )}

            {detailStep.TypeofApprover == "Mã và vai trò phê duyệt" ? (
              <div className="col-lg-12">
                <div className="form-group row">
                  <label htmlFor="example-text-input" className="col-md-3">
                    Mã vai trò <span className="text-danger">*</span>
                  </label>
                  <div className="col-md-9">
                    <select
                      className="form-control"
                      name="RoleCode"
                      onChange={this.changeFormStepModal}
                      value={detailStep.RoleCode}
                    >
                      <option value=""></option>
                      {listRoleCode.map((wfRole) => (
                        <option value={wfRole.Code} key={wfRole.ID}>
                          {wfRole.Title}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            ) : (
              ""
            )}

            {detailStep.TypeofApprover == "Người phê duyệt" ? (
              <div className="col-lg-12">
                <div className="form-group row">
                  <label htmlFor="example-text-input" className="col-md-3">
                    Loại người phê duyệt <span className="text-danger">*</span>
                  </label>
                  <div className="col-md-9">
                    <select
                      className="form-control"
                      name="TypeUserApproval"
                      onChange={this.changeFormStepModal}
                      value={detailStep.GroupApprover.TypeUserApproval}
                    >
                      <option value=""></option>
                      <option value="Một người phê duyệt">
                        Một người phê duyệt
                      </option>
                      <option value="Nhóm người phê duyệt">
                        Nhóm người phê duyệt
                      </option>
                    </select>
                  </div>
                </div>
              </div>
            ) : (
              ""
            )}

            {detailStep.TypeofApprover == "Người phê duyệt" &&
              detailStep.GroupApprover.TypeUserApproval ==
              "Một người phê duyệt" ? (
              <div className="col-lg-12">
                <div className="form-group row">
                  <label htmlFor="example-text-input" className="col-md-3">
                    Người phê duyệt <span className="text-danger">*</span>
                  </label>
                  <div className="col-md-9">
                    <input
                      className="form-control"
                      type="text"
                      placeholder="Search users"
                      name="UserApprover"
                      onChange={this.changeSearchPeople.bind(this)}
                      value={detailStep.UserApprover.UserTitle}
                    />
                    {detailStep.listSearch_UserApprover.length > 0 ? (
                      <div className="suggesAuto">
                        {detailStep.listSearch_UserApprover.map((people) => (
                          <div
                            key={people.Key}
                            className="suggtAutoItem"
                            onClick={() =>
                              this.selectSearch(people.Key, "UserApprover")
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
                </div>
              </div>
            ) : (
              ""
            )}

            {detailStep.TypeofApprover == "Người phê duyệt" &&
              detailStep.GroupApprover.TypeUserApproval ==
              "Một người phê duyệt" ? (
              <div className="col-lg-12">
                <div className="form-group row">
                  <label htmlFor="example-text-input" className="col-md-3">
                    Cho phép thay đổi người phê duyệt
                  </label>
                  <div className="col-md-9">
                    <input
                      type="checkbox"
                      className="form-check-input"
                      name="IsEditApprover"
                      onChange={this.changeFormStepModal}
                      checked={detailStep.IsEditApprover}
                    />
                  </div>
                </div>
              </div>
            ) : (
              ""
            )}

            {detailStep.TypeofApprover == "Người phê duyệt" &&
              detailStep.GroupApprover.TypeUserApproval ==
              "Nhóm người phê duyệt" ? (
              <div className="col-lg-12">
                <div className="form-group row">
                  <label htmlFor="example-text-input" className="col-md-3">
                    Nhóm người phê duyệt <span className="text-danger">*</span>
                  </label>
                  <div className="col-md-9">
                    <select
                      className="form-control"
                      name="Group"
                      onChange={this.changeFormStepModal}
                      value={detailStep.GroupApprover.Group.ID}
                    >
                      <option value=""></option>
                      {listGroup.map((group) => (
                        <option value={group.Id} key={group.Id}>
                          {group.Title}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            ) : (
              ""
            )}

            {detailStep.TypeofApprover == "Người xử lý tại bước" ? (
              <div className="col-lg-12">
                <div className="form-group row">
                  <label htmlFor="example-text-input" className="col-md-3">
                    Bước xử lý <span className="text-danger">*</span>
                  </label>
                  <div className="col-md-9">
                    <select
                      className="form-control"
                      name="ApproverInStep"
                      onChange={this.changeFormStepModal}
                      value={detailStep.ApproverInStep}
                    >
                      <option value=""></option>
                      {listStepWorkflow
                        .filter(
                          (step1) => step1.indexStep != detailStep.indexStep
                        )
                        .map((stepx, xindex) => (
                          <option value={stepx.indexStep} key={xindex}>
                            {CheckNull(stepx.StepTitle)}
                          </option>
                        ))}
                    </select>
                  </div>
                </div>
              </div>
            ) : (
              ""
            )}

            {detailStep.TypeofApprover == "Trường dữ liệu" ? (
              <div className="col-lg-12">
                <div className="form-group row">
                  <label htmlFor="example-text-input" className="col-md-3">
                    Trường dữ liệu <span className="text-danger">*</span>
                  </label>
                  <div className="col-md-9">
                    <select
                      className="form-control"
                      name="ApproverInField"
                      onChange={this.changeFormStepModal}
                      value={detailStep.ApproverInField}
                    >
                      <option value=""></option>
                      {listFormField
                        .filter(
                          (field1) =>
                            field1.Required == 1 &&
                            (field1.FieldType == objField.User ||
                              field1.FieldType == objField.UserMulti)
                        )
                        .map((fieldx, xindex) => (
                          <option value={fieldx.InternalName} key={xindex}>
                            {CheckNull(fieldx.FieldName)}
                          </option>
                        ))}
                    </select>
                  </div>
                </div>
              </div>
            ) : (
              ""
            )}
 {/* cuong */}
 {detailStep.TypeofApprover == "Select" ? (
              <div className="col-lg-12">
                <div className="form-group row">
                  <label htmlFor="example-text-input" className="col-md-3">
                    Data Field <span className="text-danger">*</span>
                  </label>
                  <div className="col-md-9">
                    <select
                      className="form-control"
                      name="ApproverInField"
                      onChange={this.changeFormStepModal}
                      value={detailStep.ApproverInField}
                    >
                      <option value=""></option>
                      {listFormField
                        .filter(
                          (field1) =>
                            field1.Required == 1 &&
                            field1.FieldType == objField.Dropdown
                        )
                        .map((fieldx, xindex) => (
                          <option value={fieldx.InternalName} key={xindex}>
                            {CheckNull(fieldx.FieldName)}
                          </option>
                        ))}
                    </select>
                  </div>
                </div>
              </div>
            ) : (
              ""
            )}
            {detailStep.TypeofApprover == "Select" && isNotNull(detailStep.ApproverInField) ? (
              <div className="col-lg-12">
                <div className="form-group row">
                  <label htmlFor="example-text-input" className="col-md-3">
                    Data <span className="text-danger">*</span>
                  </label>
                  <div className="col-md-9">
                    <div className="table-responsive mt-3 mb-3">
                      <Table className="table table-striped mb-0">
                        <thead>
                          <tr>
                            <th>Item</th>
                            <th>
                              Approver
                            </th>

                          </tr>
                        </thead>
                        <tbody>
                          {detailStep.ApproverInSelect.map((fieldx, xindex1) => (
                            <tr key={xindex1}>
                              <td>{fieldx.TitleS}</td>
                              <td>
                                <input
                                  className="form-control"
                                  type="text"
                                  placeholder="Search users"
                                  name={fieldx.TitleS}
                                  onChange={this.changeSearchPeople1.bind(this)}
                                  value={fieldx[fieldx.TitleS].UserTitle}
                                />
                                {this.fieldSearch == fieldx.TitleS && detailStep.listSearch_UserApprover.length > 0 ? (
                                  <div className="suggesAuto">
                                    {detailStep.listSearch_UserApprover.map((people) => (
                                      <div
                                        key={people.Key}
                                        className="suggtAutoItem"
                                        onClick={() =>
                                          this.selectSearch1(people.Key, fieldx.TitleS)
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
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </Table>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              ""
            )}
            {/* cuong */}
            {detailStep.StepWFType == "Phê duyệt" &&
              detailStep.ApproveRunTime ? (
              <div className="col-lg-12">
                <div className="form-group row">
                  <label htmlFor="example-text-input" className="col-md-3">
                    Cho phép chỉ định dánh sách người phê duyệt trên Apps
                  </label>
                  <div className="col-md-9">
                    <input
                      type="checkbox"
                      className="form-check-input"
                      name="ApproveRunTime"
                      onChange={this.changeFormStepModal}
                      checked={detailStep.ApproveRunTime.IsActive}
                    />
                  </div>
                </div>
              </div>
            ) : (
              ""
            )}

            <div className="col-lg-12">
              <div className="form-group row">
                <label htmlFor="example-text-input" className="col-md-3">
                  Bước kế tiếp(mặc định) <span className="text-danger">*</span>
                </label>
                <div className="col-md-9">
                  <select
                    className="form-control"
                    name="StepNextDefault"
                    onChange={this.changeFormStepModal}
                    value={detailStep.StepNextDefault.StepNextDefaultId}
                  >
                    {listStepWorkflow
                      .filter((step) => step.indexStep != detailStep.indexStep)
                      .map((steps) => (
                        <option value={steps.indexStep} key={steps.indexStep}>
                          {steps.StepTitle}
                        </option>
                      ))}
                    <option value="">Hoàn thành</option>
                  </select>
                </div>
              </div>
              <div className="text-right mb-3">
                <button
                  type="button"
                  className="btn btn-md btn-primary waves-effect waves-light"
                  onClick={() => this.setNextStep()}
                >
                  <i className="fa fa-plus-circle mr-2 align-middle"></i> Thêm
                  bước
                </button>
              </div>
            </div>

            <div className="col-lg-12">
              <div className="form-group row">
                <label htmlFor="example-text-input" className="col-md-3">
                  Điều kiện chuyển hướng
                </label>
                <div className="col-md-9">
                  <input
                    type="checkbox"
                    className="form-check-input"
                    name="StepCondition"
                    onChange={this.changeFormStepModal}
                    checked={detailStep.ObjStepCondition.IsActive}
                  />
                </div>
              </div>
            </div>

            {!detailStep.ObjStepCondition.IsActive ? (
              ""
            ) : (
              <div className="col-lg-12">
                {detailStep.ObjStepCondition.ArrayStepCondition.map(
                  (steps, indexCon) => (
                    <div className="row mb-3 border-row" key={indexCon}>
                      <Col lg="6">
                        <CardTitle className="text-info mb-3">
                          Nhánh chuyển hướng {indexCon + 1}
                        </CardTitle>
                      </Col>
                      <Col lg="6">
                        <div className="text-right">
                          <button
                            type="button"
                            className="btn"
                            onClick={() =>
                              this.showConfirmDelete(
                                "ConfigConditionStep",
                                indexCon
                              )
                            }
                          >
                            <i className="fa fa-trash text-danger font-size-16"></i>
                          </button>
                        </div>
                      </Col>

                      <ConditionStep
                        stepCondition={steps}
                        listFormField={listFormField}
                        listStepWorkflow={listStepWorkflow}
                        indexCondition={indexCon}
                        indexStep={detailStep.indexStep}
                        resultConditionStep={this.resultConditionStep}
                      />
                    </div>
                  )
                )}

                <div className="text-right">
                  <button
                    type="button"
                    className="btn btn-md btn-primary waves-effect waves-light"
                    onClick={() => this.addConditionStep()}
                  >
                    <i className="fa fa-plus-circle mr-2 align-middle"></i> Thêm
                    nhánh chuyển hướng
                  </button>
                </div>
              </div>
            )}

            <ConfigStepField
              listFormField={listFormField}
              listStepField={detailStep.ObjFieldStep.FieldInput}
              typeStepField="FieldInput"
              resultStepField={this.resultStepField}
            />

            <ConfigStepField
              listFormField={listFormField}
              listStepField={detailStep.ObjFieldStep.FieldView}
              typeStepField="FieldView"
              resultStepField={this.resultStepField}
            />

            <div className="col-lg-12">
              <div className="form-group row">
                <label htmlFor="example-text-input" className="col-md-3">
                  Tài liệu đính kèm
                </label>
                <div className="col-md-9">
                  <div>
                    <input
                      type="checkbox"
                      className="form-check-input"
                      name="isAttachments"
                      onChange={this.changeFormStepModal}
                      checked={detailStep.ObjFieldStep.isAttachments}
                    />
                    <label className="ml-4">Thêm tài liệu đính kèm</label>
                  </div>
                  <div>
                    <input
                      type="checkbox"
                      className="form-check-input"
                      name="isViewAttachments"
                      onChange={this.changeFormStepModal}
                      checked={detailStep.ObjFieldStep.isViewAttachments}
                    />
                    <label className="ml-4">Xem tài liệu đính kèm</label>
                  </div>
                  <div>
                    <input
                      type="checkbox"
                      className="form-check-input"
                      name="isEditAttachments"
                      onChange={this.changeFormStepModal}
                      checked={detailStep.ObjFieldStep.isEditAttachments}
                    />
                    <label className="ml-4">Chỉnh sửa tài liệu đính kèm</label>
                  </div>
                  <div>
                    <input
                      type="checkbox"
                      className="form-check-input"
                      name="isDeleteAttachments"
                      onChange={this.changeFormStepModal}
                      checked={detailStep.ObjFieldStep.isDeleteAttachments}
                    />
                    <label className="ml-4">Xóa tài liệu đính kèm</label>
                  </div>
                  <div>
                    <input
                      type="checkbox"
                      className="form-check-input"
                      name="isDocuSignDocuments"
                      onChange={this.changeFormStepModal}
                      checked={detailStep.ObjFieldStep.isDocuSignDocuments}
                    />
                    <label className="ml-4">Ký tài liệu đính kèm</label>
                  </div>
                </div>
              </div>
            </div>

            <div className="col-lg-12">
              <div className="form-group row">
                <label htmlFor="example-text-input" className="col-md-3">
                  SLA
                </label>
                <div className="col-md-9">
                  <input
                    type="number"
                    className="form-control"
                    name="SLA"
                    onChange={this.changeFormStepModal}
                    value={detailStep.SLA}
                  />
                </div>
              </div>
            </div>

            <div className="col-lg-12">
              <div className="form-group row">
                <label htmlFor="example-text-input" className="col-md-3">
                  Mẫu Email đến người phê duyệt
                </label>
                <div className="col-md-9">
                  <select
                    className="form-control"
                    name="EmailSendApprover"
                    onChange={this.changeFormStepModal}
                    value={
                      detailStep.ObjEmailCfg.EmailSendApprover.ObjEmailTemplate
                        .TemplateId
                    }
                  >
                    <option value=""></option>
                    {listEmailTemplate
                      .filter((x) => x.TypeTemplate == 2)
                      .map((temp) => (
                        <option value={temp.ID} key={temp.ID}>
                          {temp.Title}
                        </option>
                      ))}
                  </select>
                </div>
              </div>
            </div>

            <div className="col-lg-12">
              <div className="form-group row">
                <label htmlFor="example-text-input" className="col-md-3">
                  Mẫu Email đến người yêu cầu
                </label>
                <div className="col-md-9">
                  <select
                    className="form-control"
                    name="EmailSendUserRequest"
                    onChange={this.changeFormStepModal}
                    value={
                      detailStep.ObjEmailCfg.EmailSendUserRequest
                        .ObjEmailTemplate.TemplateId
                    }
                  >
                    <option value=""></option>
                    {listEmailTemplate
                      .filter((x) => x.TypeTemplate == 1)
                      .map((temp) => (
                        <option value={temp.ID} key={temp.ID}>
                          {temp.Title}
                        </option>
                      ))}
                  </select>
                </div>
              </div>
            </div>
            {isNotNull(detailStep.SLA) ? (
              <div className="col-lg-12">
                <div className="form-group row">
                  <label htmlFor="example-text-input" className="col-md-3">
                    Mẫu Email báo deadline
                  </label>
                  <div className="col-md-9">
                    <select
                      className="form-control"
                      name="EmailSendDeadline"
                      onChange={this.changeFormStepModal}
                      value={
                        detailStep.ObjEmailCfg.EmailSendDeadline
                          .ObjEmailTemplate.TemplateId
                      }
                    >
                      <option value=""></option>
                      {listEmailTemplate
                        .filter((x) => x.TypeTemplate == 5)
                        .map((temp) => (
                          <option value={temp.ID} key={temp.ID}>
                            {temp.Title}
                          </option>
                        ))}
                    </select>
                  </div>
                </div>
              </div>
            ) : (
              ""
            )}

            {isNotNull(detailStep.SLA) &&
              detailStep.ObjEmailCfg.EmailSendDeadline.IsActive ? (
              <div className="col-lg-12">
                <div className="form-group row">
                  <label htmlFor="example-text-input" className="col-md-3">
                    Thời gian gửi thông báo trước deadline{" "}
                    <span className="text-danger">*</span>
                  </label>
                  <div className="col-md-9">
                    <input
                      type="number"
                      className="form-control"
                      name="NumberHours"
                      onChange={this.changeFormStepModal}
                      value={
                        detailStep.ObjEmailCfg.EmailSendDeadline.NumberHours
                      }
                    />
                  </div>
                </div>
              </div>
            ) : (
              ""
            )}
            <div className="col-lg-12">
              <div className="form-group row">
                <label htmlFor="example-text-input" className="col-md-3">
                  Mẫu Email thông báo
                </label>
                <div className="col-md-9">
                  <select
                    className="form-control"
                    name="EmailSendInform"
                    onChange={this.changeFormStepModal}
                    value={
                      detailStep.ObjEmailCfg.EmailSendInform.ObjEmailTemplate
                        .TemplateId
                    }
                  >
                    <option value=""></option>
                    {listEmailTemplate
                      .filter((x) => x.TypeTemplate == 3)
                      .map((temp) => (
                        <option value={temp.ID} key={temp.ID}>
                          {temp.Title}
                        </option>
                      ))}
                  </select>
                </div>
              </div>
            </div>
            {detailStep.ObjEmailCfg.EmailSendInform.IsActive ? (
              <div className="col-lg-12">
                <div className="form-group row">
                  <label htmlFor="example-text-input" className="col-md-3">
                    Cho phép gửi mail khi lưu
                  </label>
                  <div className="col-md-9">
                    <input
                      type="checkbox"
                      className="form-check-input"
                      name="AlowSaveSendMail"
                      onChange={this.changeFormStepModal}
                      checked={
                        detailStep.ObjEmailCfg.EmailSendInform.AlowSaveSendMail
                      }
                    />
                  </div>
                </div>
              </div>
            ) : (
              ""
            )}

            {detailStep.ObjEmailCfg.EmailSendInform.IsActive ? (
              <div className="col-lg-12">
                <div className="form-group row">
                  <label htmlFor="example-text-input" className="col-md-3">
                    Người nhận mặc định
                  </label>
                  <div className="col-md-9">
                    <input
                      className="form-control"
                      type="text"
                      placeholder="Search users"
                      name="InformToUserDefault"
                      onChange={this.changeSearchPeople.bind(this)}
                      value={
                        detailStep.ObjEmailCfg.EmailSendInform
                          .search_InformToUserDefault
                      }
                    />
                    {detailStep.ObjEmailCfg.EmailSendInform
                      .listSearch_InformToUserDefault.length > 0 ? (
                      <div className="suggesAuto">
                        {detailStep.ObjEmailCfg.EmailSendInform.listSearch_InformToUserDefault.map(
                          (people) => (
                            <div
                              key={people.Key}
                              className="suggtAutoItem"
                              onClick={() =>
                                this.selectSearch(
                                  people.Key,
                                  "InformToUserDefault"
                                )
                              }
                            >
                              <i className="fa fa-user"></i>{" "}
                              {people.DisplayText}
                              {` (${people.Description}`}
                              {isNotNull(people.EntityData.Title)
                                ? ` - ${people.EntityData.Title})`
                                : `)`}
                            </div>
                          )
                        )}
                      </div>
                    ) : (
                      ""
                    )}

                    {detailStep.ObjEmailCfg.EmailSendInform.ObjUserDefault
                      .length > 0 ? (
                      <div className="tagName">
                        {detailStep.ObjEmailCfg.EmailSendInform.ObjUserDefault.map(
                          (users, indexUs) => (
                            <div key={indexUs} className="wrapName">
                              <a
                                type="button"
                                onClick={() => this.removePeople(users.UserId)}
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
                </div>
              </div>
            ) : (
              ""
            )}

            {detailStep.ObjEmailCfg.EmailSendInform.IsActive ? (
              <div className="col-lg-12">
                <div className="form-group row">
                  <label htmlFor="example-text-input" className="col-md-3">
                    Người trong các trường dữ liệu
                  </label>
                  <div className="col-md-9">
                    <select
                      className="form-control"
                      name="InformUserField"
                      onChange={this.changeFormStepModal}
                      value={this.state.autuNull}
                    >
                      <option value=""></option>
                      {listFormField
                        .filter(
                          (fu) =>
                            fu.FieldType == objField.User ||
                            fu.FieldType == objField.UserMulti
                        )
                        .map((temp) => (
                          <option
                            value={temp.InternalName}
                            key={temp.InternalName}
                          >
                            {temp.FieldName}
                          </option>
                        ))}
                    </select>

                    {detailStep.ObjEmailCfg.EmailSendInform.ObjUserField
                      .length > 0 ? (
                      <div className="tagName">
                        {detailStep.ObjEmailCfg.EmailSendInform.ObjUserField.map(
                          (fieldInform, indexF) => (
                            <div key={indexF} className="wrapName">
                              <a
                                type="button"
                                onClick={() =>
                                  this.removeInformUserField(indexF)
                                }
                              >
                                <i className="fa fa-close text-danger"></i>
                              </a>{" "}
                              {FindTitleById(
                                listFormField,
                                "InternalName",
                                fieldInform,
                                "FieldName"
                              )}
                            </div>
                          )
                        )}
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

            <div className="col-lg-12">
              <div className="form-group row">
                <label htmlFor="example-text-input" className="col-md-3">
                  Nút chức năng
                  {/* <span className="text-danger">*</span> */}
                </label>
                <div className="col-md-9">
                  <select
                    className="form-control"
                    name="btnAction"
                    onChange={this.changeFormStepModal}
                    value={detailStep.btnAction}
                    multiple
                  >
                    <option value=""></option>
                    <option value="Save">Lưu</option>
                    <option value="Submit">Gửi đi</option>
                    <option value="Reset">Làm mới</option>
                    <option value="Approval">Phê duyệt</option>
                    <option value="ReAssign">Giao lại cho</option>
                    <option value="BackStep">Chuyển bước</option>
                    <option value="Reject">Từ chối</option>
                  </select>
                </div>
              </div>
            </div>

            {detailStep.btnAction.findIndex((x) => x == "BackStep") != -1 ? (
              <div className="col-lg-12">
                <div className="form-group row">
                  <label htmlFor="example-text-input" className="col-md-3">
                    Danh sách bước chuyển <span className="text-danger">*</span>
                  </label>
                  <div className="col-md-9">
                    <select
                      className="form-control"
                      name="ObjBackStep"
                      onChange={this.changeFormStepModal}
                      value={detailStep.ObjBackStep}
                      multiple
                    >
                      <option value=""></option>
                      {listStepWorkflow
                        .filter((x) => x.indexStep != detailStep.indexStep)
                        .map((temp) => (
                          <option value={temp.indexStep} key={temp.indexStep}>
                            {temp.StepTitle}
                          </option>
                        ))}
                      <option value="0">Hoàn thành</option>
                    </select>
                  </div>
                </div>
              </div>
            ) : (
              ""
            )}

            <div className="text-center mt-3 col-lg-12">
              <button
                type="button"
                className="btn btn-primary btn-md waves-effect waves-light mr-3"
                onClick={() => this.saveFormStepWorkflow()}
              >
                <i className="fa fa-floppy-o mr-2"></i>Lưu
              </button>
              <button
                type="button"
                className="btn btn-primary  btn-md waves-effect waves-light mr-3"
                onClick={() => this.resetFormStepWorkflow()}
              >
                <i className="fa fa-refresh mr-2"></i>Làm mới
              </button>
              <button
                type="button"
                className="btn btn-primary btn-md waves-effect waves-light"
                onClick={() => this.props.modalOpenClose(false, "wfStep")}
                data-dismiss="modal"
                aria-label="Close"
              >
                Đóng
              </button>
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
      </Modal>
    );
  }
}

export default AddStepTable;
