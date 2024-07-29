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
import ConfirmRequired from "../ConfirmRequired";
import ConfirmDelete from "../ConfirmDelete";

export default class ConfigSubProcess extends Component {
  constructor(props) {
    super(props);
    // console.log(this.props);

    this.state = {
      subProcess: this.props.subProcess,
      listFormField: this.props.listFormField,
      listFormFieldNew: this.props.listFormField,
      indexSubProcess: this.props.indexSubProcess,
      listWorkflow: this.props.listWorkflow,
      listDept: this.props.listDept,
      search_Originator: "",
      listSearch_Originator: [],
      typeSearch_Originator: "All Users",
      Required: false,
      RequiredText: "",
      isConfirm: false,
      textConfirm: "",
      objConfirm: {},
      listStepWorkflow: this.props.listStepWorkflow,
    };

    this.callSearchPeople = this.callSearchPeople.bind(this);
    this.modalOpenCloseAlert = this.modalOpenCloseAlert.bind(this);
    this.closeConfirm = this.closeConfirm.bind(this);
    this.resultConfirm = this.resultConfirm.bind(this);

    this.typingTimeout = null;
    this.fieldSearch = undefined;
  }

  componentWillReceiveProps(nextProps) {
    this.setState({
      subProcess: nextProps.subProcess,
      listFormField: nextProps.listFormField,
      indexSubProcess: nextProps.indexSubProcess,
      listWorkflow: nextProps.listWorkflow,
      listStepWorkflow: nextProps.listStepWorkflow,
      listDept: nextProps.listDept,
    });
    // console.log(nextProps);
  }

  async componentDidMount() {
    let processSub = returnObject(this.state.subProcess);
    let listFormFieldNew = returnArray(this.state.listFormFieldNew);

    if (isNotNull(processSub.WFTableId) && processSub.AlowDataTransfer) {
      let allFieldLoad = await shareService.GetWFFormField(
        processSub.WFTableId
      );
      let arrFieldSP = returnArray(processSub.ArrayFieldSub);
      allFieldLoad.map((fiels) => {
        if (
          fiels.FieldType != objField.LinkTags &&
          fiels.FieldType != objField.SPLinkWF &&
          fiels.FieldType != objField.ProcessControllers &&
          arrFieldSP.findIndex(
            (fils) => fils.InternalName == fiels.InternalName
          ) == -1
        ) {
          arrFieldSP.push(fiels);
        }
      });

      if (arrFieldSP.findIndex((x) => x.InternalName == "UserRequest") == -1) {
        arrFieldSP.push({
          ID: 0,
          FieldName: "Người yêu cầu",
          FieldType: objField.User,
          InternalName: "UserRequest",
          HelpText: "",
          Required: 0,
          ObjValidation: {},
          ObjSPField: "",
        });
      }

      if (arrFieldSP.findIndex((x) => x.InternalName == "UserApproval") == -1) {
        arrFieldSP.push({
          ID: 0,
          FieldName: "Người phê duyệt",
          FieldType: objField.User,
          InternalName: "UserApproval",
          HelpText: "",
          Required: 0,
          ObjValidation: {},
          ObjSPField: "",
        });
      }
      processSub.ArrayFieldSub = arrFieldSP;
    }

    listFormFieldNew.push({
      DefaultValue: "",
      FieldName: "ID",
      FieldType: objField.Number,
      HelpText: "",
      InternalName: "ID",
      ObjSPField: "",
      ObjValidation: "",
      Required: 0,
      listSearch_DefaultValue: [],
    });
    listFormFieldNew.push({
      DefaultValue: "",
      FieldName: "Người yêu cầu",
      FieldType: objField.User,
      HelpText: "",
      InternalName: "UserRequest",
      ObjSPField: "",
      ObjValidation: "",
      Required: 0,
      listSearch_DefaultValue: [],
    });
    listFormFieldNew.push({
      DefaultValue: "",
      FieldName: "Người phê duyệt",
      FieldType: objField.User,
      HelpText: "",
      InternalName: "UserApproval",
      ObjSPField: "",
      ObjValidation: "",
      Required: 0,
      listSearch_DefaultValue: [],
    });

    await this.setState({
      subProcess: processSub,
      listFormFieldNew: listFormFieldNew,
    });
    // if (isNotNull(processSub.WFTableId)) {
    //   this.GetOriginatorSubProcess(processSub.WFTableId);
    //   let wfField = await shareService.GetWFFormField(processSub.WFTableId);
    //   if (
    //     wfField &&
    //     processSub.ArrayFieldSub &&
    //     wfField.length > 0 &&
    //     wfField.length > processSub.ArrayFieldSub.length
    //   ) {
    //     processSub.ArrayFieldSub = wfField;
    //   }
    //   this.setState({ subProcess: processSub });
    // }
  }

