import { sp } from "@pnp/sp";
import { config } from "./../../pages/environment.js";
import "@pnp/sp/webs";
import "@pnp/sp/lists/web";
import "@pnp/sp/items";
import "@pnp/sp/profiles";
import "@pnp/sp/site-users/web";
import "@pnp/sp/fields";
import "@pnp/sp/site-groups";
import {
  DateTimeFieldFormatType,
  FieldUserSelectionMode,
  ChoiceFieldFormatType,
  UrlFieldFormatType,
} from "@pnp/sp/fields/types";
import {
  isNotNull,
  CheckNullSetZero,
  CheckNull,
  returnArray,
  returnObject,
} from "./wfShareFunction.js";
import configData from "./../../../config/configDatabase.json";

class UserStore {
  constructor() {
    if (!UserStore.instance) {
      sp.setup({ pageContext: { web: { absoluteUrl: config.url.API_URL } } });

      UserStore.instance = this;
    }

    return UserStore.instance;
  }

  async getCurrentUser() {
    const currentUser = await sp.web.currentUser();
    // console.log(currentUser);
    return currentUser;
  }

  async checkPermissionUser(UserId, ListDepartment) {
    let permissUser = { Permission: "User", Dept: [] };
    const siteGroups = await sp.web.currentUser.groups();
    // console.log(siteGroups);
    if (siteGroups.findIndex((gr) => gr.Title == "BPM Admins") != -1) {
      permissUser.Permission = "Admin";
    } else if (siteGroups.findIndex((gr) => gr.Title == "BPM Managers") != -1) {
      permissUser.Permission = "Manager";
      let dept = ListDepartment.filter(
        (dp) => dp.Manager == UserId || dp.Members.indexOf(UserId) != -1
      );
      for (let index = 0; index < dept.length; index++) {
        let deptChirld = ListDepartment.filter(
          (de) => de.ParentCode == dept[index].Code
        );
        deptChirld.map((chirld) => {
          if (dept.findIndex((chil) => chil.ID == chirld.ID) == -1) {
            dept.push(chirld);
          }
        });
      }
      permissUser.Dept = dept;
    } else {
      let dept = ListDepartment.filter((dp) => dp.Manager == UserId);
      if (dept.length > 0) {
        permissUser.Permission = "Manager";
        for (let index = 0; index < dept.length; index++) {
          let deptChirld = ListDepartment.filter(
            (de) => de.ParentCode == dept[index].Code
          );
          deptChirld.map((chirld) => {
            if (dept.findIndex((chil) => chil.ID == chirld.ID) == -1) {
              dept.push(chirld);
            }
          });
        }
      }

      permissUser.Dept = dept;
    }
    // console.log(permissUser);
    return permissUser;
  }

  async GetListDepartment() {
    let items = [];
    await sp.web.lists
      .getByTitle("ListDepartment")
      .items.select(
        "ID,Title,DeptCode,Manager/Id,Manager/Title,Manager/Name,Members/Id,Members/Title,Members/Name,ParentCode,ManagerId,MembersId"
      )
      .expand("Manager,Members")
      .get()
      .then((itemList) => {
        // console.log(itemList);
        if (itemList.length > 0) {
          itemList.forEach((element) => {
            let peopleList = [];
            if (isNotNull(element.Members)) {
              element.Members.forEach((item) => {
                peopleList.push({
                  UserId: item["Id"],
                  UserTitle: item["Title"],
                  UserEmail: item["Name"].split("|")[2],
                });
              });
            }
            if (isNotNull(element.Manager)) {
              if (
                peopleList.findIndex(
                  (y) => y.UserId == element.Manager["Id"]
                ) == -1
              ) {
                peopleList.push({
                  UserId: element.Manager["Id"],
                  UserTitle: element.Manager["Title"],
                  UserEmail: element.Manager["Name"].split("|")[2],
                });
              }
            }
            items.push({
              ID: element.ID,
              Title: CheckNull(element.Title),
              Code: element.DeptCode,
              Manager: element.ManagerId,
              Members: element.MembersId,
              ParentCode: CheckNull(element.ParentCode),
              peopleList: peopleList,
            });
          });
        }
      })
      .catch((error) => {
        console.log(error);
      });
    // console.log(items);
    return items;
  }

