import React, { Component, Fragment } from "react";
import { config } from "./../../pages/environment.js";
import configData from "./../../../config/configDatabase.json";
import wfTemplate from "./../../../config/configWFTemplate.json";
import {
  CheckNull,
  isNotNull,
  CheckNullSetZero,
} from "./../wfShareCmpts/wfShareFunction.js";
import { objField, objSPField } from "./../wfShareCmpts/wfShareModel";
import { sp } from "@pnp/sp";
import "@pnp/sp/webs";
import "@pnp/sp/lists/web";
import "@pnp/sp/items";
import "@pnp/sp/profiles";
import "@pnp/sp/site-users/web";
import "@pnp/sp/fields";
import shareService from "./../wfShareCmpts/wfShareService";
import {
  Row,
  Col,
  Card,
  CardBody,
  CardTitle,
  Container,
  CardHeader,
  Spinner,
} from "reactstrap";
import "../css/loading.scss";

export default class CreateDatabase extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isShowLoadingPage: false,
    };
    sp.setup({ pageContext: { web: { absoluteUrl: config.url.API_URL } } });
    this.ArraySPList = [];
  }

  componentDidMount() {
    console.log(wfTemplate);
    this.setStateForm();
  }

  async setStateForm() {
    this.ArraySPList = await shareService.GetSPListDatabase();
    console.log(this.ArraySPList);
    if (
      this.ArraySPList.indexOf(
        configData.WFTable.ListName.toLocaleLowerCase()
      ) != -1 &&
      this.ArraySPList.indexOf(
        configData.WFStepTable.ListName.toLocaleLowerCase()
      ) != -1 &&
      this.ArraySPList.indexOf(
        configData.WFFormField.ListName.toLocaleLowerCase()
      ) != -1 &&
      this.ArraySPList.indexOf(
        configData.WFHistory.ListName.toLocaleLowerCase()
      ) != -1 &&
      this.ArraySPList.indexOf(
        configData.WFComments.ListName.toLocaleLowerCase()
      ) != -1 &&
      this.ArraySPList.indexOf(
        configData.WFTemplateEmail.ListName.toLocaleLowerCase()
      ) != -1 &&
      this.ArraySPList.indexOf(
        configData.ListRequestSendMail.ListName.toLocaleLowerCase()
      ) != -1 &&
      this.ArraySPList.indexOf(
        configData.ListDepartment.ListName.toLocaleLowerCase()
      ) != -1 &&
      this.ArraySPList.indexOf(
        configData.ListRoleCode.ListName.toLocaleLowerCase()
      ) != -1 &&
      this.ArraySPList.indexOf(
        configData.ListApproveCode.ListName.toLocaleLowerCase()
      ) != -1 &&
      this.ArraySPList.indexOf(
        configData.ListMapEmployee.ListName.toLocaleLowerCase()
      ) != -1 &&
      this.ArraySPList.indexOf(
        configData.ListPermissonByRole.ListName.toLocaleLowerCase()
      ) != -1 &&
      this.ArraySPList.indexOf(
        configData.ListMenu.ListName.toLocaleLowerCase()
      ) != -1 &&
      this.ArraySPList.indexOf(
        configData.ListSendMailDealine.ListName.toLocaleLowerCase()
      ) != -1 &&
      this.ArraySPList.indexOf(
        configData.WorkingWeekendHoliday.ListName.toLocaleLowerCase()
      ) != -1 &&
      this.ArraySPList.indexOf(
        configData.TemplateHtmlExport.ListName.toLocaleLowerCase()
      ) != -1
    ) {
      // console.log("đã có database");
      window.location.href = config.pages.wfDashboard;
    } else {
      await this.setState({ isShowLoadingPage: false });
    }
  }

  async createDatabase() {
    // console.log("createDatabase");
    // console.log(configData);
    await this.setState({ isShowLoadingPage: true });
    if (
      this.ArraySPList.indexOf(
        configData.WFTable.ListName.toLocaleLowerCase()
      ) == -1
    ) {
      await this.createListItem(configData.WFTable.ListName);
      for (let wfT = 0; wfT < configData.WFTable.ListField.length; wfT++) {
        await this.createFieldListItem(
          configData.WFTable.ListName,
          configData.WFTable.ListField[wfT]
        );
      }
    }

    if (
      this.ArraySPList.indexOf(
        configData.WFStepTable.ListName.toLocaleLowerCase()
      ) == -1
    ) {
      await this.createListItem(configData.WFStepTable.ListName);
      for (
        let wfST = 0;
        wfST < configData.WFStepTable.ListField.length;
        wfST++
      ) {
        await this.createFieldListItem(
          configData.WFStepTable.ListName,
          configData.WFStepTable.ListField[wfST]
        );
      }
    }

    if (
      this.ArraySPList.indexOf(
        configData.WFFormField.ListName.toLocaleLowerCase()
      ) == -1
    ) {
      await this.createListItem(configData.WFFormField.ListName);
      for (let wfF = 0; wfF < configData.WFFormField.ListField.length; wfF++) {
        await this.createFieldListItem(
          configData.WFFormField.ListName,
          configData.WFFormField.ListField[wfF]
        );
      }
    }

    if (
      this.ArraySPList.indexOf(
        configData.WFHistory.ListName.toLocaleLowerCase()
      ) == -1
    ) {
      await this.createListItem(configData.WFHistory.ListName);
      for (let wfH = 0; wfH < configData.WFHistory.ListField.length; wfH++) {
        await this.createFieldListItem(
          configData.WFHistory.ListName,
          configData.WFHistory.ListField[wfH]
        );
      }
    }

    if (
      this.ArraySPList.indexOf(
        configData.WFComments.ListName.toLocaleLowerCase()
      ) == -1
    ) {
      await this.createListItem(configData.WFComments.ListName);
      for (let wfC = 0; wfC < configData.WFComments.ListField.length; wfC++) {
        await this.createFieldListItem(
          configData.WFComments.ListName,
          configData.WFComments.ListField[wfC]
        );
      }
    }

    if (
      this.ArraySPList.indexOf(
        configData.WFTemplateEmail.ListName.toLocaleLowerCase()
      ) == -1
    ) {
      await this.createListItem(configData.WFTemplateEmail.ListName);
      for (
        let wfTem = 0;
        wfTem < configData.WFTemplateEmail.ListField.length;
        wfTem++
      ) {
        await this.createFieldListItem(
          configData.WFTemplateEmail.ListName,
          configData.WFTemplateEmail.ListField[wfTem]
        );
      }
    }

    if (
      this.ArraySPList.indexOf(
        configData.ListRequestSendMail.ListName.toLocaleLowerCase()
      ) == -1
    ) {
      await this.createListItem(configData.ListRequestSendMail.ListName);
      for (
        let wfSE = 0;
        wfSE < configData.ListRequestSendMail.ListField.length;
        wfSE++
      ) {
        await this.createFieldListItem(
          configData.ListRequestSendMail.ListName,
          configData.ListRequestSendMail.ListField[wfSE]
        );
      }
    }
    if (
      this.ArraySPList.indexOf(
        configData.ListSendMailDealine.ListName.toLocaleLowerCase()
      ) == -1
    ) {
      await this.createListItem(configData.ListSendMailDealine.ListName);
      for (
        let wfSE = 0;
        wfSE < configData.ListSendMailDealine.ListField.length;
        wfSE++
      ) {
        await this.createFieldListItem(
          configData.ListSendMailDealine.ListName,
          configData.ListSendMailDealine.ListField[wfSE]
        );
      }
    }
    if (
      this.ArraySPList.indexOf(
        configData.ListDepartment.ListName.toLocaleLowerCase()
      ) == -1
    ) {
      await this.createListItem(configData.ListDepartment.ListName);
      for (
        let wfSE = 0;
        wfSE < configData.ListDepartment.ListField.length;
        wfSE++
      ) {
        await this.createFieldListItem(
          configData.ListDepartment.ListName,
          configData.ListDepartment.ListField[wfSE]
        );
      }
    }
    if (
      this.ArraySPList.indexOf(
        configData.ListRoleCode.ListName.toLocaleLowerCase()
      ) == -1
    ) {
      await this.createListItem(configData.ListRoleCode.ListName);
      for (
        let wfSE = 0;
        wfSE < configData.ListRoleCode.ListField.length;
        wfSE++
      ) {
        await this.createFieldListItem(
          configData.ListRoleCode.ListName,
          configData.ListRoleCode.ListField[wfSE]
        );
      }
    }
    if (
      this.ArraySPList.indexOf(
        configData.ListApproveCode.ListName.toLocaleLowerCase()
      ) == -1
    ) {
      await this.createListItem(configData.ListApproveCode.ListName);
      for (
        let wfSE = 0;
        wfSE < configData.ListApproveCode.ListField.length;
        wfSE++
      ) {
        await this.createFieldListItem(
          configData.ListApproveCode.ListName,
          configData.ListApproveCode.ListField[wfSE]
        );
      }
    }
    if (
      this.ArraySPList.indexOf(
        configData.ListMapEmployee.ListName.toLocaleLowerCase()
      ) == -1
    ) {
      await this.createListItem(configData.ListMapEmployee.ListName);
      for (
        let wfSE = 0;
        wfSE < configData.ListMapEmployee.ListField.length;
        wfSE++
      ) {
        await this.createFieldListItem(
          configData.ListMapEmployee.ListName,
          configData.ListMapEmployee.ListField[wfSE]
        );
      }
    }
    if (
      this.ArraySPList.indexOf(
        configData.ListPermissonByRole.ListName.toLocaleLowerCase()
      ) == -1
    ) {
      await this.createListItem(configData.ListPermissonByRole.ListName);
      for (
        let wfSE = 0;
        wfSE < configData.ListPermissonByRole.ListField.length;
        wfSE++
      ) {
        await this.createFieldListItem(
          configData.ListPermissonByRole.ListName,
          configData.ListPermissonByRole.ListField[wfSE]
        );
      }
    }
    if (
      this.ArraySPList.indexOf(
        configData.ListMenu.ListName.toLocaleLowerCase()
      ) == -1
    ) {
      await this.createListItem(configData.ListMenu.ListName);
      for (let wfSE = 0; wfSE < configData.ListMenu.ListField.length; wfSE++) {
        await this.createFieldListItem(
          configData.ListMenu.ListName,
          configData.ListMenu.ListField[wfSE]
        );
      }
    }
    if (
      this.ArraySPList.indexOf(
        configData.WorkingWeekendHoliday.ListName.toLocaleLowerCase()
      ) == -1
    ) {
      await this.createListItem(configData.WorkingWeekendHoliday.ListName);
      for (
        let wfSE = 0;
        wfSE < configData.WorkingWeekendHoliday.ListField.length;
        wfSE++
      ) {
        await this.createFieldListItem(
          configData.WorkingWeekendHoliday.ListName,
          configData.WorkingWeekendHoliday.ListField[wfSE]
        );
      }
    }
    if (
      this.ArraySPList.indexOf(
        configData.TemplateHtmlExport.ListName.toLocaleLowerCase()
      ) == -1
    ) {
      await this.createListItem(configData.TemplateHtmlExport.ListName);
      for (
        let wfSE = 0;
        wfSE < configData.TemplateHtmlExport.ListField.length;
        wfSE++
      ) {
        await this.createFieldListItem(
          configData.TemplateHtmlExport.ListName,
          configData.TemplateHtmlExport.ListField[wfSE]
        );
      }
    }

    // if (
    //   this.ArraySPList.indexOf(
    //     configData.ListSendMailDocuments.ListName.toLocaleLowerCase()
    //   ) == -1
    // ) {
    //   await this.createListItem(configData.ListSendMailDocuments.ListName);
    //   for (
    //     let wfSE = 0;
    //     wfSE < configData.ListSendMailDocuments.ListField.length;
    //     wfSE++
    //   ) {
    //     await this.createFieldListItem(
    //       configData.ListSendMailDocuments.ListName,
    //       configData.ListSendMailDocuments.ListField[wfSE]
    //     );
    //   }
    // }

    console.log("Create Database Success");

    if (isNotNull(wfTemplate)) {
      this.createTemplateWF();
    } else {
      await this.setState({ isShowLoadingPage: false });
    }
  }

  // Tạo SPlist
  async createListItem(listName) {
    await sp.web.lists.add(listName);
    console.log("Create List " + listName + " Success");
  }

  // Tạo các Field trong SPList
  async createFieldListItem(listName, objConfigField) {
    let fieldSchema = ``;

    if (objConfigField.FieldType == objSPField.UserMulti.Type) {
      fieldSchema =
        `<Field DisplayName="` +
        objConfigField.FieldName +
        `" Name="` +
        objConfigField.FieldName +
        `" Type="` +
        objConfigField.spFieldType +
        `" UserSelectionMode="` +
        objConfigField.spFieldFormat +
        `" UserSelectionScope="0" Mult="TRUE" ShowInDisplayForm="TRUE" />`;
      await sp.web.lists
        .getByTitle(listName)
        .fields.createFieldAsXml(fieldSchema);
    } else if (objConfigField.FieldType == objSPField.Dropdown.Type) {
      await sp.web.lists
        .getByTitle(listName)
        .fields.addChoice(
          objConfigField.FieldName,
          objConfigField.FieldObject,
          0,
          false
        );
    } else if (objConfigField.FieldType == objSPField.RadioButton.Type) {
      let choice = `<CHOICES>`;
      objConfigField.FieldObject.forEach((field) => {
        choice += `<CHOICE>` + field + `</CHOICE>`;
      });
      choice += `</CHOICES>`;
      fieldSchema =
        `<Field DisplayName="` +
        objConfigField.FieldName +
        `" Name="` +
        objConfigField.FieldName +
        `" Type="` +
        objConfigField.spFieldType +
        `" Format="` +
        objConfigField.spFieldFormat +
        `" ShowInDisplayForm="TRUE" >` +
        choice +
        `</Field>`;
      await sp.web.lists
        .getByTitle(listName)
        .fields.createFieldAsXml(fieldSchema);
    } else if (objConfigField.FieldType == objSPField.CheckBox.Type) {
      let choice = `<CHOICES>`;
      objConfigField.FieldObject.forEach((field) => {
        choice += `<CHOICE>` + field + `</CHOICE>`;
      });
      choice += `</CHOICES>`;
      fieldSchema =
        `<Field DisplayName="` +
        objConfigField.FieldName +
        `" Name="` +
        objConfigField.FieldName +
        `" Type="` +
        objConfigField.spFieldType +
        `" ShowInDisplayForm="TRUE" >` +
        choice +
        `</Field>`;
      await sp.web.lists
        .getByTitle(listName)
        .fields.createFieldAsXml(fieldSchema);
    } else if (
      objConfigField.FieldType == objSPField.DateTime.Type ||
      objConfigField.FieldType == objSPField.Times.Type ||
      objConfigField.FieldType == objSPField.Hyperlink.Type ||
      objConfigField.FieldType == objSPField.PictureLink.Type
    ) {
      fieldSchema =
        `<Field DisplayName="` +
        objConfigField.FieldName +
        `" Name="` +
        objConfigField.FieldName +
        `" Type="` +
        objConfigField.spFieldType +
        `" Format="` +
        objConfigField.spFieldFormat +
        `" ShowInDisplayForm="TRUE" />`;
      await sp.web.lists
        .getByTitle(listName)
        .fields.createFieldAsXml(fieldSchema);
    } else if (
      objConfigField.FieldType == objSPField.AutoSystemNumberIMG.Type
    ) {
      fieldSchema =
        `<Field DisplayName="` +
        objConfigField.FieldName +
        `" Name="` +
        objConfigField.FieldName +
        `" Type="` +
        objConfigField.spFieldType +
        `" EnforceUniqueValues="TRUE" Indexed="TRUE" ShowInDisplayForm="TRUE" />`;
      await sp.web.lists
        .getByTitle(listName)
        .fields.createFieldAsXml(fieldSchema);
    } else {
      fieldSchema =
        `<Field DisplayName="` +
        objConfigField.FieldName +
        `" Name="` +
        objConfigField.FieldName +
        `" Type="` +
        objConfigField.spFieldType +
        `" ShowInDisplayForm="TRUE" />`;
      await sp.web.lists
        .getByTitle(listName)
        .fields.createFieldAsXml(fieldSchema);
    }
    console.log("Create Field Success");
  }

  async createTemplateWF() {
    let arrOldSPList = [];
    let arrIdTempEmail = [];
    const arrayWF = Object.keys(wfTemplate);
    for (let wfTemp = 0; wfTemp < arrayWF.length; wfTemp++) {
      if (wfTemplate[arrayWF[wfTemp]].WorkFlow.WIUId.results.length > 0) {
        let results = [];
        let user = "";
        for (
          let i = 0;
          i < wfTemplate[arrayWF[wfTemp]].WorkFlow.WIUId.results.length;
          i++
        ) {
          user = await shareService.getInforUser(
            "i:0#.f|membership|" +
              wfTemplate[arrayWF[wfTemp]].WorkFlow.WIUId.results[i].UserEmail
          );
          if (isNotNull(user.UserId)) {
            results.push(user.UserId);
          }
        }
        wfTemplate[arrayWF[wfTemp]].WorkFlow.WIUId.results = results;
      }

      if (
        this.ArraySPList.indexOf(
          wfTemplate[arrayWF[wfTemp]].WorkFlow.Code.toLocaleLowerCase()
        ) == -1 &&
        arrOldSPList.indexOf(
          wfTemplate[arrayWF[wfTemp]].WorkFlow.Code.toLocaleLowerCase()
        )
      ) {
        arrOldSPList.push(
          wfTemplate[arrayWF[wfTemp]].WorkFlow.Code.toLocaleLowerCase()
        );

        // Tạo SPList của quy trình
        await this.createListItem(wfTemplate[arrayWF[wfTemp]].WorkFlow.Code);
        console.log(
          "create SPList Workflow " +
            wfTemplate[arrayWF[wfTemp]].WorkFlow.Code +
            " Success"
        );

        // Lưu thông tin cấu hình của quy trình
        const itemWF = await sp.web.lists
          .getByTitle(configData.WFTable.ListName)
          .items.add(wfTemplate[arrayWF[wfTemp]].WorkFlow);
        console.log("Save Info Workflow success");

        // Lưu thông tin cấu hình các bước của quy trình
        const Steps = wfTemplate[arrayWF[wfTemp]].Step.StepWF;
        const TemplateEmail = wfTemplate[arrayWF[wfTemp]].Step.TempEmail;
        for (let step = 0; step < Steps.length; step++) {
          if (Steps[step].ObjEmailCfg.EmailSendApprover.IsActive) {
            let checkAppearTempA = TemplateEmail.findIndex(
              (t) =>
                t.IdTemp ==
                Steps[step].ObjEmailCfg.EmailSendApprover.ObjEmailTemplate
                  .TemplateId
            );
            let checkSaveTempA = arrIdTempEmail.findIndex(
              (t) =>
                t.OldId ==
                Steps[step].ObjEmailCfg.EmailSendApprover.ObjEmailTemplate
                  .TemplateId
            );
            if (checkSaveTempA == -1 && checkAppearTempA != -1) {
              const tempA = await sp.web.lists
                .getByTitle(configData.WFTemplateEmail.ListName)
                .items.add(TemplateEmail[checkAppearTempA].ContentTemp);
              Steps[
                step
              ].ObjEmailCfg.EmailSendApprover.ObjEmailTemplate.TemplateId =
                tempA["data"].ID;
              arrIdTempEmail.push({
                ID: tempA["data"].ID,
                OldId: TemplateEmail[checkAppearTempA].IdTemp,
              });
            } else if (checkSaveTempA != -1 && checkAppearTempA != -1) {
              Steps[
                step
              ].ObjEmailCfg.EmailSendApprover.ObjEmailTemplate.TemplateId =
                arrIdTempEmail[checkSaveTempA].ID;
            } else {
              Steps[step].ObjEmailCfg.EmailSendApprover.ObjEmailTemplate = {
                TemplateId: "",
                TemplateTitle: "",
              };
            }
          }

          if (Steps[step].ObjEmailCfg.EmailSendUserRequest.IsActive) {
            let checkAppearTempU = TemplateEmail.findIndex(
              (t) =>
                t.IdTemp ==
                Steps[step].ObjEmailCfg.EmailSendUserRequest.ObjEmailTemplate
                  .TemplateId
            );
            let checkSaveTempU = arrIdTempEmail.findIndex(
              (t) =>
                t.OldId ==
                Steps[step].ObjEmailCfg.EmailSendUserRequest.ObjEmailTemplate
                  .TemplateId
            );
            if (checkSaveTempU == -1 && checkAppearTempU != -1) {
              const tempU = await sp.web.lists
                .getByTitle(configData.WFTemplateEmail.ListName)
                .items.add(TemplateEmail[checkAppearTempU].ContentTemp);
              Steps[
                step
              ].ObjEmailCfg.EmailSendUserRequest.ObjEmailTemplate.TemplateId =
                tempU["data"].ID;
              arrIdTempEmail.push({
                ID: tempU["data"].ID,
                OldId: TemplateEmail[checkAppearTempU].IdTemp,
              });
            } else if (checkSaveTempU != -1 && checkAppearTempU != -1) {
              Steps[
                step
              ].ObjEmailCfg.EmailSendUserRequest.ObjEmailTemplate.TemplateId =
                arrIdTempEmail[checkSaveTempU].ID;
            } else {
              Steps[step].ObjEmailCfg.EmailSendUserRequest.ObjEmailTemplate = {
                TemplateId: "",
                TemplateTitle: "",
              };
            }
          }

          if (Steps[step].ObjEmailCfg.EmailSendInform.IsActive) {
            let checkAppearTempI = TemplateEmail.findIndex(
              (t) =>
                t.IdTemp ==
                Steps[step].ObjEmailCfg.EmailSendInform.ObjEmailTemplate
                  .TemplateId
            );
            let checkSaveTempI = arrIdTempEmail.findIndex(
              (t) =>
                t.OldId ==
                Steps[step].ObjEmailCfg.EmailSendInform.ObjEmailTemplate
                  .TemplateId
            );
            if (checkSaveTempI == -1 && checkAppearTempI != -1) {
              const tempI = await sp.web.lists
                .getByTitle(configData.WFTemplateEmail.ListName)
                .items.add(TemplateEmail[checkAppearTempI].ContentTemp);
              Steps[
                step
              ].ObjEmailCfg.EmailSendInform.ObjEmailTemplate.TemplateId =
                tempI["data"].ID;
              arrIdTempEmail.push({
                ID: tempI["data"].ID,
                OldId: TemplateEmail[checkAppearTempI].IdTemp,
              });
            } else if (checkSaveTempI != -1 && checkAppearTempI != -1) {
              Steps[
                step
              ].ObjEmailCfg.EmailSendInform.ObjEmailTemplate.TemplateId =
                arrIdTempEmail[checkSaveTempI].ID;
            } else {
              Steps[step].ObjEmailCfg.EmailSendInform.ObjEmailTemplate = {
                TemplateId: "",
                TemplateTitle: "",
              };
            }
            if (
              Steps[step].ObjEmailCfg.EmailSendInform.ObjUserDefault.length > 0
            ) {
              for (
                let k = 0;
                k <
                Steps[step].ObjEmailCfg.EmailSendInform.ObjUserDefault.length;
                k++
              ) {
                let ObjUserDefault = "";
                ObjUserDefault = await shareService.getInforUser(
                  "i:0#.f|membership|" +
                    Steps[step].ObjEmailCfg.EmailSendInform.ObjUserDefault[k]
                      .UserEmail
                );
                Steps[step].ObjEmailCfg.EmailSendInform.ObjUserDefault[
                  k
                ] = ObjUserDefault;
              }
            }
            for (let i = 0; i < Steps[step].ObjStepWFId.length; i++) {
              if (
                isNotNull(Steps[step].ObjStepWFId[i].WFTableId) &&
                Steps[step].ObjStepWFId[i].ObjInitialization.TypeUserApproval ==
                  "Designator" &&
                Steps[step].ObjStepWFId[i].ObjInitialization.UserApprover
                  .length > 0
              ) {
                for (
                  let j = 0;
                  j <
                  Steps[step].ObjStepWFId[i].ObjInitialization.UserApprover
                    .length;
                  j++
                ) {
                  let ObjUser = "";
                  ObjUser = await shareService.getInforUser(
                    "i:0#.f|membership|" +
                      Steps[step].ObjStepWFId[i].ObjInitialization.UserApprover[
                        j
                      ].UserEmail
                  );
                  Steps[step].ObjStepWFId[i].ObjInitialization.UserApprover[
                    j
                  ] = ObjUser;
                }
              }
            }
          }

          if (Steps[step].ObjEmailCfg.EmailSendDeadline.IsActive) {
            let checkAppearTempD = TemplateEmail.findIndex(
              (t) =>
                t.IdTemp ==
                Steps[step].ObjEmailCfg.EmailSendDeadline.ObjEmailTemplate
                  .TemplateId
            );
            let checkSaveTempD = arrIdTempEmail.findIndex(
              (t) =>
                t.OldId ==
                Steps[step].ObjEmailCfg.EmailSendDeadline.ObjEmailTemplate
                  .TemplateId
            );
            if (checkSaveTempD == -1 && checkAppearTempD != -1) {
              const tempD = await sp.web.lists
                .getByTitle(configData.WFTemplateEmail.ListName)
                .items.add(TemplateEmail[checkAppearTempD].ContentTemp);
              Steps[
                step
              ].ObjEmailCfg.EmailSendDeadline.ObjEmailTemplate.TemplateId =
                tempD["data"].ID;
              arrIdTempEmail.push({
                ID: tempD["data"].ID,
                OldId: TemplateEmail[checkAppearTempD].IdTemp,
              });
            } else if (checkSaveTempD != -1 && checkAppearTempD != -1) {
              Steps[
                step
              ].ObjEmailCfg.EmailSendDeadline.ObjEmailTemplate.TemplateId =
                arrIdTempEmail[checkSaveTempD].ID;
            } else {
              Steps[step].ObjEmailCfg.EmailSendDeadline.ObjEmailTemplate = {
                TemplateId: "",
                TemplateTitle: "",
              };
            }
          }

          const dataStepWF = {
            Title: Steps[step].StepTitle,
            Code: Steps[step].StepCode,
            WFTableId: CheckNullSetZero(itemWF["data"].ID),
            ObjEmailCfg: JSON.stringify(Steps[step].ObjEmailCfg),
            StepWFType: Steps[step].StepWFType,
            ObjStepWFId: JSON.stringify(Steps[step].ObjStepWFId),
            ObjStepCondition: JSON.stringify(Steps[step].ObjStepCondition),
            ClassifyStep: Steps[step].ClassifyStep,
            indexStep: Steps[step].indexStep,
            StepNextDefault: JSON.stringify(Steps[step].StepNextDefault),
            ObjFieldStep: JSON.stringify(Steps[step].ObjFieldStep),
            btnAction: JSON.stringify(Steps[step].btnAction),
            ObjBackStep: JSON.stringify(Steps[step].ObjBackStep),
            SLA: CheckNullSetZero(Steps[step].SLA),
            TypeofApprover: Steps[step].TypeofApprover,
            ApproveRunTime: JSON.stringify(Steps[step].ApproveRunTime),
          };

          if (Steps[step].TypeofApprover == "Người phê duyệt") {
            Object.assign(dataStepWF, {
              GroupApprover: JSON.stringify(Steps[step].GroupApprover),
              ApproverInField: null,
              ApproverInStep: null,
              ApproverInSelect:null,
              DepartmentCode: null,
              ApproveCode: null,
              RoleCode: null,
            });
            if (
              Steps[step].GroupApprover.TypeUserApproval ==
              "Một người phê duyệt"
            ) {
              let userApprove = null;
              if (isNotNull(Steps[step].UserApprover.UserEmail)) {
                let objUserApp = await shareService.getInforUser(
                  "i:0#.f|membership|" + Steps[step].UserApprover.UserEmail
                );
                if (isNotNull(objUserApp.UserId)) {
                  userApprove = objUserApp.UserId;
                }
              }
              Object.assign(dataStepWF, {
                UserApproverId: userApprove,
                IsEditApprover: Steps[step].IsEditApprover,
              });
            } else {
              Object.assign(dataStepWF, {
                UserApproverId: null,
                IsEditApprover: false,
              });
            }
          } else if (Steps[step].TypeofApprover == "Người xử lý tại bước") {
            let groupApprover = {
              TypeUserApproval: "",
              Group: { ID: "", Title: "" },
            };
            Object.assign(dataStepWF, {
              GroupApprover: JSON.stringify(groupApprover),
              ApproverInStep: Steps[step].ApproverInStep,
              ApproverInSelect:null,
              ApproverInField: null,
              UserApproverId: null,
              DepartmentCode: null,
              ApproveCode: null,
              RoleCode: null,
            });
          } else if (Steps[step].TypeofApprover == "Trường dữ liệu") {
            let groupApprover = {
              TypeUserApproval: "",
              Group: { ID: "", Title: "" },
            };
            Object.assign(dataStepWF, {
              GroupApprover: JSON.stringify(groupApprover),
              ApproverInField: Steps[step].ApproverInField,
              ApproverInStep: null,
              ApproverInSelect:null,
              UserApproverId: null,
              DepartmentCode: null,
              ApproveCode: null,
              RoleCode: null,
            });
          } 
          else if (Steps[step].TypeofApprover == "Select") {
            let groupApprover = {
              TypeUserApproval: "",
              Group: { ID: "", Title: "" },
            };
            Object.assign(dataStepWF, {
              GroupApprover: JSON.stringify(groupApprover),
              ApproverInField:Steps[step].ApproverInField,
              ApproverInSelect:JSON.stringify(Steps[step].ApproverInSelect),
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
              ApproveCode: Steps[step].ApproveCode,
              RoleCode: Steps[step].RoleCode,
              DepartmentCode: Steps[step].DepartmentCode,
              UserApproverId: null,
              ApproverInField: null,
              ApproverInStep: null,
              ApproverInSelect:null,
            });
          }

          await sp.web.lists
            .getByTitle(configData.WFStepTable.ListName)
            .items.add(dataStepWF);
          console.log("Save Info Workflow Step success");
        }
        console.log("Save Info Workflow All Step success");

        // Lưu thông tin cấu hình và Tạo các Trường dữ liệu của quy trình
        const Fields = wfTemplate[arrayWF[wfTemp]].Field.wfListField;
        for (let field = 0; field < Fields.length; field++) {
          //Tạo các Trường dữ liệu của quy trình
          let fieldList = {
            FieldName: Fields[field].InternalName,
            FieldType: Fields[field].FieldType,
          };
          if (
            Fields[field].FieldType == objSPField.Dropdown.Type ||
            Fields[field].FieldType == objSPField.CheckBox.Type ||
            Fields[field].FieldType == objSPField.RadioButton.Type
          ) {
            Object.assign(fieldList, {
              spFieldType: objSPField[Fields[field].FieldType].spType,
              FieldObject: Fields[field].ObjSPField.ObjField.ChoiceField,
              spFieldFormat: objSPField[Fields[field].FieldType].spFormat,
            });
          } else {
            Object.assign(fieldList, {
              spFieldType: objSPField[Fields[field].FieldType].spType,
              FieldObject: [],
              spFieldFormat: objSPField[Fields[field].FieldType].spFormat,
            });
          }
          await this.createFieldListItem(
            wfTemplate[arrayWF[wfTemp]].WorkFlow.Code,
            fieldList
          );
          console.log("create SPList Field success");
          let defaultValue = "";
          // Lưu thông tin cấu hình các Trường dữ liệu của quy trình
          if (isNotNull(Fields[field].DefaultValue)) {
            if (Fields[field].FieldType == objField.User) {
              if (isNotNull(Fields[field].DefaultValue.UserEmail)) {
                let valueDefault = await shareService.getInforUser(
                  "i:0#.f|membership|" + Fields[field].DefaultValue.UserEmail
                );
                defaultValue = JSON.stringify(valueDefault);
              } else {
                defaultValue = JSON.stringify(Fields[field].DefaultValue);
              }
            }
          }
          const dataFormField = {
            Title: Fields[field].FieldName,
            WFTableId: CheckNullSetZero(itemWF["data"].ID),
            InternalName: Fields[field].InternalName,
            FieldType: Fields[field].FieldType,
            HelpText: Fields[field].HelpText,
            Required: Fields[field].Required,
            ObjValidation: JSON.stringify(Fields[field].ObjValidation),
            ObjSPField: JSON.stringify(Fields[field].ObjSPField),
            DefaultValue: defaultValue,
          };
          await sp.web.lists
            .getByTitle(configData.WFFormField.ListName)
            .items.add(dataFormField);
          console.log("save Form Field success");
        }
        console.log("create All SPList Field, Form Field success");

        //Tạo các Trường dữ liệu mặc định của quy trình
        const fieldIndexStep = {
          FieldName: "indexStep",
          FieldType: objSPField.Number.Type,
          spFieldType: objSPField.Number.spType,
          FieldObject: [],
          spFieldFormat: objSPField.Number.spFormat,
        };
        await this.createFieldListItem(
          wfTemplate[arrayWF[wfTemp]].WorkFlow.Code,
          fieldIndexStep
        );

        const fieldStatusStep = {
          FieldName: "StatusStep",
          FieldType: objSPField.Number.Type,
          spFieldType: objSPField.Number.spType,
          FieldObject: [],
          spFieldFormat: objSPField.Number.spFormat,
        };
        await this.createFieldListItem(
          wfTemplate[arrayWF[wfTemp]].WorkFlow.Code,
          fieldStatusStep
        );

        const fieldStatusRequest = {
          FieldName: "StatusRequest",
          FieldType: objSPField.Number.Type,
          spFieldType: objSPField.Number.spType,
          FieldObject: [],
          spFieldFormat: objSPField.Number.spFormat,
        };
        await this.createFieldListItem(
          wfTemplate[arrayWF[wfTemp]].WorkFlow.Code,
          fieldStatusRequest
        );

        const fieldUserRequest = {
          FieldName: "UserRequest",
          FieldType: objSPField.User.Type,
          spFieldType: objSPField.User.spType,
          FieldObject: [],
          spFieldFormat: objSPField.User.spFormat,
        };
        await this.createFieldListItem(
          wfTemplate[arrayWF[wfTemp]].WorkFlow.Code,
          fieldUserRequest
        );

        const fieldUserApproval = {
          FieldName: "UserApproval",
          FieldType: objSPField.User.Type,
          spFieldType: objSPField.User.spType,
          FieldObject: [],
          spFieldFormat: objSPField.User.spFormat,
        };
        await this.createFieldListItem(
          wfTemplate[arrayWF[wfTemp]].WorkFlow.Code,
          fieldUserApproval
        );

        const fieldListUser = {
          FieldName: "ListUser",
          FieldType: objSPField.UserMulti.Type,
          spFieldType: objSPField.UserMulti.spType,
          FieldObject: [],
          spFieldFormat: objSPField.UserMulti.spFormat,
        };
        await this.createFieldListItem(
          wfTemplate[arrayWF[wfTemp]].WorkFlow.Code,
          fieldListUser
        );

        const fieldReason = {
          FieldName: "Reason",
          FieldType: objSPField.TextArea.Type,
          spFieldType: objSPField.TextArea.spType,
          FieldObject: [],
          spFieldFormat: objSPField.TextArea.spFormat,
        };
        await this.createFieldListItem(
          wfTemplate[arrayWF[wfTemp]].WorkFlow.Code,
          fieldReason
        );

        const fieldHistoryStep = {
          FieldName: "HistoryStep",
          FieldType: objSPField.TextArea.Type,
          spFieldType: objSPField.TextArea.spType,
          FieldObject: [],
          spFieldFormat: objSPField.TextArea.spFormat,
        };
        await this.createFieldListItem(
          wfTemplate[arrayWF[wfTemp]].WorkFlow.Code,
          fieldHistoryStep
        );

        const fieldObjSubWF = {
          FieldName: "ObjSubWF",
          FieldType: objSPField.TextArea.Type,
          spFieldType: objSPField.TextArea.spType,
          FieldObject: [],
          spFieldFormat: objSPField.TextArea.spFormat,
        };
        await this.createFieldListItem(
          wfTemplate[arrayWF[wfTemp]].WorkFlow.Code,
          fieldObjSubWF
        );

        const fieldObjParentWF = {
          FieldName: "ObjParentWF",
          FieldType: objSPField.TextArea.Type,
          spFieldType: objSPField.TextArea.spType,
          FieldObject: [],
          spFieldFormat: objSPField.TextArea.spFormat,
        };
        await this.createFieldListItem(
          wfTemplate[arrayWF[wfTemp]].WorkFlow.Code,
          fieldObjParentWF
        );

        const fieldPermissViewInStep = {
          FieldName: "PermissViewInStep",
          FieldType: objSPField.TextArea.Type,
          spFieldType: objSPField.TextArea.spType,
          FieldObject: [],
          spFieldFormat: objSPField.TextArea.spFormat,
        };
        await this.createFieldListItem(
          wfTemplate[arrayWF[wfTemp]].WorkFlow.Code,
          fieldPermissViewInStep
        );

        const fieldIsApproveRunTime = {
          FieldName: "IsApproveRunTime",
          FieldType: objSPField.YesNo.Type,
          spFieldType: objSPField.YesNo.spType,
          FieldObject: [],
          spFieldFormat: objSPField.YesNo.spFormat,
        };
        await this.createFieldListItem(
          wfTemplate[arrayWF[wfTemp]].WorkFlow.Code,
          fieldIsApproveRunTime
        );

        const fieldApproverRunTime = {
          FieldName: "ApproverRunTime",
          FieldType: objSPField.TextArea.Type,
          spFieldType: objSPField.TextArea.spType,
          FieldObject: [],
          spFieldFormat: objSPField.TextArea.spFormat,
        };
        await this.createFieldListItem(
          wfTemplate[arrayWF[wfTemp]].WorkFlow.Code,
          fieldApproverRunTime
        );

        const fieldHoursBackStep = {
          FieldName: "HoursBackStep",
          FieldType: objSPField.Number.Type,
          spFieldType: objSPField.Number.spType,
          FieldObject: [],
          spFieldFormat: objSPField.Number.spFormat,
        };
        await this.createFieldListItem(
          wfTemplate[arrayWF[wfTemp]].WorkFlow.Code,
          fieldHoursBackStep
        );

        const fieldStateOfEmergency = {
          FieldName: "StateOfEmergency",
          FieldType: objSPField.Number.Type,
          spFieldType: objSPField.Number.spType,
          FieldObject: [],
          spFieldFormat: objSPField.Number.spFormat,
        };
        await this.createFieldListItem(
          wfTemplate[arrayWF[wfTemp]].WorkFlow.Code,
          fieldStateOfEmergency
        );

        console.log("create Field default Workflow Success");

        await shareService.createReportList(
          wfTemplate[arrayWF[wfTemp]].WorkFlow.Code
        );
        await shareService.createDocumentList(
          wfTemplate[arrayWF[wfTemp]].WorkFlow.Code
        );
        console.log("create list report Workflow Success");
      } else {
        continue;
      }
    }
    console.log("create Template Workflow Success");

    await this.setState({ isShowLoadingPage: false });
    alert("Đã cấu hình cơ sở dữ liệu thành công");
    window.location.href = config.pages.wfDashboard;
  }

  render() {
    const { isShowLoadingPage } = this.state;
    return (
      <Fragment>
        {isShowLoadingPage ? (
          <div className="loadingProcess">
            <Spinner animation="border" className="loadingIcon" />
          </div>
        ) : (
          ""
        )}

        <div className="page-content mt-0 pt-0">
          <Container fluid={true}>
            <Row>
              <Col lg={12} sm={12}>
                <Card>
                  <CardHeader className="bg-info">
                    <h5 className="my-0 text-white">Tạo cơ sở dữ liệu</h5>
                  </CardHeader>

                  <CardBody>
                    <div className="row mt-3 mb-3">
                      <Col lg="12">
                        <div className="text-left">
                          <button
                            type="button"
                            className="btn btn-md btn-primary waves-effect waves-light"
                            onClick={() => this.createDatabase()}
                          >
                            <i className="fa fa-plus-circle mr-2 align-middle"></i>{" "}
                            Tạo Database
                          </button>
                        </div>
                      </Col>
                    </div>
                  </CardBody>
                </Card>
              </Col>
            </Row>
          </Container>
        </div>
      </Fragment>
    );
  }
}