  async GetOriginatorSubProcess(wfId) {
    if (isNotNull(wfId)) {
      let tableWF = this.state.listWorkflow.find((x) => x.WFId == wfId);
      if (isNotNull(tableWF)) {
        let listSearch = [];
        let typeSearch = "All Users";
        if (tableWF.WhoIsUsed == "Users") {
          listSearch = tableWF.peopleList;
          typeSearch = "Users";
        }
        if (tableWF.WhoIsUsed == "Department") {
          typeSearch = "Department";
          let dept = this.state.listDept.find(
            (x) => x.Code == tableWF.Department
          );
          if (isNotNull(dept)) {
            listSearch = dept.peopleList;
          }
        }
        this.setState({
          listSearch_Originator: listSearch,
          typeSearch_Originator: typeSearch,
        });
      }
    }
  }

  // nhập giá trị để tìm kiếm người
  async changeSearchPeople(event) {
    await this.setState({ search_Originator: event.target.value });

    clearTimeout(this.typingTimeout);
    this.typingTimeout = setTimeout(this.callSearchPeople, 1000);
  }

  // set giá trị cho danh sách người tìm kiếm
  async callSearchPeople() {
    let PeoplePicker = await shareService.searchPeoplePicker(
      this.state.search_Originator
    );
    this.setState({ listSearch_Originator: PeoplePicker });
  }

  // Chọn người từ trong danh sách tìm kiếm
  async selectSearch(Key) {
    let objUser = await shareService.getInforUser(Key);

    let processSub = returnObject(this.state.subProcess);
    let objInitialization = returnObject(processSub.ObjInitialization);
    let UserApprover = returnArray(objInitialization.UserApprover);
    if (
      processSub.TypeOfInitialization == "Save" &&
      isNotNull(objUser.UserId) &&
      UserApprover.findIndex((x) => x.UserId == objUser.UserId) == -1
    ) {
      UserApprover.push(objUser);
    } else {
      UserApprover = [objUser];
    }
    objInitialization.UserApprover = UserApprover;
    processSub.ObjInitialization = objInitialization;
    await this.setState({
      subProcess: processSub,
      listSearch_Originator: [],
      search_Originator: "",
    });

    this.props.resultSubProcess(processSub, this.state.indexSubProcess);
  }

  // Xóa danh sách người đã chọn
  async removePeople(IdUser) {
    let processSub = returnObject(this.state.subProcess);
    let objInitialization = returnObject(processSub.ObjInitialization);
    let UserApprover = returnArray(objInitialization.UserApprover);
    UserApprover.splice(IdUser, 1);
    objInitialization.UserApprover = UserApprover;
    processSub.ObjInitialization = objInitialization;
    // await this.setState({ subProcess: processSub });
    await this.props.resultSubProcess(processSub, this.state.indexSubProcess);
  }