  async AddItem(listName, data) {
    let items = { success: "", errors: "" };
    await sp.web.lists
      .getByTitle(listName)
      .items.add(data)
      .then((itemss) => {
        console.log(itemss);
        items.success = itemss;
      })
      .catch((error) => {
        console.log(error);
        items.errors = error;
      });
    return items;
  }

  // Tìm kiếm danh sách người theo key
  async searchPeoplePicker(value) {
    let arrPeople = [];
    await sp.profiles
      .clientPeoplePickerSearchUser({
        MaximumEntitySuggestions: 5,
        PrincipalSource: 15,
        PrincipalType: 1,
        QueryString: value,
      })
      .then((entiries) => {
        arrPeople = entiries;
      })
      .catch((error) => {
        console.log(error);
      });
    return arrPeople;
  }

  async getInforUser(Key) {
    let objUser = {
      UserId: "",
      UserTitle: "",
      UserEmail: "",
    };
    await sp.web
      .ensureUser(Key)
      .then((user) => {
        objUser = {
          UserId: CheckNullSetZero(user["data"].Id),
          UserTitle: CheckNull(user["data"].Title),
          UserEmail: CheckNull(user["data"].Email),
        };
      })
      .catch((error) => {
        console.log(error);
      });
    return objUser;
  }

