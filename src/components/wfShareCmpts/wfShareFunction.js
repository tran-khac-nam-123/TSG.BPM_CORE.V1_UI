import * as moment from "moment";
import {
  objField,
  arrayObjField,
  typeCalculation,
  typeCompare,
} from "./wfShareModel";
function isNotNull(str) {
  return str !== null && str !== undefined && str !== "";
}

function CheckNull(str) {
  if (!isNotNull(str)) {
    return "";
  } else {
    return str;
  }
}

function CheckNullSetZero(str) {
  try {
    if (!isNotNull(str)) {
      return 0;
    } else if (isNaN(str)) {
      return 0;
    } else {
      return Number(str);
    }
  } catch (e) {
    return 0;
  }
}

function getQueryParams(qs) {
  qs = qs.split("+").join(" ");

  let params = {},
    tokens,
    re = /[?&]?([^=]+)=([^&]*)/g;

  while ((tokens = re.exec(qs))) {
    params[decodeURIComponent(tokens[1])] = decodeURIComponent(tokens[2]);
  }

  return params;
}

function CalculateDate(dateStart, dateEnd) {
  try {
    let output = "";
    let startDate = moment(dateStart); // $('[name="date-start"]').val() === "13.04.2016"
    let endDate = moment(dateEnd); // $('[name="date-end"]').val() === "28.04.2016"

    output = endDate.diff(startDate, "days");

    return output;
  } catch (error) {
    console.log(error);
    return "";
  }
}

function CalculateNumber(numStart, numEnd, calculation) {
  try {
    let output = "";
    switch (calculation) {
      case typeCalculation.Addition:
        output = CheckNullSetZero(numEnd) + CheckNullSetZero(numStart);
        break;
      case typeCalculation.Subtraction:
        output = CheckNullSetZero(numEnd) - CheckNullSetZero(numStart);
        break;
      case typeCalculation.Multiplication:
        output = CheckNullSetZero(numEnd) * CheckNullSetZero(numStart);
        break;
      case typeCalculation.Division:
        output = CheckNullSetZero(numEnd) / CheckNullSetZero(numStart);
        break;
      default:
        output = "";
        break;
    }
    return output;
  } catch (error) {
    console.log(error);
    return "";
  }
}

function CompareDate(Field, FieldCompare, comparison) {
  try {
    let output = false;
    switch (comparison) {
      case typeCompare.Eq:
        if (Field == FieldCompare) {
          output = true;
        }
        break;
      case typeCompare.Gt:
        if (Field > FieldCompare) {
          output = true;
        }
        break;
      case typeCompare.Lt:
        if (Field < FieldCompare) {
          output = true;
        }
        break;
      case typeCompare.Ge:
        if (Field >= FieldCompare) {
          output = true;
        }
        break;
      case typeCompare.Le:
        if (Field <= FieldCompare) {
          output = true;
        }
        break;
      default:
        output = false;
        break;
    }
    return output;
  } catch (error) {
    console.log(error);
    return false;
  }
}

function CompareNumber(Field, FieldCompare, comparison) {
  try {
    let output = false;
    switch (comparison) {
      case typeCompare.Eq:
        if (CheckNullSetZero(Field) == CheckNullSetZero(FieldCompare)) {
          output = true;
        }
        break;
      case typeCompare.Gt:
        if (CheckNullSetZero(Field) > CheckNullSetZero(FieldCompare)) {
          output = true;
        }
        break;
      case typeCompare.Lt:
        if (CheckNullSetZero(Field) < CheckNullSetZero(FieldCompare)) {
          output = true;
        }
        break;
      case typeCompare.Ge:
        if (CheckNullSetZero(Field) >= CheckNullSetZero(FieldCompare)) {
          output = true;
        }
        break;
      case typeCompare.Le:
        if (CheckNullSetZero(Field) <= CheckNullSetZero(FieldCompare)) {
          output = true;
        }
        break;
      default:
        output = false;
        break;
    }
    return output;
  } catch (error) {
    console.log(error);
    return false;
  }
}

