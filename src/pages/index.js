import React from "react";
import ReactDOM from "react-dom";
import Menu from "components/menus/Menu";
import WorkflowList from "components/wfListCmpts/wfListCmpt";
import WFLicenseExpires from "components/wfConfigCmpts/wfLicenseExpires";
import { checkLicense } from "components/wfShareCmpts/wfShareFunction.js";
import { config } from "./environment.js";
import "./../assets/scss/theme.scss";
import "./globalStyle.scss";

ReactDOM.render(<Menu />, document.getElementById("menu"));
if (checkLicense(config.license)) {
  ReactDOM.render(<WorkflowList />, document.getElementById("wfList"));
} else {
  ReactDOM.render(<WFLicenseExpires />, document.getElementById("wfList"));
}