  async GetWFFormField(id) {
    let arrStepField = [];
    await sp.web.lists
      .getByTitle("WFFormField")
      .items.select(
        "ID,Title,InternalName,FieldType,HelpText,Required,ObjValidation,ObjSPField"
      )
      .filter("WFTableId eq " + id)
      .get()
      .then((listWFStep) => {
        listWFStep.forEach((itemDetail) => {
          let ObjValidation = "";
          if (isNotNull(itemDetail.ObjValidation)) {
            ObjValidation = JSON.parse(itemDetail.ObjValidation);
          }
          let ObjSPField = "";
          if (isNotNull(itemDetail.ObjSPField)) {
            ObjSPField = JSON.parse(itemDetail.ObjSPField);
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
          });
        });
      })
      .catch((error) => {
        console.log(error);
      });
    // console.log(arrStepField);
    return arrStepField;
  }

  async GetSPListDatabase() {
    let spList = [];
    await sp.web.lists
      .select("ID,Title")
      .get()
      .then((listSP) => {
        listSP.forEach((element) => {
          spList.push(CheckNull(element["Title"]).toLocaleLowerCase());
        });
      })
      .catch((error) => {
        console.log(error);
      });
    return spList;
  }

  async returnCheckInstallData() {
    let checkInstall = false;
    let ArraySPList = await this.GetSPListDatabase();
    if (
      ArraySPList.indexOf(configData.WFTable.ListName.toLocaleLowerCase()) ==
        -1 ||
      ArraySPList.indexOf(
        configData.WFStepTable.ListName.toLocaleLowerCase()
      ) == -1 ||
      ArraySPList.indexOf(
        configData.WFFormField.ListName.toLocaleLowerCase()
      ) == -1 ||
      ArraySPList.indexOf(configData.WFHistory.ListName.toLocaleLowerCase()) ==
        -1 ||
      ArraySPList.indexOf(configData.WFComments.ListName.toLocaleLowerCase()) ==
        -1 ||
      ArraySPList.indexOf(
        configData.WFTemplateEmail.ListName.toLocaleLowerCase()
      ) == -1 ||
      ArraySPList.indexOf(
        configData.ListRequestSendMail.ListName.toLocaleLowerCase()
      ) == -1 ||
      ArraySPList.indexOf(
        configData.ListDepartment.ListName.toLocaleLowerCase()
      ) == -1 ||
      ArraySPList.indexOf(
        configData.ListRoleCode.ListName.toLocaleLowerCase()
      ) == -1 ||
      ArraySPList.indexOf(
        configData.ListApproveCode.ListName.toLocaleLowerCase()
      ) == -1 ||
      ArraySPList.indexOf(
        configData.ListMapEmployee.ListName.toLocaleLowerCase()
      ) == -1 ||
      ArraySPList.indexOf(
        configData.ListPermissonByRole.ListName.toLocaleLowerCase()
      ) == -1 ||
      ArraySPList.indexOf(configData.ListMenu.ListName.toLocaleLowerCase()) ==
        -1 ||
      ArraySPList.indexOf(
        configData.ListSendMailDealine.ListName.toLocaleLowerCase()
      ) == -1 ||
      ArraySPList.indexOf(
        configData.WorkingWeekendHoliday.ListName.toLocaleLowerCase()
      ) == -1 ||
      ArraySPList.indexOf(
        configData.TemplateHtmlExport.ListName.toLocaleLowerCase()
      ) == -1
    ) {
      // window.location.href = config.pages.wfCreateDatabase;
      checkInstall = true;
    }
    return checkInstall;
  }

  async GetArrayWFStepTable(filterStr) {
    let strFilter = `ID ne 0`;
    if (isNotNull(filterStr)) {
      strFilter = filterStr;
    }
    const strSelect = `ID,Title,Code,WFTableId,indexStep,ClassifyStep,StepWFType,TypeofApprover,ApproveCode,RoleCode,ObjStepWFId,ObjBackStep,StepNextDefault,ObjStepCondition,ObjEmailCfg,SLA,ObjFieldStep,btnAction,GroupApprover,IsEditApprover,DepartmentCode,UserApprover/Title,UserApprover/Id,UserApprover/Name,ApproverInField,ApproverInStep,ApproverInSelect,ApproveRunTime`;
    let items = [];
    let itemStep = await sp.web.lists
      .getByTitle("WFStepTable")
      .items.select(strSelect)
      .filter(strFilter)
      .expand("UserApprover")
      .top(100)
      .getPaged();
    // console.log(itemStep);
    itemStep["results"].forEach((itemDetail) => {
      let ObjStepWFId = "";
      if (
        CheckNull(itemDetail.StepWFType) === "Quy trình" &&
        isNotNull(itemDetail.ObjStepWFId)
      ) {
        ObjStepWFId = JSON.parse(itemDetail.ObjStepWFId);
        if (ObjStepWFId.length > 0) {
          for (let index = 0; index < ObjStepWFId.length; index++) {
            let subProcess = returnObject(ObjStepWFId[index]);
            if (subProcess.ObjInitialization === undefined) {
              Object.assign(subProcess, {
                ObjInitialization: {
                  AlowLaunch: false,
                  TypeUserApproval: "",
                  UserApprover: [],
                },
              });
              ObjStepWFId[index] = subProcess;
            }
          }
        }
      }
      let StepNextDefault = "";
      if (isNotNull(itemDetail.StepNextDefault)) {
        StepNextDefault = JSON.parse(itemDetail.StepNextDefault);
      }
      let ObjStepCondition = "";
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
      let ObjFieldStep = {
        FieldInput: [],
        FieldView: [],
        isAttachments: false,
        isViewAttachments: false,
        isEditAttachments: false,
        isDeleteAttachments: false,
        isDocuSignDocuments: false,
      };
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
                OrderIndex: indexF,
              });
            } else {
              arrayFieldNew.push({
                InternalName: field,
                Colspan: "6",
                IsFirstColumn: false,
                OrderIndex: indexF,
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
                OrderIndex: indexF,
              });
            } else {
              arrayFieldViewNew.push({
                InternalName: field,
                Colspan: "6",
                IsFirstColumn: false,
                OrderIndex: indexF,
              });
            }
          });
          ObjFieldStep.FieldView = arrayFieldViewNew;
        }
      }

      let ObjEmailCfg = "";
      if (isNotNull(itemDetail.ObjEmailCfg)) {
        ObjEmailCfg = JSON.parse(itemDetail.ObjEmailCfg);
      }
      let userApprover = {
        UserId: "",
        UserTitle: "",
        UserEmail: "",
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
      let ObjBackStep = "";
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
      items.push({
        ID: CheckNull(itemDetail.ID),
        Title: CheckNull(itemDetail.Title),
        Code: CheckNull(itemDetail.Code),
        indexStep: CheckNull(itemDetail.indexStep),
        ClassifyStep: CheckNull(itemDetail.ClassifyStep),
        StepWFType: CheckNull(itemDetail.StepWFType),
        ObjStepWFId: ObjStepWFId,
        StepNextDefault: StepNextDefault,
        ObjStepCondition: ObjStepCondition,
        ObjEmailCfg: ObjEmailCfg,
        SLA: CheckNullSetZero(itemDetail.SLA),
        ObjFieldStep: ObjFieldStep,
        btnAction: btnAction,
        TypeofApprover: TypeofApprover,
        ApproveCode: ApproveCode,
        RoleCode: RoleCode,
        DepartmentCode: DepartmentCode,
        UserApprover: userApprover,
        GroupApprover: GroupApprover,
        IsEditApprover: itemDetail.IsEditApprover,
        ObjBackStep: ObjBackStep,
        WFTableId: CheckNullSetZero(itemDetail.WFTableId),
        ApproverInField: CheckNull(itemDetail.ApproverInField),
        ApproverInStep: CheckNull(itemDetail.ApproverInStep),
        ApproveRunTime: approveRuntime,
        ApproverInSelect:ApproverInSelect
      });
    });
    if (itemStep.hasNext) {
      let nextArray = await this.getNexWFStepTable(itemStep, []);
      items = items.concat(nextArray);
    }
    return items;
  }

  async getNexWFStepTable(itemStep, array) {
    let itemStepNext = await itemStep.getNext();
    itemStepNext["results"].forEach((itemDetail) => {
      let ObjStepWFId = "";
      if (
        CheckNull(itemDetail.StepWFType) === "Quy trình" &&
        isNotNull(itemDetail.ObjStepWFId)
      ) {
        ObjStepWFId = JSON.parse(itemDetail.ObjStepWFId);
        if (ObjStepWFId.length > 0) {
          for (let index = 0; index < ObjStepWFId.length; index++) {
            let subProcess = returnObject(ObjStepWFId[index]);
            if (subProcess.ObjInitialization === undefined) {
              Object.assign(subProcess, {
                ObjInitialization: {
                  AlowLaunch: false,
                  TypeUserApproval: "",
                  UserApprover: [],
                },
              });
              ObjStepWFId[index] = subProcess;
            }
          }
        }
      }
      let StepNextDefault = "";
      if (isNotNull(itemDetail.StepNextDefault)) {
        StepNextDefault = JSON.parse(itemDetail.StepNextDefault);
      }
      let ObjStepCondition = "";
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
      let ObjFieldStep = {
        FieldInput: [],
        FieldView: [],
        isAttachments: false,
        isViewAttachments: false,
        isEditAttachments: false,
        isDeleteAttachments: false,
        isDocuSignDocuments: false,
      };
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
                OrderIndex: indexF,
              });
            } else {
              arrayFieldViewNew.push({
                InternalName: field,
                Colspan: "6",
                IsFirstColumn: false,
                OrderIndex: indexF,
              });
            }
          });
          ObjFieldStep.FieldView = arrayFieldViewNew;
        }
      }
      let ObjEmailCfg = "";
      if (isNotNull(itemDetail.ObjEmailCfg)) {
        ObjEmailCfg = JSON.parse(itemDetail.ObjEmailCfg);
      }

      let userApprover = {
        UserId: "",
        UserTitle: "",
        UserEmail: "",
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
      let ObjBackStep = "";
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
      array.push({
        ID: CheckNull(itemDetail.ID),
        Title: CheckNull(itemDetail.Title),
        Code: CheckNull(itemDetail.Code),
        indexStep: CheckNull(itemDetail.indexStep),
        ClassifyStep: CheckNull(itemDetail.ClassifyStep),
        StepWFType: CheckNull(itemDetail.StepWFType),
        ObjStepWFId: ObjStepWFId,
        StepNextDefault: StepNextDefault,
        ObjStepCondition: ObjStepCondition,
        ObjEmailCfg: ObjEmailCfg,
        SLA: CheckNullSetZero(itemDetail.SLA),
        ObjFieldStep: ObjFieldStep,
        btnAction: btnAction,
        TypeofApprover: TypeofApprover,
        ApproveCode: ApproveCode,
        RoleCode: RoleCode,
        UserApprover: userApprover,
        GroupApprover: GroupApprover,
        IsEditApprover: itemDetail.IsEditApprover,
        ObjBackStep: ObjBackStep,
        WFTableId: CheckNullSetZero(itemDetail.WFTableId),
        ApproverInField: CheckNull(itemDetail.ApproverInField),
        ApproverInStep: CheckNull(itemDetail.ApproverInStep),
        ApproveRunTime: approveRuntime,
        ApproverInSelect:ApproverInSelect
      });
    });
    if (itemStepNext.hasNext) {
      await this.getNexWFStepTable(itemStepNext, array);
    }

    return array;
  }

  async createReportList(listName) {
    let listReport = listName + "Reports";
    await sp.web.lists.add(listReport);

    await sp.web.lists.getByTitle(listReport).fields.addNumber("WFTableId");
    await sp.web.lists.getByTitle(listReport).fields.addNumber("ItemIndex");
    await sp.web.lists.getByTitle(listReport).fields.addNumber("indexStep");
    await sp.web.lists.getByTitle(listReport).fields.addNumber("StatusStep");

    await sp.web.lists.getByTitle(listReport).fields.addText("TitleStep", 255);
    await sp.web.lists
      .getByTitle(listReport)
      .fields.addUser("UserRequest", FieldUserSelectionMode.PeopleOnly);
    await sp.web.lists
      .getByTitle(listReport)
      .fields.addUser("UserApproval", FieldUserSelectionMode.PeopleOnly);

    await sp.web.lists.getByTitle(listReport).fields.addNumber("SLA");

    await sp.web.lists
      .getByTitle(listReport)
      .fields.addMultilineText("ReasonStep", 6, false, false, false, true);

    await sp.web.lists.getByTitle(listReport).fields.addNumber("HistoryId");
    await sp.web.lists.getByTitle(listReport).fields.addNumber("RealisticSLA");

    await sp.web.lists
      .getByTitle(listReport)
      .fields.addDateTime("DateRequest", DateTimeFieldFormatType.DateTime);
    await sp.web.lists
      .getByTitle(listReport)
      .fields.addDateTime("DateFinish", DateTimeFieldFormatType.DateTime);
    await sp.web.lists
      .getByTitle(listReport)
      .fields.addDateTime(
        "RealisticDateFinish",
        DateTimeFieldFormatType.DateTime
      );
  }

  async createDocumentList(listName) {
    let listReport = listName + "Documents";
    await sp.web.lists.add(listReport, "This is a description", 101, true, {
      OnQuickLaunch: true,
    });
    await sp.web.lists.getByTitle(listReport).fields.addNumber("indexStep");
    await sp.web.lists.getByTitle(listReport).fields.addNumber("DocumentType");
  }

  async GetArrayWFTable(status) {
    let strFilter = `ID ne 0`;
    if (isNotNull(status)) {
      strFilter = `Status eq 1`;
    }
    let arrayWF = [];
    let itemWF = await sp.web.lists
      .getByTitle("WFTable")
      .items.select(
        "ID,Title,Code,Created,Status,WhoIsUsed,WIUGroup,WIUId,indexStep,SLA,AutoSave"
      )
      .filter(strFilter)
      .orderBy("ID", true)
      .top(100)
      .getPaged();
    itemWF["results"].forEach((itemDetail) => {
      let userDefault = [];
      if (isNotNull(itemDetail["WIUId"])) {
        userDefault = itemDetail["WIUId"];
      }
      arrayWF.push({
        WFId: itemDetail.ID,
        WFCode: CheckNull(itemDetail["Code"]),
        WFTitle: CheckNull(itemDetail["Title"]),
        Description: CheckNull(itemDetail["Description"]),
        WhoIsUsed: CheckNull(itemDetail["WhoIsUsed"]),
        Department: CheckNull(itemDetail["WIUGroup"]),
        UserDefault: userDefault,
        Status: CheckNull(itemDetail["Status"]),
        WFIndexStep:
          CheckNullSetZero(itemDetail["indexStep"]) > 0
            ? CheckNullSetZero(itemDetail["indexStep"])
            : 1,
        SLA: CheckNullSetZero(itemDetail["SLA"]),
        AutoSave: CheckNull(itemDetail["AutoSave"]),
      });
    });

    if (itemWF.hasNext) {
      let nextArray = await this.getNextWFTable(itemWF, []);
      arrayWF = arrayWF.concat(nextArray);
    }

    return arrayWF;
  }

  async GetArrayWFStepTable(filterStr) {
    let strFilter = `ID ne 0`;
    if (isNotNull(filterStr)) {
      strFilter = filterStr;
    }
    const strSelect = `ID,Title,Code,WFTableId,indexStep,ClassifyStep,StepWFType,TypeofApprover,ApproveCode,RoleCode,ObjStepWFId,ObjBackStep,StepNextDefault,ObjStepCondition,ObjEmailCfg,SLA,ObjFieldStep,btnAction,GroupApprover,IsEditApprover,DepartmentCode,UserApprover/Title,UserApprover/Id,UserApprover/Name`;
    let items = [];
    let itemStep = await sp.web.lists
      .getByTitle("WFStepTable")
      .items.select(strSelect)
      .filter(strFilter)
      .expand("UserApprover")
      .top(100)
      .getPaged();
    itemStep["results"].forEach((itemDetail) => {
      let ObjStepWFId = [];
      if (
        CheckNull(itemDetail.StepWFType) === "Quy trình" &&
        isNotNull(itemDetail.ObjStepWFId)
      ) {
        ObjStepWFId = JSON.parse(itemDetail.ObjStepWFId);
        if (ObjStepWFId.length > 0) {
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
      let StepNextDefault = "";
      if (isNotNull(itemDetail.StepNextDefault)) {
        StepNextDefault = JSON.parse(itemDetail.StepNextDefault);
      }
      let ObjStepCondition = "";
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
      let ObjFieldStep = {
        FieldInput: [],
        FieldView: [],
        isAttachments: false,
        isViewAttachments: false,
        isEditAttachments: false,
        isDeleteAttachments: false,
        isDocuSignDocuments: false,
      };
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
                OrderIndex: indexF,
              });
            } else {
              arrayFieldNew.push({
                InternalName: field,
                Colspan: "6",
                IsFirstColumn: false,
                OrderIndex: indexF,
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
                OrderIndex: indexF,
              });
            } else {
              arrayFieldViewNew.push({
                InternalName: field,
                Colspan: "6",
                IsFirstColumn: false,
                OrderIndex: indexF,
              });
            }
          });
          ObjFieldStep.FieldView = arrayFieldViewNew;
        }
      }
      let GroupApprover = {
        TypeUserApproval: "",
        Group: { ID: "", Title: "" },
      };

      let ObjEmailCfg = "";
      if (isNotNull(itemDetail.ObjEmailCfg)) {
        ObjEmailCfg = JSON.parse(itemDetail.ObjEmailCfg);
        if (ObjEmailCfg.EmailSendDeadline == undefined) {
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
        UserEmail: "",
      };
      let TypeofApprover = "",
        ApproveCode = "",
        RoleCode = "";
      if (isNotNull(itemDetail.UserApprover)) {
        userApprover = {
          UserId: itemDetail.UserApprover["Id"],
          UserTitle: itemDetail.UserApprover["Title"],
          UserEmail: itemDetail.UserApprover["Name"].split("|")[2],
        };
        TypeofApprover = "Người phê duyệt";
        GroupApprover.TypeUserApproval = "Một người phê duyệt";
      }
      if (isNotNull(itemDetail.TypeofApprover)) {
        TypeofApprover = CheckNull(itemDetail.TypeofApprover);
      }
      if (isNotNull(itemDetail.ApproveCode)) {
        ApproveCode = CheckNull(itemDetail.ApproveCode);
      }
      if (isNotNull(itemDetail.RoleCode)) {
        RoleCode = CheckNull(itemDetail.RoleCode);
      }
      let DepartmentCode = "";
      if (isNotNull(itemDetail.DepartmentCode)) {
        DepartmentCode = CheckNull(itemDetail.DepartmentCode);
      }
      if (isNotNull(itemDetail.GroupApprover)) {
        GroupApprover = JSON.parse(itemDetail.GroupApprover);
      }
      let btnAction = "";
      if (isNotNull(itemDetail.btnAction)) {
        btnAction = JSON.parse(itemDetail.btnAction);
      }
      let ObjBackStep = "";
      if (isNotNull(itemDetail.ObjBackStep)) {
        ObjBackStep = JSON.parse(itemDetail.ObjBackStep);
      }
      items.push({
        ID: CheckNull(itemDetail.ID),
        Title: CheckNull(itemDetail.Title),
        Code: CheckNull(itemDetail.Code),
        indexStep: CheckNull(itemDetail.indexStep),
        ClassifyStep: CheckNull(itemDetail.ClassifyStep),
        StepWFType: CheckNull(itemDetail.StepWFType),
        ObjStepWFId: ObjStepWFId,
        StepNextDefault: StepNextDefault,
        ObjStepCondition: ObjStepCondition,
        ObjEmailCfg: ObjEmailCfg,
        SLA: CheckNullSetZero(itemDetail.SLA),
        ObjFieldStep: ObjFieldStep,
        btnAction: btnAction,
        TypeofApprover: TypeofApprover,
        ApproveCode: ApproveCode,
        RoleCode: RoleCode,
        DepartmentCode: DepartmentCode,
        UserApprover: userApprover,
        GroupApprover: GroupApprover,
        IsEditApprover: itemDetail.IsEditApprover,
        ObjBackStep: ObjBackStep,
        WFTableId: CheckNullSetZero(itemDetail.WFTableId),
      });
    });
    if (itemStep.hasNext) {
      let nextArray = await this.getNexWFStepTable(itemStep, []);
      items = items.concat(nextArray);
    }
    return items;
  }

  async loadFinishItemSub(arrSub) {
    let arrInfo = [];
    for (let i = 0; i < arrSub.length; i++) {
      await sp.web.lists
        .getByTitle(arrSub[i].wfTable.WFCode)
        .items.getById(arrSub[i].ItemIndex)
        .select(`ID,Title,indexStep,StatusStep`)
        .get()
        .then((listWF) => {
          if (isNotNull(listWF)) {
            arrInfo.push({
              ItemIndex: listWF["ID"],
              Title: CheckNull(listWF["Title"]),
              indexStep: CheckNullSetZero(listWF["indexStep"]),
              StatusStep: CheckNullSetZero(listWF["StatusStep"]),
            });
          }
        })
        .catch((error) => {
          console.log(error);
        });
    }
    return arrInfo;
  }

  async GetInfoTemplateHtml() {
    let arrTemp = [];
    await sp.web.lists
      .getByTitle("TemplateHtmlExport")
      .items.select("ID,Title,BodyHtml,FieldReplaceText")
      .top(500)
      .get()
      .then((items) => {
        items.forEach((item) => {
          arrTemp.push({
            ID: item.ID,
            Title: CheckNull(item.Title),
            BodyHtml: CheckNull(item.BodyHtml),
            FieldReplaceText: CheckNull(item.FieldReplaceText),
          });
        });
      })
      .catch((error) => {
        console.log(error);
      });
    return arrTemp;
  }
  async CountWFTable(){
    let arrWF=0
    await sp.web.lists.getByTitle('WFTable')
    .items.get()
    .then((itemlist)=>{
      arrWF=itemlist
    })
    return arrWF
  }
}

const shareService = new UserStore();
Object.freeze(shareService);

export default shareService;