function ISODateString(d) {
  function pad(n) {
    return n < 10 ? "0" + n : n;
  }
  return (
    d.getUTCFullYear() +
    "-" +
    pad(d.getUTCMonth() + 1) +
    "-" +
    pad(d.getUTCDate()) +
    "T" +
    pad(d.getUTCHours()) +
    ":" +
    pad(d.getUTCMinutes()) +
    ":" +
    pad(d.getUTCSeconds()) +
    "Z"
  );
}

function formatDate(params) {
  let date = "";
  if (isNotNull(params)) {
    date = CheckNull(moment(params).format("DD/MM/YYYY"));
  }
  return date;
}

function formatStatusText(status) {
  let active = "Đang xử lý";
  switch (status) {
    case 0:
      active = "Đang xử lý";
      break;
    case 1:
      active = "Hoàn thành";
      break;
    case 2:
      active = "Từ chối";
      break;
    case -1:
      active = "Đã lưu";
      break;
    default:
      active = "Đang xử lý";
      break;
  }
  return active;
}

function formatStatusLabel(status) {
  let active = `label_warming`;
  switch (status) {
    case 0:
      active = `label_warming`;
      break;
    case 1:
      active = `label_success`;
      break;
    case 2:
      active = `label_danger`;
      break;
    case -1:
      active = `label_save`;
      break;
    default:
      active = `label_warming`;
      break;
  }
  return active;
}

function formatStatusTextLine(status) {
  let active = "Chờ xử lý";
  switch (status) {
    case 0:
      active = "Chờ xử lý";
      break;
    case 1:
      active = "Hoàn thành";
      break;
    case 2:
      active = "Từ chối";
      break;
    case -1:
      active = "Đã lưu";
      break;
    default:
      active = "Chờ xử lý";
      break;
  }
  return active;
}

function getFileBuffer(file) {
  const reader = new FileReader();
  reader.readAsArrayBuffer(file);
  return reader;
}

function FindTitleById(ArrayCompare, FieldCompare, ValueCompare, FieldOut) {
  let value = ValueCompare;
  if (ArrayCompare.length > 0) {
    let Out = ArrayCompare.find((x) => x[FieldCompare] == ValueCompare);
    // console.log(Out);
    if (isNotNull(Out)) {
      value = Out[FieldOut];
    }
  }
  // console.log(value);
  return value;
}

function formatActiveText(status) {
  let active = "Đang khởi tạo";
  switch (status) {
    case 0:
      active = "Đang khởi tạo";
      break;
    case 1:
      active = "Đang hoạt động";
      break;
    case 2:
      active = "Ngừng hoạt động";
      break;
    default:
      active = "Đang khởi tạo";
      break;
  }
  return active;
}

function formatActiveLabel(status) {
  let active = `badge badge-warning`;
  switch (status) {
    case 0:
      active = `badge badge-warning`;
      break;
    case 1:
      active = `badge badge-primary`;
      break;
    case 2:
      active = `badge badge-danger`;
      break;
    default:
      active = `badge badge-warning`;
      break;
  }
  return active;
}

function formatTypeObjField(typeField) {
  let type = "";
  const objfield = arrayObjField.find((f) => f.Type == typeField);
  if (isNotNull(objfield)) {
    type = objfield.Title;
  }
  return type;
}

function returnArray(arrayOld) {
  const arrayNew = [];
  arrayOld.map((item) => {
    arrayNew.push(item);
  });
  return arrayNew;
}

function returnObject(objOld) {
  let objNew = Object.assign({}, objOld);
  return objNew;
}

function checkLicense(license) {
  let isLicense = false;
  if (!license.isLimited) {
    // console.log("isLimited false");
    isLicense = true;
    return true;
  }
  if (license.isLimited) {
    // console.log(moment("today: " +license.today).toDate() + " ## numberDay: " + license.numberDay);
    // console.log(license.numberDay);
    const expirationDate = moment(license.today).add(license.numberDay, "days");

    // console.log(expirationDate);
    // console.log(expirationDate.endOf('days').toDate());

    if (expirationDate.endOf("days").toDate() >= new Date()) {
      // console.log("isLimited true and license true");
      isLicense = true;
      return true;
    }
  }
  // console.log("license false");
  return isLicense;
}

