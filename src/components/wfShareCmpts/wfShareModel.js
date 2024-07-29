const objField = {
  Text: "Text",
  TextArea: "TextArea",
  Number: "Number",
  DateTime: "DateTime",
  YesNo: "YesNo",
  User: "User",
  UserMulti: "UserMulti",
  Dropdown: "Dropdown",
  DropdownMulti:"DropdownMulti",
  CheckBox: "CheckBox",
  RadioButton: "RadioButton",
  SPLinkWF: "SPLinkWF",
  Hyperlink: "Hyperlink",
  PictureLink: "PictureLink",
  Label: "Label",
  Sum: "Sum",
  Average: "Average",
  Percent: "Percent",
  ProcessControllers: "ProcessControllers",
  Times: "Times",
  Profile: "Profile",
  // AutogenousCode: "AutogenousCode",
  LinkTags: "LinkTags",
  AutoSystemNumberIMG: "AutoSystemNumberIMG",
};

const arrayObjField = [
  { Title: "Một dòng văn bản", Type: "Text" },
  { Title: "Nhiều dòng văn bản", Type: "TextArea" },
  { Title: "Số", Type: "Number" },
  { Title: "Ngày", Type: "DateTime" },
  { Title: "Có/Không", Type: "YesNo" },
  { Title: "Một người", Type: "User" },
  { Title: "Nhiều người", Type: "UserMulti" },
  { Title: "Lựa chọn thả xuống", Type: "Dropdown" },
  { Title: "Lựa chọn nhiều", Type: "DropdownMulti" },
  { Title: "Lựa chọn hộp", Type: "CheckBox" },
  { Title: "Lựa chọn nút", Type: "RadioButton" },
  { Title: "TSG-WF", Type: "SPLinkWF" },
  { Title: "Đường dẫn", Type: "Hyperlink" },
  { Title: "Đường dẫn hình ảnh", Type: "PictureLink" },
  { Title: "Nhãn", Type: "Label" },
  { Title: "Tổng", Type: "Sum" },
  { Title: "Trung bình cộng", Type: "Average" },
  { Title: "Phần trăm", Type: "Percent" },
  { Title: "Process Controllers", Type: "ProcessControllers" },
  { Title: "Thời gian", Type: "Times" },
  { Title: "Thông tin người dùng", Type: "Profile" },
  { Title: "Mã tự sinh", Type: "AutogenousCode" },
  { Title: "Thẻ liên kết", Type: "LinkTags" },
  { Title: "Số hệ thống IMG", Type: "AutoSystemNumberIMG" },
];

const typeCalculation = {
  Addition: "+", // Phép cộng
  Subtraction: "-", // Phép trừ
  Multiplication: "*", // Phép nhân
  Division: "/", // Phép chia
};

const arrayTypeCalculation = [
  { Code: "+", Title: "Cộng" },
  { Code: "-", Title: "Trừ" },
  { Code: "*", Title: "Nhân" },
  { Code: "/", Title: "Chia" },
];

const typeCompare = {
  Eq: "=",
  Ne: "!=",
  Gt: ">",
  Lt: "<",
  Ge: ">=",
  Le: "<=",
};

const arrayTypeCompare = [
  { Code: "=", Title: "Bằng" },
  { Code: "!=", Title: "Khác" },
  { Code: ">", Title: "Lớn hơn" },
  { Code: "<", Title: "Nhỏ hơn" },
  { Code: ">=", Title: "Lớn hơn hoặc bằng" },
  { Code: "<=", Title: "Nhỏ hơn hoặc bằng" },
];

