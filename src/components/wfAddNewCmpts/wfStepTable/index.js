import React, { Component } from "react";
import {
  returnArray,
  returnObject,
} from "../../wfShareCmpts/wfShareFunction.js";

import {
  Row,
  Col,
  Card,
  CardBody,
  CardTitle,
  Container,
  Modal,
  Input,
  Form,
  FormGroup,
  InputGroup,
  Label,
  CardSubtitle,
  CardText,
  CardHeader,
  Collapse,
} from "reactstrap";
import { Table, Thead, Tbody, Tr, Th, Td } from "react-super-responsive-table";

import AddStepTable from "./addStepTable";
import AddNextStepTable from "./addNextStepTable";

class WfStepTable extends Component {
  constructor(props) {
    super(props);
    // console.log(this.props);

    this.state = {
      listStepWorkflow: this.props.listStepWorkflow,
      listDept: this.props.listDept,
      listFormField: this.props.listFormField,
      listEmailTemplate: this.props.listEmailTemplate,
      isShowModal: false,
      isShowModalNext: false,
      detailStep: {
        ID: 0,
        StepTitle: "",
        StepCode: "",
        indexStep: 0,
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
          // TypeCondition: "",
          // ObjCondition: [],
          // StepNextCondition: {
          //   StepNextConditionId: "",
          //   StepNextConditionTitle: "Hoàn thành",
          // },
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
        ApproverInSelect:"",
        ApproveRunTime: {
          IsActive: false,
        },
      },
      indexFormStep: -1,
      listApproveCode: this.props.listApproveCode,
      listRoleCode: this.props.listRoleCode,
      listGroup: this.props.listGroup,
      detailStepOld: {},
      listWorkflow: this.props.listWorkflow,
      Confirm: false,
      ConfirmText: "",
      TypeConfirm: "",
      ConfirmParameter: "",
      IsCollapse: true,
    };

    this.modalOpenClose = this.modalOpenClose.bind(this);
    this.resutlStepTable = this.resutlStepTable.bind(this);
    this.setStepTable = this.setStepTable.bind(this);
    this.deleteStepTable = this.deleteStepTable.bind(this);

    this.setNextStepTable = this.setNextStepTable.bind(this);
    this.resutlNextStepTable = this.resutlNextStepTable.bind(this);
  }

  componentWillReceiveProps(nextProps) {
    // console.log(nextProps);
    this.setState({
      listStepWorkflow: nextProps.listStepWorkflow,
      listDept: nextProps.listDept,
      listFormField: nextProps.listFormField,
      listEmailTemplate: nextProps.listEmailTemplate,
      istApproveCode: nextProps.listApproveCode,
      listRoleCode: nextProps.listRoleCode,
      listGroup: nextProps.listGroup,
      listWorkflow: nextProps.listWorkflow,
    });
  }

  async modalOpenClose(isModal, typeForm) {
    // console.log(this.props);
    // console.log(this.state);

    if (typeForm == "wfStep") {
      await this.setState({ isShowModal: isModal });
    } else {
      await this.setState({ isShowModalNext: isModal });
    }
    // console.log(this.state);
  }

  async resutlStepTable(stepObject, index) {
    // console.log(stepObject);
    let listStep = returnArray(this.state.listStepWorkflow);

    if (index > -1) {
      listStep[index] = stepObject;
    } else {
      // listStep.push(stepObject);
      let stepObjectNew = returnObject(stepObject);
      if (listStep.length > 0) {
        let maxIndexStep = Math.max.apply(
          Math,
          listStep.map(function (step) {
            return step.indexStep;
          })
        );
        stepObjectNew.indexStep = Number(maxIndexStep) + 1;
      } else {
        stepObjectNew.indexStep = 1;
      }
      listStep.push(stepObjectNew);
    }
    // await this.setState({ listStepWorkflow: listStep, isShowModal: false });
    await this.setState({ isShowModal: false });
    this.props.setListStepTable(listStep);
  }