function isValidURL(string) {
  var res = string.match(
    /(http(s)?:\/\/.)?(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)/g
  );
  return res !== null;
}

// Kiểm tra điều kiện khi tạo mới 1 điều kiện trong cấu hình của 1 bước
function checkFormCondition(typeForm, arrItemCon) {
  let txtRequired = "";
  if (typeForm == "ConditionCompare") {
    for (let index = 0; index < arrItemCon.length; index++) {
      let rowRequired = "";
      if (!isNotNull(arrItemCon[index].Field)) {
        rowRequired += " Trường dữ liệu,";
      }
      if (!isNotNull(arrItemCon[index].Condition)) {
        rowRequired += " Điều kiện,";
      }
      if (!isNotNull(arrItemCon[index].ConditionType)) {
        rowRequired += " Loại so sánh,";
      }
      if (
        !isNotNull(arrItemCon[index].FieldCompare) &&
        arrItemCon[index].ConditionType == "FieldCompare"
      ) {
        rowRequired += " Trường so sánh,";
      }
      if (
        !isNotNull(arrItemCon[index].Value) &&
        (arrItemCon[index].ConditionType == "FieldValue" ||
          !isNotNull(arrItemCon[index].ConditionType)) &&
        (arrItemCon[index].FieldType == objField.Number ||
          arrItemCon[index].FieldType == objField.DateTime)
      ) {
        rowRequired += " Giá trị nhập,";
      }
      if (isNotNull(rowRequired)) {
        txtRequired += "Dòng " + (index + 1) + ": " + rowRequired + " \n";
      }
    }
  } else if (typeForm == "ConditionCalculate") {
    for (let index = 0; index < arrItemCon.length; index++) {
      let rowRequired = "";
      if (!isNotNull(arrItemCon[index].Field.FieldNameEnd)) {
        rowRequired += " Trường dữ liệu,";
      }
      if (!isNotNull(arrItemCon[index].Field.Calculate)) {
        rowRequired += " Phép tính,";
      }
      if (!isNotNull(arrItemCon[index].Field.FieldNameStart)) {
        rowRequired += " Trường tính,";
      }
      if (!isNotNull(arrItemCon[index].Condition)) {
        rowRequired += " Điều kiện,";
      }
      if (!isNotNull(arrItemCon[index].ConditionType)) {
        rowRequired += " Loại so sánh,";
      }
      if (
        !isNotNull(arrItemCon[index].FieldCompare) &&
        arrItemCon[index].ConditionType == "FieldCompare"
      ) {
        rowRequired += " Trường so sánh,";
      }
      if (
        !isNotNull(arrItemCon[index].Value) &&
        (arrItemCon[index].ConditionType == "FieldValue" ||
          !isNotNull(arrItemCon[index].ConditionType))
      ) {
        rowRequired += " Giá trị nhập,";
      }
      if (isNotNull(rowRequired)) {
        txtRequired += "Dòng " + (index + 1) + ": " + rowRequired + " \n";
      }
    }
  }
  return txtRequired;
}