const objSPField = {
  Text: {
    Title: "Một dòng văn bản",
    Type: "Text",
    spType: "Text",
    spFormat: "",
  },
  TextArea: {
    Title: "Nhiều dòng văn bản",
    Type: "TextArea",
    spType: "Note",
    spFormat: "",
  },
  Number: { Title: "Số", Type: "Number", spType: "Number", spFormat: "" },
  DateTime: {
    Title: "Ngày",
    Type: "DateTime",
    spType: "DateTime",
    spFormat: "DateOnly",
  },
  YesNo: {
    Title: "Có/Không",
    Type: "YesNo",
    spType: "Boolean",
    spFormat: false,
  },
  User: {
    Title: "Một người",
    Type: "User",
    spType: "User",
    spFormat: "PeopleOnly",
  },
  UserMulti: {
    Title: "Nhiều người",
    Type: "UserMulti",
    spType: "User",
    spFormat: "PeopleOnly",
  },
  Dropdown: {
    Title: "Lựa chọn thả xuống",
    Type: "Dropdown",
    spType: "Choice",
    spFormat: "Dropdown",
  },
  DropdownMulti: {
    Title: "Lựa chọn nhiều",
    Type: "DropdownMulti",
    spType: "MultiChoice",
    spFormat: "DropdownMulti",
  },
  CheckBox: {
    Title: "Lựa chọn hộp",
    Type: "CheckBox",
    spType: "MultiChoice",
    spFormat: "CheckBox",
  },
  RadioButton: {
    Title: "Lựa chọn nút",
    Type: "RadioButton",
    spType: "Choice",
    spFormat: "RadioButtons",
  },
  Sum: { Title: "Tổng", Type: "Sum", spType: "Number", spFormat: "" },
  Average: {
    Title: "Trung bình cộng",
    Type: "Average",
    spType: "Number",
    spFormat: "",
  },
  Percent: {
    Title: "Phần trăm",
    Type: "Percent",
    spType: "Number",
    spFormat: "",
  },
  SPLinkWF: {
    Title: "TSG-WF",
    Type: "SPLinkWF",
    spType: "Note",
    spFormat: "",
  },
  Hyperlink: {
    Title: "Đường dẫn",
    Type: "Hyperlink",
    spType: "URL",
    spFormat: "Hyperlink",
  },
  PictureLink: {
    Title: "Đường dẫn hình ảnh",
    Type: "PictureLink",
    spType: "URL",
    spFormat: "Image",
  },
  Label: {
    Title: "Nhãn",
    Type: "Label",
    spType: "Note",
    spFormat: "",
  },
  ProcessControllers: {
    Title: "Loading Controller",
    Type: "ProcessControllers",
    spType: "Note",
    spFormat: "",
  },
  Times: {
    Title: "Thông tin người dùng",
    Type: "Times",
    spType: "DateTime",
    spFormat: "DateTime",
  },
  Profile: {
    Title: "Thông tin người dùng",
    Type: "Profile",
    spType: "Text",
    spFormat: "",
  },
  AutogenousCode: {
    Title: "Mã tự sinh",
    Type: "AutogenousCode",
    spType: "Text",
    spFormat: "",
  },
  LinkTags: {
    Title: "Thẻ liên kết",
    Type: "LinkTags",
    spType: "Note",
    spFormat: "",
  },
  AutoSystemNumberIMG: {
    Title: "Số hệ thống IMG",
    Type: "AutoSystemNumberIMG",
    spType: "Text",
    spFormat: "",
  },
};

const objDataTransfer = {
  DataTransmitted: "DataTransmitted",
  DataReceived: "DataReceived",
  DataSynchronized: "DataSynchronized",
};

const arrayDataTransfer = [
  { Code: "DataTransmitted", Title: "<==" },
  { Code: "DataReceived", Title: "==>" },
  { Code: "DataSynchronized", Title: " <==>" },
];

const colspan = [
  { Code: 1, Title: "Col 1" },
  { Code: 2, Title: "Col 2" },
  { Code: 3, Title: "Col 3" },
  { Code: 4, Title: "Col 4" },
  { Code: 5, Title: "Col 5" },
  { Code: 6, Title: "Col 6" },
  { Code: 7, Title: "Col 7" },
  { Code: 8, Title: "Col 8" },
  { Code: 9, Title: "Col 9" },
  { Code: 10, Title: "Col 10" },
  { Code: 11, Title: "Col 11" },
  { Code: 12, Title: "Col 12" },
];

const objWFStatus = [
  { Code: 0, Title: "Đang xử lý" },
  { Code: 1, Title: "Hoàn thành" },
  { Code: 2, Title: "Từ chối" },
  { Code: 3, Title: "Đã lưu" },
  { Code: 4, Title: "Yêu cầu chỉnh sửa" },
];

const ArrayButtonAction = [
  { Code: "Save", Title: "Lưu" },
  { Code: "Submit", Title: "Gửi đi" },
  { Code: "Reset", Title: "Làm mới" },
  { Code: "Approval", Title: "Phê duyệt" },
  { Code: "ReAssign", Title: "Giao lại cho" },
  { Code: "BackStep", Title: "Chuyển bước" },
  { Code: "Reject", Title: "Từ chối" },
];

export {
  objField,
  arrayObjField,
  typeCalculation,
  arrayTypeCalculation,
  typeCompare,
  arrayTypeCompare,
  objSPField,
  objDataTransfer,
  arrayDataTransfer,
  colspan,
  objWFStatus,
  ArrayButtonAction,
};
