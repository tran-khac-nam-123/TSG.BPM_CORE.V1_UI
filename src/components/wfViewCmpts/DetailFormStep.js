import React, { Component } from "react";

import {
  isNotNull,
  CheckNull,
  FindTitleById,
} from "../wfShareCmpts/wfShareFunction.js";
import {
  ArrayButtonAction,
  arrayDataTransfer,
  colspan,
} from "../wfShareCmpts/wfShareModel";
import { Modal } from "reactstrap";
import { Table, Thead, Tbody, Tr, Th, Td } from "react-super-responsive-table";

class DetailFormStep extends Component {
  constructor(props) {
    super(props);
    this.state = {
      detailStep: this.props.detailStep,
      listDept: this.props.listDept,
      listApproveCode: this.props.listApproveCode,
      listRoleCode: this.props.listRoleCode,
      listWFStep: this.props.listWFStep,
      listWFField: this.props.listWFField,
    };
    this.typingTimeout = null;
  }

  render() {
    const {
      listWFField,
      detailStep,
      listDept,
      listApproveCode,
      listRoleCode,
      listWFStep,
    } = this.state;
    // console.log(this.state);
    return (
      <Modal size="xl" isOpen={true}>
        <div className="modal-header">
          <h5 className="modal-title mt-0 text-primary" id="myLargeModalLabel">
            Chi tiết bước quy trình
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
          {detailStep ? (
            <div className="row">
              <div className="col-lg-6">
                <div className="form-group row">
                  <label htmlFor="example-text-input" className="col-md-6">
                    Tiêu đề bước
                  </label>
                  <div className="col-md-6 text-info">
                    {detailStep.StepTitle}
                  </div>
                </div>
              </div>

              <div className="col-lg-6">
                <div className="form-group row">
                  <label htmlFor="example-text-input" className="col-md-6">
                    Mã bước
                  </label>
                  <div className="col-md-6 text-info">
                    {detailStep.StepCode}
                  </div>
                </div>
              </div>

              <div className="col-lg-6">
                <div className="form-group row">
                  <label htmlFor="example-text-input" className="col-md-6">
                    Loại bước
                  </label>
                  <div className="col-md-6 text-info">
                    {detailStep.StepWFType}
                  </div>
                </div>
              </div>

              <div className="col-lg-6">
                <div className="form-group row">
                  <label htmlFor="example-text-input" className="col-md-6">
                    Phê duyệt theo
                  </label>
                  <div className="col-md-6 text-info">
                    {detailStep.TypeofApprover}
                  </div>
                </div>
              </div>

              {detailStep.TypeofApprover == "Phòng ban và mã phê duyệt" ||
              detailStep.TypeofApprover == "Phòng ban và mã vai trò" ? (
                <div className="col-lg-6">
                  <div className="form-group row">
                    <label htmlFor="example-text-input" className="col-md-6">
                      Phòng ban
                    </label>
                    <div className="col-md-6 text-info">
                      {isNotNull(detailStep.DepartmentCode)
                        ? FindTitleById(
                            listDept,
                            "Code",
                            detailStep.DepartmentCode,
                            "Title"
                          )
                        : "Phòng ban người đăng nhập"}
                    </div>
                  </div>
                </div>
              ) : (
                ""
              )}

              {detailStep.TypeofApprover == "Mã và vai trò phê duyệt" ? (
                <div className="col-lg-6">
                  <div className="form-group row">
                    <label htmlFor="example-text-input" className="col-md-6">
                      Mã phê duyệt
                    </label>
                    <div className="col-md-6 text-info">
                      {FindTitleById(
                        listApproveCode,
                        `Code`,
                        detailStep.ApproveCode,
                        `Title`
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                ""
              )}

              {detailStep.TypeofApprover == "Phòng ban và mã phê duyệt" ? (
                <div className="col-lg-6">
                  <div className="form-group row">
                    <label htmlFor="example-text-input" className="col-md-6">
                      Mã phê duyệt
                    </label>
                    <div className="col-md-6 text-info">
                      {!isNotNull(detailStep.ApproveCode)
                        ? "Người đăng nhập chỉ định"
                        : FindTitleById(
                            listApproveCode,
                            `Code`,
                            detailStep.ApproveCode,
                            `Title`
                          )}
                    </div>
                  </div>
                </div>
              ) : (
                ""
              )}

              {detailStep.TypeofApprover == "Mã và vai trò phê duyệt" ||
              detailStep.TypeofApprover == "Phòng ban và mã vai trò" ? (
                <div className="col-lg-6">
                  <div className="form-group row">
                    <label htmlFor="example-text-input" className="col-md-6">
                      {" "}
                      Mã vai trò
                    </label>
                    <div className="col-md-6 text-info">
                      {FindTitleById(
                        listRoleCode,
                        `Code`,
                        detailStep.RoleCode,
                        `Title`
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                ""
              )}

              {detailStep.TypeofApprover == "Người phê duyệt" ? (
                <div className="col-lg-6">
                  <div className="form-group row">
                    <label htmlFor="example-text-input" className="col-md-6">
                      Loại người phê duyệt
                    </label>
                    <div className="col-md-6 text-info">
                      {detailStep.GroupApprover.TypeUserApproval}
                    </div>
                  </div>
                </div>
              ) : (
                ""
              )}

              {detailStep.TypeofApprover == "Người phê duyệt" &&
              detailStep.GroupApprover.TypeUserApproval ==
                "Một người phê duyệt" ? (
                <div className="col-lg-6">
                  <div className="form-group row">
                    <label htmlFor="example-text-input" className="col-md-6">
                      Người phê duyệt
                    </label>
                    <div className="col-md-6 text-info">
                      {detailStep.UserApprover.UserTitle}
                    </div>
                  </div>
                </div>
              ) : detailStep.TypeofApprover == "Người phê duyệt" &&
                detailStep.GroupApprover.TypeUserApproval ==
                  "Nhóm người phê duyệt" ? (
                <div className="col-lg-6">
                  <div className="form-group row">
                    <label htmlFor="example-text-input" className="col-md-6">
                      Nhóm người phê duyệt
                    </label>
                    <div className="col-md-6 text-info">
                      {detailStep.GroupApprover.Group.Title}
                    </div>
                  </div>
                </div>
              ) : (
                ""
              )}

              {detailStep.TypeofApprover == "Người xử lý tại bước" ? (
                <div className="col-lg-6">
                  <div className="form-group row">
                    <label htmlFor="example-text-input" className="col-md-6">
                      Bước xử lý
                    </label>
                    <div className="col-md-6 text-info">
                      {FindTitleById(
                        listWFStep,
                        "indexStep",
                        detailStep.ApproverInStep,
                        "StepTitle"
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                ""
              )}

              {detailStep.TypeofApprover == "Trường dữ liệu" ? (
                <div className="col-lg-6">
                  <div className="form-group row">
                    <label htmlFor="example-text-input" className="col-md-6">
                      Trường dữ liệu
                    </label>
                    <div className="col-md-6 text-info">
                      {FindTitleById(
                        listWFField,
                        "InternalName",
                        detailStep.ApproverInField,
                        "Title"
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                ""
              )}
 {detailStep.TypeofApprover == "Select" ? (
                <div className="col-lg-6">
                  <div className="form-group row">
                    <label htmlFor="example-text-input" className="col-md-6">
                      Data field
                    </label>
                    <div className="col-md-6 text-info">
                      {FindTitleById(
                        listWFField,
                        "InternalName",
                        detailStep.ApproverInField,
                        "Title"
                      )}
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
                                {fieldx[fieldx.TitleS]['UserTitle']}
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
              <div className="col-lg-6">
                <div className="form-group row">
                  <label htmlFor="example-text-input" className="col-md-6">
                    {" "}
                    Cho phép chỉ định dánh sách người phê duyệt trên Apps
                  </label>
                  <div className="col-md-6 text-info">
                    {detailStep.ApproveRunTime &&
                    detailStep.ApproveRunTime.IsActive
                      ? "Có"
                      : "Không"}
                  </div>
                </div>
              </div>

              <div className="col-lg-6">
                <div className="form-group row">
                  <label htmlFor="example-text-input" className="col-md-6">
                    {" "}
                    Bước kế tiếp(Mặc định)
                  </label>
                  <div className="col-md-6 text-info">
                    {detailStep.StepNextDefault.StepNextDefaultTitle}
                  </div>
                </div>
              </div>

              {detailStep.StepWFType == "Quy trình" &&
              detailStep.ObjStepWFId.length > 0
                ? detailStep.ObjStepWFId.map((item, index) => (
                    <div
                      className="col-lg-12"
                      style={{
                        border: "solid 1px red",
                        marginBottom: "15px",
                      }}
                      key={index}
                    >
                      <div className="form-group row">
                        <label
                          htmlFor="example-text-input"
                          className="col-md-3"
                        >
                          <h5>Quy trình con {index + 1}</h5>{" "}
                        </label>
                        <div className="col-md-9">
                          <div className="row">
                            <div className="col-lg-6">
                              <div className="form-group row">
                                <label htmlFor="example-text-input">
                                  Tên quy trình :{" "}
                                </label>
                                <div className="text-info">
                                  {" "}
                                  {item.WFTableTitle}
                                </div>
                              </div>
                            </div>
                            <div className="col-lg-6">
                              <div className="form-group row">
                                <label htmlFor="example-text-input">
                                  {" "}
                                  Đồng bộ :{" "}
                                </label>
                                <div className="text-info">
                                  {" "}
                                  {item.Waitting ? "Có" : "Không"}
                                </div>
                              </div>
                            </div>
                            {isNotNull(item.ObjInitialization) ? (
                              <div className="col-lg-6">
                                <div className="form-group row">
                                  <label htmlFor="example-text-input">
                                    {" "}
                                    Tự động khởi chạy :{" "}
                                  </label>
                                  <div className="text-info">
                                    {" "}
                                    {item.ObjInitialization.AlowLaunch
                                      ? "Có"
                                      : "Không"}
                                  </div>
                                </div>
                              </div>
                            ) : (
                              ""
                            )}
                            {isNotNull(item.TypeOfInitialization) ? (
                              <div className="col-lg-6">
                                <div className="form-group row">
                                  <label htmlFor="example-text-input">
                                    {" "}
                                    Loại khởi chạy :{" "}
                                  </label>
                                  <div className="text-info">
                                    {" "}
                                    {item.TypeOfInitialization == "Save"
                                      ? "Lưu"
                                      : "Gửi đi"}
                                  </div>
                                </div>
                              </div>
                            ) : (
                              ""
                            )}
                            {isNotNull(item.ObjInitialization) ? (
                              <div className="col-lg-6">
                                <div className="form-group row">
                                  <label htmlFor="example-text-input">
                                    Loại người khởi tạo:{" "}
                                  </label>
                                  <div className="text-info">
                                    {" "}
                                    {isNotNull(
                                      item.ObjInitialization.TypeUserApproval
                                    ) &&
                                    item.ObjInitialization.TypeUserApproval ==
                                      "Designator"
                                      ? "Người chỉ định"
                                      : isNotNull(
                                          item.ObjInitialization
                                            .TypeUserApproval
                                        ) &&
                                        item.ObjInitialization
                                          .TypeUserApproval == "Approval"
                                      ? "Người phê duyệt"
                                      : item.ObjInitialization
                                          .TypeUserApproval == "ShowDialog" &&
                                        !item.ObjInitialization.AlowLaunch
                                      ? "Người chỉ định bằng tay"
                                      : item.ObjInitialization
                                          .TypeUserApproval ==
                                        "UserApprovalInStep"
                                      ? "Người xử lý tại bước"
                                      : item.ObjInitialization
                                          .TypeUserApproval == "ApproverInField"
                                      ? "Trường dữ liệu"
                                      : ""}
                                  </div>
                                </div>
                              </div>
                            ) : (
                              ""
                            )}
                            {isNotNull(item.ObjInitialization) &&
                            isNotNull(
                              item.ObjInitialization.TypeUserApproval
                            ) &&
                            item.ObjInitialization.TypeUserApproval ==
                              "Designator" ? (
                              <div className="col-lg-6">
                                <div className="form-group row">
                                  <label htmlFor="example-text-input">
                                    Người khởi tạo :{" "}
                                  </label>
                                  <div className="text-info">
                                    {" "}
                                    {item.ObjInitialization.UserApprover
                                      .length > 0
                                      ? item.ObjInitialization.UserApprover.map(
                                          (x) => x.UserTitle + ", "
                                        )
                                      : ""}
                                  </div>
                                </div>
                              </div>
                            ) : (
                              ""
                            )}
                            {isNotNull(item.ObjInitialization) &&
                            isNotNull(
                              item.ObjInitialization.TypeUserApproval
                            ) &&
                            item.ObjInitialization.TypeUserApproval ==
                              "ApproverInField" ? (
                              <div className="col-lg-6">
                                <div className="form-group row">
                                  <label htmlFor="example-text-input">
                                    Trường dữ liệu :{" "}
                                  </label>
                                  <div className="text-info">
                                    {" "}
                                    {listWFField.length > 0
                                      ? FindTitleById(
                                          listWFField,
                                          "InternalName",
                                          item.ObjInitialization.Field,
                                          "Title"
                                        )
                                      : ""}
                                  </div>
                                </div>
                              </div>
                            ) : (
                              ""
                            )}
                            {isNotNull(item.ObjInitialization) &&
                            isNotNull(
                              item.ObjInitialization.TypeUserApproval
                            ) &&
                            item.ObjInitialization.TypeUserApproval ==
                              "UserApprovalInStep" ? (
                              <div className="col-lg-6">
                                <div className="form-group row">
                                  <label htmlFor="example-text-input">
                                    Bước :{" "}
                                  </label>
                                  <div className="text-info">
                                    {" "}
                                    {listWFStep.length > 0
                                      ? FindTitleById(
                                          listWFStep,
                                          "indexStep",
                                          item.ObjInitialization.Step,
                                          "StepTitle"
                                        )
                                      : ""}
                                  </div>
                                </div>
                              </div>
                            ) : (
                              ""
                            )}
                            <div className="col-lg-6">
                              <div className="form-group row">
                                <label htmlFor="example-text-input">
                                  {" "}
                                  Cho phép đồng bộ dữ liệu quy trình cha và con
                                  :{" "}
                                </label>
                                <div className="text-info">
                                  {" "}
                                  {item.AlowDataTransfer ? "Có" : "Không"}
                                </div>
                              </div>
                            </div>
                          </div>
                          {item.CorrespondingFields.length > 0 ? (
                            <div className="col-lg-12">
                              <div className="form-group row">
                                <Table className="table table-striped">
                                  <thead>
                                    <tr>
                                      <th>Trường dữ liệu con</th>
                                      <th>Loại đồng bộ</th>
                                      <th>Trường dữ liệu cha</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {item.CorrespondingFields.map(
                                      (fields, index) => (
                                        <tr key={index}>
                                          <td>{fields.FieldSub.FieldName}</td>
                                          <td>
                                            {FindTitleById(
                                              arrayDataTransfer,
                                              "Code",
                                              fields.DataTransfer,
                                              "Title"
                                            )}
                                          </td>
                                          <td>
                                            {fields.FieldParent.FieldName}
                                          </td>
                                        </tr>
                                      )
                                    )}
                                  </tbody>
                                </Table>
                              </div>
                            </div>
                          ) : (
                            ""
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                : ""}

              {!detailStep.ObjStepCondition.IsActive ? (
                ""
              ) : (
                <div className="col-lg-12">
                  <div className="form-group row">
                    <label htmlFor="example-text-input" className="col-md-3">
                      {" "}
                      Điều kiện chuyển hướng
                    </label>
                    <div className="col-md-9 text-info">
                      <Table className="table table-striped">
                        <thead>
                          <tr>
                            <td>Nhánh chuyển hướng</td>
                            <td>Độ ưu tiên</td>
                            <td>Loại điều kiện</td>
                            <td>Điều kiên kết hợp</td>
                            <td>Điều kiện</td>
                            <td>Bước kê tiếp</td>
                          </tr>
                        </thead>
                        <tbody>
                          {detailStep.ObjStepCondition.ArrayStepCondition.map(
                            (stepCon, inStep) => (
                              <tr key={inStep}>
                                <td>Nhánh {inStep + 1}</td>
                                <td>{stepCon.Priority}</td>
                                <td>{stepCon.TypeCondition}</td>
                                <td>{stepCon.ConditionsCombined}</td>
                                {stepCon.TypeCondition == "Calculate" ? (
                                  <td>
                                    {stepCon.ObjCondition.map((con) => (
                                      <p key={con.Field.FieldNameEnd}>
                                        ( {con.Field.FieldNameEnd}{" "}
                                        {con.Field.Calculate}{" "}
                                        {con.Field.FieldNameStart} ){" "}
                                        {con.Condition}{" "}
                                        {con.FieldCompare != ""
                                          ? con.FieldCompare
                                          : con.Value}
                                      </p>
                                    ))}
                                  </td>
                                ) : (
                                  <td>
                                    {stepCon.ObjCondition.map((con) => (
                                      <p key={con.Field}>
                                        {con.Field} {con.Condition}{" "}
                                        {con.FieldCompare != ""
                                          ? con.FieldCompare
                                          : con.Value}
                                      </p>
                                    ))}
                                  </td>
                                )}
                                <td>
                                  {
                                    stepCon.StepNextCondition
                                      .StepNextConditionTitle
                                  }
                                </td>
                              </tr>
                            )
                          )}
                        </tbody>
                      </Table>
                    </div>
                  </div>
                </div>
              )}
              {detailStep.ObjFieldStep.FieldInput.length > 0 ? (
                <div
                  className="col-lg-12"
                  style={{
                    border: "solid 1px red",
                    marginBottom: "15px",
                  }}
                >
                  <div className="form-group row">
                    <label htmlFor="example-text-input" className="col-md-3">
                      Trường dữ liệu nhập
                    </label>
                    <div className="col-md-9">
                      <Table className="table table-striped">
                        <thead>
                          <tr>
                            <th>Trường dữ liệu </th>
                            <th>Colspan</th>
                            <th>Là cột đầu tiên</th>
                          </tr>
                        </thead>
                        <tbody>
                          {detailStep.ObjFieldStep.FieldInput.length > 0
                            ? detailStep.ObjFieldStep.FieldInput.map(
                                (fieldsSub, indexSub) => (
                                  <tr key={indexSub}>
                                    <td>
                                      {FindTitleById(
                                        listWFField,
                                        "InternalName",
                                        fieldsSub.InternalName,
                                        "Title"
                                      )}
                                    </td>
                                    <td>
                                      {isNotNull(fieldsSub.Colspan)
                                        ? FindTitleById(
                                            colspan,
                                            "Code",
                                            fieldsSub.Colspan,
                                            "Title"
                                          )
                                        : ""}
                                    </td>
                                    <td>
                                      {isNotNull(fieldsSub.IsFirstColumn)
                                        ? fieldsSub.IsFirstColumn == true
                                          ? "Có"
                                          : "Không"
                                        : ""}
                                    </td>
                                  </tr>
                                )
                              )
                            : ""}
                        </tbody>
                      </Table>
                    </div>
                  </div>
                </div>
              ) : (
                ""
              )}

              {detailStep.ObjFieldStep.FieldView.length > 0 ? (
                <div
                  className="col-lg-12"
                  style={{
                    border: "solid 1px red",
                    marginBottom: "15px",
                  }}
                >
                  <div className="form-group row">
                    <label htmlFor="example-text-input" className="col-md-3">
                      Trường dữ liệu hiển thị
                    </label>
                    <div className="col-md-9">
                      <Table className="table table-striped">
                        <thead>
                          <tr>
                            <th>Trường dữ liệu </th>
                            <th>Colspan</th>
                            <th>Là cột đầu tiên</th>
                          </tr>
                        </thead>
                        <tbody>
                          {detailStep.ObjFieldStep.FieldView.length > 0
                            ? detailStep.ObjFieldStep.FieldView.map(
                                (fieldsSub, indexSub) => (
                                  <tr key={indexSub}>
                                    <td>
                                      {FindTitleById(
                                        listWFField,
                                        "InternalName",
                                        fieldsSub.InternalName,
                                        "Title"
                                      )}
                                    </td>
                                    <td>
                                      {isNotNull(fieldsSub.Colspan)
                                        ? FindTitleById(
                                            colspan,
                                            "Code",
                                            fieldsSub.Colspan,
                                            "Title"
                                          )
                                        : ""}
                                    </td>
                                    <td>
                                      {isNotNull(fieldsSub.IsFirstColumn)
                                        ? fieldsSub.IsFirstColumn == true
                                          ? "Có"
                                          : "Không"
                                        : ""}
                                    </td>
                                  </tr>
                                )
                              )
                            : ""}
                        </tbody>
                      </Table>
                    </div>
                  </div>
                </div>
              ) : (
                ""
              )}
              <div className="col-lg-6">
                <div className="form-group row">
                  <label htmlFor="example-text-input" className="col-md-6">
                    {" "}
                    SLA
                  </label>
                  <div className="col-md-6 text-info">{detailStep.SLA}</div>
                </div>
              </div>

              <div className="col-lg-6">
                <div className="form-group row">
                  <label htmlFor="example-text-input" className="col-md-6">
                    {" "}
                    Tài liệu đính kèm
                  </label>
                  <div className="col-md-6 text-info">
                    {detailStep.ObjFieldStep.isAttachments
                      ? "Thêm tài liệu đính kèm , "
                      : ""}
                    {detailStep.ObjFieldStep.isEditAttachments
                      ? "Chỉnh sửa tài liệu đính kèm , "
                      : ""}
                    {detailStep.ObjFieldStep.isViewAttachments
                      ? "Xem tài liệu đính kèm , "
                      : ""}
                    {detailStep.ObjFieldStep.isDeleteAttachments
                      ? "Xóa tài liệu đính kèm , "
                      : ""}
                    {detailStep.ObjFieldStep.isDocuSignDocuments
                      ? "Ký tài liệu đính kèm , "
                      : ""}
                  </div>
                </div>
              </div>

              {detailStep.ObjEmailCfg.EmailSendApprover ? (
                <div className="col-lg-6">
                  <div className="form-group row">
                    <label htmlFor="example-text-input" className="col-md-6">
                      {" "}
                      Mẫu Email đến người phê duyệt
                    </label>
                    <div className="col-md-6 text-info">
                      {
                        detailStep.ObjEmailCfg.EmailSendApprover
                          .ObjEmailTemplate.TemplateTitle
                      }
                    </div>
                  </div>
                </div>
              ) : (
                ""
              )}

              {detailStep.ObjEmailCfg.EmailSendUserRequest ? (
                <div className="col-lg-6">
                  <div className="form-group row">
                    <label htmlFor="example-text-input" className="col-md-6">
                      {" "}
                      Mẫu Email đến người yêu cầu
                    </label>
                    <div className="col-md-6 text-info">
                      {
                        detailStep.ObjEmailCfg.EmailSendUserRequest
                          .ObjEmailTemplate.TemplateTitle
                      }
                    </div>
                  </div>
                </div>
              ) : (
                ""
              )}

              {detailStep.ObjEmailCfg.EmailSendInform ? (
                <div className="col-lg-6">
                  <div className="form-group row">
                    <label htmlFor="example-text-input" className="col-md-6">
                      {" "}
                      Mẫu Email thông báo
                    </label>
                    <div className="col-md-6 text-info">
                      {
                        detailStep.ObjEmailCfg.EmailSendInform.ObjEmailTemplate
                          .TemplateTitle
                      }
                    </div>
                  </div>
                </div>
              ) : (
                ""
              )}
              {detailStep.ObjEmailCfg.EmailSendInform ? (
                <div className="col-lg-6">
                  <div className="form-group row">
                    <label htmlFor="example-text-input" className="col-md-6">
                      {" "}
                      Cho phép gửi mail khi lưu :
                    </label>
                    <div className="col-md-6 text-info">
                      {detailStep.ObjEmailCfg.EmailSendInform.AlowSaveSendMail
                        ? "Có"
                        : "Không"}
                    </div>
                  </div>
                </div>
              ) : (
                ""
              )}
              {detailStep.ObjEmailCfg.EmailSendInform ? (
                <div className="col-lg-6">
                  <div className="form-group row">
                    <label htmlFor="example-text-input" className="col-md-6">
                      {" "}
                      Người nhận mặc định trong trường dữ liệu :
                    </label>
                    <div className="col-md-6 text-info">
                      {detailStep.ObjEmailCfg.EmailSendInform.ObjUserDefault
                        .length > 0
                        ? detailStep.ObjEmailCfg.EmailSendInform.ObjUserDefault.map(
                            (item) => item.UserTitle + ", "
                          )
                        : ""}
                    </div>
                  </div>
                </div>
              ) : (
                ""
              )}
              {detailStep.ObjEmailCfg.EmailSendDeadline ? (
                <div className="col-lg-6">
                  <div className="form-group row">
                    <label htmlFor="example-text-input" className="col-md-6">
                      {" "}
                      Mẫu Email thông báo deadline
                    </label>
                    <div className="col-md-6 text-info">
                      {
                        detailStep.ObjEmailCfg.EmailSendDeadline
                          .ObjEmailTemplate.TemplateTitle
                      }
                    </div>
                  </div>
                </div>
              ) : (
                ""
              )}
              {detailStep.ObjEmailCfg.EmailSendDeadline ? (
                <div className="col-lg-6">
                  <div className="form-group row">
                    <label htmlFor="example-text-input" className="col-md-6">
                      {" "}
                      Thời gian gửi thông báo trước deadline
                    </label>
                    <div className="col-md-6 text-info">
                      {detailStep.ObjEmailCfg.EmailSendDeadline.NumberHours}
                    </div>
                  </div>
                </div>
              ) : (
                ""
              )}
              <div className="col-lg-6">
                <div className="form-group row">
                  <label htmlFor="example-text-input" className="col-md-6">
                    {" "}
                    Nút chức năng
                  </label>
                  <div className="col-md-6 text-info">
                    {detailStep.btnAction.length > 0
                      ? detailStep.btnAction.map(
                          (x) =>
                            FindTitleById(
                              ArrayButtonAction,
                              "Code",
                              x,
                              "Title"
                            ) + ", "
                        )
                      : ""}
                  </div>
                </div>
              </div>

              {detailStep.btnAction.findIndex((x) => x == "BackStep") != -1 ? (
                <div className="col-lg-6">
                  <div className="form-group row">
                    <label htmlFor="example-text-input" className="col-md-6">
                      Danh sách bước chuyển
                    </label>
                    <div className="col-md-6 text-info">
                      {detailStep.ObjBackStep.map((item) =>
                        FindTitleById(
                          listWFStep,
                          `indexStep`,
                          item,
                          "StepTitle"
                        ) == 0
                          ? "Hoàn thành ,"
                          : FindTitleById(
                              listWFStep,
                              `indexStep`,
                              item,
                              "StepTitle"
                            ) + ", "
                      )}
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
              onClick={() => this.props.modalOpenClose(false, "wfStep")}
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

export default DetailFormStep;
