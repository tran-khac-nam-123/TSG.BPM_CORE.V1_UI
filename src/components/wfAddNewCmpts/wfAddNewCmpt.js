import React, { Component, Fragment } from "react";
import { config } from "./../../pages/environment.js";
import {
  isNotNull,
  CheckNull,
  CheckNullSetZero,
  getQueryParams,
  returnArray,
  returnObject,
  checkSaveStepForm,
  TotalSLA,
} from "../wfShareCmpts/wfShareFunction.js";
import { objField, arrayObjField } from "./../wfShareCmpts/wfShareModel";
import { sp } from "@pnp/sp";
import {
  DateTimeFieldFormatType,
  FieldUserSelectionMode,
  ChoiceFieldFormatType,
  UrlFieldFormatType,
} from "@pnp/sp/fields/types";
import "@pnp/sp/webs";
import "@pnp/sp/lists/web";
import "@pnp/sp/items";
import "@pnp/sp/profiles";
import "@pnp/sp/site-users/web";
import "@pnp/sp/fields";
import "@pnp/sp/site-groups";
import * as moment from "moment";
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
  Spinner,
} from "reactstrap";
import { Table, Thead, Tbody, Tr, Th, Td } from "react-super-responsive-table";

import shareService from "../wfShareCmpts/wfShareService";
import WfFormField from "./wfFormField";
import WfStepTable from "./wfStepTable";
import WfComponentInfo from "./wfComponentInfo"
import InfoParentProcess from "./infoParentProcess.js";
import "../css/loading.scss";
import ConfirmRequired from "./ConfirmRequired";
import ReactFlow, {
  removeElements,
  addEdge,
  MiniMap,
  Controls,
  Background,
} from 'react-flow-renderer';
export default class WorkflowAddNew extends Component {
  constructor(props) {
    super(props);
    this.state = {
      countFL: 0,
      txtPermission: "",
      isFormPermission: false,
      Code: "",
      Title: "",
      Description: "",
      //ui
      ListComponentInfo: [],
      //
      WhoIsUsed: "",
      Department: "",
      search_UserDefault: "",
      listSearch_UserDefault: [],
      list_UserDefault: [],
      listWorkflow: [],
      listDept: [],
      listEmailTemplate: [],
      listStepWorkflow: [],
      listFormField: [],
      FieldImport: "",
      listApproveCode: [],
      listRoleCode: [],
      listGroup: [],
      indexStep: "",
      isShowLoadingPage: true,
      Required: false,
      RequiredText: "",
      AutoSave: false,
      isParentProcess: false,
      ArrayAllParentProcess: [],
      ObjParentProcess: {
        ArrayFieldCondition: [],
        TypeParentProcess: "",
        ArrayParentProcess: [],
        ParentProcess: "",
        ItemParentProcess: "",
        ParentProcessDateStart: new Date(
          moment(new Date())
            .subtract(30, "day")
            .hours(0)
            .minutes(0)
            .seconds(0)
            .toDate()
        ),
        ParentProcessDateEnd: new Date(
          moment(new Date()).hours(23).minutes(59).seconds(59).toDate()
        ),
      },
      // tuyen update IMG
      TemplateHtml: "",
      listTemplateHtml: [],
      // tuyen update IMG
    };
    this.changeFormInput = this.changeFormInput.bind(this);
    this.callSearchPeople = this.callSearchPeople.bind(this);
    this.resultParentProcess = this.resultParentProcess.bind(this);
    this.ItemId = undefined;
    sp.setup({ pageContext: { web: { absoluteUrl: config.url.API_URL } } });
    // console.log(sp);
    this.typingTimeout = null;
    this.fieldSearch = undefined;
    this.indexValid = -1;
    this.listFieldId = [];
    this.listFieldCreate = [];
    this.listStepId = [];
    this.deleteEditField = this.deleteEditField.bind(this);
    this.deleteStepForm = this.deleteStepForm.bind(this);
    this.permissUser = {};
    this.setListFormField = this.setListFormField.bind(this);
    this.setListStepTable = this.setListStepTable.bind(this);
    this.modalOpenCloseAlert = this.modalOpenCloseAlert.bind(this);
    this.flow = []
  }

  setListFormField(listField) {
    // console.log(listField);
    this.setState({ listFormField: listField });
  }

  setListStepTable(listStep) {
    // console.log(listStep);
    this.setState({ listStepWorkflow: listStep });
  }

  // Xóa thông tin field trên danh sách
  deleteEditField(indexField) {
    // console.log(indexField);
    //   if (confirm("Bạn có chắc chắn muốn xóa trường dữ liệu này?")) {
    const fieldList = returnArray(this.state.listFormField);
    // console.log(fieldList.indexOf(itemField))
    if (CheckNullSetZero(fieldList[indexField].ID) > 0) {
      this.listFieldId.push(fieldList[indexField].ID);
    }
    fieldList.splice(indexField, 1);
    this.setState({ listFormField: fieldList });
    //  }
  }
  // Xóa thông tin bước trên danh sách
  deleteStepForm(stepIndex) {
    // console.log(indexField);
    //  if (confirm("Bạn có chắc chắn muốn xóa bước này?")) {
    const stepList = this.state.listStepWorkflow;
    // console.log(fieldList.indexOf(itemField))
    if (CheckNullSetZero(stepList[stepIndex].ID) > 0) {
      this.listStepId.push(stepList[stepIndex].ID);
    }
    stepList.splice(stepIndex, 1);
    this.setState({ listStepWorkflow: stepList });
    // }
  }