function checkAddStepCondition(arrConditions) {
  let txtStepCon = "";
  for (let index = 0; index < arrConditions.length; index++) {
    let txtRow = "";
    let stepCondition = returnObject(arrConditions[index]);
    let arrItemCon = returnArray(stepCondition.ObjCondition);

    if (!isNotNull(stepCondition.TypeCondition)) {
      txtRow += "Loại điều kiện, ";
    }
    if (arrItemCon.length == 0) {
      txtRow += "Điều kiện chuyển hướng, ";
    }
    if (arrItemCon.length > 1 && !isNotNull(stepCondition.ConditionsCombined)) {
      txtRow += "Điều kiện kết hợp, ";
    }
    if (arrItemCon.length > 0) {
      let txtAlert = "";
      if (stepCondition.TypeCondition == "Compare") {
        txtAlert = checkFormCondition("ConditionCompare", arrItemCon);
      } else {
        txtAlert = checkFormCondition("ConditionCalculate", arrItemCon);
      }
      if (isNotNull(txtAlert)) {
        txtRow += "Thông tin điều kiện chuyển hướng quy trình: \n" + txtAlert;
      }
    }
    if (isNotNull(txtRow)) {
      txtStepCon +=
        "Nhánh chuyển hướng " +
        (index + 1) +
        " chưa đầy đủ thông tin: \n" +
        txtRow +
        " \n";
    }
  }
  return txtStepCon;
}

function checkSaveStepForm(detailStep) {
  let txtCheck = "";
  if (!isNotNull(detailStep.StepTitle)) {
    txtCheck += "Tiêu đề bước, ";
  }
  if (!isNotNull(detailStep.StepCode)) {
    txtCheck += "Mã bước, ";
  }
  if (isNotNull(detailStep.StepCode)) {
    let listCheck = "1234567890QWERTYUIOPASDFGHJKLZXCVBNM";
    let check = true;
    for (let i = 0; i < detailStep.StepCode.length; i++) {
      let result = listCheck.includes(detailStep.StepCode[i].toUpperCase());
      if (result == false) {
        check = false;
        break;
      }
    }
    if (check == false) {
      txtCheck += "Mã bước không được chứa ký tự đặc biệt! , ";
    }
  }
  if (!isNotNull(detailStep.StepWFType)) {
    txtCheck += "Loại bước, ";
  }
  if (
    !isNotNull(detailStep.TypeofApprover) &&
    detailStep.ClassifyStep != "Start"
  ) {
    txtCheck += "Phê duyệt theo, ";
  }
  if (
    detailStep.TypeofApprover == "Mã và vai trò phê duyệt" &&
    !isNotNull(detailStep.ApproveCode)
  ) {
    txtCheck += "Mã phê duyệt, ";
  }
  if (
    detailStep.TypeofApprover == "Mã và vai trò phê duyệt" &&
    !isNotNull(detailStep.RoleCode)
  ) {
    txtCheck += "Mã vai trò, ";
  }

  if (
    detailStep.TypeofApprover == "Phòng ban và mã vai trò" &&
    !isNotNull(detailStep.RoleCode)
  ) {
    txtCheck += "Mã vai trò, ";
  }
  if (detailStep.TypeofApprover == "Người phê duyệt") {
    if (!isNotNull(detailStep.GroupApprover.TypeUserApproval)) {
      txtCheck += "Loại người phê duyệt, ";
    } else {
      if (
        detailStep.GroupApprover.TypeUserApproval == "Một người phê duyệt" &&
        !isNotNull(detailStep.UserApprover.UserId)
      ) {
        txtCheck += "người phê duyệt, ";
      }
      if (
        detailStep.GroupApprover.TypeUserApproval == "Nhóm người phê duyệt" &&
        !isNotNull(detailStep.GroupApprover.Group.ID)
      ) {
        txtCheck += "Nhóm người phê duyệt, ";
      }
    }
  }
  if (
    detailStep.TypeofApprover == "Người xử lý tại bước" &&
    !isNotNull(detailStep.ApproverInStep)
  ) {
    txtCheck += "Bước xử lý , ";
  }
  if (
    ( detailStep.TypeofApprover == "Data field" || detailStep.TypeofApprover == "Select") &&
    !isNotNull(detailStep.ApproverInField)
  ) {
    txtCheck += "Trường dữ liệu, ";
  }

  if (detailStep.StepWFType == "Quy trình") {
    if (detailStep.ObjStepWFId.length > 0) {
      let txtRequird = checkaddStepSubWF(detailStep.ObjStepWFId);
      if (isNotNull(txtRequird)) {
        txtCheck += " \n " + txtRequird;
      }
    } else {
      txtCheck += "Quy trình con, ";
    }
  }
  if (detailStep.ObjFieldStep.FieldInput.length > 0) {
    let txtFieldInput = checkFormStepFields(detailStep.ObjFieldStep.FieldInput);
    if (isNotNull(txtFieldInput)) {
      txtCheck += "Trường dữ liệu nhập: \n " + txtFieldInput;
    }
  }

  if (detailStep.ObjFieldStep.FieldView.length == 0) {
    txtCheck += "Trường dữ liệu hiển thị, ";
  }

  if (detailStep.ObjFieldStep.FieldView.length > 0) {
    let txtFieldView = checkFormStepFields(detailStep.ObjFieldStep.FieldView);
    if (isNotNull(txtFieldView)) {
      txtCheck += "Trường dữ hiển thị: \n " + txtFieldView;
    }
  }

  if (detailStep.ObjStepCondition.IsActive) {
    if (detailStep.ObjStepCondition.ArrayStepCondition.length > 0) {
      let txtRequird = checkAddStepCondition(
        detailStep.ObjStepCondition.ArrayStepCondition
      );
      if (isNotNull(txtRequird)) {
        txtCheck += " \n " + txtRequird;
      }
    } else {
      txtCheck += "Nhánh chuyển hướng, ";
    }
  }

  if (
    detailStep.ObjEmailCfg.EmailSendDeadline.IsActive &&
    !isNotNull(detailStep.ObjEmailCfg.EmailSendDeadline.NumberHours)
  ) {
    txtCheck += "Thời gian gửi thông báo deadline, ";
  }
  if (
    detailStep.ObjEmailCfg.EmailSendDeadline.IsActive &&
    CheckNullSetZero(detailStep.SLA) <
      CheckNullSetZero(detailStep.ObjEmailCfg.EmailSendDeadline.NumberHours)
  ) {
    txtCheck += "Thời gian gửi thông báo deadline không được lớn hơn SLA, ";
  }
  // if (detailStep.btnAction == 0) {
  //   txtCheck += "Nút chức năng, ";
  // }
  if (
    detailStep.btnAction.findIndex((x) => x == "BackStep") != -1 &&
    detailStep.ObjBackStep.length == 0
  ) {
    txtCheck += "Danh sách chuyển bước, ";
  }
  return txtCheck;
}

