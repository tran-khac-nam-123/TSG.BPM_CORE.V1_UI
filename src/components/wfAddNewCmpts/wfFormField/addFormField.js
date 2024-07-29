import React, { Component } from "react";

import {
  isNotNull,
  CheckNull,
  CheckNullSetZero,
  returnArray,
  returnObject,
  isValidURL,
  checkFormConditionSPLink,
  checkFormLoadingController,
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
import ConfigLoadingControl from "./configLoadingControl";
import LoadingControllers from "./loadingController";
import ConfigLinkTags from "./configLinkTag";

import { Modal, Toast, ToastBody, ToastHeader } from "reactstrap";
import { Table, Thead, Tbody, Tr, Th, Td } from "react-super-responsive-table";
import ConfirmRequired from "../ConfirmRequired";

class AddFormField extends Component {
  constructor(props) {
    super(props);
    this.state = {
      detailField: this.props.detailField,
      listFormField: this.props.listFormField,
      listWorkflow: this.props.listWorkflow,
      indexField: this.props.indexField,
      listStepWorkflow: this.props.listStepWorkflow,
      ListComponentInfo: this.props.ListComponentInfo,
      arrWorkFlow: [],
      arrField: [],
      Confirm: false,
      ConfirmText: "",
      TypeConfirm: "",
      ConfirmParameter: "",
      typeForm: "",
      Calculation: false,
      Required: false,
      RequiredText: "",
    };
    this.changeFormFieldModal = this.changeFormFieldModal.bind(this);
    this.callSearchPeople = this.callSearchPeople.bind(this);
    this.resultLoadingControl = this.resultLoadingControl.bind(this);
    this.modalOpenCloseAlert = this.modalOpenCloseAlert.bind(this);
    this.resultLinkTags = this.resultLinkTags.bind(this);
    this.typingTimeout = null;
    this.fieldSearch = "";
  }
  componentWillReceiveProps(nextProps) {
    // console.log(nextProps);
    this.setState({
      listFormField: nextProps.listFormField,
      listWorkflow: nextProps.listWorkflow,
      detailField: nextProps.detailField,
      indexField: nextProps.indexField,
      ListComponentInfo: nextProps.ListComponentInfo
    });
  }

  async componentDidMount() {
    if (
      (this.state.detailField.FieldType == objField.Sum ||
        this.state.detailField.FieldType == objField.Average ||
        this.state.detailField.FieldType == objField.Percent) &&
      this.state.detailField.ObjSPField.ObjField.ChoiceField.length > 0 &&
      isNotNull(
        this.state.detailField.ObjSPField.ObjField.ChoiceField[0].WFTableId
      )
    ) {
      let arrFields = await shareService.GetWFFormField(
        this.state.detailField.ObjSPField.ObjField.ChoiceField[0].WFTableId
      );
      await this.setState({ arrField: arrFields });
    }
    let arrWF = [];
    let objNull = {};
    if (
      isNotNull(this.state.detailField.ObjSPField.ObjField) &&
      this.state.detailField.ObjSPField.ObjField.toString() != {}
    ) {
      if (
        isNotNull(this.state.detailField.ObjSPField.ObjField.ChoiceField[0])
      ) {
        if (
          isNotNull(
            this.state.detailField.ObjSPField.ObjField.ChoiceField[0].indexStep
          )
        ) {
          let stepIndex = this.state.listStepWorkflow.find(
            (x) =>
              x.indexStep ==
              this.state.detailField.ObjSPField.ObjField.ChoiceField[0]
                .indexStep
          );
          if (
            isNotNull(stepIndex) &&
            stepIndex.StepWFType == "Quy trình" &&
            stepIndex.ObjStepWFId.length > 0
          ) {
            arrWF = stepIndex.ObjStepWFId.filter((wf) => wf.Waitting == false);
          }
        }
      }
    } else {
      this.state.listStepWorkflow.map((st) => {
        if (st.StepWFType == "Quy trình" && st.ObjStepWFId.length > 0) {
          let wfBDB = st.ObjStepWFId.filter((wf) => wf.Waitting == false);
          wfBDB.map((bdb) => {
            if (arrWF.findIndex((wf) => wf.WFTableId == bdb.WFTableId) == -1) {
              arrWF.push(bdb);
            }
          });
        }
      });
    }
    await this.setState({ arrWorkFlow: arrWF });
  }

  // set giá trị cho form tạo mới field
  async changeFormFieldModal(event) {
    // console.log(event);
    let valueState = event.target.value;
    let nameState = event.target.name;
    const objModal = returnObject(this.state.detailField);

    if (nameState == "Required") {
      objModal[nameState] = event.target.checked == true ? 1 : 0;
    } else if (nameState == "FieldType") {
      objModal[nameState] = valueState;
      objModal["Required"] = 0;
      let objValid = returnObject(objModal.ObjValidation);
      let objSPField = returnObject(objModal.ObjSPField);
      let objCalculated = returnObject(
        objModal.ObjValidation.CalculateCondition
      );
      objSPField.Type = valueState;
      objValid.IsActive = false;
      objValid.CompareCondition = [];
      objCalculated.isCalculate = false;
      objValid.CalculateCondition = objCalculated;

      objSPField.TextField = "";
      objSPField.ObjField = {
        ChoiceField: [],
        ObjSPLink: {
          wfTableId: "",
          wfTableCode: "",
          typeSPLink: "",
          ArrayFieldSP: [],
          ArrayFieldCondition: [],
          ArrayFieldFilter: [],
          ArrayFieldView: [],
          TypeFilter: "and",
          TextSearchField: "",
          ArrButtonView: [],
        },
      };

      if (valueState == "Number") {
        objValid.typeInputValidation = "number";
      } else if (valueState == "DateTime" || valueState == "Times") {
        objValid.typeInputValidation = "date";
      } else if (
        valueState == "Sum" ||
        valueState == "Average" ||
        valueState == "Percent"
      ) {
        objSPField = {
          Type: "Number",
          ObjField: {
            ChoiceField: [
              {
                PercentValue: "",
                indexStep: "",
                WFTableId: "",
                InternalName: "",
              },
            ],
          },
          TextField: "",
        };
      } else if (valueState == objField.AutoSystemNumberIMG) {
        objSPField = {
          Type: "Text",
          ObjField: {
            ChoiceField: [
              {
                Prefix: "",
                Suffixes: "",
              },
            ],
          },
          TextField: "",
        };
      } else if (valueState == objField.LinkTags) {
        objSPField = {
          Type: "Text",
          ObjField: {
            ChoiceField: [
              {
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
              },
            ],
          },
          TextField: "",
        };
      } else {
        objValid.typeInputValidation = "text";
      }
      objModal.ObjValidation = objValid;
      objModal.ObjSPField = objSPField;

      if (valueState == objField.User) {
        objModal.DefaultValue = { UserId: "", UserTitle: "", UserEmail: "" };
      } else {
        objModal.DefaultValue = "";
      }
      objModal.listSearch_DefaultValue = [];
    } else if (nameState == "typeCalculation") {
      let ObjValidation = returnObject(objModal.ObjValidation);
      let CalculateCondition = returnObject(ObjValidation.CalculateCondition);
      CalculateCondition.typeCalculation = valueState;
      ObjValidation.CalculateCondition = CalculateCondition;
      objModal.ObjValidation = ObjValidation;
    } else if (nameState == "Expression") {
      let ObjValidation = returnObject(objModal.ObjValidation);
      let CalculateCondition = returnObject(ObjValidation.CalculateCondition);
      CalculateCondition.Expression = valueState;
      ObjValidation.CalculateCondition = CalculateCondition;
      objModal.ObjValidation = ObjValidation;
    } else if (nameState == "ObjValidation") {
      let objValid = returnObject(objModal.ObjValidation);
      objValid.IsActive = event.target.checked;
      objValid.CompareCondition = [
        {
          Condition: "",
          Field: "",
          FieldCompare: "",
          Value: "",
          ConditionType: "",
          arrCondition: arrayTypeCompare,
        },
      ];
      objModal.ObjValidation = objValid;
    } else if (nameState == "isCalculate") {
      let objCalculated = returnObject(
        objModal.ObjValidation.CalculateCondition
      );
      objCalculated = {
        isCalculate: event.target.checked,
        FieldType: "",
        FieldNameEnd: "",
        FieldNameStart: "",
        Calculation: "",
        arrCalculation: [],
        arrFieldCalculation: [],
        Expression: "",
        typeCalculation: "",
      };
      let objValid = returnObject(objModal.ObjValidation);
      objValid.CalculateCondition = objCalculated;
      objModal.ObjValidation = objValid;
    } else if (nameState == "ChoiceField") {
      const arrChoice = valueState.split(/\r?\n/);
      let objSPField = returnObject(objModal.ObjSPField);
      let fieldObject = returnObject(objSPField.ObjField);
      fieldObject.ChoiceField = arrChoice;
      objSPField.ObjField = fieldObject;
      objSPField.TextField = valueState;
      objModal.ObjSPField = objSPField;
    } else if (nameState == "PercentValue") {
      let objSPField = returnObject(objModal.ObjSPField);
      let objFields = returnObject(objSPField.ObjField);
      let choiceField = returnArray(objFields.ChoiceField);
      let choiceFieldItem = returnObject(choiceField[0]);
      choiceFieldItem.PercentValue = valueState;
      choiceField[0] = choiceFieldItem;
      objFields.ChoiceField = choiceField;
      objSPField.ObjField = objFields;
      objModal.ObjSPField = objSPField;
    } else if (nameState == "indexStep") {
      let objSPField = returnObject(objModal.ObjSPField);
      let objFields = returnObject(objSPField.ObjField);
      let choiceField = returnArray(objFields.ChoiceField);
      let choiceFieldItem = returnObject(choiceField[0]);
      choiceFieldItem.indexStep = valueState;
      choiceFieldItem.WFTableId = "";
      choiceFieldItem.InternalName = "";
      choiceField[0] = choiceFieldItem;
      objFields.ChoiceField = choiceField;
      objSPField.ObjField = objFields;
      objModal.ObjSPField = objSPField;
      let arrWF = [];
      if (isNotNull(valueState)) {
        let stepIndex = this.state.listStepWorkflow.find(
          (x) => x.indexStep == valueState
        );
        if (
          isNotNull(stepIndex) &&
          stepIndex.StepWFType == "Quy trình" &&
          stepIndex.ObjStepWFId.length > 0
        ) {
          arrWF = stepIndex.ObjStepWFId.filter((wf) => wf.Waitting == false);
        }
      } else {
        this.state.listStepWorkflow.map((st) => {
          if (st.StepWFType == "Quy trình" && st.ObjStepWFId.length > 0) {
            let wfBDB = st.ObjStepWFId.filter((wf) => wf.Waitting == false);
            wfBDB.map((bdb) => {
              if (
                arrWF.findIndex((wf) => wf.WFTableId == bdb.WFTableId) == -1
              ) {
                arrWF.push(bdb);
              }
            });
          }
        });
      }
      await this.setState({ arrWorkFlow: arrWF });
    } else if (nameState == "WFTableId") {
      let objSPField = returnObject(objModal.ObjSPField);
      let objFields = returnObject(objSPField.ObjField);
      let choiceField = returnArray(objFields.ChoiceField);
      let choiceFieldItem = returnObject(choiceField[0]);
      choiceFieldItem.WFTableId = valueState;
      choiceField[0] = choiceFieldItem;
      choiceFieldItem.InternalName = "";
      objFields.ChoiceField = choiceField;
      objSPField.ObjField = objFields;
      objModal.ObjSPField = objSPField;

      if (isNotNull(valueState)) {
        let arrFields = await shareService.GetWFFormField(valueState);
        await this.setState({ arrField: arrFields });
      }
    } else if (nameState == "InternalNameSub") {
      let objSPField = returnObject(objModal.ObjSPField);
      let objFields = returnObject(objSPField.ObjField);
      let choiceField = returnArray(objFields.ChoiceField);
      let choiceFieldItem = returnObject(choiceField[0]);
      choiceFieldItem.InternalName = valueState;
      choiceField[0] = choiceFieldItem;
      objFields.ChoiceField = choiceField;
      objSPField.ObjField = objFields;
      objModal.ObjSPField = objSPField;
    } else if (nameState == "InternalName") {
      valueState = valueState.replace(/\s/g, "");
      objModal[nameState] = valueState;
    } else if (nameState == "TypeDefaultValue") {
      objModal[nameState] = valueState;
      objModal.DefaultValue = "";
    } else if (nameState == "DefaultValueStep") {
      objModal.DefaultValue = parseInt(valueState);
    } else if (nameState == "Prefix" || nameState == "Suffixes") {
      let objSPField = returnObject(objModal.ObjSPField);
      let fieldObject = returnObject(objSPField.ObjField);
      let arrChoice = returnArray(fieldObject.ChoiceField);
      let fieldObject0 = returnObject(arrChoice[0]);
      fieldObject0[nameState] = valueState;
      arrChoice[0] = fieldObject0;
      fieldObject.ChoiceField = arrChoice;
      objSPField.ObjField = fieldObject;
      objModal.ObjSPField = objSPField;
    } else {
      objModal[nameState] = valueState;
    }
    // console.log(objModal);
    await this.setState({ detailField: objModal });
  }

  // set giá trị cho các điều kiện của field
  changeFormValdation(index, typeForm, event) {
    let valueState = event.target.value;
    let nameState = event.target.name;
    if (typeForm == "ObjValidation") {
      const objModal = returnObject(this.state.detailField);

      let objValid = returnObject(objModal.ObjValidation);
      let arrCompare = returnArray(objModal.ObjValidation.CompareCondition);
      arrCompare[index][nameState] = valueState;

      if (nameState == "FieldCompare") {
        const fieldIn = this.state.listFormField.find(
          (f) => f.InternalName == valueState
        );
        if (isNotNull(fieldIn)) {
          arrCompare[index].Field = fieldIn.FieldName;
        } else {
          arrCompare[index].Field = valueState;
        }
      }
      if (nameState == "ConditionType") {
        arrCompare[index].Field = "";
        arrCompare[index].FieldCompare = "";
        arrCompare[index].Value = "";
      }
      objValid.CompareCondition = arrCompare;
      objModal.ObjValidation = objValid;
      this.setState({ detailField: objModal });
    } else if (typeForm == "ObjCalculation") {
      const objValidCal = returnObject(this.state.detailField);

      let objValid = returnObject(objValidCal.ObjValidation);
      let objCalculated = returnObject(
        objValidCal.ObjValidation.CalculateCondition
      );

      objCalculated[nameState] = valueState;
      if (nameState == "FieldNameEnd") {
        const fieldIn = this.state.listFormField.find(
          (f) => f.InternalName == valueState
        );
        objCalculated.FieldType = fieldIn.FieldType;
        if (fieldIn.FieldType == objField.DateTime) {
          objCalculated.arrFieldCalculation = this.state.listFormField.filter(
            (fa) =>
              fa.FieldType == objField.DateTime &&
              fa.InternalName != fieldIn.InternalName
          );
          objCalculated.arrCalculation = [{ Code: "-", Title: "Trừ" }];
        } else if (fieldIn.FieldType == objField.Number) {
          objCalculated.arrFieldCalculation = this.state.listFormField.filter(
            (fa) =>
              fa.FieldType == objField.Number &&
              fa.InternalName != fieldIn.InternalName
          );
          objCalculated.arrCalculation = arrayTypeCalculation;
        }
      }
      objValid.CalculateCondition = objCalculated;
      objValidCal.ObjValidation = objValid;
      this.setState({ detailField: objValidCal });
    }
  }

  // Thêm điều kiện trên field
  AddFormValdation(typeForm) {
    if (typeForm == "ObjValidation") {
      const obj = returnObject(this.state.detailField);
      let objValid = returnObject(obj.ObjValidation);
      let arrCompare = returnArray(obj.ObjValidation.CompareCondition);

      if (arrCompare.length > 0) {
        const txtAlerRequired = this.checkFormValdation(typeForm);
        if (isNotNull(txtAlerRequired)) {
          this.setState({
            RequiredText:
              "Bạn chưa điền đủ thông tin điều kiện: \n " +
              txtAlerRequired +
              "",
            Required: true,
          });
          //alert("Bạn chưa điền đủ thông tin điều kiện: \n" + txtAlerRequired);
          return;
        } else {
          arrCompare.push({
            Condition: "",
            Field: "",
            FieldCompare: "",
            Value: "",
            ConditionType: "",
            arrCondition: arrayTypeCompare,
          });
          objValid.CompareCondition = arrCompare;
          obj.ObjValidation = objValid;
          this.setState({ detailField: obj });
        }
      } else {
        arrCompare.push({
          Condition: "",
          Field: "",
          FieldCompare: "",
          Value: "",
          ConditionType: "",
          arrCondition: arrayTypeCompare,
        });
        objValid.CompareCondition = arrCompare;
        obj.ObjValidation = objValid;
        this.setState({ detailField: obj });
      }
    }
  }
  Confirm(index, typeForm) {
    this.setState({
      Confirm: true,
      ConfirmText: "Bạn chắc chắn muốn xóa điều kiện so sánh này ?",
      ConfirmParameter: index,
      typeForm: typeForm,
    });
  }
  // Xóa điều kiện trên form field
  removeFormValdation(index, typeForm) {
    if (typeForm == "ObjValidation") {
      const obj = returnObject(this.state.detailField);
      // obj.ObjValidation.CompareCondition.splice(index, 1);
      let objValid = returnObject(obj.ObjValidation);
      let arrCompare = returnArray(obj.ObjValidation.CompareCondition);
      arrCompare.splice(index, 1);
      objValid.CompareCondition = arrCompare;
      obj.ObjValidation = objValid;
      this.setState({ detailField: obj, Confirm: false });
    }
  }

  // kiểm tra điều kiện trên field
  checkFormValdation(typeForm) {
    let txtRequired = "";
    if (typeForm == "ObjValidation") {
      const obj = this.state.detailField;
      if (obj.ObjValidation.IsActive) {
        for (
          let index = 0;
          index < obj.ObjValidation.CompareCondition.length;
          index++
        ) {
          let rowRequired = "";
          if (!isNotNull(obj.ObjValidation.CompareCondition[index].Condition)) {
            rowRequired += " Điều kiện,";
          }
          if (
            !isNotNull(obj.ObjValidation.CompareCondition[index].ConditionType)
          ) {
            rowRequired += " Loại so sánh,";
          }
          if (
            !isNotNull(
              obj.ObjValidation.CompareCondition[index].FieldCompare
            ) &&
            obj.ObjValidation.CompareCondition[index].ConditionType ==
              "FieldCompare"
          ) {
            rowRequired += " Trường so sánh,";
          }
          if (
            !isNotNull(obj.ObjValidation.CompareCondition[index].Value) &&
            (obj.ObjValidation.CompareCondition[index].ConditionType ==
              "FieldValue" ||
              !isNotNull(
                obj.ObjValidation.CompareCondition[index].ConditionType
              ))
          ) {
            rowRequired += " Giá trị nhập,";
          }
          if (isNotNull(rowRequired)) {
            txtRequired += "Dòng " + (index + 1) + ": " + rowRequired + " \n";
          }
        }
      }
    }
    return txtRequired;
  }

  checkSaveFormField() {
    let txtCheckForm = "";
    let txtForm = "";
    const txtValidation = this.checkFormValdation("ObjValidation");
    let txtCalculation = "";
    const detailField = this.state.detailField;
    if (!isNotNull(detailField.FieldName)) {
      txtForm += " Tên Trường,";
    }
    if (!isNotNull(detailField.FieldType)) {
      txtForm += " Kiểu dữ liệu,";
    }
    if (!isNotNull(detailField.InternalName)) {
      txtForm += " Trường nội bộ,";
    }
    if (isNotNull(detailField.InternalName)) {
      let listCheck = "1234567890QWERTYUIOPASDFGHJKLZXCVBNM";
      let check = true;
      for (let i = 0; i < detailField.InternalName.length; i++) {
        let result = listCheck.includes(
          detailField.InternalName[i].toUpperCase()
        );
        if (result == false) {
          check = false;
          break;
        }
      }
      if (check == false) {
        txtForm += "Trường nội bộ không được chứa ký tự đặc biệt! , ";
      }
    }
    if (
      detailField.ID == 0 &&
      this.state.listFormField.findIndex(
        (x) => x.InternalName == detailField.InternalName
      ) != -1 &&
      this.state.indexField == -1
    ) {
      txtForm += "\n Trường nội bộ đã tồn tại";
    }
    if (
      (detailField.FieldType == "RadioButton" ||
        detailField.FieldType == "CheckBox" ||
        detailField.FieldType == "Dropdown" ||
        detailField.FieldType == "DropdownMulti"
         ) &&
      !isNotNull(detailField.ObjSPField.TextField)
    ) {
      txtForm += " Trường lựa chọn,";
    }
    if (
      detailField.ObjValidation.CalculateCondition.isCalculate &&
      !isNotNull(detailField.ObjValidation.CalculateCondition.typeCalculation)
    ) {
      txtCalculation += "Loại tính toán";
    }
    if (
      detailField.ObjValidation.CalculateCondition.isCalculate &&
      detailField.ObjValidation.CalculateCondition.typeCalculation ==
        "CalforField"
    ) {
      if (
        !isNotNull(detailField.ObjValidation.CalculateCondition.FieldNameEnd)
      ) {
        txtCalculation += " Trường dữ liệu,";
      }
      if (
        !isNotNull(detailField.ObjValidation.CalculateCondition.Calculation)
      ) {
        txtCalculation += " Phép tính,";
      }
      if (
        !isNotNull(detailField.ObjValidation.CalculateCondition.FieldNameStart)
      ) {
        txtCalculation += " Trường tính,";
      }
    }
    if (
      detailField.ObjValidation.CalculateCondition.isCalculate &&
      detailField.ObjValidation.CalculateCondition.typeCalculation ==
        "CalforExp" &&
      !isNotNull(detailField.ObjValidation.CalculateCondition.Expression)
    ) {
      txtCalculation += " Biểu thức tính,";
    }
    if (
      detailField.ObjValidation.CalculateCondition.isCalculate &&
      detailField.ObjValidation.CalculateCondition.typeCalculation ==
        "CalforExp" &&
      isNotNull(detailField.ObjValidation.CalculateCondition.Expression)
    ) {
      let replaceArray = this.state.listFormField.filter(
        (x) =>
          x.FieldType == objField.Number ||
          x.FieldType == objField.Sum ||
          x.FieldType == objField.Average ||
          x.FieldType == objField.Percent
      );
      let myString = detailField.ObjValidation.CalculateCondition.Expression;
      let regexes = replaceArray.map(
        (string) => new RegExp(`\{${string.InternalName}\}`, "gi")
      );
      for (var i = 0; i < replaceArray.length; i++) {
        myString = myString.replace(regexes[i], 1);
      }
      try {
        let result = eval(myString);
        // console.log(result);
      } catch (ex) {
        txtCalculation += " biểu thức tính chưa đúng,";
      }
    }
    if (
      (detailField.FieldType == objField.SPLinkWF ||
        detailField.FieldType == objField.ProcessControllers) &&
      !isNotNull(detailField.ObjSPField.ObjField.ObjSPLink.wfTableId)
    ) {
      txtForm += " Link đến quy trình,";
    }
    if (
      detailField.FieldType == objField.SPLinkWF &&
      !isNotNull(detailField.ObjSPField.ObjField.ObjSPLink.typeSPLink)
    ) {
      txtForm += " Loại hiển thị quy trình,";
    }
    if (
      ((detailField.FieldType == objField.SPLinkWF &&
        detailField.ObjSPField.ObjField.ObjSPLink.typeSPLink == "ViewDetail") ||
        detailField.FieldType == objField.ProcessControllers) &&
      detailField.ObjSPField.ObjField.ObjSPLink.ArrayFieldView.length == 0
    ) {
      txtForm += " Trường hiển thị,";
    }
    if (
      (detailField.FieldType == objField.SPLinkWF ||
        detailField.FieldType == objField.ProcessControllers) &&
      detailField.ObjSPField.ObjField.ObjSPLink.ArrayFieldCondition.length > 0
    ) {
      let checkFC = "";
      if (detailField.FieldType == objField.ProcessControllers) {
        checkFC = checkFormLoadingController(
          detailField.ObjSPField.ObjField.ObjSPLink.ArrayFieldCondition
        );
      } else {
        checkFC = checkFormConditionSPLink(
          detailField.ObjSPField.ObjField.ObjSPLink.ArrayFieldCondition
        );
      }

      if (isNotNull(checkFC)) {
        txtForm += " Thông tin điều kiện mặc định: \n" + checkFC;
      }
    }

    if (
      detailField.FieldType == objField.LinkTags &&
      detailField.ObjSPField.ObjField.ChoiceField.length == 0
    ) {
      txtForm += " Liên kết,";
    }

    if (
      detailField.FieldType == objField.LinkTags &&
      detailField.ObjSPField.ObjField.ChoiceField.length > 0
    ) {
      let textCheck = checkFormLinkTags(
        detailField.ObjSPField.ObjField.ChoiceField
      );
      if (isNotNull(textCheck)) {
        txtForm += " \n " + textCheck;
      }
    }

    if (
      detailField.FieldType == objField.AutoSystemNumberIMG &&
      detailField.ObjSPField.ObjField.ChoiceField.length > 0 &&
      !isNotNull(detailField.ObjSPField.ObjField.ChoiceField[0].Suffixes)
    ) {
      txtForm += " Loại đề xuất,";
    }

    if (
      (detailField.FieldType == objField.Label ||
        detailField.FieldType == objField.Profile) &&
      !isNotNull(detailField.DefaultValue)
    ) {
      txtForm += " Giá trị mặc định,";
    }

    if (
      (detailField.FieldType == objField.Sum ||
        detailField.FieldType == objField.Percent ||
        detailField.FieldType == objField.Average) &&
      (!isNotNull(detailField.ObjSPField.ObjField.ChoiceField[0].WFTableId) ||
        this.state.arrWorkFlow.findIndex(
          (x) =>
            x.WFTableId ==
            detailField.ObjSPField.ObjField.ChoiceField[0].WFTableId
        ) == -1)
    ) {
      txtForm += " Quy trình con,";
    }
    if (
      (detailField.FieldType == objField.Sum ||
        detailField.FieldType == objField.Percent ||
        detailField.FieldType == objField.Average) &&
      !isNotNull(detailField.ObjSPField.ObjField.ChoiceField[0].InternalName)
    ) {
      txtForm += " Trường dữ liệu,";
    }
    if (
      detailField.FieldType == objField.Percent &&
      !isNotNull(detailField.ObjSPField.ObjField.ChoiceField[0].PercentValue)
    ) {
      txtForm += " Giá trị mặc định,";
    }
    if (
      detailField.FieldType == objField.DateTime &&
      detailField.TypeDefaultValue == "InputValue" &&
      !isNotNull(detailField.DefaultValue)
    ) {
      txtForm += " Giá trị mặc định,";
    }
    if (
      detailField.FieldType == objField.User &&
      (detailField.TypeDefaultValue == "UserApprovalInStep" ||
        detailField.TypeDefaultValue == "InputValue")
    ) {
      if (
        detailField.TypeDefaultValue == "UserApprovalInStep" &&
        !isNotNull(detailField.DefaultValue)
      ) {
        txtForm += " Bước,";
      }
      if (
        detailField.TypeDefaultValue == "InputValue" &&
        !isNotNull(detailField.DefaultValue.UserTitle)
      ) {
        txtForm += " Giá trị mặc định,";
      }
    }
    if (
      detailField.FieldType == objField.Hyperlink ||
      detailField.FieldType == objField.PictureLink
    ) {
      if (
        isNotNull(detailField.DefaultValue) &&
        !isValidURL(detailField.DefaultValue)
      ) {
        txtForm += " Giá trị mặc định phải là 1 đường dẫn,";
      }
    }
    if (txtForm != "") {
      txtCheckForm += txtForm;
    }
    if (txtValidation != "") {
      txtCheckForm += " \n" + "Điều kiện so sánh:" + txtValidation;
    }
    if (txtCalculation != "") {
      txtCheckForm += " \n" + "Điều kiện tính toán:" + txtCalculation;
    }
    return txtCheckForm;
  }

  saveFormField() {
    // console.log(this.state);
    const message = this.checkSaveFormField();
    if (isNotNull(message)) {
      this.setState({
        RequiredText: "Bạn chưa nhập đầy đủ thông tin: " + message + "",
        Required: true,
      });
      //  alert("Bạn chưa nhập đầy đủ thông tin:" + message);
      return;
    }
    if (
      isNotNull(this.state.detailField.DefaultValue) &&
      isNotNull(this.state.detailField.DefaultValue.UserId) &&
      !isNotNull(this.state.detailField.DefaultValue.UserTitle)
    ) {
      this.state.detailField.DefaultValue = "";
    }
    this.props.resutlFormField(this.state.detailField, this.state.indexField);
  }

  resetFormField() {
    // console.log(this.state);
    let fieldObject = returnObject(this.state.detailField);

    this.setState({
      detailField: {
        ID: fieldObject.ID,
        FieldName: "",
        FieldType: "Text",
        InternalName:
          this.state.indexField == -1 ? "" : fieldObject.InternalName,
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
      },
    });
  }

  // nhập giá trị để tìm kiếm người
  changeSearchPeople(event) {
    let detailField = returnObject(this.state.detailField);
    let userDF = returnObject(detailField.DefaultValue);
    userDF.UserTitle = event.target.value;
    detailField.DefaultValue = userDF;
    this.setState({ detailField: detailField });

    clearTimeout(this.typingTimeout);
    this.typingTimeout = setTimeout(this.callSearchPeople, 1000);
  }

  // set giá trị cho danh sách người tìm kiếm
  async callSearchPeople() {
    let detailField = returnObject(this.state.detailField);
    let PeoplePicker = await shareService.searchPeoplePicker(
      detailField.DefaultValue.UserTitle
    );
    detailField.listSearch_DefaultValue = PeoplePicker;
    this.setState({ detailField: detailField });
  }

  // Chọn người từ trong danh sách tìm kiếm
  async selectSearch(Key) {
    let detailField = returnObject(this.state.detailField);
    let objUser = await shareService.getInforUser(Key);
    detailField.DefaultValue = objUser;
    detailField.listSearch_DefaultValue = [];
    this.setState({ detailField: detailField });
  }

  resultLoadingControl(objSPLink) {
    // console.log(objSPLink);
    let detailFieldSP = returnObject(this.state.detailField);
    let objSPFieldSP = returnObject(detailFieldSP.ObjSPField);
    let objFieldSP = returnObject(objSPFieldSP.ObjField);
    objFieldSP.ObjSPLink = objSPLink;
    objSPFieldSP.ObjField = objFieldSP;
    detailFieldSP.ObjSPField = objSPFieldSP;
    this.setState({ detailField: detailFieldSP });
  }

  resultLinkTags(choiceField) {
    // console.log(objSPLink);
    let detailFieldSP = returnObject(this.state.detailField);
    let objSPFieldSP = returnObject(detailFieldSP.ObjSPField);
    let objFieldSP = returnObject(objSPFieldSP.ObjField);

    objFieldSP.ChoiceField = choiceField;

    objSPFieldSP.ObjField = objFieldSP;
    detailFieldSP.ObjSPField = objSPFieldSP;
    this.setState({ detailField: detailFieldSP });
  }

  async modalOpenCloseAlert() {
    await this.setState({ Required: false });
  }

  render() {
    const {
      detailField,
      listWorkflow,
      listFormField,
      listStepWorkflow,
      arrWorkFlow,
      arrField,
      Confirm,
      ListComponentInfo
    } = this.state;
    // console.log(this.state);

    return (
      <Modal size="xl" isOpen={true}>
        <div className="modal-header">
          <h5 className="modal-title mt-0 text-primary" id="myLargeModalLabel">
            Thêm trường dữ liệu
          </h5>
          <button
            onClick={() => this.props.modalOpenClose(false)}
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
                  Tên trường <span className="text-danger">*</span>
                </label>
                <div className="col-md-9">
                  <input
                    className="form-control"
                    type="text"
                    name="FieldName"
                    onChange={this.changeFormFieldModal}
                    value={detailField.FieldName}
                  />
                </div>
              </div>
            </div>

            <div className="col-lg-12">
              <div className="form-group row">
                <label htmlFor="example-text-input" className="col-md-3">
                  Kiểu dữ liệu <span className="text-danger">*</span>
                </label>
                <div className="col-md-9">
                  <select
                    className="form-control"
                    name="FieldType"
                    onChange={this.changeFormFieldModal}
                    value={detailField.FieldType}
                    disabled={detailField.ID > 0 ? true : false}
                  >
                    {arrayObjField.map((objfield) => (
                      <option key={objfield.Type} value={objfield.Type}>
                        {objfield.Title}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <div className="col-lg-12">
              <div className="form-group row">
                <label htmlFor="example-text-input" className="col-md-3">
                  Mô tả
                </label>
                <div className="col-md-9">
                  <textarea
                    rows="3"
                    className="form-control"
                    name="HelpText"
                    onChange={this.changeFormFieldModal}
                    value={detailField.HelpText}
                  ></textarea>
                </div>
              </div>
            </div>

            <div className="col-lg-12">
              <div className="form-group row">
                <label htmlFor="example-text-input" className="col-md-3">
                  Trường nội bộ <span className="text-danger">*</span>
                </label>
                <div className="col-md-9">
                  <input
                    className="form-control"
                    type="text"
                    name="InternalName"
                    onChange={this.changeFormFieldModal}
                    value={detailField.InternalName}
                    disabled={this.state.indexField == -1 ? false : true}
                  />
                </div>
              </div>
            </div>

            <div className="col-lg-12">
              <div className="form-group row">
                <label htmlFor="example-text-input" className="col-md-3">
                  Bắt buộc
                </label>
                <div className="col-md-9">
                  <input
                    type="checkbox"
                    className="form-check-input"
                    name="Required"
                    onChange={this.changeFormFieldModal}
                    checked={detailField.Required == 1 ? true : false}
                  />
                </div>
              </div>
            </div>

            {detailField.FieldType == objField.AutoSystemNumberIMG &&
            detailField.ObjSPField &&
            detailField.ObjSPField.ObjField &&
            detailField.ObjSPField.ObjField.ChoiceField &&
            detailField.ObjSPField.ObjField.ChoiceField.length > 0 ? (
              <div className="col-lg-12">
                <div className="form-group row">
                  <label htmlFor="example-text-input" className="col-md-3">
                    Loại đề xuất <span className="text-danger">*</span>
                  </label>
                  <div className="col-md-9">
                    <input
                      className="form-control"
                      type="text"
                      name="Suffixes"
                      onChange={this.changeFormFieldModal}
                      value={
                        detailField.ObjSPField.ObjField.ChoiceField[0].Suffixes
                      }
                    />
                  </div>
                </div>
              </div>
            ) : (
              ""
            )}

            {detailField.FieldType == objField.Percent ? (
              <div className="col-lg-12">
                <div className="form-group row">
                  <label htmlFor="example-text-input" className="col-md-3">
                    Giá trị mặc định <span className="text-danger">*</span>
                  </label>
                  <div className="col-md-9">
                    <input
                      type="number"
                      name="PercentValue"
                      className="form-control"
                      onChange={this.changeFormFieldModal}
                      value={
                        detailField.ObjSPField.ObjField.ChoiceField[0]
                          .PercentValue
                      }
                    />
                  </div>
                </div>
              </div>
            ) : (
              ""
            )}

            {detailField.FieldType == objField.Sum ||
            detailField.FieldType == objField.Average ||
            detailField.FieldType == objField.Percent ? (
              <div className="col-lg-12">
                <div className="form-group row">
                  <label htmlFor="example-text-input" className="col-md-3">
                    Lựa chọn bước
                  </label>
                  <div className="col-md-9">
                    <select
                      className="form-control"
                      name="indexStep"
                      onChange={this.changeFormFieldModal}
                      value={
                        detailField.ObjSPField.ObjField.ChoiceField[0].indexStep
                      }
                    >
                      <option value=""></option>
                      {listStepWorkflow
                        .filter((x) => isNotNull(x.ObjStepWFId))
                        .map((step) => (
                          <option key={step.indexStep} value={step.indexStep}>
                            {step.StepTitle}
                          </option>
                        ))}
                    </select>
                  </div>
                </div>
              </div>
            ) : (
              ""
            )}

            {detailField.FieldType == objField.Sum ||
            detailField.FieldType == objField.Average ||
            detailField.FieldType == objField.Percent ? (
              <div className="col-lg-12">
                <div className="form-group row">
                  <label htmlFor="example-text-input" className="col-md-3">
                    Lựa chọn quy trình con{" "}
                    <span className="text-danger">*</span>
                  </label>
                  <div className="col-md-9">
                    <select
                      className="form-control"
                      name="WFTableId"
                      onChange={this.changeFormFieldModal}
                      value={
                        detailField.ObjSPField.ObjField.ChoiceField[0].WFTableId
                      }
                    >
                      <option value=""></option>
                      {arrWorkFlow.map((wfSub) => (
                        <option key={wfSub.WFTableId} value={wfSub.WFTableId}>
                          {wfSub.WFTableTitle}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            ) : (
              ""
            )}

            {detailField.FieldType == objField.Sum ||
            detailField.FieldType == objField.Average ||
            detailField.FieldType == objField.Percent ? (
              <div className="col-lg-12">
                <div className="form-group row">
                  <label htmlFor="example-text-input" className="col-md-3">
                    Lựa chọn trường dữ liệu{" "}
                    <span className="text-danger">*</span>
                  </label>
                  <div className="col-md-9">
                    <select
                      className="form-control"
                      name="InternalNameSub"
                      onChange={this.changeFormFieldModal}
                      value={
                        detailField.ObjSPField.ObjField.ChoiceField[0]
                          .InternalName
                      }
                    >
                      <option value=""></option>
                      {arrField
                        .filter(
                          (k) =>
                            k.FieldType == "Number" ||
                            k.FieldType == objField.Sum ||
                            k.FieldType == objField.Average ||
                            k.FieldType == objField.Percent
                        )
                        .map((field) => (
                          <option
                            key={field.InternalName}
                            value={field.InternalName}
                          >
                            {field.FieldName}
                          </option>
                        ))}
                    </select>
                  </div>
                </div>
              </div>
            ) : (
              ""
            )}

            {detailField.FieldType == objField.Dropdown ||
            detailField.FieldType == objField.DropdownMulti ||
            detailField.FieldType == objField.CheckBox ||
            detailField.FieldType == objField.RadioButton ? (
              <div className="col-lg-12">
                <div className="form-group row">
                  <label htmlFor="example-text-input" className="col-md-3">
                    Lựa chọn <span className="text-danger">*</span> (Enter xuống
                    dòng với mỗi lựa chọn)
                  </label>
                  <div className="col-md-9">
                    <textarea
                      rows="3"
                      className="form-control"
                      name="ChoiceField"
                      onChange={this.changeFormFieldModal}
                      value={detailField.ObjSPField.TextField}
                    ></textarea>
                  </div>
                </div>
              </div>
            ) : (
              ""
            )}

            {detailField.FieldType == objField.Number ||
            detailField.FieldType == objField.DateTime ? (
              <div className="col-lg-12">
                <div className="form-group row">
                  <label htmlFor="example-text-input" className="col-md-3">
                    Điều kiện so sánh
                  </label>
                  <div className="col-md-9">
                    <input
                      type="checkbox"
                      className="form-check-input"
                      name="ObjValidation"
                      onChange={this.changeFormFieldModal}
                      checked={detailField.ObjValidation.IsActive}
                    />
                  </div>
                </div>
              </div>
            ) : (
              ""
            )}

            {detailField.ObjValidation.IsActive ? (
              <div className="col-lg-12">
                <div className="form-group row">
                  <div className="col-md-12">
                    <div className="table-responsive mt-3">
                      <Table className="table table-striped mb-0">
                        <thead>
                          <tr>
                            <th>
                              Điều kiện <span className="text-danger">*</span>
                            </th>
                            <th>
                              Loại so sánh{" "}
                              <span className="text-danger">*</span>
                            </th>
                            <th>
                              Trường so sánh || Giá trị nhập{" "}
                              <span className="text-danger">*</span>
                            </th>
                            <th className="text-right">Hoạt động</th>
                          </tr>
                        </thead>
                        <tbody>
                          {detailField.ObjValidation.CompareCondition.map(
                            (stepCon, index) => (
                              <tr key={index}>
                                <td>
                                  <select
                                    className="form-control"
                                    name="Condition"
                                    onChange={this.changeFormValdation.bind(
                                      this,
                                      index,
                                      `ObjValidation`
                                    )}
                                    value={stepCon.Condition}
                                  >
                                    <option value=""></option>
                                    {stepCon.arrCondition.map((conArr) => (
                                      <option
                                        value={conArr.Code}
                                        key={conArr.Code}
                                      >
                                        {conArr.Title}
                                      </option>
                                    ))}
                                  </select>
                                </td>
                                <td>
                                  <select
                                    className="form-control"
                                    name="ConditionType"
                                    onChange={this.changeFormValdation.bind(
                                      this,
                                      index,
                                      `ObjValidation`
                                    )}
                                    value={stepCon.ConditionType}
                                  >
                                    <option value=""></option>
                                    <option value="FieldCompare">
                                      Trường so sánh
                                    </option>
                                    <option value="FieldValue">
                                      Giá trị nhập
                                    </option>
                                    {detailField.FieldType ==
                                    objField.DateTime ? (
                                      <option value="CurentDate">
                                        Ngày hiện tại
                                      </option>
                                    ) : (
                                      ""
                                    )}
                                  </select>
                                </td>
                                <td>
                                  {stepCon.ConditionType == "FieldCompare" ? (
                                    <select
                                      className="form-control"
                                      name="FieldCompare"
                                      onChange={this.changeFormValdation.bind(
                                        this,
                                        index,
                                        `ObjValidation`
                                      )}
                                      value={stepCon.FieldCompare}
                                    >
                                      <option value=""></option>
                                      {listFormField
                                        .filter(
                                          (fc) =>
                                            fc.FieldType ==
                                              detailField.FieldType &&
                                            fc.InternalName !=
                                              detailField.InternalName
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
                                  ) : stepCon.ConditionType == "FieldValue" ? (
                                    <input
                                      type={
                                        detailField.ObjValidation
                                          .typeInputValidation
                                      }
                                      className="form-control"
                                      name="Value"
                                      onChange={this.changeFormValdation.bind(
                                        this,
                                        index,
                                        `ObjValidation`
                                      )}
                                      value={stepCon.Value}
                                    />
                                  ) : (
                                    ""
                                  )}
                                </td>
                                <td>
                                  <div className="button-items text-right">
                                    <button
                                      title="Xóa điều kiện"
                                      type="button"
                                      className="btn"
                                      onClick={() =>
                                        this.Confirm(index, `ObjValidation`)
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
                <div className="text-right mb-3">
                  <button
                    type="button"
                    className="btn btn-md btn-primary waves-effect waves-light"
                    onClick={() => this.AddFormValdation(`ObjValidation`)}
                  >
                    <i className="fa fa-plus-circle mr-2 align-middle"></i> Thêm
                    điều kiện
                  </button>
                </div>
              </div>
            ) : (
              ""
            )}

            {detailField.FieldType == objField.Number ? (
              <div className="col-lg-12">
                <div className="form-group row">
                  <label htmlFor="example-text-input" className="col-md-3">
                    Là trường được tính toán
                  </label>
                  <div className="col-md-9">
                    <input
                      type="checkbox"
                      className="form-check-input"
                      name="isCalculate"
                      onChange={this.changeFormFieldModal}
                      checked={
                        detailField.ObjValidation.CalculateCondition.isCalculate
                      }
                    />
                  </div>
                </div>
              </div>
            ) : (
              ""
            )}
            {detailField.ObjValidation.CalculateCondition.isCalculate ? (
              <div className="col-lg-12">
                <div className="form-group row">
                  <label htmlFor="example-text-input" className="col-md-3">
                    Chọn loại tính toán <span className="text-danger">*</span>
                  </label>

                  <div className="col-md-9">
                    <select
                      className="form-control"
                      name="typeCalculation"
                      onChange={this.changeFormFieldModal}
                      value={
                        detailField.ObjValidation.CalculateCondition
                          .typeCalculation
                      }
                    >
                      <option value=""></option>
                      <option value="CalforField">
                        Tính toán theo trường dữ liệu
                      </option>
                      <option value="CalforExp">
                        Tính toán theo biểu thức nhập
                      </option>
                    </select>
                  </div>
                </div>
              </div>
            ) : (
              ""
            )}
            {detailField.ObjValidation.CalculateCondition.isCalculate &&
            detailField.ObjValidation.CalculateCondition.typeCalculation ==
              "CalforField" ? (
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
                          </tr>
                        </thead>
                        <tbody>
                          <tr>
                            <td>
                              <select
                                className="form-control"
                                name="FieldNameEnd"
                                onChange={this.changeFormValdation.bind(
                                  this,
                                  0,
                                  `ObjCalculation`
                                )}
                                value={
                                  detailField.ObjValidation.CalculateCondition
                                    .FieldNameEnd
                                }
                              >
                                <option value=""></option>
                                {listFormField
                                  .filter(
                                    (flc) =>
                                      flc.InternalName !=
                                        detailField.InternalName &&
                                      (flc.FieldType == objField.Number ||
                                        flc.FieldType == objField.DateTime)
                                  )
                                  .map((conArr) => (
                                    <option
                                      value={conArr.InternalName}
                                      key={conArr.InternalName}
                                    >
                                      {conArr.FieldName}
                                    </option>
                                  ))}
                              </select>
                            </td>
                            <td>
                              <select
                                className="form-control"
                                name="Calculation"
                                onChange={this.changeFormValdation.bind(
                                  this,
                                  0,
                                  `ObjCalculation`
                                )}
                                value={
                                  detailField.ObjValidation.CalculateCondition
                                    .Calculation
                                }
                              >
                                <option value=""></option>
                                {detailField.ObjValidation.CalculateCondition.arrCalculation.map(
                                  (cal, inCal) => (
                                    <option value={cal.Code} key={inCal}>
                                      {cal.Title}
                                    </option>
                                  )
                                )}
                              </select>
                            </td>
                            <td>
                              <select
                                className="form-control"
                                name="FieldNameStart"
                                onChange={this.changeFormValdation.bind(
                                  this,
                                  0,
                                  `ObjCalculation`
                                )}
                                value={
                                  detailField.ObjValidation.CalculateCondition
                                    .FieldNameStart
                                }
                              >
                                <option value=""></option>
                                {detailField.ObjValidation.CalculateCondition.arrFieldCalculation.map(
                                  (fieldArr) => (
                                    <option
                                      value={fieldArr.InternalName}
                                      key={fieldArr.InternalName}
                                    >
                                      {isNotNull(fieldArr.FieldName)
                                        ? fieldArr.FieldName
                                        : fieldArr.Title}
                                    </option>
                                  )
                                )}
                              </select>
                            </td>
                          </tr>
                        </tbody>
                      </Table>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              ""
            )}

            {detailField.ObjValidation.CalculateCondition.isCalculate &&
            detailField.ObjValidation.CalculateCondition.typeCalculation ==
              "CalforExp" ? (
              <div className="col-lg-12">
                <div className="form-group row">
                  <label htmlFor="example-text-input" className="col-md-3">
                    <button
                      type="button"
                      className="btn btn-primary btn-md waves-effect waves-light"
                      onClick={() =>
                        this.setState({ Calculation: !this.state.Calculation })
                      }
                    >
                      Ví dụ
                    </button>
                  </label>

                  <div className="col-md-5">
                    {this.state.Calculation ? (
                      <Toast>
                        <ToastHeader>
                          <strong className="mr-auto">
                            Danh sách trường dữ liệu
                          </strong>
                        </ToastHeader>
                        <ToastBody>
                          <div className="table-responsive mt-3">
                            <Table className="table table-striped mb-0">
                              <thead>
                                <tr>
                                  <th>Tên trường</th>
                                  <th>Trường nội bộ</th>
                                </tr>
                              </thead>
                              <tbody>
                                {listFormField
                                  .filter(
                                    (x) =>
                                      x.FieldType == objField.Number ||
                                      x.FieldType == objField.Sum ||
                                      x.FieldType == objField.Average ||
                                      x.FieldType == objField.Percent
                                  )
                                  .map((field) => (
                                    <tr key={field.InternalName}>
                                      <td>{field.FieldName}</td>
                                      <td> {`{${field.InternalName}}`}</td>
                                    </tr>
                                  ))}
                              </tbody>
                            </Table>
                          </div>
                        </ToastBody>
                      </Toast>
                    ) : (
                      ""
                    )}
                  </div>
                  <div className="col-md-4">
                    {this.state.Calculation ? (
                      <Toast>
                        <ToastHeader>
                          <strong className="mr-auto">
                            Danh sách các phép tính
                          </strong>
                        </ToastHeader>
                        <ToastBody>
                          <div className="table-responsive mt-3">
                            <Table className="table table-striped mb-0">
                              <thead>
                                <tr>
                                  <th>Phép tính</th>
                                  <th>Ký hiệu</th>
                                </tr>
                              </thead>
                              <tbody>
                                {arrayTypeCalculation.map((item) => (
                                  <tr key={item.Code}>
                                    <td>{item.Title}</td>
                                    <td> {item.Code}</td>
                                  </tr>
                                ))}
                                <tr>
                                  <td>Mở ngoặc</td>
                                  <td>(</td>
                                </tr>
                                <tr>
                                  <td>Đóng ngoặc</td>
                                  <td>)</td>
                                </tr>
                              </tbody>
                            </Table>
                          </div>
                        </ToastBody>
                      </Toast>
                    ) : (
                      ""
                    )}
                  </div>
                </div>
              </div>
            ) : (
              ""
            )}
            {detailField.FieldType == objField.Number &&
            detailField.ObjValidation.CalculateCondition.isCalculate &&
            detailField.ObjValidation.CalculateCondition.typeCalculation ==
              "CalforExp" &&
            this.state.Calculation ? (
              <div className="col-lg-12">
                <div className="form-group row">
                  <label htmlFor="example-text-input" className="col-md-3">
                    Ví dụ
                  </label>

                  <div className="col-md-9">
                    ( {`{So1}`} + {`{So2}`} ) / {`{So3}`}
                  </div>
                </div>
              </div>
            ) : (
              ""
            )}

            {detailField.ObjValidation.CalculateCondition.isCalculate &&
            detailField.ObjValidation.CalculateCondition.typeCalculation ==
              "CalforExp" ? (
              <div className="col-lg-12">
                <div className="form-group row">
                  <label htmlFor="example-text-input" className="col-md-3">
                    Biểu thức tính<span className="text-danger">*</span>
                  </label>
                  <div className="col-md-9">
                    <textarea
                      rows="3"
                      className="form-control"
                      name="Expression"
                      onChange={this.changeFormFieldModal}
                      value={
                        detailField.ObjValidation.CalculateCondition.Expression
                      }
                    ></textarea>
                  </div>
                </div>
              </div>
            ) : (
              ""
            )}

            {detailField.FieldType == objField.SPLinkWF ? (
              <ConfigLoadingControl
                listWorkflow={listWorkflow}
                ObjSPLink={detailField.ObjSPField.ObjField.ObjSPLink}
                resultLoadingControl={this.resultLoadingControl}
              />
            ) : (
              ""
            )}

            {detailField.FieldType == objField.ProcessControllers ? (
              <LoadingControllers
                listWorkflow={listWorkflow}
                ObjSPLink={detailField.ObjSPField.ObjField.ObjSPLink}
                listFormField={listFormField}
                resultLoadingControl={this.resultLoadingControl}
              />
            ) : (
              ""
            )}

            {detailField.FieldType == objField.LinkTags ? (
              <ConfigLinkTags
                listWorkflow={listWorkflow}
                ChoiceField={detailField.ObjSPField.ObjField.ChoiceField}
                resultLinkTags={this.resultLinkTags}
              />
            ) : (
              ""
            )}

            {detailField.FieldType == objField.Profile ? (
              <div className="col-lg-12">
                <div className="form-group row">
                  <label htmlFor="example-text-input" className="col-md-3">
                    Giá trị mặc định <span className="text-danger">*</span>
                  </label>
                  <div className="col-md-9">
                    <select
                      className="form-control"
                      name="DefaultValue"
                      onChange={this.changeFormFieldModal}
                      value={detailField.DefaultValue}
                    >
                      <option> </option>
                      <option value="Title"> Tiêu đề </option>
                      <option value="User"> Người dùng </option>
                      <option value="ApproveCode"> Mã phê duyệt </option>
                      <option value="RoleCode"> Mã vai trò </option>
                      <option value="DeptCode"> Mã phòng ban </option>
                      <option value="Unit"> Đơn vị </option>
                    </select>
                  </div>
                </div>
              </div>
            ) : (
              ""
            )}

            {detailField.FieldType == objField.Text ? (
              <div className="col-lg-12">
                <div className="form-group row">
                  <label htmlFor="example-text-input" className="col-md-3">
                    Giá trị mặc định
                  </label>
                  <div className="col-md-9">
                    <input
                      className="form-control"
                      type="text"
                      name="DefaultValue"
                      onChange={this.changeFormFieldModal}
                      value={detailField.DefaultValue}
                    />
                  </div>
                </div>
              </div>
            ) : (
              ""
            )}

            {detailField.FieldType == objField.Number ? (
              <div className="col-lg-12">
                <div className="form-group row">
                  <label htmlFor="example-text-input" className="col-md-3">
                    Giá trị mặc định
                  </label>
                  <div className="col-md-9">
                    <input
                      className="form-control"
                      type="number"
                      name="DefaultValue"
                      onChange={this.changeFormFieldModal}
                      value={detailField.DefaultValue}
                    />
                  </div>
                </div>
              </div>
            ) : (
              ""
            )}

            {detailField.FieldType == objField.Dropdown ? (
              <div className="col-lg-12">
                <div className="form-group row">
                  <label htmlFor="example-text-input" className="col-md-3">
                    Giá trị mặc định
                  </label>
                  <div className="col-md-9">
                    <select
                      className="form-control"
                      name="DefaultValue"
                      onChange={this.changeFormFieldModal}
                      value={detailField.DefaultValue}
                    >
                      <option value=""></option>
                      {detailField.ObjSPField.ObjField.ChoiceField.map(
                        (dfField, dfKey) => (
                          <option value={dfField} key={dfKey}>
                            {dfField}
                          </option>
                        )
                      )}
                    </select>
                  </div>
                </div>
              </div>
            ) : (
              ""
            )}
            {detailField.FieldType == objField.Hyperlink ||
            detailField.FieldType == objField.PictureLink ? (
              <div className="col-lg-12">
                <div className="form-group row">
                  <label htmlFor="example-text-input" className="col-md-3">
                    Giá trị mặc định
                  </label>
                  <div className="col-md-9">
                    <textarea
                      rows="3"
                      className="form-control"
                      type="text"
                      name="DefaultValue"
                      onChange={this.changeFormFieldModal}
                      value={detailField.DefaultValue}
                    ></textarea>
                  </div>
                </div>
              </div>
            ) : (
              ""
            )}

            {detailField.FieldType == objField.Label ? (
              <div className="col-lg-12">
                <div className="form-group row">
                  <label htmlFor="example-text-input" className="col-md-3">
                    Giá trị mặc định <span className="text-danger">*</span>
                  </label>
                  <div className="col-md-9">
                    <textarea
                      rows="3"
                      className="form-control"
                      type="text"
                      name="DefaultValue"
                      onChange={this.changeFormFieldModal}
                      value={detailField.DefaultValue}
                    ></textarea>
                  </div>
                </div>
              </div>
            ) : (
              ""
            )}
            {detailField.FieldType == objField.User ? (
              <div className="col-lg-12">
                <div className="form-group row">
                  <label htmlFor="example-text-input" className="col-md-3">
                    Loại giá trị mặc định
                  </label>
                  <div className="col-md-9">
                    <select
                      className="form-control"
                      name="TypeDefaultValue"
                      onChange={this.changeFormFieldModal}
                      value={detailField.TypeDefaultValue}
                    >
                      <option value=""></option>
                      <option value="CurrentData">Người đăng nhập</option>
                      <option value="InputValue">Gía trị nhập</option>
                      <option value="UserApprovalInStep">
                        Người xử lý tại bước
                      </option>
                    </select>
                  </div>
                </div>
              </div>
            ) : (
              ""
            )}
            {detailField.FieldType == objField.DateTime ? (
              <div className="col-lg-12">
                <div className="form-group row">
                  <label htmlFor="example-text-input" className="col-md-3">
                    Loại giá trị mặc định
                  </label>
                  <div className="col-md-9">
                    <select
                      className="form-control"
                      name="TypeDefaultValue"
                      onChange={this.changeFormFieldModal}
                      value={detailField.TypeDefaultValue}
                    >
                      <option value=""></option>
                      <option value="CurrentData">Ngày hiện tại</option>
                      <option value="InputValue">Gía trị nhập</option>
                    </select>
                  </div>
                </div>
              </div>
            ) : (
              ""
            )}
            {detailField.FieldType == objField.DateTime &&
            detailField.TypeDefaultValue == "InputValue" ? (
              <div className="col-lg-12">
                <div className="form-group row">
                  <label htmlFor="example-text-input" className="col-md-3">
                    Giá trị mặc định <span className="text-danger">*</span>
                  </label>
                  <div className="col-md-9">
                    <input
                      className="form-control"
                      type="date"
                      name="DefaultValue"
                      onChange={this.changeFormFieldModal}
                      value={detailField.DefaultValue}
                    />
                  </div>
                </div>
              </div>
            ) : (
              ""
            )}
            {detailField.FieldType == objField.User &&
            detailField.TypeDefaultValue == "InputValue" ? (
              <div className="col-lg-12">
                <div className="form-group row">
                  <label htmlFor="example-text-input" className="col-md-3">
                    Giá trị mặc định <span className="text-danger">*</span>
                  </label>
                  <div className="col-md-9">
                    <input
                      className="form-control"
                      type="text"
                      placeholder="Search users"
                      name="DefaultValue"
                      onChange={this.changeSearchPeople.bind(this)}
                      value={detailField.DefaultValue.UserTitle}
                    />
                    {detailField.listSearch_DefaultValue.length > 0 ? (
                      <div className="suggesAuto">
                        {detailField.listSearch_DefaultValue.map((people) => (
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
                  </div>
                </div>
              </div>
            ) : (
              ""
            )}
            {detailField.FieldType == objField.User &&
            detailField.TypeDefaultValue == "UserApprovalInStep" ? (
              <div className="col-lg-12">
                <div className="form-group row">
                  <label htmlFor="example-text-input" className="col-md-3">
                    Bước <span className="text-danger">*</span>
                  </label>
                  <div className="col-md-9">
                    <select
                      className="form-control"
                      name="DefaultValueStep"
                      onChange={this.changeFormFieldModal}
                      value={detailField.DefaultValue}
                    >
                      <option value=""></option>
                      {listStepWorkflow.map((dfStep) => (
                        <option value={dfStep.indexStep} key={dfStep.indexStep}>
                          {dfStep.StepTitle}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            ) : (
              ""
            )}
            <div className="col-lg-12">
                <div className="form-group row">
                  <label htmlFor="example-text-input" className="col-md-3">
                    Danh mục
                  </label>
                  <div className="col-md-9">
                  <select
                      className="form-control"
                      name="ComponentInfo"
                      onChange={this.changeFormFieldModal}
                      value={detailField.ComponentInfo}
                    >
                      <option value=""></option>
                      {ListComponentInfo.map((com,indexC) => (
                        <option value={com.Title} key={indexC}>
                          {com.Title}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            <div className="text-center mt-3 col-lg-12">
              <button
                type="button"
                className="btn btn-primary btn-md waves-effect waves-light mr-3"
                onClick={() => this.saveFormField()}
              >
                <i className="fa fa-floppy-o mr-2"></i>Lưu
              </button>
              <button
                type="button"
                className="btn btn-primary  btn-md waves-effect waves-light mr-3"
                onClick={() => this.resetFormField()}
              >
                <i className="fa fa-refresh mr-2"></i>Làm mới
              </button>
              <button
                type="button"
                className="btn btn-primary btn-md waves-effect waves-light"
                onClick={() => this.props.modalOpenClose(false)}
                data-dismiss="modal"
                aria-label="Close"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
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
                    this.removeFormValdation(
                      this.state.ConfirmParameter,
                      this.state.typeForm
                    )
                  }
                >
                  Có
                </button>
              </div>
            </div>
          </Modal>
        )}
        {!this.state.Required ? (
          ""
        ) : (
          <ConfirmRequired
            textRequired={this.state.RequiredText}
            modalOpenCloseAlert={this.modalOpenCloseAlert}
          />
        )}
      </Modal>
    );
  }
}

export default AddFormField;