  async changeFormWFSub(event) {
    let nameState = event.target.name;
    let valueState = event.target.value;
    let processSub = returnObject(this.state.subProcess);
    let objInitialization = returnObject(processSub.ObjInitialization);

    if (nameState == "StepWFTableId") {
      processSub.WFTableId = valueState;
      processSub.WFTableTitle = event.target.selectedOptions[0].text;
      processSub.AlowDataTransfer = false;
      processSub.Waitting = false;
      (processSub.TypeOfInitialization = "Save"),
        (objInitialization.AlowLaunch = false);
      objInitialization.Step = "";
      objInitialization.TypeUserApproval = "";
      objInitialization.UserApprover = [];
      processSub.ObjInitialization = objInitialization;

      if (isNotNull(processSub.WFTableId)) {
        processSub.IsActive = true;
        await this.GetOriginatorSubProcess(processSub.WFTableId);
      } else {
        processSub.IsActive = false;
        await this.setState({
          listSearch_Originator: [],
          typeSearch_Originator: "All Users",
        });
      }
    }
    if (nameState == "WaittingStepWF") {
      processSub.Waitting = event.target.checked;
      if (processSub.Waitting && objInitialization.AlowLaunch) {
        objInitialization.Step = "";
        objInitialization.TypeUserApproval = "";
        processSub.ObjInitialization = objInitialization;
      }
    }
    if (nameState == "TypeOfInitialization") {
      processSub.TypeOfInitialization = valueState;
      objInitialization.UserApprover = [];
      processSub.ObjInitialization = objInitialization;
    }
    if (nameState == "AlowLaunch") {
      objInitialization.AlowLaunch = event.target.checked;
      // objInitialization.TypeUserApproval = "";
      // objInitialization.UserApprover = [];
      if (
        objInitialization.AlowLaunch == true &&
        objInitialization.TypeUserApproval == "ShowDialog"
      ) {
        objInitialization.TypeUserApproval = "";
        objInitialization.UserApprover = [];
      }
      if (processSub.Waitting && objInitialization.AlowLaunch) {
        objInitialization.Step = "";
        objInitialization.TypeUserApproval = "";
      }
      processSub.ObjInitialization = objInitialization;
    }
    if (nameState == "TypeUserApprovalSub") {
      objInitialization.TypeUserApproval = valueState;
      objInitialization.UserApprover = [];
      processSub.ObjInitialization = objInitialization;
    }
    if (nameState == "UserApprovalSub") {
      if (processSub.TypeOfInitialization == "Save") {
        let user = this.state.listSearch_Originator.find(
          (x) => x.UserId == valueState
        );
        let userOriginator = returnArray(objInitialization.UserApprover);
        if (
          isNotNull(user) &&
          isNotNull(user.UserId) &&
          userOriginator.findIndex((x) => x.UserId == user.UserId) == -1
        ) {
          userOriginator.push(user);
        }

        objInitialization.UserApprover = userOriginator;
      } else {
        let userSingle = this.state.listSearch_Originator.find(
          (x) => x.UserId == valueState
        );
        if (isNotNull(userSingle) && isNotNull(userSingle.UserId)) {
          objInitialization.UserApprover = [userSingle];
        }
      }
      processSub.ObjInitialization = objInitialization;
    }
    if (nameState == "AlowDataTransfer") {
      processSub.AlowDataTransfer = event.target.checked;
      if (isNotNull(processSub.WFTableId)) {
        if (processSub.AlowDataTransfer == true) {
          processSub.ArrayFieldSub = await shareService.GetWFFormField(
            processSub.WFTableId
          );
          if (
            processSub.ArrayFieldSub.findIndex(
              (x) => x.InternalName == "UserRequest"
            ) == -1
          ) {
            processSub.ArrayFieldSub.push({
              ID: 0,
              FieldName: "Người yêu cầu",
              FieldType: objField.User,
              InternalName: "UserRequest",
              HelpText: "",
              Required: 0,
              ObjValidation: {},
              ObjSPField: "",
            });
          }

          if (
            processSub.ArrayFieldSub.findIndex(
              (x) => x.InternalName == "UserApproval"
            ) == -1
          ) {
            processSub.ArrayFieldSub.push({
              ID: 0,
              FieldName: "Người phê duyệt",
              FieldType: objField.User,
              InternalName: "UserApproval",
              HelpText: "",
              Required: 0,
              ObjValidation: {},
              ObjSPField: "",
            });
          }
          processSub.CorrespondingFields = [];
          processSub.ArrayFieldSub.map((x) => {
            if (
              this.state.listFormField.findIndex(
                (y) => y.FieldType == x.FieldType
              ) != -1
            ) {
              processSub.CorrespondingFields.push({
                FieldSub: {
                  FieldName: x.FieldName,
                  FieldType: x.FieldType,
                  InternalName: x.InternalName,
                },
                FieldParent: "",
                DataTransfer: "",
              });
            }
          });
        } else {
          processSub.CorrespondingFields = [];
        }
      } else {
        processSub.ArrayFieldSub = [];
      }
    }
    if (nameState == "Step") {
      objInitialization.Step = valueState;
      processSub.ObjInitialization = objInitialization;
    }
    if (nameState == "Field") {
      objInitialization.Field = valueState;
      processSub.ObjInitialization = objInitialization;
    }
    // await this.setState({ subProcess: processSub });
    this.props.resultSubProcess(processSub, this.state.indexSubProcess);
  }

  removeFormCorrespondingFields(index) {
    // let processSub = returnObject(this.state.subProcess);
    // let CorrespondingFields = returnArray(processSub.CorrespondingFields);
    // CorrespondingFields.splice(index, 1);
    // processSub.CorrespondingFields = CorrespondingFields;
    // // this.setState({ subProcess: processSub });
    // this.props.resultSubProcess(processSub, this.state.indexSubProcess);
    this.setState({
      isConfirm: true,
      textConfirm: "Bạn chắc chắn muốn xóa dòng đồng bộ dữ liệu này?",
      objConfirm: {
        indexArr: index,
      },
    });
  }

  AddFormCorrespondingFields() {
    let objData = {
      FieldSub: "",
      FieldParent: "",
      DataTransfer: "",
    };

    let processSub = returnObject(this.state.subProcess);
    let CorrespondingFields = returnArray(processSub.CorrespondingFields);
    if (CorrespondingFields.length > 0) {
      let txtAlerRequired = checkFormCorrespondingFields(CorrespondingFields);
      if (isNotNull(txtAlerRequired)) {
        this.setState({
          RequiredText:
            "Thông tin đồng bộ dữ liệu Quy trình con " +
            (this.state.indexSubProcess + 1) +
            " chưa đầy đủ: \n " +
            txtAlerRequired +
            "",
          Required: true,
        });
        return;
      } else {
        CorrespondingFields.push(objData);
      }
    } else {
      CorrespondingFields.push(objData);
    }
    processSub.CorrespondingFields = CorrespondingFields;
    // this.setState({ subProcess: processSub });
    this.props.resultSubProcess(processSub, this.state.indexSubProcess);
  }

