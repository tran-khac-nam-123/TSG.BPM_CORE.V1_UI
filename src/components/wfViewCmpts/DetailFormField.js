import React, { Component } from "react";
import {
  isNotNull,
  CheckNull,
  formatTypeObjField,
  FindTitleById,
  returnArray,
} from "../wfShareCmpts/wfShareFunction.js";
import {
  objField,
  arrayTypeCompare,
  objWFStatus,
} from "../wfShareCmpts/wfShareModel";
import { Modal, CardTitle } from "reactstrap";
import { Table, Thead, Tbody, Tr, Th, Td } from "react-super-responsive-table";
import moment from "moment";

class DetailFormField extends Component {
  constructor(props) {
    super(props);
    this.state = {
      detailField: this.props.detailField,
      listWorkflow: this.props.listWorkflow,
      listFieldSub: this.props.listFieldSub,
      listWFField: this.props.listWFField,
      listWFStep: this.props.listWFStep,
    };
    this.typingTimeout = null;
  }

  render() {
    const { detailField, listWorkflow, listFieldSub, listWFStep } = this.state;
    let listWFField = returnArray(this.state.listWFField);
    listWFField.push({
      ID: 0,
      FieldName: "ID",
      FieldType: objField.Number,
      InternalName: "ID",
      HelpText: "",
      Required: 0,
      ObjValidation: {},
      ObjSPField: "",
    });
    listWFField.push({
      ID: 0,
      FieldName: "Trạng thái",
      FieldType: objField.Number,
      InternalName: "StatusStep",
      HelpText: "",
      Required: 0,
      ObjValidation: {},
      ObjSPField: "",
    });
    listWFField.push({
      ID: 0,
      FieldName: "Người yêu cầu",
      FieldType: objField.User,
      InternalName: "UserRequest",
      HelpText: "",
      Required: 0,
      ObjValidation: {},
      ObjSPField: "",
    });
    listWFField.push({
      ID: 0,
      FieldName: "Người phê duyệt",
      FieldType: objField.User,
      InternalName: "UserApproval",
      HelpText: "",
      Required: 0,
      ObjValidation: {},
      ObjSPField: "",
    });
    listWFField.push({
      ID: 0,
      FieldName: "Ngày tạo",
      FieldType: objField.DateTime,
      InternalName: "Created",
      HelpText: "",
      Required: 0,
      ObjValidation: {},
      ObjSPField: "",
    });

    // console.log(listWFField);
    return (
      <Modal size="xl" isOpen={true}>
        <div className="modal-header">
          <h5 className="modal-title mt-0 text-primary" id="myLargeModalLabel">
            Chi tiết trường dữ liệu
          </h5>
          <button
            onClick={() => this.props.modalOpenClose(false, "wfField")}
            type="button"
            className="close"
            data-dismiss="modal"
            aria-label="Close"
          >
            <span aria-hidden="true">&times;</span>
          </button>
        </div>
        <div className="modal-body">
          {detailField ? (
            <div className="row">
              <div className="col-lg-6">
                <div className="form-group row">
                  <label htmlFor="example-text-input" className="col-md-6">
                    Tên trường
                  </label>
                  <div className="col-md-6 text-info">{detailField.Title}</div>
                </div>
              </div>

              <div className="col-lg-6">
                <div className="form-group row">
                  <label htmlFor="example-text-input" className="col-md-6">
                    {" "}
                    Kiểu dữ liệu
                  </label>
                  <div className="col-md-6 text-info">
                    {formatTypeObjField(detailField.FieldType)}
                  </div>
                </div>
              </div>

              <div className="col-lg-6">
                <div className="form-group row">
                  <label htmlFor="example-text-input" className="col-md-6">
                    Mô tả
                  </label>
                  <div className="col-md-6 text-info">
                    {detailField.HelpText}
                  </div>
                </div>
              </div>

              <div className="col-lg-6">
                <div className="form-group row">
                  <label htmlFor="example-text-input" className="col-md-6">
                    Trường nội bộ
                  </label>
                  <div className="col-md-6 text-info">
                    {detailField.InternalName}
                  </div>
                </div>
              </div>

              <div className="col-lg-6">
                <div className="form-group row">
                  <label htmlFor="example-text-input" className="col-md-6">
                    {" "}
                    Bắt buộc
                  </label>
                  <div className="col-md-6 text-info">
                    {detailField.Required == 1 ? "Có" : "Không"}
                  </div>
                </div>
              </div>

              {detailField.FieldType == objField.AutoSystemNumberIMG &&
              detailField.ObjSPField &&
              detailField.ObjSPField.ObjField &&
              detailField.ObjSPField.ObjField.ChoiceField &&
              detailField.ObjSPField.ObjField.ChoiceField.length > 0 ? (
                <div className="col-lg-6">
                  <div className="form-group row">
                    <label htmlFor="example-text-input" className="col-md-6">
                      Loại đề xuất
                    </label>
                    <div className="col-md-6 text-info">
                      {detailField.ObjSPField.ObjField.ChoiceField[0].Suffixes}
                    </div>
                  </div>
                </div>
              ) : (
                ""
              )}

              {detailField.FieldType == "Percent" ? (
                <div className="col-lg-6">
                  <div className="form-group row">
                    <label htmlFor="example-text-input" className="col-md-6">
                      Giá trị tính phần trăm
                    </label>
                    <div className="col-md-6 text-info">
                      {
                        detailField.ObjSPField.ObjField.ChoiceField[0]
                          .PercentValue
                      }
                    </div>
                  </div>
                </div>
              ) : (
                ""
              )}

              {detailField.FieldType == "Percent" ||
              detailField.FieldType == "Sum" ||
              detailField.FieldType == "Average" ? (
                <div className="col-lg-6">
                  <div className="form-group row">
                    <label htmlFor="example-text-input" className="col-md-6">
                      {" "}
                      Bước
                    </label>
                    <div className="col-md-6 text-info">
                      {isNotNull(
                        detailField.ObjSPField.ObjField.ChoiceField[0].indexStep
                      )
                        ? FindTitleById(
                            listWFStep,
                            "indexStep",
                            detailField.ObjSPField.ObjField.ChoiceField[0]
                              .indexStep,
                            "StepTitle"
                          )
                        : ""}
                    </div>
                  </div>
                </div>
              ) : (
                ""
              )}

              {detailField.FieldType == "Percent" ||
              detailField.FieldType == "Sum" ||
              detailField.FieldType == "Average" ? (
                <div className="col-lg-6">
                  <div className="form-group row">
                    <label htmlFor="example-text-input" className="col-md-6">
                      {" "}
                      Quy trình con
                    </label>
                    <div className="col-md-6 text-info">
                      {FindTitleById(
                        listWorkflow,
                        "ID",
                        detailField.ObjSPField.ObjField.ChoiceField[0]
                          .WFTableId,
                        "Title"
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                ""
              )}

              {detailField.FieldType == "Percent" ||
              detailField.FieldType == "Sum" ||
              detailField.FieldType == "Average" ? (
                <div className="col-lg-6">
                  <div className="form-group row">
                    <label htmlFor="example-text-input" className="col-md-6">
                      {" "}
                      Trường dữ liệu
                    </label>
                    <div className="col-md-6 text-info">
                      {FindTitleById(
                        listFieldSub,
                        "InternalName",
                        detailField.ObjSPField.ObjField.ChoiceField[0]
                          .InternalName,
                        "FieldName"
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                ""
              )}

              {CheckNull(detailField.ObjSPField.TextField) != "" &&
              detailField.FieldType != objField.SPLinkWF ? (
                <div className="col-lg-6">
                  <div className="form-group row">
                    <label htmlFor="example-text-input" className="col-md-6">
                      {" "}
                      Lựa chọn
                    </label>
                    <div className="col-md-6 text-info">
                      <textarea
                        className="form-control"
                        rows="3"
                        value={detailField.ObjSPField.TextField}
                        readOnly
                      ></textarea>
                    </div>
                  </div>
                </div>
              ) : (
                ""
              )}

              {detailField.FieldType == objField.SPLinkWF ||
              detailField.FieldType == objField.ProcessControllers ? (
                <div className="col-lg-6">
                  <div className="form-group row">
                    <label htmlFor="example-text-input" className="col-md-6">
                      {" "}
                      Link đến quy trình
                    </label>
                    <div className="col-md-6 text-info">
                      {FindTitleById(
                        listWorkflow,
                        "Code",
                        detailField.ObjSPField.ObjField.ObjSPLink.wfTableCode,
                        `Title`
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                ""
              )}

              {detailField.FieldType == objField.SPLinkWF ? (
                <div className="col-lg-6">
                  <div className="form-group row">
                    <label htmlFor="example-text-input" className="col-md-6">
                      {" "}
                      Loại hiển thị quy trình
                    </label>
                    <div className="col-md-6 text-info">
                      {detailField.ObjSPField.ObjField.ObjSPLink.typeSPLink ==
                      "ViewDetail"
                        ? "Chi tiết quy trình"
                        : "Đường dẫn Link"}
                    </div>
                  </div>
                </div>
              ) : (
                ""
              )}

              {(detailField.FieldType == objField.SPLinkWF ||
                detailField.FieldType == objField.ProcessControllers) &&
              detailField.ObjSPField.ObjField.ObjSPLink.ArrayFieldFilter
                .length > 0 ? (
                <div className="col-lg-6">
                  <div className="form-group row">
                    <label htmlFor="example-text-input" className="col-md-6">
                      {" "}
                      Trường tìm kiếm
                    </label>
                    <div className="col-md-6 text-info">
                      {detailField.ObjSPField.ObjField.ObjSPLink.ArrayFieldFilter.map(
                        (fls) => fls.FieldName + ", "
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                ""
              )}

              {detailField.FieldType == objField.SPLinkWF &&
              detailField.ObjSPField.ObjField.ObjSPLink.ArrayFieldFilter
                .length > 1 ? (
                <div className="col-lg-6">
                  <div className="form-group row">
                    <label htmlFor="example-text-input" className="col-md-6">
                      {" "}
                      Kiểu kết hợp tìm kiếm
                    </label>
                    <div className="col-md-6 text-info">
                      {detailField.ObjSPField.ObjField.ObjSPLink.TypeFilter ==
                      "or"
                        ? "Kết hợp hoặc"
                        : "Kết hợp và"}
                    </div>
                  </div>
                </div>
              ) : (
                ""
              )}

              {(detailField.FieldType == objField.SPLinkWF ||
                detailField.FieldType == objField.ProcessControllers) &&
              detailField.ObjSPField.ObjField.ObjSPLink.ArrayFieldView.length >
                0 ? (
                <div className="col-lg-6">
                  <div className="form-group row">
                    <label htmlFor="example-text-input" className="col-md-6">
                      {" "}
                      Trường hiển thị
                    </label>
                    <div className="col-md-6 text-info">
                      {detailField.ObjSPField.ObjField.ObjSPLink.ArrayFieldView.map(
                        (fls) => fls.FieldName + ", "
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                ""
              )}

              {detailField.FieldType == objField.ProcessControllers &&
              isNotNull(
                detailField.ObjSPField.ObjField.ObjSPLink.ArrButtonView
              ) &&
              detailField.ObjSPField.ObjField.ObjSPLink.ArrButtonView.length >
                0 ? (
                <div className="col-lg-6">
                  <div className="form-group row">
                    <label htmlFor="example-text-input" className="col-md-6">
                      {" "}
                      Trường hiển thị
                    </label>
                    <div className="col-md-6 text-info">
                      {detailField.ObjSPField.ObjField.ObjSPLink.ArrButtonView.map(
                        (fls) => fls.Title + ", "
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                ""
              )}

              {detailField.FieldType == objField.LinkTags &&
              detailField.ObjSPField &&
              detailField.ObjSPField.ObjField &&
              detailField.ObjSPField.ObjField.ChoiceField &&
              detailField.ObjSPField.ObjField.ChoiceField.length > 0 ? (
                <div className="col-lg-12">
                  {detailField.ObjSPField.ObjField.ChoiceField.map(
                    (links, linkIndex) => (
                      <div className="row border-row pt-3 mb-3" key={linkIndex}>
                        <div className="col-lg-12">
                          <CardTitle className="text-info mb-3">
                            Liên kết thứ {linkIndex + 1}
                          </CardTitle>
                        </div>

                        <div className="col-lg-12">
                          <div className="form-group row">
                            <label
                              htmlFor="example-text-input"
                              className="col-md-3"
                            >
                              Liên kết đến quy trình{" "}
                              <span className="text-danger">*</span>
                            </label>
                            <div className="col-md-9 text-info">
                              {links.wfTableTitle}
                            </div>
                          </div>
                        </div>

                        {links.ArrayFieldFilter &&
                        links.ArrayFieldFilter.length > 0 ? (
                          <div className="col-lg-12">
                            <div className="form-group row">
                              <label
                                htmlFor="example-text-input"
                                className="col-md-3"
                              >
                                Trường tìm kiếm
                              </label>
                              <div className="col-md-9 text-info">
                                {links.ArrayFieldFilter.map(
                                  (fls) => fls.FieldName + ", "
                                )}
                              </div>
                            </div>
                          </div>
                        ) : (
                          ""
                        )}

                        {links.ArrayFieldCondition &&
                        links.ArrayFieldCondition.length > 0 ? (
                          <div className="col-lg-12">
                            <div className="form-group row">
                              <label
                                htmlFor="example-text-input"
                                className="col-md-3"
                              >
                                Điều kiện mặc định
                              </label>
                              <div className="col-md-9 text-info">
                                <Table className="table table-striped">
                                  <thead>
                                    <tr>
                                      <th>Trường dữ liệu</th>
                                      <th>Loại điều kiện</th>
                                      <th>Giá trị điều kiện</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {links.ArrayFieldCondition.map(
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
                                            {fieldCon.InternalName ==
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
                                              : fieldCon.FieldSPLink
                                                  .FieldType ==
                                                objField.DateTime
                                              ? formatDate(
                                                  fieldCon.CompareValue
                                                )
                                              : CheckNull(
                                                  fieldCon.CompareValue
                                                )}
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
                      </div>
                    )
                  )}
                </div>
              ) : (
                ""
              )}

              {detailField.FieldType == objField.Profile ? (
                <div className="col-lg-6">
                  <div className="form-group row">
                    <label htmlFor="example-text-input" className="col-md-6">
                      {" "}
                      Giá trị mặc định
                    </label>
                    <div className="col-md-6 text-info">
                      {detailField.DefaultValue == "Title"
                        ? "Tiêu đề"
                        : detailField.DefaultValue == "User"
                        ? "Người dùng"
                        : detailField.DefaultValue == "RoleCode"
                        ? "Mã vai trò"
                        : detailField.DefaultValue == "ApproveCode"
                        ? "Mã phê duyệt"
                        : detailField.DefaultValue == "DeptCode"
                        ? "Mã phòng ban"
                        : detailField.DefaultValue == "Unit"
                        ? "Đơn vị"
                        : ""}
                    </div>
                  </div>
                </div>
              ) : (
                ""
              )}

              {detailField.FieldType == objField.Text ||
              detailField.FieldType == objField.Number ||
              detailField.FieldType == objField.Dropdown ||
              detailField.FieldType == objField.Label ? (
                <div className="col-lg-6">
                  <div className="form-group row">
                    <label htmlFor="example-text-input" className="col-md-6">
                      {" "}
                      Gía trị mặc định
                    </label>
                    <div className="col-md-6 text-info">
                      {detailField.DefaultValue}
                    </div>
                  </div>
                </div>
              ) : (
                ""
              )}

              {detailField.FieldType == objField.User &&
              isNotNull(detailField.TypeDefaultValue) ? (
                <div className="col-lg-6">
                  <div className="form-group row">
                    <label htmlFor="example-text-input" className="col-md-6">
                      {" "}
                      Loại giá trị mặc định
                    </label>
                    <div className="col-md-6 text-info">
                      {CheckNull(
                        detailField.TypeDefaultValue == "CurrentData"
                          ? "Người đăng nhập"
                          : detailField.TypeDefaultValue == "InputValue"
                          ? "Gía trị nhập"
                          : detailField.TypeDefaultValue == "UserApprovalInStep"
                          ? "Người xử lý tại bước"
                          : ""
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                ""
              )}

              {detailField.FieldType == objField.User &&
              detailField.TypeDefaultValue == "InputValue" ? (
                <div className="col-lg-6">
                  <div className="form-group row">
                    <label htmlFor="example-text-input" className="col-md-6">
                      {" "}
                      Giá trị mặc định
                    </label>
                    <div className="col-md-6 text-info">
                      {CheckNull(detailField.DefaultValue.UserTitle)}
                    </div>
                  </div>
                </div>
              ) : (
                ""
              )}

              {detailField.FieldType == objField.User &&
              detailField.TypeDefaultValue == "UserApprovalInStep" ? (
                <div className="col-lg-6">
                  <div className="form-group row">
                    <label htmlFor="example-text-input" className="col-md-6">
                      {" "}
                      Bước
                    </label>
                    <div className="col-md-6 text-info">
                      {FindTitleById(
                        listWFStep,
                        "indexStep",
                        detailField.DefaultValue,
                        "StepTitle"
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                ""
              )}

              {detailField.FieldType == objField.DateTime &&
              isNotNull(detailField.TypeDefaultValue) ? (
                <div className="col-lg-6">
                  <div className="form-group row">
                    <label htmlFor="example-text-input" className="col-md-6">
                      {" "}
                      Loại giá trị mặc định
                    </label>
                    <div className="col-md-6 text-info">
                      {CheckNull(
                        detailField.TypeDefaultValue == "CurrentData"
                          ? "Ngày hiện tại"
                          : detailField.TypeDefaultValue == "InputValue"
                          ? "Gía trị nhập"
                          : ""
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                ""
              )}

              {detailField.FieldType == objField.DateTime &&
              detailField.TypeDefaultValue == "InputValue" ? (
                <div className="col-lg-6">
                  <div className="form-group row">
                    <label htmlFor="example-text-input" className="col-md-6">
                      {" "}
                      Giá trị mặc định
                    </label>
                    <div className="col-md-6 text-info">
                      {CheckNull(
                        moment(new Date(detailField.DefaultValue)).format(
                          "DD-MM-YYYY"
                        )
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                ""
              )}

              {detailField.ObjValidation.IsActive == true &&
              detailField.ObjValidation.CompareCondition.length > 0 ? (
                <div className="col-lg-12">
                  <div className="form-group row">
                    <label htmlFor="example-text-input" className="col-md-3">
                      {" "}
                      Điều kiện so sánh
                    </label>
                    <div className="col-md-9 text-info">
                      <Table className="table table-striped">
                        <thead>
                          <tr>
                            <th>Điều kiện </th>
                            <th>Loại so sánh </th>
                            <th>Trường so sánh || Giá trị nhập </th>
                          </tr>
                        </thead>
                        <tbody>
                          {detailField.ObjValidation.CompareCondition.map(
                            (item, keyItem) => (
                              <tr key={keyItem}>
                                <td>
                                  {FindTitleById(
                                    item.arrCondition,
                                    "Code",
                                    item.Condition,
                                    "Title"
                                  )}
                                </td>
                                <td>
                                  {item.ConditionType == "FieldCompare"
                                    ? "Trường so sánh"
                                    : "Giá trị nhập"}
                                </td>
                                {item.ConditionType == "FieldCompare" ? (
                                  <td>
                                    {FindTitleById(
                                      listWFField,
                                      "InternalName",
                                      item.FieldCompare,
                                      "Title"
                                    )}
                                  </td>
                                ) : (
                                  <td>{item.Value}</td>
                                )}
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

              {detailField.ObjValidation.CalculateCondition.isCalculate ==
              true ? (
                <div className="col-lg-6">
                  <div className="form-group row">
                    <label htmlFor="example-text-input" className="col-md-6">
                      {" "}
                      Loại tính toán
                    </label>
                    <div className="col-md-6 text-info">
                      {detailField.ObjValidation.CalculateCondition
                        .typeCalculation == "CalforField"
                        ? "Tính toán theo trường dữ liệu"
                        : detailField.ObjValidation.CalculateCondition
                            .typeCalculation == "CalforExp"
                        ? "Tính toán theo biểu thức nhập"
                        : ""}
                    </div>
                  </div>
                </div>
              ) : (
                ""
              )}

              {detailField.ObjValidation.CalculateCondition.isCalculate ==
                true &&
              detailField.ObjValidation.CalculateCondition.typeCalculation ==
                "CalforField" ? (
                <div className="col-lg-12">
                  <div className="form-group row">
                    <label htmlFor="example-text-input" className="col-md-3">
                      {" "}
                      Là trường được tính toán
                    </label>
                    <div className="col-md-9 text-info">
                      <Table className="table table-striped">
                        <thead>
                          <tr>
                            <th>Trường dữ liệu </th>
                            <th>Phép tính </th>
                            <th>Trường tính </th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr>
                            <td>
                              {FindTitleById(
                                listWFField,
                                "InternalName",
                                detailField.ObjValidation.CalculateCondition
                                  .FieldNameEnd,
                                "Title"
                              )}
                            </td>
                            <td>
                              {FindTitleById(
                                detailField.ObjValidation.CalculateCondition
                                  .arrCalculation,
                                "Code",
                                detailField.ObjValidation.CalculateCondition
                                  .Calculation,
                                "Title"
                              )}
                            </td>
                            <td>
                              {FindTitleById(
                                listWFField,
                                "InternalName",
                                detailField.ObjValidation.CalculateCondition
                                  .FieldNameStart,
                                "Title"
                              )}
                            </td>
                          </tr>
                        </tbody>
                      </Table>
                    </div>
                  </div>
                </div>
              ) : (
                ""
              )}

              {detailField.ObjValidation.CalculateCondition.isCalculate ==
                true &&
              detailField.ObjValidation.CalculateCondition.typeCalculation ==
                "CalforExp" ? (
                <div className="col-lg-12">
                  <div className="form-group row">
                    <label htmlFor="example-text-input" className="col-md-3">
                      {" "}
                      Phép tính
                    </label>
                    <div className="col-md-9 text-info">
                      {CheckNull(
                        detailField.ObjValidation.CalculateCondition.Expression
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                ""
              )}

              {detailField.ObjSPField.Type == "SPLinkWF" &&
              detailField.ObjSPField.ObjField.ObjSPLink.ArrayFieldCondition
                .length > 0 ? (
                <div className="col-lg-12">
                  <div className="form-group row">
                    <label htmlFor="example-text-input" className="col-md-3">
                      {" "}
                      Điều kiện mặc định
                    </label>
                    <div className="col-md-9 text-info">
                      <Table className="table table-striped">
                        <thead>
                          <tr>
                            <th>Trường dữ liệu</th>
                            <th>Loại điều kiện</th>
                            <th>Giá trị điều kiện</th>
                          </tr>
                        </thead>
                        <tbody>
                          {detailField.ObjSPField.ObjField.ObjSPLink.ArrayFieldCondition.map(
                            (fieldCon, inCon) => (
                              <tr key={inCon}>
                                <td>
                                  {CheckNull(fieldCon.FieldSPLink.FieldName)}
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
                                  {fieldCon.InternalName == "StatusStep"
                                    ? FindTitleById(
                                        objWFStatus,
                                        "Code",
                                        fieldCon.CompareValue,
                                        "Title"
                                      )
                                    : fieldCon.FieldSPLink.FieldType ==
                                      objField.User
                                    ? CheckNull(fieldCon.CompareValue.UserTitle)
                                    : fieldCon.FieldSPLink.FieldType ==
                                      objField.UserMulti
                                    ? fieldCon.listCompareValue.length > 0
                                      ? fieldCon.listCompareValue.map(
                                          (fls) => fls.UserTitle + ", "
                                        )
                                      : ""
                                    : CheckNull(fieldCon.CompareValue)}
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

              {detailField.ObjSPField.Type == objField.ProcessControllers &&
              detailField.ObjSPField.ObjField.ObjSPLink.ArrayFieldCondition
                .length > 0 ? (
                <div className="col-lg-12">
                  <div className="form-group row">
                    <label htmlFor="example-text-input" className="col-md-3">
                      {" "}
                      Điều kiện mặc định
                    </label>
                    <div className="col-md-9 text-info">
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
                          {detailField.ObjSPField.ObjField.ObjSPLink.ArrayFieldCondition.map(
                            (fieldCon, inCon) => (
                              <tr key={inCon}>
                                <td>
                                  {CheckNull(fieldCon.FieldSPLink.FieldName)}
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
                                  {fieldCon.TypeCompare == "UserLogin"
                                    ? "Người đăng nhập"
                                    : fieldCon.TypeCompare == "CompareValue"
                                    ? "Gía trị nhập"
                                    : "Theo trường dữ liệu chính"}
                                </td>
                                <td>
                                  {fieldCon.TypeCompare == "CompareValueMain"
                                    ? FindTitleById(
                                        objWFStatus,
                                        "InternalName",
                                        fieldCon.CompareValue,
                                        "Title"
                                      )
                                    : fieldCon.InternalName == "StatusStep"
                                    ? FindTitleById(
                                        objWFStatus,
                                        "Code",
                                        fieldCon.CompareValue,
                                        "Title"
                                      )
                                    : fieldCon.FieldSPLink.FieldType ==
                                      objField.User
                                    ? CheckNull(fieldCon.CompareValue.UserTitle)
                                    : fieldCon.FieldSPLink.FieldType ==
                                      objField.UserMulti
                                    ? fieldCon.listCompareValue.length > 0
                                      ? fieldCon.listCompareValue.map(
                                          (fls) => fls.UserTitle + ", "
                                        )
                                      : ""
                                    : fieldCon.TypeCompare == "CompareValue"
                                    ? CheckNull(fieldCon.CompareValue)
                                    : ""}
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
            </div>
          ) : (
            ""
          )}
        </div>
        <div className="modal-footer">
          <div className="text-center mt-3 col-lg-12">
            <button
              type="button"
              className="btn btn-primary btn-md waves-effect waves-light"
              onClick={() => this.props.modalOpenClose(false, "wfField")}
              data-dismiss="modal"
              aria-label="Close"
            >
              Đóng
            </button>
          </div>
        </div>
      </Modal>
    );
  }
}

export default DetailFormField;
