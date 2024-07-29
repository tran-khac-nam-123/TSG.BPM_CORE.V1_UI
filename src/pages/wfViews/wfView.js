import React from "react";
import ReactDOM from "react-dom";

import Menu from "components/menus/Menu";
import WorkflowView from "components/wfViewCmpts/wfViewCmpt";
import WFLicenseExpires from "components/wfConfigCmpts/wfLicenseExpires";
import { checkLicense } from "components/wfShareCmpts/wfShareFunction.js";
import { config } from "../environment.js";
import "../../assets/scss/theme.scss";
import "./../globalStyle.scss";

ReactDOM.render(<Menu />, document.getElementById("menu"));
if (checkLicense(config.license)) {
  ReactDOM.render(<WorkflowView />, document.getElementById("wfView"));
} else {
  ReactDOM.render(<WFLicenseExpires />, document.getElementById("wfView"));
}