  changeFormCorrespondingFields(event, index) {
    let valueState = event.target.value;
    let nameState = event.target.name;
    let processSub = returnObject(this.state.subProcess);
    let CorrespondingFields1 = returnArray(processSub.CorrespondingFields);
    let CorrespondingFields = returnArray(
      processSub.CorrespondingFields.filter(
        (field, indexField) => indexField != index
      )
    );
    let CorrespondingFieldsItem = returnObject(CorrespondingFields1[index]);
    let FieldSub = returnObject(CorrespondingFieldsItem.FieldSub);
    let FieldParent = returnObject(CorrespondingFieldsItem.FieldParent);
    let DataTransfer = CorrespondingFieldsItem.DataTransfer;

    if (nameState == "FieldSub") {
      if (isNotNull(valueState)) {
        let field = processSub.ArrayFieldSub.find(
          (x) => x.InternalName == valueState
        );
        let textCheck1 = this.checkDuplicateData(
          CorrespondingFields,
          DataTransfer,
          field,
          FieldParent
        );
        // console.log(textCheck1);
        if (isNotNull(textCheck1)) {
          this.setState({
            RequiredText:
              "Đồng bộ dữ liệu bị trùng(cặp dữ liệu Cha - Con): \n " +
              textCheck1 +
              "",
            Required: true,
          });
          // alert(
          //   "Đồng bộ dữ liệu bị trùng(cặp dữ liệu Cha - Con): \n" + textCheck1
          // );
          FieldSub = "";
        } else {
          FieldSub = {
            FieldName: field.FieldName,
            FieldType: field.FieldType,
            InternalName: field.InternalName,
          };
        }
      } else {
        FieldSub = "";
      }
      if (
        (FieldSub.InternalName == "StatusStep" ||
          FieldSub.InternalName == "UserRequest" ||
          FieldSub.InternalName == "UserApproval" ||
          FieldParent.InternalName == "ID" ||
          FieldParent.InternalName == "StatusStep" ||
          FieldParent.InternalName == "UserRequest" ||
          FieldParent.InternalName == "UserApproval") &&
        isNotNull(CorrespondingFieldsItem.DataTransfer) &&
        CorrespondingFieldsItem.DataTransfer != "DataTransmitted"
      ) {
        this.setState({
          RequiredText: "Chỉ đồng bộ dữ liệu trường này từ cha sang con !",
          Required: true,
        });
        FieldSub = "";
      }
    }
    if (nameState == "FieldParent") {
      if (isNotNull(valueState)) {
        let field2 = this.state.listFormField.find(
          (x) => x.InternalName == valueState
        );
        if (valueState == "ID" || valueState == "StatusStep") {
          field2 = {
            FieldName: valueState,
            FieldType: objField.Number,
            InternalName: valueState,
          };
        }
        if (valueState == "UserRequest" || valueState == "UserApproval") {
          field2 = {
            FieldName: valueState,
            FieldType: objField.User,
            InternalName: valueState,
          };
        }
        if (
          field2 &&
          FieldSub &&
          FieldSub.FieldType == objField.Text &&
          field2.FieldType == objField.AutoSystemNumberIMG &&
          DataTransfer != objDataTransfer.DataTransmitted
        ) {
          DataTransfer = objDataTransfer.DataTransmitted;
        }
        let textCheck2 = this.checkDuplicateData(
          CorrespondingFields,
          DataTransfer,
          FieldSub,
          field2
        );
        // console.log(textCheck2);
        if (isNotNull(textCheck2)) {
          this.setState({
            RequiredText:
              "Đồng bộ dữ liệu bị trùng(cặp dữ liệu Cha - Con): \n " +
              textCheck2 +
              "",
            Required: true,
          });
          // alert(
          //   "Đồng bộ dữ liệu bị trùng(cặp dữ liệu Cha - Con): \n" + textCheck2
          // );
          FieldParent = "";
        } else {
          FieldParent = {
            FieldName: field2.FieldName,
            FieldType: field2.FieldType,
            InternalName: field2.InternalName,
          };
        }
      } else {
        FieldParent = "";
      }
      if (
        (FieldSub.InternalName == "StatusStep" ||
          FieldSub.InternalName == "UserRequest" ||
          FieldSub.InternalName == "UserApproval" ||
          FieldParent.InternalName == "ID" ||
          FieldParent.InternalName == "StatusStep" ||
          FieldParent.InternalName == "UserRequest" ||
          FieldParent.InternalName == "UserApproval") &&
        isNotNull(CorrespondingFieldsItem.DataTransfer) &&
        CorrespondingFieldsItem.DataTransfer != "DataTransmitted"
      ) {
        this.setState({
          RequiredText: "Chỉ đồng bộ dữ liệu trường này từ cha sang con !",
          Required: true,
        });
        FieldParent = "";
      }
    }
    if (nameState == "arrayDataTransfer") {
      if (isNotNull(FieldSub.InternalName)) {
        let textCheck3 = this.checkDuplicateData(
          CorrespondingFields,
          valueState,
          FieldSub,
          FieldParent
        );
        // console.log(textCheck3);
        if (isNotNull(textCheck3)) {
          this.setState({
            RequiredText:
              "Đồng bộ dữ liệu bị trùng(cặp dữ liệu Cha - Con): \n " +
              textCheck3 +
              "",
            Required: true,
          });
          // alert(
          //   "Đồng bộ dữ liệu bị trùng(cặp dữ liệu Cha - Con): \n" + textCheck3
          // );
          DataTransfer = "";
        } else {
          DataTransfer = valueState;
        }
      } else {
        this.setState({
          RequiredText: "Bạn chưa chọn trường dữ liệu con",
          Required: true,
        });
        // alert("Bạn chưa chọn trường dữ liệu con");
        DataTransfer = "";
      }
      if (
        (FieldSub.InternalName == "StatusStep" ||
          FieldSub.InternalName == "UserRequest" ||
          FieldSub.InternalName == "UserApproval" ||
          FieldParent.InternalName == "ID" ||
          FieldParent.InternalName == "StatusStep" ||
          FieldParent.InternalName == "UserRequest" ||
          FieldParent.InternalName == "UserApproval") &&
        valueState != "DataTransmitted"
      ) {
        this.setState({
          RequiredText: "Chỉ đồng bộ dữ liệu trường này từ cha sang con !",
          Required: true,
        });
        DataTransfer = "";
      }
    }

    CorrespondingFieldsItem.DataTransfer = DataTransfer;
    CorrespondingFieldsItem.FieldParent = FieldParent;
    CorrespondingFieldsItem.FieldSub = FieldSub;
    CorrespondingFields1[index] = CorrespondingFieldsItem;
    processSub.CorrespondingFields = CorrespondingFields1;
    // this.setState({ subProcess: processSub });
    this.props.resultSubProcess(processSub, this.state.indexSubProcess);
  }