  async setStepTable(index) {
    if (index > -1) {
      const listStep = returnArray(this.state.listStepWorkflow);
      const step = returnObject(listStep[index]);
      await this.setState({
        isShowModal: true,
        detailStep: step,
        indexFormStep: index,
      });
    } else {
      let stepIndex = this.state.listStepWorkflow.length + 1;
      await this.setState({
        isShowModal: true,
        detailStep: {
          ID: 0,
          StepTitle: "",
          StepCode: "",
          indexStep: "",
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
            // TypeCondition: "",
            // ObjCondition: [],
            // StepNextCondition: {
            //   StepNextConditionId: "",
            //   StepNextConditionTitle: "Hoàn thành",
            // },
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
          ApproverInSelect:"",
          ApproveRunTime: {
            IsActive: false,
          },
        },
        indexFormStep: -1,
      });
    }
  }

  createJsonText() {
    let detailStep = {
      ID: 0,
      StepTitle: "",
      StepCode: "",
      indexStep: stepIndex,
      ClassifyStep: "Step",
      StepWFType: "",
      SLA: "",
      DepartmentCode: "",
      btnAction: [],
      ObjBackStep: [],
      ObjStepWFId: [
        {
          IsActive: false,
          WFTableId: "",
          WFTableCode: "",
          WFTableTitle: "",
          Waitting: false,
          TypeOfInitialization: "",
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
      ],
      StepNextDefault: {
        StepNextDefaultId: "",
        StepNextDefaultTitle: "Hoàn thành",
      },
      ObjStepCondition: {
        IsActive: false,
        ArrayStepCondition: [
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
        ],
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
      ApproverInSelect:"",
      ApproveRunTime: {
        IsActive: false,
      },
    };
  }

  // Xóa thông tin field trên danh sách
  deleteStepTable(indexField) {
    // console.log(indexField);
    this.props.deleteStepForm(indexField);
    this.setState({ Confirm: false });
  }

  async setNextStepTable(stepObject) {
    this.setState({ isShowModalNext: true, detailStep: stepObject });
  }

  async resutlNextStepTable(stepObject, stepObjectOld) {
    let listStep = returnArray(this.state.listStepWorkflow);
    // let index = 0;
    let indexStep = listStep.findIndex(
      (st) => st.indexStep == stepObjectOld.indexStep
    );

    if (indexStep != -1) {
      listStep[indexStep] = stepObjectOld;
    }

    let stepObjectNew = returnObject(stepObject);

    stepObjectNew.indexStep = listStep.length + 1;
    listStep.push(stepObjectNew);

    // console.log(this.state);
    await this.setState({
      isShowModal: true,
      isShowModalNext: false,
      // detailStep: stepObjectOld,
      indexFormStep: indexStep,
      listStepWorkflow: listStep,
      // indexFormStep: index,
    });

    this.props.setListStepTable(listStep);
  }

  Confirm(status, id) {
    if (status == "Delete") {
      this.setState({
        Confirm: true,
        ConfirmText: "Bạn chắc chắn muốn xóa bước này ?",
        TypeConfirm: status,
        ConfirmParameter: id,
      });
    }
  }

  render() {
    // console.log(this.state);
    const {
      listDept,
      listStepWorkflow,
      listFormField,
      isShowModal,
      isShowModalNext,
      indexFormStep,
      detailStep,
      listEmailTemplate,
      listApproveCode,
      listRoleCode,
      listGroup,
      detailStepOld,
      listWorkflow,
      Confirm,
      IsCollapse,
    } = this.state;
    return (
      <Card outline color="info" className="border p-3">
        <div className="row">
          <Col lg="6">
            <CardTitle className="text-info mb-3">
              Thiết lập các bước quy trình
            </CardTitle>
          </Col>
          <Col lg="6">
            <div className="text-right">
              <button
                type="button"
                className="btn btn-md btn-primary waves-effect mr-2 waves-light"
                onClick={() => this.setState({ IsCollapse: !IsCollapse })}
                title={IsCollapse ? "Collapse" : "Extend"}
              >
                <i
                  className={`fa fa-${
                    IsCollapse ? "chevron-up" : "chevron-down"
                  } pr-0`}
                ></i>
              </button>

              <button
                type="button"
                className="btn btn-md btn-primary waves-effect waves-light"
                onClick={() => this.setStepTable(-1)}
              >
                <i className="fa fa-plus-circle mr-2 align-middle"></i> Thêm
                bước
              </button>
            </div>
          </Col>
          <Col lg="12">
            <Collapse isOpen={IsCollapse}>
              <div className="table-responsive mt-3">
                <Table className="table table-striped mb-0">
                  <thead>
                    <tr>
                      <th>Tên bước</th>
                      <th>Mã bước</th>
                      <th>Loại bước</th>
                      <th>Bước kế tiếp(mặc định)</th>
                      <th className="text-right" style={{ minWidth: "80px" }}>
                        Hoạt động
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {listStepWorkflow.length > 0 ? (
                      listStepWorkflow.map((item, stepIndex) => (
                        <tr key={stepIndex}>
                          <td>{item.StepTitle}</td>
                          <td>{item.StepCode}</td>
                          <td>{item.StepWFType}</td>
                          <td>{item.StepNextDefault.StepNextDefaultTitle}</td>
                          <td>
                            <div className="button-items text-right">
                              <button
                                type="button"
                                onClick={() => this.setStepTable(stepIndex)}
                                className="btn btn-sm waves-effect waves-light p-0 mb-0"
                                title="Chỉnh sửa bước"
                              >
                                <i className="fa fa-pencil mr-2 align-middle text-primary font-size-16"></i>
                              </button>
                              <button
                                type="button"
                                className="btn btn-sm waves-effect waves-light p-0 mb-0"
                                onClick={() =>
                                  this.Confirm("Delete", stepIndex)
                                }
                                title="Xóa bước"
                              >
                                <i className="fa fa-trash text-danger font-size-16" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="5" className="text-center">
                          Không có dữ liệu
                        </td>
                      </tr>
                    )}
                  </tbody>
                </Table>
              </div>

              {/* addMore */}
              <div className="text-right mt-3">
                <button
                  type="button"
                  className="btn btn-md btn-primary waves-effect waves-light"
                  onClick={() => this.setStepTable(-1)}
                >
                  <i className="fa fa-plus-circle mr-2 align-middle"></i> Thêm
                  bước
                </button>
              </div>
            </Collapse>
          </Col>

          {!isShowModal ? (
            ""
          ) : (
            <AddStepTable
              detailStep={detailStep}
              listDept={listDept}
              listStepWorkflow={listStepWorkflow}
              listFormField={listFormField}
              listEmailTemplate={listEmailTemplate}
              indexFormStep={indexFormStep}
              modalOpenClose={this.modalOpenClose}
              resutlStepTable={this.resutlStepTable}
              listApproveCode={listApproveCode}
              listRoleCode={listRoleCode}
              listGroup={listGroup}
              listWorkflow={listWorkflow}
              setNextStepTable={this.setNextStepTable}
            />
          )}

          {!isShowModalNext ? (
            ""
          ) : (
            <AddNextStepTable
              listStepWorkflow={listStepWorkflow}
              detailStepOld={detailStepOld}
              resutlNextStepTable={this.resutlNextStepTable}
              modalOpenClose={this.modalOpenClose}
            />
          )}
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
                      this.deleteStepTable(this.state.ConfirmParameter)
                    }
                  >
                    Có
                  </button>
                </div>
              </div>
            </Modal>
          )}
        </div>
      </Card>
    );
  }
}

export default WfStepTable;