function checkaddStepSubWF(arrSubWFs) {
  let txtSubWF = "";

  for (let index = 0; index < arrSubWFs.length; index++) {
    let txtSubRow = "";
    if (!isNotNull(arrSubWFs[index].WFTableId)) {
      txtSubRow += "Tên quy trình con, ";
    }
    if (
      isNotNull(arrSubWFs[index].ObjInitialization) &&
      !isNotNull(arrSubWFs[index].ObjInitialization.TypeUserApproval)
    ) {
      txtSubRow += "Loại người khởi tạo, ";
    }
    if (
      isNotNull(arrSubWFs[index].ObjInitialization) &&
      arrSubWFs[index].ObjInitialization.TypeUserApproval ==
        "UserApprovalInStep" &&
      !isNotNull(arrSubWFs[index].ObjInitialization.Step)
    ) {
      txtSubRow += "Bước, ";
    }
    if (
      isNotNull(arrSubWFs[index].ObjInitialization) &&
      arrSubWFs[index].ObjInitialization.TypeUserApproval ==
        "ApproverInField" &&
      !isNotNull(arrSubWFs[index].ObjInitialization.Field)
    ) {
      txtSubRow += "Trường dữ liệu, ";
    }
    if (
      isNotNull(arrSubWFs[index].ObjInitialization) &&
      arrSubWFs[index].ObjInitialization.TypeUserApproval == "Designator" &&
      arrSubWFs[index].ObjInitialization.UserApprover.length == 0
    ) {
      txtSubRow += "Người chỉ định, ";
    }
    if (arrSubWFs[index].AlowDataTransfer) {
      let txtAlert = checkFormCorrespondingFields(
        arrSubWFs[index].CorrespondingFields
      );
      if (isNotNull(txtAlert)) {
        txtSubRow +=
          "Thông tin đồng bộ dữ liệu quy trình cha và con: \n" + txtAlert;
      }
    }

    if (isNotNull(txtSubRow)) {
      txtSubWF +=
        "Quy trình con " +
        (index + 1) +
        " chưa đầy đủ thông tin: \n" +
        txtSubRow +
        " \n";
    }
  }
  return txtSubWF;
}