  checkDuplicateData(CorrespondingFields, DataTransfer, FieldSub, FieldParent) {
    let textRequired = "";
    if (isNotNull(DataTransfer)) {
      if (
        DataTransfer == objDataTransfer.DataTransmitted &&
        isNotNull(FieldSub.InternalName)
      ) {
        let arrTransmitted = CorrespondingFields.filter(
          (cor) =>
            cor.FieldSub.InternalName == FieldSub.InternalName &&
            (cor.DataTransfer == objDataTransfer.DataTransmitted ||
              cor.DataTransfer == objDataTransfer.DataSynchronized)
        );

        if (arrTransmitted.length > 0) {
          arrTransmitted.map((field1) => {
            if (isNotNull(field1.FieldParent.FieldName)) {
              textRequired +=
                CheckNull(field1.FieldParent.FieldName) +
                " - " +
                CheckNull(FieldSub.FieldName) +
                " \n";
            } else {
              textRequired +=
                CheckNull(FieldParent.FieldName) +
                " - " +
                CheckNull(FieldSub.FieldName) +
                " \n";
            }
          });
        }
      }
      if (
        DataTransfer == objDataTransfer.DataReceived &&
        isNotNull(FieldParent.InternalName)
      ) {
        let arrReceived = CorrespondingFields.filter(
          (cor) =>
            cor.FieldParent.InternalName == FieldParent.InternalName &&
            (cor.DataTransfer == objDataTransfer.DataReceived ||
              cor.DataTransfer == objDataTransfer.DataSynchronized)
        );
        if (arrReceived.length > 0) {
          arrReceived.map((field2) => {
            if (isNotNull(field2.FieldSub.FieldName)) {
              textRequired +=
                CheckNull(FieldParent.FieldName) +
                " - " +
                CheckNull(field2.FieldSub.FieldName) +
                " \n";
            } else {
              textRequired +=
                CheckNull(FieldParent.FieldName) +
                " - " +
                CheckNull(FieldSub.FieldName) +
                " \n";
            }
          });
        }
      }
      if (
        DataTransfer == objDataTransfer.DataSynchronized &&
        (isNotNull(FieldParent.InternalName) ||
          isNotNull(FieldSub.InternalName))
      ) {
        let arrSynchronized = CorrespondingFields.filter(
          (cor) =>
            (cor.FieldSub.InternalName == FieldSub.InternalName &&
              (cor.DataTransfer == objDataTransfer.DataTransmitted ||
                cor.DataTransfer == objDataTransfer.DataSynchronized)) ||
            (cor.FieldParent.InternalName == FieldParent.InternalName &&
              (cor.DataTransfer == objDataTransfer.DataReceived ||
                cor.DataTransfer == objDataTransfer.DataSynchronized))
        );
        if (arrSynchronized.length > 0) {
          arrSynchronized.map((field3) => {
            if (
              isNotNull(field3.FieldParent.FieldName) &&
              !isNotNull(field3.FieldSub.FieldName)
            ) {
              textRequired +=
                CheckNull(field3.FieldParent.FieldName) +
                " - " +
                CheckNull(FieldSub.FieldName) +
                " \n";
            } else if (
              !isNotNull(field3.FieldParent.FieldName) &&
              isNotNull(field3.FieldSub.FieldName)
            ) {
              textRequired +=
                CheckNull(FieldParent.FieldName) +
                " - " +
                CheckNull(field3.FieldSub.FieldName) +
                " \n";
            } else {
              textRequired +=
                CheckNull(field3.FieldParent.FieldName) +
                " - " +
                CheckNull(field3.FieldSub.FieldName) +
                " \n";
            }
          });
        }
      }
    }
    return textRequired;
  }

