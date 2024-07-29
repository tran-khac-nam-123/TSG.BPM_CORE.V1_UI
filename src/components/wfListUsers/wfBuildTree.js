import React, { Component, Fragment } from "react";
import * as moment from "moment";
import { sp } from "@pnp/sp";
import "@pnp/sp/webs";
import "@pnp/sp/lists/web";
import "@pnp/sp/items";
import "@pnp/sp/profiles";
import "@pnp/sp/site-users/web";
import "@pnp/sp/site-groups/web";
import {
  Row,
  Col,
  Card,
  CardHeader,
  CardBody,
  CardTitle,
  Container,
  Modal,
  Button,
  Spinner,
} from "reactstrap";
import { Table, Thead, Tbody, Tr, Th, Td } from "react-super-responsive-table";
import {
  isNotNull,
  CheckNull,
  CheckNullSetZero,
  ISODateString,
  formatDate,
  formatActiveLabel,
  formatActiveText,
  returnArray,
  returnObject,
  TotalSLA,
  FindTitleById,
} from "../wfShareCmpts/wfShareFunction";

import shareService from "../wfShareCmpts/wfShareService";
import "../css/loading.scss";

export default class BuildTreeT extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isLoading: false,
    };
  }

  BuildTree(list) {
    // let root = list.filter(x => x.ParentCode == parent)
    // root.map(x=>)
    if (list.length > 0) {
      return list.map((x) => (
        <TreeNode label={x.Title}>
          {x.root.length > 0 ? this.BuildTree(x.root) : ""}{" "}
        </TreeNode>
      ));
    }
  }

  async componentDidMount() {
    let items = [];
    await sp.web.lists
      .getByTitle("ListDepartment")
      .items.select("ID,Title,DeptCode,ParentCode,Manager/Title")
      .expand("Manager")
      .get()
      .then((itemList) => {
        // console.log(itemList);
        itemList.forEach((element) => {
          items.push({
            ID: element.ID,
            Title: element.Title,
            DeptCode: element.DeptCode,
            ParentCode: element.ParentCode,
            root: [],
          });
        });
        console.log(items);
      })
      .catch((error) => {
        console.log(error);
      });

    //let list = this.BuildTree(items, null, '')
    items.map((y) => {
      y.root = items.filter((z) => z.ParentCode == y.DeptCode);
    });
    this.setState({ items: items });
  }

  render() {
    const {} = this.state;
    return (
      <Fragment>
        <Container>
          <Row>
            <Col lg={12} sm={12}>
              <Card>
                <div>
                  {this.state.items
                    .filter((x) => x.ParentCode == null)
                    .map((y) => (
                      <Tree label={y.Title}>{this.BuildTree(y.root)}</Tree>
                    ))}
                </div>
              </Card>
            </Col>
          </Row>
        </Container>
      </Fragment>
    );
  }
}
