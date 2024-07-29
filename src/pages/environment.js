// sites/tsgapp/TSG_BPM
// sites/dev/DevTeam_WF
// sites/dev/BMPRelease
// sites/dev/DevTestSPList
// sites/dev/DevTeam_BPM

import logoPicture from "./../components/logo.png";
import * as moment from "moment";

const versionMGR = {
  version1: 1,
  version2: 2,
  version3: 3,
};

const baseSite = {
  hostUrl: window["base-url"] + "/sites/tsgapp/TSG_BPM_HR",
//  AppPage: "/AppLibraries/BPM/BPM_MGR",
   AppPage: "/TSG_BPM_MGR_V1_1_0/Pages",
};

const prod = {
  url: {
    API_URL: baseSite.hostUrl,
  },
  pages: {
    wfDashboard: baseSite.hostUrl + baseSite.AppPage + "/Default.aspx",
    wfAddNew: baseSite.hostUrl + baseSite.AppPage + "/wfAddNews/wfAddNew.aspx",
    wfView: baseSite.hostUrl + baseSite.AppPage + "/wfViews/wfView.aspx",
    wfCreateDatabase:
      baseSite.hostUrl +
      baseSite.AppPage +
      "/wfCreateDatabases/wfCreateDatabase.aspx",
      wfUser: baseSite.hostUrl + baseSite.AppPage + "/wfAddNews/wfAddNew.aspx",
      wfPermisson: baseSite.hostUrl + baseSite.AppPage + "/wfAddNews/wfAddNew.aspx",
  },
  // productPicture: '/sites/dev/DevTeam_WF/AppLibraries/BPM/BPM_MGR' + logoPicture,
  productPicture: baseSite.hostUrl + baseSite.AppPage + logoPicture,
  productVersion: versionMGR.version3,
  NumberMaxFlow:50,
  devSetting: true,
  license: {
    today: "2020-04-13",
    numberDay: 30,
    isLimited: false,
  },
};

const dev = {
  url: {
    API_URL: `http://localhost:8080`,
  },
  pages: {
    wfDashboard: "/index.html",
    wfAddNew: "/wfAddNews/wfAddNew.html",
    wfView: "/wfViews/wfView.html",
    wfCreateDatabase: "/wfCreateDatabases/wfCreateDatabase.html",
    wfUser: "/wfListUsers/wfListUser.html",
    wfPermisson: "/wfListPermissons/wfListPermisson.html",
  },
  productPicture: logoPicture,
  productVersion: versionMGR.version3,
  NumberMaxFlow:60,
  devSetting: true,
  license: {
    today: "2020-04-13",
    numberDay: 30,
    isLimited: false,
  },
};

export const config = process.env.NODE_ENV === "development" ? dev : prod;