  componentDidMount() {
    let param = getQueryParams(window.location.search);
    this.ItemId = param["ItemId"];
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
        this.setStateForm(depts, "");
      } else if (this.permissUser.Permission == "Manager") {
        this.setStateForm(this.permissUser.Dept, "Department");
      } else {
        this.setState({
          isFormPermission: false,
          txtPermission: "Bạn không có quyền truy cập",
          isShowLoadingPage: false,
        });
      }
    }
  }

  // set các giá trị ban đầu của form
  async setStateForm(deptList, whoUse) {
    // let deptList = await this.GetListDepartment();
    // console.log(deptList);

    const wfList = await this.GetWFTable();
    // console.log(wfList);

    const wfEmailTemplate = await this.GetTemplateEmail();
    // console.log(wfEmailTemplate);

    const wfApprove = await this.GetApproveCode();
    // console.log(wfApprove);

    const wfRole = await this.GetRoleCode();
    // console.log(wfRole);
    const wfGroup = await sp.web.siteGroups();
    // console.log(wfGroup);

    const listHtml = await shareService.GetInfoTemplateHtml();
    // console.log(listHtml);
    let countFL = await shareService.CountWFTable()
    await this.setState({
      listDept: deptList,
      listWorkflow: wfList,
      listEmailTemplate: wfEmailTemplate,
      listApproveCode: wfApprove,
      listRoleCode: wfRole,
      listGroup: wfGroup,
      WhoIsUsed: whoUse,
      listTemplateHtml: listHtml,
      countFL: countFL.length
    });

    if (isNotNull(this.ItemId)) {
      if (countFL.findIndex(x => x.ID == this.ItemId)) {
        this.ItemId == undefined
      }
      const wfDetail = await this.GetWFTableDetail();
      console.log(wfDetail);

      if (
        this.permissUser.Dept.findIndex(
          (dp) => dp.Code == wfDetail.Department
        ) == -1 &&
        this.permissUser.Permission == "Manager"
      ) {
        this.setState({
          isFormPermission: false,
          txtPermission: "Bạn không có quyền truy cập vào quy trình này",
        });
      } else {
        const wfListStep = await this.GetWFStepTable();
        console.log(wfListStep);

        const wfListField = await this.GetWFFormField();
        console.log(wfListField);
        let listStepWorkflowDG = this.ConfigLineStep(wfListStep, wfDetail.indexStep, [])
        listStepWorkflowDG.push({
          indexStep: -1,
          StepTitle: 'End',
          StepCode: '',
          ObjStepCondition: '',
          StepNextDefault: ''
        })
        let ox = 100, oy = 200
        let UI = {
          id: '0', source: '0_label', target: wfDetail.indexStep, arrowHeadType: 'arrowclosed', label: ''
        }
        let DATA = {
          style: {
            background: '#D6D5E6',
            color: '#333',
            border: '1px solid #222138',
            width: 180,
            height: 50
          },
          id: '0_label',
          type: 'input',
          data: {
            label: (

              <strong>Begin</strong>

            ),
          },
          position: { x: ox, y: oy },
          sourcePosition: 'right',
        }
        this.flow.push(DATA)
        this.flow.push(UI)
        ox += 200
        listStepWorkflowDG.map(x => {
          if (x.indexStep != -1) {
            UI = {
              id: x.indexStep + '_label', source: x.indexStep, target: isNotNull(x.StepNextDefault.StepNextDefaultId) ? x.StepNextDefault.StepNextDefaultId : -1, arrowHeadType: 'arrowclosed', label: ''
            }

            DATA = {
              id: x.indexStep,
              style: {
                width: 150,
                height: 50
              },
              data: {
                label: (

                  <strong>{x.StepTitle}</strong>

                ),
              },
              position: { x: ox, y: oy },
              sourcePosition: 'right',
              targetPosition: 'left',
            }
          }
          else {


            DATA = {
              id: x.indexStep,
              style: {
                background: '#4bda5e',
                color: '#333',
                border: '1px solid #222138',
                width: 180,
                height: 50
              },

              type: 'output',

              data: {
                label: (

                  <strong>{x.StepTitle}</strong>

                ),
              },
              position: { x: ox, y: oy },

              targetPosition: 'left',
            }
          }

          this.flow.push(DATA)
          this.flow.push(UI)
          let check = false
          this.FindFlow(x, listStepWorkflowDG, wfListStep, ox, oy, wfListField, check)

          ox += 200
        })

        listStepWorkflowDG.map(x => {
          let inS = x.indexStep
          let idx = this.flow.findIndex(x => x.id == inS)
          let countC = this.flow.filter(y => y.source == inS)
          if (countC.length > 1) {
            this.flow[idx].position.x -= 150
            this.addPosition(inS, listStepWorkflowDG)

          }
          let countB = this.flow.filter(y => y.target == inS)
          if (countB.length > 1) {
            this.flow[idx].position.y += 150
            this.addPosition(inS, listStepWorkflowDG)

          }
        })
        let arrParentProcess = [];
        let isParentProcess = false;
        arrParentProcess = await this.loadConfigParentProcess(wfDetail);
        // console.log(arrParentProcess);
        if (arrParentProcess.length > 0) {
          isParentProcess = true;
        }
        this.setState({
          isFormPermission: true,
          Code: wfDetail.Code,
          Title: wfDetail.Title,
          AutoSave: wfDetail.AutoSave,
          Description: wfDetail.Description,
          WhoIsUsed: wfDetail.WhoIsUsed,
          //ui
          ListComponentInfo: wfDetail.ListComponentInfo,
          //ui
          Department: wfDetail.Department,
          list_UserDefault: wfDetail.listPeople,
          indexStep: wfDetail.indexStep,
          ObjParentProcess: wfDetail.ObjParentProcess,
          TemplateHtml: wfDetail.TemplateHtml,
          listFormField: wfListField,
          listStepWorkflow: wfListStep,
          isShowLoadingPage: false,
          ArrayAllParentProcess: arrParentProcess,
          isParentProcess: isParentProcess,
        });
      }
    } else {
      this.setState({ isFormPermission: true, isShowLoadingPage: false });
    }
    // console.log(this.state);
  }
  addPosition(inS, listStepWorkflowDG) {

    let idx = this.flow.findIndex(x => x.id == inS)

    this.flow[idx].position.x += 150
    let a = listStepWorkflowDG.find(x => x.indexStep == inS)
    if (isNotNull(a.StepNextDefault)) {
      inS = a.StepNextDefault.StepNextDefaultId
      if (isNotNull(inS)) {
        this.addPosition(inS, listStepWorkflowDG)
      }
    }
  }

  FindFlow(x, listStepWorkflowDG, wfListStep, ox, oy, wfListField, check) {

    let DATA = ''
    let UI = ''
    let add = []
    if (x.ObjStepCondition.IsActive) {
      x.ObjStepCondition.ArrayStepCondition.map(y => {
        let lb = ''
        let a = ''
        let b = ''
        let c = ''
        let addy = 100
        y.ObjCondition.map(h => {
          a = wfListField.find(fi => fi.InternalName == h.Field).FieldName
          if (h.ConditionType == 'FieldValue') {
            b = h.Condition + h.Value
          }
          else {
            b = h.Condition + ' ' + h.Value + ('Field')
          }

          c = y.ConditionsCombined == 'Or' ? '|| ' : y.ConditionsCombined == 'And' ? '&& ' : ' '
          lb += a + ' ' + b + ' ' + c


        })
        if (x.ObjStepCondition.ArrayStepCondition.length > 1) {
          lb += '(Độ ưu tiên: ' + y.Priority + ')'
        }
        UI = {
          id: x.indexStep + '_label_change', source: x.indexStep,
          target: isNotNull(y.StepNextCondition.StepNextConditionId) ? parseInt(y.StepNextCondition.StepNextConditionId) : -1, arrowHeadType: 'arrowclosed', label: lb
        }
        let check1 = this.flow.findIndex(e => e.id == UI.id && e.source == UI.source && e.target == UI.target)
        if (check1 == -1) {
          this.flow.push(UI)
          if (listStepWorkflowDG.findIndex(z => z.indexStep == y.StepNextCondition.StepNextConditionId) == -1) {
            if (isNotNull(y.StepNextCondition.StepNextConditionId)) {
              DATA = {
                id: parseInt(y.StepNextCondition.StepNextConditionId),
                style: {
                  width: 150,
                  height: 50
                },
                data: {
                  label: (

                    <strong>{y.StepNextCondition.StepNextConditionTitle}</strong>

                  ),
                },
                position: { x: ox + 200, y: oy + 150 },
                sourcePosition: 'right',
                targetPosition: 'left',
              }
            }

            if (this.flow.findIndex(y => y.id == DATA.id) == -1 && isNotNull(DATA.id)) {
              this.flow.push(DATA)
            }


          }


          add.push(wfListStep.find(k => k.indexStep == y.StepNextCondition.StepNextConditionId))


        }
        // else{
        //    this.flow[this.flow.findIndex(y => y.id == UI.id)].label=UI.label

        // }

      })
      if (add.length > 0) {
        check = true
        add.map(u => {
          if (isNotNull(u)) {
            this.FindFlow(u, listStepWorkflowDG, wfListStep, ox, oy - 50, wfListField, check)
          }
        })
      }

    }
    else {
      if (check) {
        if (listStepWorkflowDG.findIndex(z => z.indexStep == x.StepNextDefault.StepNextDefaultId) != -1) {
          UI = {
            id: x.indexStep + '_label_change', source: x.indexStep, target: x.StepNextDefault.StepNextDefaultId, arrowHeadType: 'arrowclosed', label: ''
          }
          if (this.flow.findIndex(y => y.id == UI.id) == -1) {
            this.flow.push(UI)
          }
          if (this.flow.findIndex(y => y.id == x.indexStep) != -1) {
            this.flow[this.flow.findIndex(y => y.id == x.indexStep)].position.y + 100
          }

        }
        else {
          if (isNotNull(x.indexStep)) {
            DATA = {
              id: x.indexStep,
              style: {
                width: 150,
                height: 50
              },
              data: {
                label: (

                  <strong>{x.StepTitle}</strong>

                ),
              },
              position: { x: ox + 200, y: oy + 150 },
              sourcePosition: 'right',
              targetPosition: 'left',
            }
          }
          else {
            DATA = {
              id: -1,
              type: 'output',
              style: {
                width: 150,
                height: 50
              },
              data: {
                label: (

                  <strong>End</strong>

                ),
              },
              position: { x: ox + 200, y: oy + 150 },
              targetPosition: 'left',
            }
          }

          if (this.flow.findIndex(y => y.id == DATA.id) == -1 && DATA.id != -1) {
            this.flow.push(DATA)
          }

          // bước ko có trong listStepWorkflowDG
          let stepNextoutLine = wfListStep.find(z => z.indexStep == x.StepNextDefault.StepNextDefaultId)
          if (isNotNull(stepNextoutLine)) {
            if (this.flow.findIndex(y => y.id == stepNextoutLine.indexStep) == -1 && stepNextoutLine.indexStep != -1) {
              DATA = {
                id: parseInt(stepNextoutLine.indexStep),
                style: {
                  width: 150,
                  height: 50
                },
                data: {
                  label: (

                    <strong>{stepNextoutLine.StepTitle}</strong>

                  ),
                },
                position: { x: ox + 200, y: oy + 350 },
                sourcePosition: 'right',
                targetPosition: 'left',
              }
              UI = {
                id: x.indexStep + '_label_change', source: x.indexStep, target: x.StepNextDefault.StepNextDefaultId, arrowHeadType: 'arrowclosed', label: ''
              }
              if (this.flow.findIndex(y => y.id == UI.id) == -1) {
                this.flow.push(UI)
              }


              UI = {
                id: stepNextoutLine.indexStep + '_label_change', source: stepNextoutLine.indexStep, target: stepNextoutLine.StepNextDefault.StepNextDefaultId, arrowHeadType: 'arrowclosed', label: ''
              }

              if (this.flow.findIndex(y => y.id == UI.id) == -1) {
                this.flow.push(UI)
              }
              if (this.flow.findIndex(y => y.id == DATA.id) == -1 && DATA.id != -1) {
                this.flow.push(DATA)
              }

              this.FindFlow(stepNextoutLine, listStepWorkflowDG, wfListStep, ox, oy - 50, wfListField, check)
            }
          }
          else{
            UI = {
              id: x.indexStep + '_label_change', source: x.indexStep, target: -1, arrowHeadType: 'arrowclosed', label: ''
            }
           
              this.flow.push(UI)
           
          }
        }
      }
    }

  }

  ConfigLineStep(listStep, indexStep, arr) {
    let StepIndex = listStep.find(x => x.indexStep == indexStep)
    arr.push({
      indexStep: StepIndex.indexStep,
      StepTitle: StepIndex.StepTitle,
      StepCode: StepIndex.StepCode,
      ObjStepCondition: StepIndex.ObjStepCondition,
      StepNextDefault: isNotNull(StepIndex.StepNextDefault) ? StepIndex.StepNextDefault : -1
    })
    indexStep = StepIndex.StepNextDefault.StepNextDefaultId
    if (isNotNull(indexStep)) {
      this.ConfigLineStep(listStep, indexStep, arr)
    }

    return arr
  }
  async loadConfigParentProcess(wfTableIndex) {
    //Danh sách quy trình đang hoạt động
    let wfParent = await shareService.GetArrayWFTable(1);
    // console.log(wfParent);

    // Danh sách Step có type == 'Quy trình'
    const strFilter = `StepWFType eq 'Quy trình'`;
    let wfStepParent = await shareService.GetArrayWFStepTable(strFilter);
    // console.log(wfStepParent);

    let wfStepParentId = Array.from(wfParent, ({ WFId }) => WFId);
    // console.log(wfStepParentId);

    let fieldSPLink = new Set(wfStepParentId);
    // console.log(fieldSPLink);

    //Danh sách step đi theo quy trình đang hoạt động
    let wfStepParentCheck = wfStepParent.filter((item) =>
      fieldSPLink.has(item.WFTableId)
    );
    // console.log(wfStepParentCheck);

    let arrParentProcess = [];

    wfStepParentCheck.map((step) => {
      if (isNotNull(step.ObjStepWFId) && step.ObjStepWFId.length > 0) {
        let ArraySub = returnArray(step.ObjStepWFId);
        ArraySub.map((subItem) => {
          let wfTableParent = wfParent.find((wf) => wf.WFId == step.WFTableId);
          if (isNotNull(wfTableParent)) {
            if (
              subItem.WFTableId == wfTableIndex.ID &&
              arrParentProcess.findIndex(
                (sub) => sub.wfTable.WFId == subItem.WFTableId
              ) == -1
            ) {
              arrParentProcess.push({
                wfTable: wfTableParent,
                ConfigSubProcess: subItem,
                indexStep: step.indexStep,
                StepTitle: step.Title,
                isWaitting: subItem.Waitting,
                isAutoSub: subItem.ObjInitialization.AlowLaunch,
              });
            }
          }
        });
      }
    });

    // console.log(objArrayParent);
    return arrParentProcess;
  }

  async resultParentProcess(objParentProcess) {
    // console.log(objParentProcess);
    await this.setState({ ObjParentProcess: objParentProcess });
  }
  // set giá trị trong form thông tin quy trình
  async changeFormInput(event) {
    let valueState = event.target.value;
    if (event.target.name == "Code") {
      valueState = valueState.replace(/\s/g, "");
    }
    if (event.target.name == "AutoSave") {
      await this.setState({ [event.target.name]: event.target.checked });
    }
    // console.log(event);
    if (event.target.name == "WhoIsUsed") {
      await this.setState({
        [event.target.name]: event.target.value,
        Department: "",
        UserDefault: "",
      });
    } else {
      await this.setState({ [event.target.name]: valueState });
    }
  }

  // làm mới Foem nhập thông tin quy trình
  async resetItemWF() {
    this.setState({
      Code: "",
      Title: "",
      AutoSave: false,
      Description: "",
      WhoIsUsed: "",
      Department: "",
      search_UserDefault: "",
      listSearch_UserDefault: [],
      list_UserDefault: [],
      FieldImport: "",
      listStepWorkflow: [],
      listFormField: [],
      indexStep: "",
      TemplateHtml: "",
    });
    this.typingTimeout = null;
    this.fieldSearch = undefined;
    this.indexValid = -1;
    this.listFieldId = [];
    this.listFieldCreate = [];
    this.listStepId = [];
  }

  // Load thông tin chi tiết của 1 Workflow
  async GetWFTableDetail() {
    let ObjParentProcess = {
      ArrayFieldCondition: [],
      TypeParentProcess: "",
      ArrayParentProcess: [],
      ParentProcess: "",
      ItemParentProcess: "",
      ParentProcessDateStart: new Date(
        moment(new Date())
          .subtract(30, "day")
          .hours(0)
          .minutes(0)
          .seconds(0)
          .toDate()
      ),
      ParentProcessDateEnd: new Date(
        moment(new Date()).hours(23).minutes(59).seconds(59).toDate()
      ),
    };
    let details = {
      ObjParentProcess: ObjParentProcess,
      Code: "",
      Title: "",
      AutoSave: false,
      Description: "",
      WhoIsUsed: "",
      Department: "",
      UserDefault: "",
      Status: "",
      listPeople: [],
      indexStep: "",
      ID: "",
      TemplateHtml: "",
      //ui
      ListComponentInfo: []
    };
    await sp.web.lists
      .getByTitle("WFTable")
      .items.getById(this.ItemId)
      .select(
        "ID,Title,Code,Description,WhoIsUsed,WIUGroup,WIU/Id,WIU/Title,Status,indexStep,AutoSave,ObjParentProcess,TemplateHtml,ListComponentInfo"
      )
      .expand("WIU")
      .get()
      .then((itemDetail) => {
        // console.log(itemDetail);
        if (isNotNull(itemDetail)) {
          let peopleList = [];
          if (isNotNull(itemDetail["WIU"])) {
            itemDetail["WIU"].forEach((item) => {
              peopleList.push({ UserId: item["Id"], UserTitle: item["Title"] });
            });
          }
          details = {
            ID: itemDetail["ID"],
            Code: CheckNull(itemDetail["Code"]),
            Title: CheckNull(itemDetail["Title"]),
            Description: CheckNull(itemDetail["Description"]),
            WhoIsUsed: CheckNull(itemDetail["WhoIsUsed"]),
            Department: CheckNull(itemDetail["WIUGroup"]),
            Status: CheckNull(itemDetail["Status"]),
            listPeople: peopleList,
            indexStep:
              CheckNullSetZero(itemDetail["indexStep"]) > 0
                ? CheckNullSetZero(itemDetail["indexStep"])
                : 1,
            AutoSave: itemDetail["AutoSave"],
            ObjParentProcess: isNotNull(itemDetail["ObjParentProcess"])
              ? JSON.parse(itemDetail["ObjParentProcess"])
              : ObjParentProcess,
            TemplateHtml: CheckNull(itemDetail["TemplateHtml"]),
            //ui
            ListComponentInfo: CheckNull(JSON.parse(itemDetail["ListComponentInfo"]))
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
      "ID,Title,InternalName,FieldType,HelpText,Required,ObjValidation,ObjSPField,DefaultValue,OrderIndex,TypeDefaultValue,ComponentInfo";
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
            if (
              CheckNull(itemDetail.FieldType) == objField.ProcessControllers ||
              CheckNull(itemDetail.FieldType) == objField.SPLinkWF
            ) {
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
                      ArrButtonView: [],
                    },
                  });
                } else {
                  let ObjSPLink = returnObject(objFields.ObjSPLink);
                  if (objFields.ObjSPLink.ArrayFieldSP === undefined) {
                    Object.assign(ObjSPLink, {
                      ArrayFieldSP: [],
                      ArrayFieldCondition: [],
                      ArrayFieldFilter: [],
                      ArrayFieldView: [],
                      TypeFilter: "and",
                      TextSearchField: "",
                    });
                  }
                  if (objFields.ObjSPLink.ArrButtonView === undefined) {
                    Object.assign(ObjSPLink, {
                      ArrButtonView: [],
                    });
                  }
                  objFields.ObjSPLink = ObjSPLink;
                }
              } else {
                let ObjSPLink1 = returnObject(objFields.ObjSPLink);
                if (
                  objFields.ObjSPLink &&
                  objFields.ObjSPLink.ArrayFieldSP === undefined
                ) {
                  Object.assign(ObjSPLink1, {
                    ArrayFieldSP: [],
                    ArrayFieldCondition: [],
                    ArrayFieldFilter: [],
                    ArrayFieldView: [],
                    TypeFilter: "and",
                    TextSearchField: "",
                  });
                }
                if (
                  objFields.ObjSPLink &&
                  objFields.ObjSPLink.ArrButtonView === undefined
                ) {
                  Object.assign(ObjSPLink1, {
                    ArrButtonView: [],
                  });
                }
                objFields.ObjSPLink = ObjSPLink1;
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
            FieldName: CheckNull(itemDetail.Title),
            FieldType: CheckNull(itemDetail.FieldType),
            InternalName: CheckNull(itemDetail.InternalName),
            HelpText: CheckNull(itemDetail.HelpText),
            Required: CheckNullSetZero(itemDetail.Required),
            ObjValidation: ObjValidation,
            ObjSPField: ObjSPField,
            DefaultValue: DefaultValue,
            TypeDefaultValue: CheckNull(itemDetail.TypeDefaultValue),
            listSearch_DefaultValue: [],
            ComponentInfo: CheckNull(itemDetail.ComponentInfo)
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
    const strSelect = `ID,Title,Code,indexStep,ClassifyStep,StepWFType,TypeofApprover,ApproveCode,RoleCode,ObjStepWFId,StepNextDefault,ObjStepCondition,ObjEmailCfg,SLA,DepartmentCode,ObjFieldStep,ObjBackStep,btnAction,GroupApprover,IsEditApprover,UserApprover/Title,UserApprover/Id,ApproverInField,ApproverInStep,ApproverInSelect,ApproveRunTime`;
    await sp.web.lists
      .getByTitle("WFStepTable")
      .items.select(strSelect)
      .expand("UserApprover")
      .filter("WFTableId eq " + this.ItemId)
      .orderBy("indexStep", true)
      .get()
      .then((listWFStep) => {
        listWFStep.forEach((itemDetail) => {
          let ObjStepWFId = [];
          if (isNotNull(itemDetail.ObjStepWFId)) {
            ObjStepWFId = JSON.parse(itemDetail.ObjStepWFId);
            if (
              CheckNull(itemDetail.StepWFType) === "Quy trình" &&
              ObjStepWFId.length > 0
            ) {
              for (let index = 0; index < ObjStepWFId.length; index++) {
                let subProcess = returnObject(ObjStepWFId[index]);
                if (subProcess.ObjInitialization === undefined) {
                  Object.assign(subProcess, {
                    ObjInitialization: {
                      AlowLaunch: false,
                      TypeUserApproval: "",
                      UserApprover: [],
                      Step: "",
                      Field: "",
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
          if (
            !isNotNull(itemDetail.ObjStepWFId) ||
            itemDetail.ObjStepWFId == [] ||
            itemDetail.ObjStepWFId == '""'
          ) {
            ObjStepWFId = [];
          }
          let StepNextDefault = "";
          if (isNotNull(itemDetail.StepNextDefault)) {
            StepNextDefault = JSON.parse(itemDetail.StepNextDefault);
          }
          let ObjStepCondition = {
            FieldInput: [],
            FieldView: [],
          };
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
          let ObjFieldStep = "";
          if (isNotNull(itemDetail.ObjFieldStep)) {
            ObjFieldStep = JSON.parse(itemDetail.ObjFieldStep);

            if (ObjFieldStep.isViewAttachments == undefined) {
              Object.assign(ObjFieldStep, { isViewAttachments: false });
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
            if (ObjEmailCfg.EmailSendInform.IsActive) {
              const objUserField = ObjEmailCfg.EmailSendInform.ObjUserField;
              const objUserDefault = ObjEmailCfg.EmailSendInform.ObjUserDefault;

              if (objUserField != undefined) {
                let arrField = [];
                for (let f = 0; f < objUserField.length; f++) {
                  if (isNotNull(objUserField[f])) {
                    arrField.push(objUserField[f].InternalName);
                  }
                }
                ObjEmailCfg.EmailSendInform.ObjUserField = arrField;
              } else {
                Object.assign(ObjEmailCfg.EmailSendInform, {
                  ObjUserField: [],
                });
              }
              if (objUserDefault == undefined) {
                Object.assign(ObjEmailCfg.EmailSendInform, {
                  ObjUserDefault: [],
                });
              }
              if (
                ObjEmailCfg.EmailSendInform.search_InformToUserDefault ==
                undefined
              ) {
                Object.assign(ObjEmailCfg.EmailSendInform, {
                  search_InformToUserDefault: "",
                });
              }
              if (
                ObjEmailCfg.EmailSendInform.listSearch_InformToUserDefault ==
                undefined
              ) {
                Object.assign(ObjEmailCfg.EmailSendInform, {
                  listSearch_InformToUserDefault: [],
                });
              }
              if (ObjEmailCfg.EmailSendInform.AlowSaveSendMail == undefined) {
                Object.assign(ObjEmailCfg.EmailSendInform, {
                  AlowSaveSendMail: false,
                });
              }
            } else {
              ObjEmailCfg.EmailSendInform = {
                IsActive: false,
                ObjEmailTemplate: { TemplateId: "", TemplateTitle: "" },
                ObjUserDefault: [],
                ObjUserField: [],
                search_InformToUserDefault: "",
                listSearch_InformToUserDefault: [],
                AlowSaveSendMail: false,
              };
            }
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
            ObjStepWFId: ObjStepWFId,
            StepNextDefault: StepNextDefault,
            ObjStepCondition: ObjStepCondition,
            ObjEmailCfg: ObjEmailCfg,
            ObjFieldStep: ObjFieldStep,
            ObjBackStep: ObjBackStep,
            TypeofApprover: TypeofApprover,
            ApproveCode: ApproveCode,
            RoleCode: RoleCode,
            DepartmentCode: DepartmentCode,
            UserApprover: userApprover,
            listSearch_UserApprover: [],
            GroupApprover: GroupApprover,
            IsEditApprover: itemDetail.IsEditApprover,
            ApproverInField: CheckNull(itemDetail.ApproverInField),
            ApproverInStep: CheckNull(itemDetail.ApproverInStep),
            ApproveRunTime: approveRuntime,
            ApproverInSelect: ApproverInSelect,
          });
        });
        // console.log(arrStepWF);
      })
      .catch((error) => {
        console.log(error);
      });
    // console.log(details);
    return arrStepWF;
  }

  // lấy danh sách quy trình
  async GetWFTable() {
    let arrWF = [];
    let strFilter = `Status eq 1`;
    if (isNotNull(this.ItemId)) {
      strFilter += ` and ID ne ` + this.ItemId;
    }
    await sp.web.lists
      .getByTitle("WFTable")
      .items.select(
        "ID,Title,Code,SLA,AutoSave,WhoIsUsed,WIUGroup,WIU/Id,WIU/Title,WIU/Name"
      )
      .expand("WIU")
      .filter(strFilter)
      .get()
      .then((listWF) => {
        if (listWF.length > 0) {
          listWF.forEach((itemWF) => {
            let peopleList = [];
            if (isNotNull(itemWF.WIU)) {
              itemWF.WIU.forEach((item) => {
                peopleList.push({
                  UserId: item["Id"],
                  UserTitle: item["Title"],
                  UserEmail: item["Name"].split("|")[2],
                });
              });
            }
            arrWF.push({
              WFId: itemWF.ID,
              WFCode: itemWF.Code,
              WFTitle: itemWF.Title,
              SLA: CheckNullSetZero(itemWF.SLA),
              WhoIsUsed: CheckNull(itemWF.WhoIsUsed),
              Department: CheckNull(itemWF.WIUGroup),
              peopleList: peopleList,
              AutoSave: itemWF.AutoSave,
            });
          });
        }
      })
      .catch((error) => {
        console.log(error);
      });
    // console.log(details);
    return arrWF;
  }

  // lấy danh sách Template Email
  async GetTemplateEmail() {
    let arrTemplate = [];
    await sp.web.lists
      .getByTitle("WFTemplateEmail")
      .items.select("ID,Title,TypeTemplate")
      .get()
      .then((listTemplate) => {
        listTemplate.forEach((itemDetail) => {
          arrTemplate.push({
            ID: CheckNull(itemDetail.ID),
            Title: CheckNull(itemDetail.Title),
            TypeTemplate: CheckNull(itemDetail.TypeTemplate),
          });
        });
      })
      .catch((error) => {
        console.log(error);
      });
    return arrTemplate;
  }

  // lấy danh sách Mã phê duyệt
  async GetApproveCode() {
    let arrApprove = [];
    await sp.web.lists
      .getByTitle("ListApproveCode")
      .items.select("ID,Title,Code,DeptCode")
      .get()
      .then((listApprove) => {
        listApprove.forEach((itemDetail) => {
          arrApprove.push({
            ID: CheckNull(itemDetail.ID),
            Title: CheckNull(itemDetail.Title),
            Code: CheckNull(itemDetail.Code),
            DeptCode: isNotNull(itemDetail.DeptCode)
              ? itemDetail.DeptCode.split(",")
              : "",
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
      .items.select("ID,Title,Code,DeptCode")
      .get()
      .then((listRoleCode) => {
        listRoleCode.forEach((itemDetail) => {
          arrRoleCode.push({
            ID: CheckNull(itemDetail.ID),
            Title: CheckNull(itemDetail.Title),
            Code: CheckNull(itemDetail.Code),
            DeptCode: isNotNull(itemDetail.DeptCode)
              ? itemDetail.DeptCode.split(",")
              : "",
          });
        });
      })
      .catch((error) => {
        console.log(error);
      });
    return arrRoleCode;
  }

  // Kiểm tra thông tin bắt buộc khi lưu 1 quy trình
  checkSaveFormAdd() {
    let txtCheck = "";
    if (!isNotNull(this.state.Code)) {
      txtCheck += "Mã quy trình, ";
    }
    if (isNotNull(this.state.Code)) {
      let listCheck = "1234567890QWERTYUIOPASDFGHJKLZXCVBNM";
      let check = true;
      for (let i = 0; i < this.state.Code.length; i++) {
        let result = listCheck.includes(this.state.Code[i].toUpperCase());
        if (result == false) {
          check = false;
          break;
        }
      }
      if (check == false) {
        txtCheck += "Mã quy trình không được chứa ký tự đặc biệt! , ";
      }
    }
    if (!isNotNull(this.state.Title)) {
      txtCheck += "Tên quy trình, ";
    }
    if (!isNotNull(this.state.WhoIsUsed)) {
      txtCheck += "Ai được sử dụng quy trình, ";
    }
    if (
      this.state.WhoIsUsed == "Department" &&
      !isNotNull(this.state.Department)
    ) {
      txtCheck += "Phòng ban được sử dụng, ";
    }
    if (
      this.state.WhoIsUsed == "Users" &&
      this.state.list_UserDefault.length == 0
    ) {
      txtCheck += "Nhóm người dùng, ";
    }
    if (!isNotNull(this.state.indexStep)) {
      txtCheck += "Bước khởi tạo quy trình, ";
    }
    if (this.state.listFormField.length == 0) {
      txtCheck += "Danh sách trường dữ liệu, ";
    }
    if (this.state.listStepWorkflow.length == 0) {
      txtCheck += "Danh sách bước quy trình, ";
    }
    if (this.state.listStepWorkflow.length > 0) {
      let listStep = returnArray(this.state.listStepWorkflow);
      for (let index = 0; index < listStep.length; index++) {
        let txtRow = checkSaveStepForm(listStep[index]);
        if (isNotNull(txtRow)) {
          txtCheck +=
            "\n Thông tin bước " + listStep[index].StepTitle + ": \n" + txtRow;
        }
      }
    }
    return txtCheck;
  }

  saveItem(status) {
    let checkRequired = this.checkSaveFormAdd();
    if (isNotNull(checkRequired)) {
      this.setState({ RequiredText: checkRequired, Required: true });
      //    alert("Bạn chưa nhập đầy đủ thông tin Quy trình: \n " + checkRequired);
    } else {
      this.setState({ isShowLoadingPage: true });
      let dataItemWF = {
        Title: this.state.Title,
        Code: this.state.Code,
        indexStep: this.state.indexStep,
        Description: this.state.Description,
        WhoIsUsed: this.state.WhoIsUsed,
        Status: status,
        SLA: 0,
        AutoSave:
          !isNotNull(this.state.AutoSave) || !this.state.AutoSave
            ? false
            : true,
        ObjParentProcess: JSON.stringify(this.state.ObjParentProcess),
        ListComponentInfo: JSON.stringify(this.state.ListComponentInfo)
      };
      if (isNotNull(this.state.Department)) {
        Object.assign(dataItemWF, { WIUGroup: this.state.Department });
      }
      if (this.state.WhoIsUsed == "Users") {
        const userDefault = [];
        for (let i = 0; i < this.state.list_UserDefault.length; i++) {
          userDefault.push(this.state.list_UserDefault[i].UserId);
        }
        Object.assign(dataItemWF, { WIUId: { results: userDefault } });
      }
      if (this.state.listStepWorkflow.length > 1) {
        let numSLA = TotalSLA(
          this.state.listStepWorkflow,
          this.state.indexStep
        );
        Object.assign(dataItemWF, { SLA: numSLA });
      }

      if (isNotNull(this.state.TemplateHtml)) {
        Object.assign(dataItemWF, {
          TemplateHtml: CheckNullSetZero(this.state.TemplateHtml),
        });
      }
      // console.log(this.state);
      // console.log(dataItemWF);

      this.listFieldCreate = [];
      if (isNotNull(this.ItemId)) {
        this.updateItemWFTable(dataItemWF);
      } else {
        this.saveItemWFTable(dataItemWF);
      }
    }
  }

  // Lưu thông tin của quy trình
  async saveItemWFTable(dataItemWF) {
    const checkList = await this.checkSaveListItem(this.state.Code);
    if (checkList) {
      sp.web.lists
        .getByTitle("WFTable")
        .items.add(dataItemWF)
        .then((items) => {
          // console.log("Add Success");
          this.checkWFFormField(this.state.Code, 0, items["data"].ID);
        })
        .catch((error) => {
          console.log(error);
        });
    } else {
      this.setState({
        RequiredText: "Mã quy trình đã tồn tại",
        Required: true,
      });
      this.setState({ isShowLoadingPage: false });
      return false;
    }
  }

  // Cập nhật thông tin của quy trình
  async updateItemWFTable(dataItemWF) {
    sp.web.lists
      .getByTitle("WFTable")
      .items.getById(this.ItemId)
      .update(dataItemWF)
      .then((items) => {
        // console.log("update Success");
        this.checkWFFormField(this.state.Code, 0, this.ItemId);
      })
      .catch((error) => {
        console.log(error);
      });
  }

  // nhập giá trị để tìm kiếm người
  changeSearchPeople(event) {
    this.fieldSearch = event.target.name;
    this.setState({ [`search_` + event.target.name]: event.target.value });
    clearTimeout(this.typingTimeout);
    this.typingTimeout = setTimeout(this.callSearchPeople, 1000);
  }

  // set giá trị cho danh sách người tìm kiếm
  async callSearchPeople() {
    let PeoplePicker = await shareService.searchPeoplePicker(
      this.state[`search_` + this.fieldSearch]
    );
    this.setState({ [`listSearch_` + this.fieldSearch]: PeoplePicker });
    this.fieldSearch = undefined;
  }

  // Chọn người từ trong danh sách tìm kiếm
  async selectSearch(Key, InternalName) {
    let objUser = await shareService.getInforUser(Key);
    if (objUser.UserId !== 0) {
      let arrPeople = this.state[`list_` + InternalName];
      if (arrPeople.findIndex((x) => x.UserId == objUser.UserId) == -1) {
        arrPeople.push(objUser);
      }
      this.setState({
        [`list_` + InternalName]: arrPeople,
        [`search_` + InternalName]: "",
        [`listSearch_` + InternalName]: [],
      });
    } else {
      this.setState({
        [`search_` + InternalName]: "",
        [`listSearch_` + InternalName]: [],
      });
    }
  }

  // Xóa danh sách người đã chọn
  removePeople(index) {
    let arrPeople = returnArray(this.state.list_UserDefault);
    arrPeople.splice(index, 1);
    this.setState({ list_UserDefault: arrPeople });
  }

  // Kiểm tra SPlist quy trình đã tồn tại hay chưa
  async checkSaveListItem(listName) {
    let check = true;
    await sp.web.lists
      .get()
      .then((list) => {
        // console.log(list);
        if (list.length > 0) {
          for (let index = 0; index < list.length; index++) {
            if (
              list[index].Title.toLocaleLowerCase() ==
              listName.toLocaleLowerCase()
            ) {
              check = false;
              break;
            }
          }
        }
      })
      .catch((error) => {
        console.log(error);
      });
    return check;
  }

  // Tạo SPlist quy trình
  createListItem(listName, ItemId) {
    sp.web.lists
      .add(listName)
      .then((listItem) => {
        // console.log(listItem);
        this.createFieldListItem(listName, 0, ItemId);
      })
      .catch((error) => {
        console.log(error);
      });
  }

  // Tạo các Field trong SPList quy trình
  createFieldListItem(listName, index, ItemId) {
    const listField = this.listFieldCreate;
    if (
      (listField[index].FieldType == objField.Text ||
        listField[index].FieldType == objField.Profile) &&
      listField[index].InternalName.toLocaleLowerCase() != "title" &&
      listField[index].InternalName.toLocaleLowerCase() != "reason"
    ) {
      sp.web.lists
        .getByTitle(listName)
        .fields.addText(listField[index].InternalName, 255)
        .then((fieldText) => {
          // console.log(fieldText);
          if (listField.length > index + 1) {
            this.createFieldListItem(listName, index + 1, ItemId);
          } else {
            // console.log("save success field");
            if (isNotNull(this.ItemId)) {
              window.location.href = config.pages.wfView + `?ItemId=` + ItemId;
            } else {
              this.createFieldListItemDefault(listName, ItemId);
            }
          }
        })
        .catch((error) => {
          console.log(error);
        });
    } else if (
      (listField[index].FieldType == objField.TextArea ||
        listField[index].FieldType == objField.SPLinkWF ||
        listField[index].FieldType == objField.ProcessControllers ||
        listField[index].FieldType == objField.LinkTags ||
        listField[index].FieldType == objField.Label) &&
      listField[index].InternalName.toLocaleLowerCase() != "title" &&
      listField[index].InternalName.toLocaleLowerCase() != "reason"
    ) {
      sp.web.lists
        .getByTitle(listName)
        .fields.addMultilineText(
          listField[index].InternalName,
          6,
          false,
          false,
          false,
          true
        )
        .then((fieldText) => {
          // console.log(fieldText);
          if (listField.length > index + 1) {
            this.createFieldListItem(listName, index + 1, ItemId);
          } else {
            // console.log("save success field");
            if (isNotNull(this.ItemId)) {
              window.location.href = config.pages.wfView + `?ItemId=` + ItemId;
            } else {
              this.createFieldListItemDefault(listName, ItemId);
            }
          }
        })
        .catch((error) => {
          console.log(error);
        });
    } else if (
      (listField[index].FieldType == objField.Number ||
        listField[index].FieldType == objField.Sum ||
        listField[index].FieldType == objField.Average ||
        listField[index].FieldType == objField.Percent) &&
      listField[index].InternalName.toLocaleLowerCase() != "title" &&
      listField[index].InternalName.toLocaleLowerCase() != "reason"
    ) {
      sp.web.lists
        .getByTitle(listName)
        .fields.addNumber(listField[index].InternalName)
        .then((fieldText) => {
          // console.log(fieldText);
          if (listField.length > index + 1) {
            this.createFieldListItem(listName, index + 1, ItemId);
          } else {
            // console.log("save success field");
            if (isNotNull(this.ItemId)) {
              window.location.href = config.pages.wfView + `?ItemId=` + ItemId;
            } else {
              this.createFieldListItemDefault(listName, ItemId);
            }
          }
        })
        .catch((error) => {
          console.log(error);
        });
    } else if (
      (listField[index].FieldType == objField.DateTime ||
        listField[index].FieldType == objField.Times) &&
      listField[index].InternalName.toLocaleLowerCase() != "title" &&
      listField[index].InternalName.toLocaleLowerCase() != "reason"
    ) {
      sp.web.lists
        .getByTitle(listName)
        .fields.addDateTime(
          listField[index].InternalName,
          DateTimeFieldFormatType.DateTime
        )
        .then((fieldText) => {
          // console.log(fieldText);
          if (listField.length > index + 1) {
            this.createFieldListItem(listName, index + 1, ItemId);
          } else {
            // console.log("save success field");
            if (isNotNull(this.ItemId)) {
              window.location.href = config.pages.wfView + `?ItemId=` + ItemId;
            } else {
              this.createFieldListItemDefault(listName, ItemId);
            }
          }
        })
        .catch((error) => {
          console.log(error);
        });
    } else if (
      listField[index].FieldType == objField.YesNo &&
      listField[index].InternalName.toLocaleLowerCase() != "title" &&
      listField[index].InternalName.toLocaleLowerCase() != "reason"
    ) {
      sp.web.lists
        .getByTitle(listName)
        .fields.addBoolean(listField[index].InternalName)
        .then((fieldText) => {
          // console.log(fieldText);
          if (listField.length > index + 1) {
            this.createFieldListItem(listName, index + 1, ItemId);
          } else {
            // console.log("save success field");
            if (isNotNull(this.ItemId)) {
              window.location.href = config.pages.wfView + `?ItemId=` + ItemId;
            } else {
              this.createFieldListItemDefault(listName, ItemId);
            }
          }
        })
        .catch((error) => {
          console.log(error);
        });
    } else if (
      listField[index].FieldType == objField.User &&
      listField[index].InternalName.toLocaleLowerCase() != "title" &&
      listField[index].InternalName.toLocaleLowerCase() != "reason"
    ) {
      sp.web.lists
        .getByTitle(listName)
        .fields.addUser(
          listField[index].InternalName,
          FieldUserSelectionMode.PeopleOnly
        )
        .then((fieldText) => {
          // console.log(fieldText);
          if (listField.length > index + 1) {
            this.createFieldListItem(listName, index + 1, ItemId);
          } else {
            // console.log("save success field");
            if (isNotNull(this.ItemId)) {
              window.location.href = config.pages.wfView + `?ItemId=` + ItemId;
            } else {
              this.createFieldListItemDefault(listName, ItemId);
            }
          }
        })
        .catch((error) => {
          console.log(error);
        });
    } else if (
      listField[index].FieldType == objField.UserMulti &&
      listField[index].InternalName.toLocaleLowerCase() != "title" &&
      listField[index].InternalName.toLocaleLowerCase() != "reason"
    ) {
      // sp.web.lists.getByTitle(listName).fields.addUser(listField[index].InternalName, FieldUserSelectionMode.PeopleAndGroups).then(
      //   fieldText => {
      //     console.log(fieldText);
      //     if (listField.length > (index + 1)) {
      //       this.createFieldListItem(listName, index + 1, ItemId)
      //     }
      //     else {
      //       console.log("save success field");
      //       if(isNotNull(this.ItemId)){
      //         window.location.href = config.pages.wfView + `?ItemId=` + ItemId;
      //       }
      //       else{
      //         this.createFieldListItemDefault(listName, ItemId);
      //       }
      //     }
      //   }
      // ).catch(
      //   error => {
      //     console.log(error);
      //   }
      // );
      const fieldSchema =
        `<Field DisplayName="` +
        listField[index].InternalName +
        `" Name="` +
        listField[index].InternalName +
        `" Type="UserMulti" UserSelectionMode="PeopleOnly" UserSelectionScope="0" Mult="TRUE" />`;

      sp.web.lists
        .getByTitle(listName)
        .fields.createFieldAsXml(fieldSchema)
        .then((fieldText) => {
          // console.log(fieldText);
          if (listField.length > index + 1) {
            this.createFieldListItem(listName, index + 1, ItemId);
          } else {
            // console.log("save success field");
            if (isNotNull(this.ItemId)) {
              window.location.href = config.pages.wfView + `?ItemId=` + ItemId;
            } else {
              this.createFieldListItemDefault(listName, ItemId);
            }
          }
        })
        .catch((error) => {
          console.log(error);
        });
    } else if (
      listField[index].FieldType == objField.Dropdown &&
      listField[index].InternalName.toLocaleLowerCase() != "title" &&
      listField[index].InternalName.toLocaleLowerCase() != "reason"
    ) {
      const choices = listField[index].ObjSPField.ObjField.ChoiceField;
      sp.web.lists
        .getByTitle(listName)
        .fields.addChoice(
          listField[index].InternalName,
          choices,
          ChoiceFieldFormatType.Dropdown,
          false
        )
        .then((fieldText) => {
          // console.log(fieldText);
          if (listField.length > index + 1) {
            this.createFieldListItem(listName, index + 1, ItemId);
          } else {
            // console.log("save success field");
            if (isNotNull(this.ItemId)) {
              window.location.href = config.pages.wfView + `?ItemId=` + ItemId;
            } else {
              this.createFieldListItemDefault(listName, ItemId);
            }
          }
        })
        .catch((error) => {
          console.log(error);
        });
    }

    else if (
      listField[index].FieldType == objField.DropdownMulti &&
      listField[index].InternalName.toLocaleLowerCase() != "title" &&
      listField[index].InternalName.toLocaleLowerCase() != "reason"
    ) {
      const choices = listField[index].ObjSPField.ObjField.ChoiceField;
      sp.web.lists
        .getByTitle(listName)
        .fields.addMultiChoice(listField[index].InternalName, choices, false)
        .then((fieldText) => {
          // console.log(fieldText);
          if (listField.length > index + 1) {
            this.createFieldListItem(listName, index + 1, ItemId);
          } else {
            // console.log("save success field");
            if (isNotNull(this.ItemId)) {
              window.location.href = config.pages.wfView + `?ItemId=` + ItemId;
            } else {
              this.createFieldListItemDefault(listName, ItemId);
            }
          }
        })
        .catch((error) => {
          console.log(error);
        });
    }
    else if (
      listField[index].FieldType == objField.CheckBox &&
      listField[index].InternalName.toLocaleLowerCase() != "title" &&
      listField[index].InternalName.toLocaleLowerCase() != "reason"
    ) {
      const choices = listField[index].ObjSPField.ObjField.ChoiceField;
      sp.web.lists
        .getByTitle(listName)
        .fields.addMultiChoice(listField[index].InternalName, choices, false)
        .then((fieldText) => {
          // console.log(fieldText);
          if (listField.length > index + 1) {
            this.createFieldListItem(listName, index + 1, ItemId);
          } else {
            // console.log("save success field");
            if (isNotNull(this.ItemId)) {
              window.location.href = config.pages.wfView + `?ItemId=` + ItemId;
            } else {
              this.createFieldListItemDefault(listName, ItemId);
            }
          }
        })
        .catch((error) => {
          console.log(error);
        });
    } else if (
      listField[index].FieldType == objField.RadioButton &&
      listField[index].InternalName.toLocaleLowerCase() != "title" &&
      listField[index].InternalName.toLocaleLowerCase() != "reason"
    ) {
      const choices = listField[index].ObjSPField.ObjField.ChoiceField;
      sp.web.lists
        .getByTitle(listName)
        .fields.addChoice(
          listField[index].InternalName,
          choices,
          ChoiceFieldFormatType.RadioButtons,
          false
        )
        .then((fieldText) => {
          // console.log(fieldText);
          if (listField.length > index + 1) {
            this.createFieldListItem(listName, index + 1, ItemId);
          } else {
            // console.log("save success field");
            if (isNotNull(this.ItemId)) {
              window.location.href = config.pages.wfView + `?ItemId=` + ItemId;
            } else {
              this.createFieldListItemDefault(listName, ItemId);
            }
          }
        })
        .catch((error) => {
          console.log(error);
        });
    } else if (
      listField[index].FieldType == objField.Hyperlink &&
      listField[index].InternalName.toLocaleLowerCase() != "title" &&
      listField[index].InternalName.toLocaleLowerCase() != "reason"
    ) {
      sp.web.lists
        .getByTitle(listName)
        .fields.addUrl(
          listField[index].InternalName,
          UrlFieldFormatType.Hyperlink
        )
        .then((fieldText) => {
          // console.log(fieldText);
          if (listField.length > index + 1) {
            this.createFieldListItem(listName, index + 1, ItemId);
          } else {
            // console.log("save success field");
            if (isNotNull(this.ItemId)) {
              window.location.href = config.pages.wfView + `?ItemId=` + ItemId;
            } else {
              this.createFieldListItemDefault(listName, ItemId);
            }
          }
        })
        .catch((error) => {
          console.log(error);
        });
    } else if (
      listField[index].FieldType == objField.PictureLink &&
      listField[index].InternalName.toLocaleLowerCase() != "title" &&
      listField[index].InternalName.toLocaleLowerCase() != "reason"
    ) {
      sp.web.lists
        .getByTitle(listName)
        .fields.addUrl(listField[index].InternalName, UrlFieldFormatType.Image)
        .then((fieldText) => {
          // console.log(fieldText);
          if (listField.length > index + 1) {
            this.createFieldListItem(listName, index + 1, ItemId);
          } else {
            // console.log("save success field");
            if (isNotNull(this.ItemId)) {
              window.location.href = config.pages.wfView + `?ItemId=` + ItemId;
            } else {
              this.createFieldListItemDefault(listName, ItemId);
            }
          }
        })
        .catch((error) => {
          console.log(error);
        });
    } else if (
      listField[index].FieldType == objField.AutoSystemNumberIMG &&
      listField[index].InternalName.toLocaleLowerCase() != "title" &&
      listField[index].InternalName.toLocaleLowerCase() != "reason"
    ) {
      sp.web.lists
        .getByTitle(listName)
        .fields.addText(listField[index].InternalName, 255, {
          EnforceUniqueValues: true,
          Indexed: true,
        })
        .then((fieldText) => {
          // console.log(fieldText);
          if (listField.length > index + 1) {
            this.createFieldListItem(listName, index + 1, ItemId);
          } else {
            // console.log("save success field");
            if (isNotNull(this.ItemId)) {
              window.location.href = config.pages.wfView + `?ItemId=` + ItemId;
            } else {
              this.createFieldListItemDefault(listName, ItemId);
            }
          }
        })
        .catch((error) => {
          console.log(error);
        });
    } else {
      if (listField.length > index + 1) {
        this.createFieldListItem(listName, index + 1, ItemId);
      } else {
        // console.log("save success field");
        if (isNotNull(this.ItemId)) {
          window.location.href = config.pages.wfView + `?ItemId=` + ItemId;
        } else {
          this.createFieldListItemDefault(listName, ItemId);
        }
      }
    }
  }

  // Kiểm trả điều kiện là Lưu hay Cập nhật Thông tin của Field trong SPList
  checkWFFormField(listName, index, ItemId) {
    const fieldItem = this.state.listFormField;
    const dataFormField = {
      Title: fieldItem[index].FieldName,
      WFTableId: ItemId,
      InternalName: fieldItem[index].InternalName,
      FieldType: fieldItem[index].FieldType,
      HelpText: fieldItem[index].HelpText,
      Required: fieldItem[index].Required,
      ObjValidation: JSON.stringify(fieldItem[index].ObjValidation),
      ObjSPField: JSON.stringify(fieldItem[index].ObjSPField),
      OrderIndex: index,
      TypeDefaultValue: fieldItem[index].TypeDefaultValue,
      ComponentInfo: fieldItem[index].ComponentInfo,
    };
    // if(isNotNull(fieldItem[index].DefaultValue)){
    if (fieldItem[index].FieldType == objField.User) {
      Object.assign(dataFormField, {
        DefaultValue: JSON.stringify(fieldItem[index].DefaultValue),
      });
    } else {
      Object.assign(dataFormField, {
        DefaultValue: fieldItem[index].DefaultValue,
      });
    }
    // }
    if (CheckNullSetZero(fieldItem[index].ID) > 0) {
      this.updateWFFormField(
        listName,
        index,
        dataFormField,
        fieldItem[index].ID,
        ItemId
      );
    } else {
      this.listFieldCreate.push(fieldItem[index]);
      this.saveWFFormField(listName, index, dataFormField, ItemId);
    }
  }

  // Lưu thông tin Field trong SPList
  saveWFFormField(listName, index, dataFormField, ItemId) {
    const fieldItem = this.state.listFormField;
    sp.web.lists
      .getByTitle("WFFormField")
      .items.add(dataFormField)
      .then((itemField) => {
        // console.log(itemField);
        if (fieldItem.length > index + 1) {
          this.checkWFFormField(listName, index + 1, ItemId);
        } else {
          if (this.listFieldId.length > 0) {
            this.deleteWFFormField(listName, 0, ItemId);
          } else {
            this.checkSaveStepWorkflow(listName, 0, ItemId);
          }
        }
      })
      .catch((error) => {
        console.log(error);
      });
  }

  // Cập nhật thông tin Field trong SPList
  updateWFFormField(listName, index, dataFormField, Id, ItemId) {
    const fieldItem = this.state.listFormField;
    sp.web.lists
      .getByTitle("WFFormField")
      .items.getById(Id)
      .update(dataFormField)
      .then((itemField) => {
        // console.log(itemField);
        if (fieldItem.length > index + 1) {
          this.checkWFFormField(listName, index + 1, ItemId);
        } else {
          if (this.listFieldId.length > 0) {
            this.deleteWFFormField(listName, 0, ItemId);
          } else {
            this.checkSaveStepWorkflow(listName, 0, ItemId);
          }
        }
      })
      .catch((error) => {
        console.log(error);
      });
  }

  // Xóa thông tin Field trong SPList
  deleteWFFormField(listName, index, ItemId) {
    sp.web.lists
      .getByTitle("WFFormField")
      .items.getById(this.listFieldId[index])
      .delete()
      .then((del) => {
        // console.log("Delete Step WF success");
        if (this.listFieldId.length > index + 1) {
          this.deleteWFFormField(listName, index + 1, ItemId);
        } else {
          this.checkSaveStepWorkflow(listName, 0, ItemId);
        }
      })
      .catch((error) => {
        console.log(error);
      });
  }

  // Tạo các field mặc định trong SPList của quy trình
  async createFieldListItemDefault(listName, ItemId) {
    await sp.web.lists.getByTitle(listName).fields.addNumber("indexStep");
    await sp.web.lists.getByTitle(listName).fields.addNumber("StatusStep");
    await sp.web.lists.getByTitle(listName).fields.addNumber("StatusRequest");
    await sp.web.lists
      .getByTitle(listName)
      .fields.addUser("UserRequest", FieldUserSelectionMode.PeopleOnly);
    await sp.web.lists
      .getByTitle(listName)
      .fields.addUser("UserApproval", FieldUserSelectionMode.PeopleOnly);

    const fieldSchema = `<Field DisplayName="ListUser" Name="ListUser" Type="UserMulti" UserSelectionMode="PeopleOnly" UserSelectionScope="0" Mult="TRUE" />`;
    await sp.web.lists
      .getByTitle(listName)
      .fields.createFieldAsXml(fieldSchema);
    await sp.web.lists
      .getByTitle(listName)
      .fields.addMultilineText("HistoryStep", 6, false, false, false, true);
    await sp.web.lists
      .getByTitle(listName)
      .fields.addMultilineText("ObjParentWF", 6, false, false, false, true);
    await sp.web.lists
      .getByTitle(listName)
      .fields.addMultilineText("ObjSubWF", 6, false, false, false, true);
    await sp.web.lists
      .getByTitle(listName)
      .fields.addMultilineText("Reason", 6, false, false, false, true);
    await sp.web.lists
      .getByTitle(listName)
      .fields.addMultilineText(
        "PermissViewInStep",
        6,
        false,
        false,
        false,
        true
      );

    await sp.web.lists
      .getByTitle(listName)
      .fields.addBoolean("IsApproveRunTime");
    await sp.web.lists
      .getByTitle(listName)
      .fields.addMultilineText("ApproverRunTime", 6, false, false, false, true);

    await sp.web.lists.getByTitle(listName).fields.addNumber("HoursBackStep");
    await sp.web.lists
      .getByTitle(listName)
      .fields.addNumber("StateOfEmergency");

    await shareService.createReportList(listName);
    await shareService.createDocumentList(listName);
    window.location.href = config.pages.wfView + `?ItemId=` + ItemId;
  }

  // Kiểm trả điều kiện là Lưu hay Cập nhật Thông tin của 1 bước trong SPList
  checkSaveStepWorkflow(listName, index, ItemId) {
    const fieldItem = this.state.listStepWorkflow;
    if (fieldItem[index].ObjEmailCfg.EmailSendInform.IsActive) {
      const objUserField =
        fieldItem[index].ObjEmailCfg.EmailSendInform.ObjUserField;
      let arrField = [];

      const listField = this.state.listFormField.filter(
        (fs) =>
          fs.FieldType == objField.User || fs.FieldType == objField.UserMulti
      );
      for (let f = 0; f < objUserField.length; f++) {
        const field = listField.find(
          (fu) => fu.InternalName == objUserField[f]
        );
        arrField.push(field);
      }
      fieldItem[index].ObjEmailCfg.EmailSendInform.ObjUserField = arrField;
    }
    let ObjFieldStep = fieldItem[index].ObjFieldStep;
    let fieldInputNew = [];
    ObjFieldStep.FieldInput.map((x) => {
      if (
        this.state.listFormField.findIndex(
          (y) => y.InternalName == x.InternalName
        ) != -1
      ) {
        fieldInputNew.push(x);
        // let indexInput = ObjFieldStep.FieldInput.indexOf(x.InternalName);
        // ObjFieldStep.FieldInput.splice(indexInput, 1);
      }
    });
    ObjFieldStep.FieldInput = fieldInputNew;
    let fieldViewNew = [];
    ObjFieldStep.FieldView.map((k) => {
      if (
        this.state.listFormField.findIndex(
          (z) => z.InternalName == k.InternalName
        ) != -1
      ) {
        fieldViewNew.push(k);
        // let indexView = ObjFieldStep.FieldView.indexOf(k.InternalName);
        // ObjFieldStep.FieldView.splice(indexView, 1);
      }
    });
    ObjFieldStep.FieldView = fieldViewNew;

    const dataStepWF = {
      Title: fieldItem[index].StepTitle,
      Code: fieldItem[index].StepCode,
      WFTableId: ItemId,
      ObjEmailCfg: JSON.stringify(fieldItem[index].ObjEmailCfg),
      StepWFType: fieldItem[index].StepWFType,
      ObjStepWFId: JSON.stringify(fieldItem[index].ObjStepWFId),
      ObjStepCondition: JSON.stringify(fieldItem[index].ObjStepCondition),
      ClassifyStep: fieldItem[index].ClassifyStep,
      indexStep: fieldItem[index].indexStep,
      StepNextDefault: JSON.stringify(fieldItem[index].StepNextDefault),
      ObjFieldStep: JSON.stringify(ObjFieldStep),
      btnAction: JSON.stringify(fieldItem[index].btnAction),
      ObjBackStep: JSON.stringify(fieldItem[index].ObjBackStep),
      SLA: CheckNullSetZero(fieldItem[index].SLA),
      TypeofApprover: fieldItem[index].TypeofApprover,
      ApproveRunTime: JSON.stringify(fieldItem[index].ApproveRunTime),
    };
    // if (fieldItem[index].indexStep > 1) {
    if (fieldItem[index].TypeofApprover == "Người phê duyệt") {
      Object.assign(dataStepWF, {
        GroupApprover: JSON.stringify(fieldItem[index].GroupApprover),
        ApproverInField: null,
        ApproverInStep: null,
        ApproverInSelect: null,
        DepartmentCode: null,
        ApproveCode: null,
        RoleCode: null,
      });
      if (
        fieldItem[index].GroupApprover.TypeUserApproval == "Một người phê duyệt"
      ) {
        Object.assign(dataStepWF, {
          UserApproverId: fieldItem[index].UserApprover.UserId,
          IsEditApprover: fieldItem[index].IsEditApprover,
        });
      } else {
        Object.assign(dataStepWF, {
          UserApproverId: null,
          IsEditApprover: false,
        });
      }
    } else if (fieldItem[index].TypeofApprover == "Người xử lý tại bước") {
      let groupApprover = {
        TypeUserApproval: "",
        Group: { ID: "", Title: "" },
      };
      Object.assign(dataStepWF, {
        GroupApprover: JSON.stringify(groupApprover),
        ApproverInStep: fieldItem[index].ApproverInStep,
        ApproverInSelect: null,
        ApproverInField: null,
        UserApproverId: null,
        DepartmentCode: null,
        ApproveCode: null,
        RoleCode: null,
      });
    } else if (fieldItem[index].TypeofApprover == "Trường dữ liệu") {
      let groupApprover = {
        TypeUserApproval: "",
        Group: { ID: "", Title: "" },
      };
      Object.assign(dataStepWF, {
        GroupApprover: JSON.stringify(groupApprover),
        ApproverInField: fieldItem[index].ApproverInField,
        ApproverInSelect: null,
        ApproverInStep: null,
        UserApproverId: null,
        DepartmentCode: null,
        ApproveCode: null,
        RoleCode: null,
      });
    }
    else if (fieldItem[index].TypeofApprover == "Select") {
      let groupApprover = {
        TypeUserApproval: "",
        Group: { ID: "", Title: "" },
      };
      Object.assign(dataStepWF, {
        GroupApprover: JSON.stringify(groupApprover),
        ApproverInSelect: JSON.stringify(fieldItem[index].ApproverInSelect),
        ApproverInField: fieldItem[index].ApproverInField,
        ApproverInStep: null,
        UserApproverId: null,
        DepartmentCode: null,
        ApproveCode: null,
        RoleCode: null,

      });
    }
    else {
      let groupApprover = {
        TypeUserApproval: "",
        Group: { ID: "", Title: "" },
      };
      Object.assign(dataStepWF, {
        GroupApprover: JSON.stringify(groupApprover),
        ApproveCode: fieldItem[index].ApproveCode,
        RoleCode: fieldItem[index].RoleCode,
        DepartmentCode: fieldItem[index].DepartmentCode,
        UserApproverId: null,
        ApproverInField: null,
        ApproverInStep: null,
        ApproverInSelect: null,
      });
    }
    // }
    if (CheckNullSetZero(fieldItem[index].ID) > 0) {
      this.updateStepWorkflow(
        listName,
        index,
        dataStepWF,
        fieldItem[index].ID,
        ItemId
      );
    } else {
      this.saveStepWorkflow(listName, index, dataStepWF, ItemId);
    }
  }

  // Lưu thông tin cấu hình của 1 bước trong SPList
  saveStepWorkflow(listName, index, dataStepWF, ItemId) {
    const fieldItem = this.state.listStepWorkflow;
    sp.web.lists
      .getByTitle("WFStepTable")
      .items.add(dataStepWF)
      .then((itemField) => {
        // console.log(itemField);
        if (fieldItem.length > index + 1) {
          this.checkSaveStepWorkflow(listName, index + 1, ItemId);
        } else {
          if (this.listStepId.length > 0) {
            this.deleteStepWorkflow(listName, 0, ItemId);
          } else {
            if (this.listFieldCreate.length > 0) {
              if (isNotNull(this.ItemId)) {
                this.createFieldListItem(listName, 0, ItemId);
              } else {
                this.createListItem(listName, ItemId);
              }
            } else {
              window.location.href = config.pages.wfView + `?ItemId=` + ItemId;
            }
          }
        }
      })
      .catch((error) => {
        console.log(error);
      });
  }

  // Cập nhật thông tin cấu hình của 1 bước trong SPList
  updateStepWorkflow(listName, index, dataStepWF, Id, ItemId) {
    const fieldItem = this.state.listStepWorkflow;
    sp.web.lists
      .getByTitle("WFStepTable")
      .items.getById(Id)
      .update(dataStepWF)
      .then((itemField) => {
        // console.log(itemField);
        if (fieldItem.length > index + 1) {
          this.checkSaveStepWorkflow(listName, index + 1, ItemId);
        } else {
          if (this.listStepId.length > 0) {
            this.deleteStepWorkflow(listName, 0, ItemId);
          } else {
            if (this.listFieldCreate.length > 0) {
              if (isNotNull(this.ItemId)) {
                this.createFieldListItem(listName, 0, ItemId);
              } else {
                this.createListItem(listName, ItemId);
              }
            } else {
              window.location.href = config.pages.wfView + `?ItemId=` + ItemId;
            }
          }
        }
      })
      .catch((error) => {
        console.log(error);
      });
  }

  // Xóa bước trong SPList
  deleteStepWorkflow(listName, index, ItemId) {
    sp.web.lists
      .getByTitle("WFStepTable")
      .items.getById(this.listStepId[index])
      .delete()
      .then((del) => {
        // console.log("Delete Step WF success");
        if (this.listStepId.length > index + 1) {
          this.deleteStepWorkflow(listName, index + 1, ItemId);
        } else {
          if (this.listFieldCreate.length > 0) {
            if (isNotNull(this.ItemId)) {
              this.createFieldListItem(listName, 0, ItemId);
            } else {
              this.createListItem(listName, ItemId);
            }
          } else {
            window.location.href = config.pages.wfView + `?ItemId=` + ItemId;
          }
        }
      })
      .catch((error) => {
        console.log(error);
      });
  }

  callChangeFile(type) {
    // console.log(type);
    if (type == "AttachmentRequest") {
      document.getElementById("fileUploadRequest").click();
    } else if (type == "AttachmentComment") {
      document.getElementById("fileUploadComment").click();
    }
  }

  async changeFile(event) {
    let file = event.target.files[0];
    if (file) {
      var readFile = new FileReader();
      self = this;
      var json = "";

      readFile.onload = async function (e) {
        self.setState({ isShowLoadingPage: true });
        var contents = e.target.result;
        json = JSON.parse(contents);
        let StepWF = json.Step.StepWF;
        for (let index = 0; index < StepWF.length; index++) {
          if (StepWF[index].ObjEmailCfg.EmailSendInform.IsActive) {
            const objUserField =
              StepWF[index].ObjEmailCfg.EmailSendInform.ObjUserField;
            const objUserDefault =
              StepWF[index].ObjEmailCfg.EmailSendInform.ObjUserDefault;

            if (objUserField != undefined) {
              let arrField = [];
              for (let f = 0; f < objUserField.length; f++) {
                if (isNotNull(objUserField[f])) {
                  arrField.push(objUserField[f].InternalName);
                }
              }
              StepWF[index].ObjEmailCfg.EmailSendInform.ObjUserField = arrField;
            } else {
              Object.assign(StepWF[index].ObjEmailCfg.EmailSendInform, {
                ObjUserField: [],
              });
            }
            if (objUserDefault == undefined) {
              Object.assign(StepWF[index].ObjEmailCfg.EmailSendInform, {
                ObjUserDefault: [],
              });
            }
            if (objUserDefault.length > 0) {
              for (let k = 0; k < objUserDefault.length; k++) {
                if (isNotNull(objUserDefault[k].UserEmail)) {
                  let DefaultUserValue = await shareService.getInforUser(
                    "i:0#.f|membership|" + objUserDefault[k].UserEmail
                  );
                  StepWF[index].ObjEmailCfg.EmailSendInform.ObjUserDefault[
                    k
                  ] = DefaultUserValue;
                }
              }
            }
            if (
              StepWF[index].ObjEmailCfg.EmailSendInform
                .search_InformToUserDefault == undefined
            ) {
              Object.assign(StepWF[index].ObjEmailCfg.EmailSendInform, {
                search_InformToUserDefault: "",
              });
            }
            if (
              StepWF[index].ObjEmailCfg.EmailSendInform
                .listSearch_InformToUserDefault == undefined
            ) {
              Object.assign(StepWF[index].ObjEmailCfg.EmailSendInform, {
                listSearch_InformToUserDefault: [],
              });
            }
          } else {
            StepWF[index].ObjEmailCfg.EmailSendInform = {
              IsActive: false,
              ObjEmailTemplate: { TemplateId: "", TemplateTitle: "" },
              ObjUserDefault: [],
              ObjUserField: [],
              search_InformToUserDefault: "",
              listSearch_InformToUserDefault: [],
            };
          }
          if (!isNotNull(StepWF[index].ObjEmailCfg.EmailSendDeadline)) {
            StepWF[index].ObjEmailCfg.EmailSendDeadline = {
              IsActive: false,
              ObjEmailTemplate: { TemplateId: "", TemplateTitle: "" },
              NumberHours: "",
            };
          }
          if (isNotNull(StepWF[index].UserApprover.UserEmail)) {
            let UserApprover = "";
            UserApprover = await shareService.getInforUser(
              "i:0#.f|membership|" + StepWF[index].UserApprover.UserEmail
            );
            StepWF[index].UserApprover = UserApprover;
          }
          if (
            StepWF[index].ObjFieldStep.FieldInput.length > 0 &&
            StepWF[index].ObjFieldStep.FieldInput[0].IsFirstColumn === undefined
          ) {
            let arrayFieldOld = returnArray(
              StepWF[index].ObjFieldStep.FieldInput
            );
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
            StepWF[index].ObjFieldStep.FieldInput = arrayFieldNew;
          }
          if (
            StepWF[index].ObjFieldStep.FieldView.length > 0 &&
            StepWF[index].ObjFieldStep.FieldView[0].IsFirstColumn === undefined
          ) {
            let arrayFieldViewOld = returnArray(
              StepWF[index].ObjFieldStep.FieldView
            );
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
            StepWF[index].ObjFieldStep.FieldView = arrayFieldViewNew;
          }
        }
        for (let field = 0; field < json.Field.wfListField.length; field++) {
          if (
            json.Field.wfListField[field].FieldType == "User" &&
            isNotNull(json.Field.wfListField[field].DefaultValue) &&
            isNotNull(json.Field.wfListField[field].DefaultValue.UserEmail)
          ) {
            let DefaultValue = await shareService.getInforUser(
              "i:0#.f|membership|" +
              json.Field.wfListField[field].DefaultValue.UserEmail
            );
            json.Field.wfListField[field].DefaultValue = DefaultValue;
          }
        }
        let list_UserDefault = [];
        if (
          isNotNull(json.WorkFlow.WIUId) &&
          json.WorkFlow.WIUId.results.length > 0
        ) {
          for (let i = 0; i < json.WorkFlow.WIUId.results.length; i++) {
            if (isNotNull(json.WorkFlow.WIUId.results[i].UserEmail)) {
              let user = await shareService.getInforUser(
                "i:0#.f|membership|" + json.WorkFlow.WIUId.results[i].UserEmail
              );
              list_UserDefault.push(user);
            }
          }
        }
        //  Object.assign(json.Field.wfListField,{ComponentInfo:''})
        self.setState({
          FieldImport: file.name,
          Title: CheckNull(json.WorkFlow.Title),
          Code: CheckNull(json.WorkFlow.Code),
          Description: CheckNull(json.WorkFlow.Description),
          WhoIsUsed:
            self.permissUser.Permission == "Manager"
              ? "Department"
              : CheckNull(json.WorkFlow.WhoIsUsed),
          listFormField: CheckNull(json.Field.wfListField),
          listStepWorkflow: CheckNull(StepWF),
          indexStep: CheckNull(json.WorkFlow.indexStep),
          Department:
            self.state.listDept.findIndex(
              (y) => y.Code == json.WorkFlow.GroupCode
            ) != -1
              ? CheckNull(json.WorkFlow.GroupCode)
              : "",
          list_UserDefault: list_UserDefault,
          isShowLoadingPage: false,
          ListComponentInfo: CheckNull(json.WorkFlow.ListComponentInfo) == "" ? [] : CheckNull(json.WorkFlow.ListComponentInfo)
        });
      };

      readFile.readAsText(file);
    } else {
      console.log("Failed to load file");
    }
  }

  removeFile() {
    this.setState({ FieldImport: "" });
  }

  async modalOpenCloseAlert() {
    await this.setState({ Required: false });
  }

  render() {
    const {
      countFL,
      listDept,
      listTemplateHtml,
      listStepWorkflow,
      listWorkflow,
      listEmailTemplate,
      listApproveCode,
      listRoleCode,
      listGroup,
      isShowLoadingPage,
      isParentProcess,
      ArrayAllParentProcess,
      ObjParentProcess,
    } = this.state;
    // console.log(this.state);
    return (
      <Fragment>
        {isShowLoadingPage ? (
          <div className="loadingProcess">
            <Spinner animation="border" className="loadingIcon" />
          </div>
        ) : (
          ""
        )}
        {countFL < config.NumberMaxFlow || isNotNull(this.ItemId) ?
          <div className="page-content mt-0 pt-0">
            <Container fluid={true}>
              <Row>
                <Col lg={12} sm={12}>
                  <Card>
                    <CardHeader className="bg-info">
                      <h5 className="my-0 text-white">Tạo mới quy trình</h5>
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
                        <div className="row mt-3 mb-3">
                          <div className="col">
                            <div className="form-group">
                              <button
                                type="button"
                                className="btn btn-primary btn-block waves-effect waves-light"
                                onClick={() => this.saveItem(0)}
                              >
                                <i className="fa fa-floppy-o mr-2"></i>Lưu
                              </button>
                            </div>
                          </div>

                          <div className="col">
                            <div className="form-group">
                              <button
                                type="button"
                                className="btn btn-success btn-block waves-effect waves-light"
                                onClick={() => this.saveItem(1)}
                              >
                                <i className="fa fa-check mr-2"></i>Đưa vào hoạt
                                động
                              </button>
                            </div>
                          </div>

                          <div className="col">
                            <div className="form-group">
                              <button
                                type="button"
                                className="btn btn-secondary btn-block waves-effect waves-light"
                                onClick={() => this.resetItemWF()}
                              >
                                <i className="fa fa-refresh mr-2"></i>Làm mới
                              </button>
                            </div>
                          </div>

                          {config.productVersion == 3 ? (
                            <div className="col">
                              <div className="form-group">
                                <button
                                  type="button"
                                  onClick={() =>
                                    this.callChangeFile("AttachmentRequest")
                                  }
                                  className="btn btn-info btn-block waves-effect waves-light"
                                >
                                  <i className="fa fa-download mr-2"></i>Import
                                </button>
                                <input
                                  hidden
                                  onChange={this.changeFile.bind(this)}
                                  type="file"
                                  id="fileUploadRequest"
                                />
                                {this.state.FieldImport != "" ? (
                                  <a
                                    type="button"
                                    onClick={() => this.removeFile()}
                                  >
                                    <i className="fa fa-close text-danger"></i>{" "}
                                    {this.state.FieldImport}
                                  </a>
                                ) : (
                                  ""
                                )}
                              </div>
                            </div>
                          ) : (
                            ""
                          )}
                        </div>

                        <div className="row mb-3">
                          <div className="col-lg-6">
                            <div className="form-group row">
                              <label
                                htmlFor="example-text-input"
                                className="col-md-4 col-form-label"
                              >
                                Tên quy trình{" "}
                                <span className="text-danger">*</span>
                              </label>
                              <div className="col-md-8">
                                <input
                                  className="form-control"
                                  type="text"
                                  name="Title"
                                  onChange={this.changeFormInput}
                                  value={this.state.Title}
                                />
                              </div>
                            </div>
                          </div>

                          <div className="col-lg-6">
                            <div className="form-group row">
                              <label
                                htmlFor="example-text-input"
                                className="col-md-4 col-form-label"
                              >
                                Mã quy trình{" "}
                                <span className="text-danger">*</span>
                              </label>
                              <div className="col-md-8">
                                <input
                                  className="form-control"
                                  type="text"
                                  name="Code"
                                  onChange={this.changeFormInput}
                                  value={this.state.Code}
                                  disabled={isNotNull(this.ItemId) ? true : false}
                                />
                              </div>
                            </div>
                          </div>

                          <div className="col-lg-6">
                            <div className="form-group row">
                              <label
                                htmlFor="example-text-input"
                                className="col-md-4 col-form-label"
                              >
                                Ai dược sử dụng quy trình{" "}
                                <span className="text-danger">*</span>
                              </label>
                              <div className="col-md-8">
                                <select
                                  className="form-control"
                                  name="WhoIsUsed"
                                  onChange={this.changeFormInput}
                                  value={this.state.WhoIsUsed}
                                  disabled={
                                    this.permissUser.Permission == "Manager"
                                      ? true
                                      : false
                                  }
                                >
                                  <option value=""></option>
                                  <option value="All Users">
                                    Tất cả mọi người
                                  </option>
                                  <option value="Department">Phòng ban</option>
                                  <option value="Users">Nhóm người dùng</option>
                                </select>
                              </div>
                            </div>
                          </div>

                          {this.state.WhoIsUsed == "Department" ? (
                            <div className="col-lg-6">
                              <div className="form-group row">
                                <label
                                  htmlFor="example-text-input"
                                  className="col-md-4 col-form-label"
                                >
                                  Phòng ban <span className="text-danger">*</span>
                                </label>
                                <div className="col-md-8">
                                  <select
                                    className="form-control"
                                    name="Department"
                                    onChange={this.changeFormInput}
                                    value={this.state.Department}
                                  >
                                    <option value=""></option>
                                    {listDept
                                      ? listDept.map((dept) => (
                                        <option key={dept.ID} value={dept.Code}>
                                          {dept.Title}
                                        </option>
                                      ))
                                      : ""}
                                  </select>
                                </div>
                              </div>
                            </div>
                          ) : (
                            ""
                          )}

                          {this.state.WhoIsUsed == "Users" ? (
                            <div className="col-lg-6">
                              <div className="form-group row">
                                <label
                                  htmlFor="example-text-input"
                                  className="col-md-4 col-form-label"
                                >
                                  Nhóm người dùng{" "}
                                  <span className="text-danger">*</span>
                                </label>
                                <div className="col-md-8">
                                  <input
                                    className="form-control"
                                    type="text"
                                    name="UserDefault"
                                    onChange={this.changeSearchPeople.bind(this)}
                                    value={this.state.search_UserDefault}
                                    placeholder="Tìm kiếm người dùng"
                                  />
                                  
                                  {this.state.listSearch_UserDefault.length >
                                    0 ? (
                                    <div className="suggesAuto">
                                      {this.state.listSearch_UserDefault.map(
                                        (people) => (
                                          <div
                                            key={people.Key}
                                            className="suggtAutoItem"
                                            onClick={() =>
                                              this.selectSearch(
                                                people.Key,
                                                "UserDefault"
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

                                  {this.state.list_UserDefault.length > 0 ? (
                                    <div className="tagName">
                                      {this.state.list_UserDefault.map(
                                        (users, indexUs) => (
                                          <div key={indexUs} className="wrapName">
                                            <a
                                              type="button"
                                              onClick={() =>
                                                this.removePeople(indexUs)
                                              }
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

                          <div className="col-lg-6">
                            <div className="form-group row">
                              <label
                                htmlFor="example-text-input"
                                className="col-md-4 col-form-label"
                              >
                                Bước khởi tạo quy trình
                                <span className="text-danger">*</span>
                              </label>
                              <div className="col-md-8">
                                <select
                                  className="form-control"
                                  name="indexStep"
                                  onChange={this.changeFormInput}
                                  value={this.state.indexStep}
                                >
                                  <option value=""></option>
                                  {listStepWorkflow
                                    ? listStepWorkflow.map((step) => (
                                      <option
                                        key={step.indexStep}
                                        value={step.indexStep}
                                      >
                                        {step.StepTitle}
                                      </option>
                                    ))
                                    : ""}
                                </select>
                              </div>
                            </div>
                          </div>

                          <div className="col-lg-6">
                            <div className="form-group row">
                              <label
                                htmlFor="example-text-input"
                                className="col-md-4 col-form-label"
                              >
                                Tự động lưu
                              </label>
                              <div className="col-md-8">
                                <input
                                  type="checkbox"
                                  className="form-check-input"
                                  name="AutoSave"
                                  onChange={this.changeFormInput}
                                  checked={this.state.AutoSave}
                                />
                              </div>
                            </div>
                          </div>

                          <div className="col-lg-6">
                            <div className="form-group row">
                              <label
                                htmlFor="example-text-input"
                                className="col-md-4 col-form-label"
                              >
                                Mẫu xuất tài liệu PDF
                              </label>
                              <div className="col-md-8">
                                <select
                                  className="form-control"
                                  name="TemplateHtml"
                                  onChange={this.changeFormInput}
                                  value={this.state.TemplateHtml}
                                >
                                  <option value=""></option>
                                  {listTemplateHtml
                                    ? listTemplateHtml.map((step) => (
                                      <option key={step.ID} value={step.ID}>
                                        {step.Title}
                                      </option>
                                    ))
                                    : ""}
                                </select>
                              </div>
                            </div>
                          </div>

                          <div
                            className={`col-lg-${!isNotNull(this.state.WhoIsUsed) ||
                              this.state.WhoIsUsed == "All Users"
                              ? "12"
                              : "6"
                              }`}
                          >
                            <div className="form-group row">
                              <label
                                htmlFor="example-text-input"
                                className={`col-form-label col-lg-${!isNotNull(this.state.WhoIsUsed) ||
                                  this.state.WhoIsUsed == "All Users"
                                  ? "2"
                                  : "4"
                                  }`}
                              >
                                Mô tả
                              </label>
                              <div
                                className={`col-lg-${!isNotNull(this.state.WhoIsUsed) ||
                                  this.state.WhoIsUsed == "All Users"
                                  ? "10"
                                  : "8"
                                  }`}
                              >
                                <textarea
                                  rows="3"
                                  name="Description"
                                  className="form-control"
                                  onChange={this.changeFormInput}
                                  value={this.state.Description}
                                ></textarea>
                              </div>
                            </div>
                          </div>

                          {!isParentProcess ? (
                            ""
                          ) : (
                            <div className="col-lg-12">
                              <InfoParentProcess
                                ArrayAllParentProcess={ArrayAllParentProcess}
                                ObjParentProcess={ObjParentProcess}
                                resultParentProcess={this.resultParentProcess}
                                listFormField={this.state.listFormField}
                              />
                            </div>
                          )}
                        </div>
                        <WfComponentInfo
                          ListComponentInfo={this.state.ListComponentInfo}

                        />
                        <Card outline color="info" className="border p-3">
                          <div className="row">
                            <Col lg="6">
                              <CardTitle className="text-info mb-3">
                                Sơ đồ luồng chạy
                              </CardTitle>
                            </Col>
                            <Col lg="12" className="flowDG">
                              <ReactFlow
                                elements={this.flow}

                                snapToGrid={true}
                                snapGrid={[15, 15]}
                              >
                                <MiniMap
                                  nodeStrokeColor={(n) => {
                                    if (n.style?.background) return n.style.background;
                                    if (n.type === 'input') return '#0041d0';
                                    if (n.type === 'output') return '#ff0072';
                                    if (n.type === 'default') return '#1a192b';

                                    return '#eee';
                                  }}
                                  nodeColor={(n) => {
                                    if (n.style?.background) return n.style.background;

                                    return '#fff';
                                  }}
                                  nodeBorderRadius={2}
                                />
                                <Controls />
                                <Background color="#aaa" gap={16} />
                              </ReactFlow>
                              {/* <Flowchart
                              chartCode={this.code}
                              options={this.opt}

                            /> */}
                              {/* {this.state.listStepWorkflowDG.map((item, stepIndex) => (
                              <span key={stepIndex}>
                                {item.StepTitle}  <br />
                              </span>

                            ))} */}

                            </Col>
                          </div>
                        </Card>
                        <WfFormField
                          listStepWorkflow={this.state.listStepWorkflow}
                          listFormField={this.state.listFormField}
                          listWorkflow={this.state.listWorkflow}
                          ListComponentInfo={this.state.ListComponentInfo}
                          setListFormField={this.setListFormField}
                          deleteEditField={this.deleteEditField}
                        />

                        <WfStepTable
                          listDept={this.state.listDept}
                          listFormField={this.state.listFormField}
                          listStepWorkflow={this.state.listStepWorkflow}
                          listEmailTemplate={listEmailTemplate}
                          setListStepTable={this.setListStepTable}
                          deleteStepForm={this.deleteStepForm}
                          listApproveCode={listApproveCode}
                          listRoleCode={listRoleCode}
                          listGroup={listGroup}
                          listWorkflow={listWorkflow}
                        />

                        <div className="row mt-3 mb-3">
                          <div className="col">
                            <div className="form-group">
                              <button
                                type="button"
                                className="btn btn-primary btn-block waves-effect waves-light"
                                onClick={() => this.saveItem(0)}
                              >
                                <i className="fa fa-floppy-o mr-2"></i>Lưu
                              </button>
                            </div>
                          </div>

                          <div className="col">
                            <div className="form-group">
                              <button
                                type="button"
                                className="btn btn-success btn-block waves-effect waves-light"
                                onClick={() => this.saveItem(1)}
                              >
                                <i className="fa fa-check mr-2"></i>Đưa vào hoạt
                                động
                              </button>
                            </div>
                          </div>

                          <div className="col">
                            <div className="form-group">
                              <button
                                type="button"
                                className="btn btn-secondary btn-block waves-effect waves-light"
                                onClick={() => this.resetItemWF()}
                              >
                                <i className="fa fa-refresh mr-2"></i>Làm mới
                              </button>
                            </div>
                          </div>

                          {config.productVersion == 3 ? (
                            <div className="col">
                              <div className="form-group">
                                <button
                                  type="button"
                                  onClick={() =>
                                    this.callChangeFile("AttachmentRequest")
                                  }
                                  className="btn btn-info btn-block waves-effect waves-light"
                                >
                                  <i className="fa fa-download mr-2"></i>Import
                                </button>
                                <input
                                  hidden
                                  onChange={this.changeFile.bind(this)}
                                  type="file"
                                  id="fileUploadRequest"
                                />
                                {this.state.FieldImport != "" ? (
                                  <a
                                    type="button"
                                    onClick={() => this.removeFile()}
                                  >
                                    <i className="fa fa-close text-danger"></i>{" "}
                                    {this.state.FieldImport}
                                  </a>
                                ) : (
                                  ""
                                )}
                              </div>
                            </div>
                          ) : (
                            ""
                          )}
                        </div>
                      </CardBody>
                    )}
                  </Card>
                </Col>
              </Row>
            </Container>
          </div>
          : ''}
        {
          !this.state.Required ? (
            ""
          ) : (
            <ConfirmRequired
              textRequired={this.state.RequiredText}
              modalOpenCloseAlert={this.modalOpenCloseAlert}
            />
          )
        }
      </Fragment >
    );
  }
}
