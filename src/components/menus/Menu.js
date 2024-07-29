import React, { Component } from "react";
import style from "./Menu.css";
import { config } from "./../../pages/environment.js";
import configData from "./../../../config/configDatabase.json";
import { checkLicense, CheckNull } from "./../wfShareCmpts/wfShareFunction.js";
import { sp } from "@pnp/sp";
import "@pnp/sp/webs";
import "@pnp/sp/lists/web";
import "@pnp/sp/items";
import "@pnp/sp/profiles";
import "@pnp/sp/site-users/web";
import "@pnp/sp/fields";
import "@pnp/sp/site-groups/web";
import shareService from "./../wfShareCmpts/wfShareService";

export default class Menu extends Component {
  constructor(props) {
    super(props);
    this.state = {
      countFL: 0,
      isInstall: true,
      permissIsUser: false,
      IsLicense: false,
    };
    sp.setup({ pageContext: { web: { absoluteUrl: config.url.API_URL } } });
    this.currentUser = undefined;
  }

  componentDidMount() {
    this.setStateForm();
  }

  async setStateForm() {
    let checkInstall = await shareService.returnCheckInstallData();
    if (checkInstall) {
      this.setState({ isInstall: true });
    } else {
      this.currentUser = await shareService.getCurrentUser();
      let countFL = await shareService.CountWFTable()
      let depts = await shareService.GetListDepartment();

      let permissUser = await shareService.checkPermissionUser(
        this.currentUser.Id,
        depts
      );
      console.log(permissUser);
      let licens = checkLicense(config.license);
      this.setState({
        countFL: countFL.length,
        isInstall: false,
        permissIsUser: permissUser.Permission == "User" ? true : false,
        IsLicense: licens,
      });
    }
  }

  render() {
    return (
      <div>
        <div className={style.Menu}>
          <a href={config.pages.wfDashboard}>
            <img className="logo" src={config.productPicture} />
          </a>
          {!this.state.IsLicense ? (
            <ul>
              <li>
                <a className="active">Quyền truy cập</a>
              </li>
            </ul>
          ) : this.state.isInstall ? (
            <ul>
              <li>
                <a className="active" href={config.pages.wfCreateDatabase}>
                  Cấu hình cơ sở dữ liệu
                </a>
              </li>
            </ul>
          ) : this.state.permissIsUser ? (
            <ul>
              {" "}
              <li>
                <a className="active">Quyền truy cập</a>
              </li>
            </ul>
          ) : config.productVersion != 3 ? (
            <ul>
              <li>
                <a className="active" href={config.pages.wfDashboard}>
                  Danh sách quy trình
                </a>
              </li>
            </ul>
          ) : (
            <ul>
              <li>
                <a className="active" href={config.pages.wfDashboard}>
                  Danh sách quy trình
                </a>
              </li>
              {this.state.countFL < config.NumberMaxFlow ?
                <li>
                  <a href={config.pages.wfAddNew}>Tạo mới quy trình</a>
                </li>
                : ''
              }
              <li> 
                <a className="active" href={config.pages.wfUser}>
                  Danh sách user
                </a>
              </li>

              <li> 
                <a className="active" href={config.pages.wfPermisson}>
                  Danh sách permisson
                </a>
              </li>
            </ul>
            
          )}
      
               
             
        </div>
      </div>
    );
  }
}