function checkFormCorrespondingFields(CorrespondingFields) {
  let txtRequired = "";
  for (let index = 0; index < CorrespondingFields.length; index++) {
    let rowRequired = "";
    if (!isNotNull(CorrespondingFields[index].FieldSub.InternalName)) {
      rowRequired += "Trường dữ liệu con, ";
    }
    if (!isNotNull(CorrespondingFields[index].FieldParent.InternalName)) {
      rowRequired += "Trường dữ liệu cha, ";
    }
    if (!isNotNull(CorrespondingFields[index].DataTransfer)) {
      rowRequired += "Loại đồng bộ, ";
    }
    if (isNotNull(rowRequired)) {
      txtRequired += "Dòng " + (index + 1) + ": " + rowRequired + " \n";
    }
  }
  return txtRequired;
}

function checkFormStepFields(ArrayStepField) {
  let txtRequired = "";
  for (let index = 0; index < ArrayStepField.length; index++) {
    let rowRequired = "";
    if (!isNotNull(ArrayStepField[index].InternalName)) {
      rowRequired += "Trường dữ liệu, ";
    }
    if (!isNotNull(ArrayStepField[index].Colspan)) {
      rowRequired += "Loại colspan, ";
    }
    if (isNotNull(rowRequired)) {
      txtRequired += "Dòng " + (index + 1) + ": " + rowRequired + " \n";
    }
  }
  return txtRequired;
}

function checkFormConditionSPLink(ArrayFieldCondition) {
  let txtRequired = "";
  for (let index = 0; index < ArrayFieldCondition.length; index++) {
    let txtRows = "";
    let objFieldCondition = returnObject(ArrayFieldCondition[index]);
    if (!isNotNull(objFieldCondition.InternalName)) {
      txtRows += "Trường dữ liệu, ";
    }
    if (!isNotNull(objFieldCondition.ConditionType)) {
      txtRows += "Điều kiện, ";
    }
    if (
      !isNotNull(objFieldCondition.CompareValue) &&
      (objFieldCondition.FieldSPLink.FieldType == objField.Number ||
        objFieldCondition.FieldSPLink.FieldType == objField.DateTime ||
        objFieldCondition.FieldSPLink.FieldType == objField.Sum ||
        objFieldCondition.FieldSPLink.FieldType == objField.Average ||
        objFieldCondition.FieldSPLink.FieldType == objField.Percent)
    ) {
      txtRows += "Giá trị điều kiện, ";
    }
    if (
      objFieldCondition.FieldSPLink.FieldType == objField.User &&
      !isNotNull(objFieldCondition.CompareValue.UserId)
    ) {
      txtRows += "Giá trị điều kiện, ";
    }
    if (
      objFieldCondition.FieldSPLink.FieldType == objField.UserMulti &&
      isNotNull(objFieldCondition.listCompareValue) &&
      objFieldCondition.listCompareValue.length == 0
    ) {
      txtRows += "Giá trị điều kiện, ";
    }
    if (isNotNull(txtRows)) {
      txtRequired += "Dòng " + (index + 1) + ": " + txtRows + " \n";
    }
  }
  return txtRequired;
}