  async modalOpenCloseAlert() {
    await this.setState({ Required: false });
  }

  async resultConfirm(objConfirm) {
    await this.closeConfirm();
    let processSub = returnObject(this.state.subProcess);
    let CorrespondingFields = returnArray(processSub.CorrespondingFields);
    CorrespondingFields.splice(objConfirm.indexArr, 1);
    processSub.CorrespondingFields = CorrespondingFields;
    // this.setState({ subProcess: processSub });
    this.props.resultSubProcess(processSub, this.state.indexSubProcess);
  }

  async closeConfirm() {
    await this.setState({ isConfirm: false, textConfirm: "", objConfirm: {} });
  }

  render() {
    const {
      subProcess,
      listFormField,
      listFormFieldNew,
      indexSubProcess,
      listWorkflow,
      isConfirm,
      textConfirm,
      objConfirm,
      listStepWorkflow,
    } = this.state;
    return (
      <div className="col-lg-12">
        <div className="row">
          <div className="col-lg-12">
            <div className="form-group row">
              <label htmlFor="example-text-input" className="col-md-3">
                Tên quy trình con <span className="text-danger">*</span>
              </label>
              <div className="col-md-9">
                <select
                  className="form-control"
                  name="StepWFTableId"
                  onChange={(event) => this.changeFormWFSub(event)}
                  value={subProcess.WFTableId}
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

          {isNotNull(subProcess.WFTableId) ? (
            <div className="col-lg-12">
              <div className="form-group row">
                <label htmlFor="example-text-input" className="col-md-3">
                  Đồng bộ
                </label>
                <div className="col-md-9">
                  <input
                    type="checkbox"
                    className="form-check-input"
                    name="WaittingStepWF"
                    onChange={(event) => this.changeFormWFSub(event)}
                    checked={subProcess.Waitting}
                  />
                </div>
              </div>
            </div>
          ) : (
            ""
          )}

          {isNotNull(subProcess.WFTableId) ? (
            <div className="col-lg-12">
              <div className="form-group row">
                <label htmlFor="example-text-input" className="col-md-3">
                  Tự động khởi chạy
                </label>
                <div className="col-md-9">
                  <input
                    type="checkbox"
                    className="form-check-input"
                    name="AlowLaunch"
                    onChange={(event) => this.changeFormWFSub(event)}
                    checked={subProcess.ObjInitialization.AlowLaunch}
                  />
                </div>
              </div>
            </div>
          ) : (
            ""
          )}
          {isNotNull(subProcess.WFTableId) ? (
            <div className="col-lg-12">
              <div className="form-group row">
                <label htmlFor="example-text-input" className="col-md-3">
                  Chọn loại khởi tạo
                </label>
                <div className="col-md-9">
                  <select
                    className="form-control"
                    name="TypeOfInitialization"
                    onChange={(event) => this.changeFormWFSub(event)}
                    value={subProcess.TypeOfInitialization}
                  >
                    <option value="Save">Lưu</option>
                    <option value="Approval">Gửi đi</option>
                  </select>
                </div>
              </div>
            </div>
          ) : (
            ""
          )}
          {isNotNull(subProcess.WFTableId) ? (
            <div className="col-lg-12">
              <div className="form-group row">
                <label htmlFor="example-text-input" className="col-md-3">
                  Chọn loại người khởi tạo{" "}
                  <span className="text-danger">*</span>
                </label>
                <div className="col-md-9">
                  <select
                    className="form-control"
                    name="TypeUserApprovalSub"
                    onChange={(event) => this.changeFormWFSub(event)}
                    value={subProcess.ObjInitialization.TypeUserApproval}
                  >
                    <option value=""></option>
                    <option value="Approval">Người phê duyệt</option>
                    <option value="Designator">Người chỉ định</option>
                    {subProcess.ObjInitialization.AlowLaunch == true ? (
                      ""
                    ) : (
                      <option value="ShowDialog">Chỉ định bằng tay</option>
                    )}
                    {subProcess.ObjInitialization.AlowLaunch &&
                    subProcess.Waitting ? (
                      ""
                    ) : (
                      <option value="UserApprovalInStep">
                        Người xử lý tại bước
                      </option>
                    )}
                    <option value="ApproverInField">Trường dữ liệu</option>
                  </select>
                </div>
              </div>
            </div>
          ) : (
            ""
          )}

          {isNotNull(subProcess.WFTableId) &&
          subProcess.ObjInitialization.TypeUserApproval == "Designator" ? (
            this.state.typeSearch_Originator == "All Users" ? (
              <div className="col-lg-12">
                <div className="form-group row">
                  <label htmlFor="example-text-input" className="col-md-3">
                    Chọn người chỉ định <span className="text-danger">*</span>
                  </label>
                  <div className="col-md-9">
                    <input
                      className="form-control"
                      type="text"
                      placeholder="Search users"
                      name="SearchOriginator"
                      onChange={(event) => this.changeSearchPeople(event)}
                      value={this.state.search_Originator}
                    />
                    {this.state.listSearch_Originator.length > 0 ? (
                      <div className="suggesAuto">
                        {this.state.listSearch_Originator.map((people) => (
                          <div
                            key={people.Key}
                            className="suggtAutoItem"
                            onClick={() => this.selectSearch(people.Key)}
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

                    {subProcess.ObjInitialization.UserApprover.length > 0 ? (
                      <div className="tagName">
                        {subProcess.ObjInitialization.UserApprover.map(
                          (users, indexUs) => (
                            <div key={indexUs} className="wrapName">
                              <a
                                type="button"
                                onClick={() => this.removePeople(indexUs)}
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
              <div className="col-lg-12">
                <div className="form-group row">
                  <label htmlFor="example-text-input" className="col-md-3">
                    Chọn người chỉ định <span className="text-danger">*</span>
                  </label>
                  <div className="col-md-9">
                    <select
                      className="form-control"
                      name="UserApprovalSub"
                      value={
                        subProcess.TypeOfInitialization == "Approval" &&
                        subProcess.ObjInitialization.UserApprover.length > 0
                          ? subProcess.ObjInitialization.UserApprover[0].UserId
                          : ""
                      }
                      onChange={(event) => this.changeFormWFSub(event)}
                    >
                      <option value=""></option>
                      {this.state.listSearch_Originator.map((user) => (
                        <option value={user.UserId} key={user.UserId}>
                          {user.UserTitle}
                        </option>
                      ))}
                    </select>
                    {subProcess.TypeOfInitialization == "Save" &&
                    subProcess.ObjInitialization.UserApprover.length > 0 ? (
                      <div className="tagName">
                        {subProcess.ObjInitialization.UserApprover.map(
                          (users, indexUs) => (
                            <div key={indexUs} className="wrapName">
                              <a
                                type="button"
                                onClick={() => this.removePeople(indexUs)}
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
            )
          ) : isNotNull(subProcess.WFTableId) &&
            subProcess.ObjInitialization.TypeUserApproval ==
              "UserApprovalInStep" ? (
            <div className="col-lg-12">
              <div className="form-group row">
                <label htmlFor="example-text-input" className="col-md-3">
                  Chọn bước <span className="text-danger">*</span>
                </label>
                <div className="col-md-9">
                  <select
                    className="form-control"
                    name="Step"
                    onChange={(event) => this.changeFormWFSub(event)}
                    value={subProcess.ObjInitialization.Step}
                  >
                    <option value=""></option>
                    {listStepWorkflow.map((step) => (
                      <option value={step.indexStep}>{step.StepTitle}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          ) : isNotNull(subProcess.WFTableId) &&
            subProcess.ObjInitialization.TypeUserApproval ==
              "ApproverInField" ? (
            <div className="col-lg-12">
              <div className="form-group row">
                <label htmlFor="example-text-input" className="col-md-3">
                  Chọn trường dữ liệu <span className="text-danger">*</span>
                </label>
                <div className="col-md-9">
                  <select
                    className="form-control"
                    name="Field"
                    onChange={(event) => this.changeFormWFSub(event)}
                    value={subProcess.ObjInitialization.Field}
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

          {isNotNull(subProcess.WFTableId) ? (
            <div className="col-lg-12">
              <div className="form-group row">
                <label htmlFor="example-text-input" className="col-md-3">
                  Cho phép đồng bộ dữ liệu quy trình cha và con
                </label>
                <div className="col-md-9">
                  <input
                    type="checkbox"
                    className="form-check-input"
                    name="AlowDataTransfer"
                    onChange={(event) => this.changeFormWFSub(event)}
                    checked={subProcess.AlowDataTransfer}
                  />
                </div>
              </div>
            </div>
          ) : (
            ""
          )}

          {isNotNull(subProcess.WFTableId) && subProcess.AlowDataTransfer ? (
            <div className="col-lg-12">
              {isNotNull(subProcess.CorrespondingFields) ? (
                <div className="form-group row">
                  <div className="col-md-12">
                    <div className="table-responsive mt-3">
                      <Table className="table table-striped mb-0">
                        <thead>
                          <tr>
                            <th>
                              Trường quy trình con{" "}
                              <span className="text-danger">*</span>
                            </th>

                            <th>
                              Loại đồng bộ{" "}
                              <span className="text-danger">*</span>
                            </th>
                            <th>
                              Trường quy trình cha{" "}
                              <span className="text-danger">*</span>
                            </th>
                            <th className="text-right">Hoạt động</th>
                          </tr>
                        </thead>
                        <tbody>
                          {subProcess.CorrespondingFields.map(
                            (stepCon, index) => (
                              <tr key={index}>
                                <td>
                                  <select
                                    className="form-control"
                                    name="FieldSub"
                                    onChange={(event) =>
                                      this.changeFormCorrespondingFields(
                                        event,
                                        index
                                      )
                                    }
                                    value={
                                      isNotNull(stepCon.FieldSub)
                                        ? stepCon.FieldSub.InternalName
                                        : ""
                                    }
                                  >
                                    <option value=""></option>
                                    {subProcess.ArrayFieldSub.map(
                                      (conArr, indexFieldSub) => (
                                        <option
                                          value={conArr.InternalName}
                                          label={conArr.FieldName}
                                          key={indexFieldSub}
                                        ></option>
                                      )
                                    )}
                                  </select>
                                </td>
                                <td>
                                  <select
                                    className="form-control"
                                    name="arrayDataTransfer"
                                    onChange={(event) =>
                                      this.changeFormCorrespondingFields(
                                        event,
                                        index
                                      )
                                    }
                                    value={stepCon.DataTransfer}
                                  >
                                    <option value=""></option>
                                    {stepCon.FieldSub.FieldType ==
                                    objField.AutoSystemNumberIMG ? (
                                      <option
                                        value={arrayDataTransfer[1].Code}
                                        label={arrayDataTransfer[1].Title}
                                      ></option>
                                    ) : stepCon.FieldSub.FieldType ==
                                        objField.Text &&
                                      stepCon.FieldParent &&
                                      stepCon.FieldParent.FieldType ==
                                        objField.AutoSystemNumberIMG ? (
                                      <option
                                        value={arrayDataTransfer[0].Code}
                                        label={arrayDataTransfer[0].Title}
                                      ></option>
                                    ) : (
                                      arrayDataTransfer.map(
                                        (conArr, indexCor) => (
                                          <option
                                            value={conArr.Code}
                                            label={conArr.Title}
                                            key={indexCor}
                                          ></option>
                                        )
                                      )
                                    )}
                                    {/* {arrayDataTransfer.map(
                                      (conArr, indexCor) => (
                                        <option
                                          value={conArr.Code}
                                          label={conArr.Title}
                                          key={indexCor}
                                        ></option>
                                      )
                                    )} */}
                                  </select>
                                </td>
                                <td>
                                  <select
                                    className="form-control"
                                    name="FieldParent"
                                    onChange={(event) =>
                                      this.changeFormCorrespondingFields(
                                        event,
                                        index
                                      )
                                    }
                                    value={
                                      isNotNull(stepCon.FieldParent)
                                        ? stepCon.FieldParent.InternalName
                                        : ""
                                    }
                                  >
                                    <option value=""></option>
                                    {/* {stepCon.FieldSub.InternalName=="StatusStep" ?
                                     <option
                                     value="StatusStep"
                                     label="Trạng thái"
                                   ></option>
                                    :   */}
                                    {stepCon.FieldSub.FieldType ==
                                    objField.AutoSystemNumberIMG
                                      ? listFormFieldNew
                                          .filter(
                                            (x) => x.FieldType == objField.Text
                                          )
                                          .map(
                                            (fieldParent, indexFieldParent) => (
                                              <option
                                                value={fieldParent.InternalName}
                                                label={fieldParent.FieldName}
                                                key={indexFieldParent}
                                              ></option>
                                            )
                                          )
                                      : stepCon.FieldSub.FieldType ==
                                        objField.Text
                                      ? listFormFieldNew
                                          .filter(
                                            (x) =>
                                              x.FieldType == objField.Text ||
                                              x.FieldType ==
                                                objField.AutoSystemNumberIMG
                                          )
                                          .map(
                                            (fieldParent, indexFieldParent) => (
                                              <option
                                                value={fieldParent.InternalName}
                                                label={fieldParent.FieldName}
                                                key={indexFieldParent}
                                              ></option>
                                            )
                                          )
                                      : listFormFieldNew
                                          .filter(
                                            (x) =>
                                              x.FieldType ==
                                              stepCon.FieldSub.FieldType
                                          )
                                          .map(
                                            (fieldParent, indexFieldParent) => (
                                              <option
                                                value={fieldParent.InternalName}
                                                label={fieldParent.FieldName}
                                                key={indexFieldParent}
                                              ></option>
                                            )
                                          )}
                                    {/* {listFormFieldNew
                                      .filter(
                                        (x) =>
                                          x.FieldType ==
                                          stepCon.FieldSub.FieldType
                                      )
                                      .map((fieldParent, indexFieldParent) => (
                                        <option
                                          value={fieldParent.InternalName}
                                          label={fieldParent.FieldName}
                                          key={indexFieldParent}
                                        ></option>
                                      ))} */}
                                  </select>
                                </td>
                                <td>
                                  <div className="button-items text-right">
                                    <button
                                      type="button"
                                      className="btn"
                                      onClick={() =>
                                        this.removeFormCorrespondingFields(
                                          index
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
                      </Table>
                    </div>
                  </div>
                </div>
              ) : (
                ""
              )}

              <div className="text-right mb-3">
                <button
                  type="button"
                  className="btn btn-md btn-primary waves-effect waves-light"
                  onClick={() => this.AddFormCorrespondingFields()}
                >
                  <i className="fa fa-plus-circle mr-2 align-middle"></i> Thêm
                  trường dữ liệu
                </button>
              </div>
            </div>
          ) : (
            ""
          )}
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
