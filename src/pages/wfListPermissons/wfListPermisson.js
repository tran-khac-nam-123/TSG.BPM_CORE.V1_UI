import React from "react";
import ReactDOM from "react-dom";

import Menu from "components/menus/Menu";
import ListPermisson from "components/wfListPermisson/wfListPermissonCmpt.js";
import WFLicenseExpires from "components/wfConfigCmpts/wfLicenseExpires";
import { checkLicense } from "components/wfShareCmpts/wfShareFunction.js";
import { config } from "../environment.js";
import "../../assets/scss/theme.scss";
import "./../globalStyle.scss";
ReactDOM.render(<Menu />, document.getElementById("menu"));
if (checkLicense(config.license)) {
  ReactDOM.render(<ListPermisson />, document.getElementById("wfListPermisson"));
} else {
  ReactDOM.render(<WFLicenseExpires />, document.getElementById("wfListPermisson"));
}