function checkFormLoadingController(ArrayFieldCondition) {
  let txtRequired = "";
  for (let index = 0; index < ArrayFieldCondition.length; index++) {
    let txtRows = "";
    let objFieldCondition = returnObject(ArrayFieldCondition[index]);
    if (!isNotNull(objFieldCondition.InternalName)) {
      txtRows += "Trường dữ liệu, ";
    }
    if (!isNotNull(objFieldCondition.ConditionType)) {
      txtRows += "Điều kiện, ";
    }
    if (!isNotNull(objFieldCondition.TypeCompare)) {
      txtRows += "Loại so sánh, ";
    }
    if (
      !isNotNull(objFieldCondition.CompareValue) &&
      (objFieldCondition.FieldSPLink.FieldType == objField.Number ||
        objFieldCondition.FieldSPLink.FieldType == objField.DateTime ||
        objFieldCondition.FieldSPLink.FieldType == objField.Sum ||
        objFieldCondition.FieldSPLink.FieldType == objField.Average ||
        objFieldCondition.FieldSPLink.FieldType == objField.Percent) &&
      objFieldCondition.InternalName != "StatusStep"
    ) {
      txtRows += "Giá trị điều kiện, ";
    }
    if (
      objFieldCondition.FieldSPLink.FieldType == objField.User &&
      (!isNotNull(
        objFieldCondition.CompareValue &&
          objFieldCondition.TypeCompare == "CompareValueMain"
      ) ||
        (objFieldCondition.TypeCompare == "CompareValue" &&
          !isNotNull(objFieldCondition.CompareValue.UserId)))
    ) {
      txtRows += "Giá trị điều kiện, ";
    }
    if (
      objFieldCondition.FieldSPLink.FieldType == objField.UserMulti &&
      (!isNotNull(objFieldCondition.listCompareValue) ||
        (objFieldCondition.TypeCompare == "CompareValue" &&
          objFieldCondition.listCompareValue.length == 0))
    ) {
      txtRows += "Giá trị điều kiện, ";
    }
    if (isNotNull(txtRows)) {
      txtRequired += "Dòng " + (index + 1) + ": " + txtRows + " \n";
    }
  }
  return txtRequired;
}
function TotalSLA(ArrSLA, indexStep) {
  let total = 0;
  ArrSLA.filter((x) => x.indexStep != indexStep).forEach((element) => {
    total += CheckNullSetZero(element.SLA);
  });
  return total;
}

function checkFormLinkTags(choiceField) {
  let textLinkTags = "";
  for (let c = 0; c < choiceField.length; c++) {
    let rowLink = "";
    let objLinkTags = returnObject(choiceField[c]);
    if (!isNotNull(objLinkTags.wfTableId)) {
      rowLink += "Liên kết đến quy trình,";
    }
    if (objLinkTags.ArrayFieldCondition.length > 0) {
      let textCondition = checkFormConditionSPLink(
        objLinkTags.ArrayFieldCondition
      );
      if (isNotNull(textCondition)) {
        rowLink += "Thông tin điều kiện mặc định: \n" + textCondition;
      }
    }

    if (isNotNull(rowLink)) {
      textLinkTags +=
        "Liên kết thứ " +
        (c + 1) +
        " chưa đầy đủ thông tin: \n" +
        rowLink +
        " \n";
    }
  }
  return textLinkTags;
}

export {
  isNotNull,
  CheckNull,
  CheckNullSetZero,
  getQueryParams,
  CalculateDate,
  CalculateNumber,
  CompareNumber,
  CompareDate,
  ISODateString,
  formatDate,
  formatStatusText,
  formatStatusLabel,
  formatStatusTextLine,
  getFileBuffer,
  FindTitleById,
  formatActiveText,
  formatActiveLabel,
  formatTypeObjField,
  returnArray,
  returnObject,
  checkLicense,
  isValidURL,
  checkFormCondition,
  checkAddStepCondition,
  checkSaveStepForm,
  checkaddStepSubWF,
  checkFormCorrespondingFields,
  checkFormStepFields,
  checkFormConditionSPLink,
  checkFormLoadingController,
  TotalSLA,
  checkFormLinkTags,
};
