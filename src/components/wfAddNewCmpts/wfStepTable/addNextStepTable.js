import React, { Component } from "react";
import { isNotNull, returnObject } from "../../wfShareCmpts/wfShareFunction.js";
import { Modal } from "reactstrap";
import ConfirmRequired from "../ConfirmRequired";
export default class AddNextStepTable extends Component {
  constructor(props) {
    super(props);
    // console.log(this.props);

    this.state = {
      listStepWorkflow: this.props.listStepWorkflow,
      detailStep: {
        ID: 0,
        StepTitle: "",
        StepCode: "",
        indexStep: 0,
        ClassifyStep: "Step",
        StepWFType: "",
        SLA: "",
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
      },
      detailStepOld: this.props.detailStepOld,
      Required: false,
      RequiredText: "",
      ApproveRunTime: {
        IsActive: false,
      },
    };

    this.changeFormNextStep = this.changeFormNextStep.bind(this);
    this.modalOpenCloseAlert = this.modalOpenCloseAlert.bind(this);
  }

  componentWillReceiveProps(nextProps) {
    // console.log(nextProps);
    // console.log(this.props);
    this.setState({
      detailStepOld: nextProps.detailStepOld,
    });
  }

  saveFormNextStep() {
    // console.log(this.state);
    if (!isNotNull(this.state.detailStep.StepTitle)) {
      this.setState({
        RequiredText: "Bạn chưa nhập Tiêu đề bước",
        Required: true,
      });
      //  alert("Bạn chưa nhập Tiêu đề bước");
      return;
    } else if (!isNotNull(this.state.detailStep.StepCode)) {
      this.setState({ RequiredText: "Bạn chưa nhập Mã bước", Required: true });
      //  alert("Bạn chưa nhập Mã bước");
      return;
    } else if (!isNotNull(this.state.detailStep.StepWFType)) {
      this.setState({
        RequiredText: "Bạn chưa nhập Loại bước",
        Required: true,
      });
      // alert("Bạn chưa nhập Lọai bước");
      return;
    } else if (
      this.state.listStepWorkflow.findIndex(
        (x) => x.StepCode == this.state.detailStep.StepCode
      ) != -1
    ) {
      this.setState({ RequiredText: "Mã bước đã tồn tại", Required: true });
      // alert("Mã bước đã tồn tại");
      return;
    } else if (isNotNull(this.state.detailStep.StepCode)) {
      let listCheck = "1234567890QWERTYUIOPASDFGHJKLZXCVBNM";
      let check = true;
      for (let i = 0; i < this.state.detailStep.StepCode.length; i++) {
        let result = listCheck.includes(
          this.state.detailStep.StepCode[i].toUpperCase()
        );
        if (result == false) {
          check = false;
          break;
        }
      }
      if (check == false) {
        this.setState({
          RequiredText: "Mã bước không được chứa ký tự đặc biệt!",
          Required: true,
        });
        // alert("Mã bước không được chứa ký tự đặc biệt! ")
        return;
      } else {
        this.props.resutlNextStepTable(
          this.state.detailStep,
          this.state.detailStepOld
        );
      }
    } else {
      this.props.resutlNextStepTable(
        this.state.detailStep,
        this.state.detailStepOld
      );
    }
  }

  resetFormNextStep() {
    // console.log(this.state);
    this.setState({
      detailStep: {
        ID: 0,
        StepTitle: "",
        StepCode: "",
        indexStep: 0,
        ClassifyStep: "",
        StepWFType: "",
        SLA: "",
        btnAction: [],
        ObjBackStep: [],
        ObjStepWFId: [],
        StepNextDefault: {
          StepNextDefaultId: "",
          StepNextDefaultTitle: "Hoàn thành",
        },
        ObjStepCondition: {
          IsActive: false,
          TypeCondition: "",
          ObjCondition: [],
          StepNextCondition: {
            StepNextConditionId: "",
            StepNextConditionTitle: "Hoàn thành",
          },
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
        ApproverInSelect:"",
        ApproveRunTime: {
          IsActive: false,
        },
      },
    });
  }

  changeFormNextStep(event) {
    let nameState = event.target.name;
    let valueState = event.target.value;
    let stepIndex = returnObject(this.state.detailStep);
    // if (nameState == "StepCode") {
    //   if (
    //     this.state.listStepWorkflow.findIndex(
    //       (x) => x.StepCode == valueState
    //     ) == -1
    //   ) {
    //     stepIndex[nameState] = valueState;
    //   } else {
    //     stepIndex.StepCode = "";
    //     alert("Mã bước đã tồn tại");
    //   }
    // } else {
    //   stepIndex[nameState] = valueState;
    // }
    if (nameState == "StepCode") {
      valueState = valueState.replace(/\s/g, "");
    }
    stepIndex[nameState] = valueState;
    this.setState({ detailStep: stepIndex });
    // console.log(this.state);
  }
  async modalOpenCloseAlert() {
    await this.setState({ Required: false });
  }
  render() {
    const { detailStep } = this.state;
    // console.log(detailStep);
    return (
      <Modal size="xl" isOpen={true}>
        <div className="modal-header">
          <h5 className="modal-title mt-0 text-primary" id="myLargeModalLabel">
            Cấu hình bước quy trình
          </h5>
          <button
            onClick={() => this.props.modalOpenClose(false, "wfNextStep")}
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
                    onChange={this.changeFormNextStep}
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
                    onChange={this.changeFormNextStep}
                    value={detailStep.StepCode}
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
                    onChange={this.changeFormNextStep}
                    value={detailStep.StepWFType}
                  >
                    <option value=""></option>
                    <option value="Phê duyệt">Phê duyệt</option>
                    <option value="Quy trình">Quy trình</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="text-center mt-3 col-lg-12">
              <button
                type="button"
                className="btn btn-primary btn-md waves-effect waves-light mr-3"
                onClick={() => this.saveFormNextStep()}
              >
                <i className="fa fa-floppy-o mr-2"></i>Lưu
              </button>
              <button
                type="button"
                className="btn btn-primary  btn-md waves-effect waves-light mr-3"
                onClick={() => this.resetFormNextStep()}
              >
                <i className="fa fa-refresh mr-2"></i>Làm mới
              </button>
              <button
                type="button"
                className="btn btn-primary btn-md waves-effect waves-light"
                onClick={() => this.props.modalOpenClose(false, "wfNextStep")}
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
      </Modal>
    );
  }
}
