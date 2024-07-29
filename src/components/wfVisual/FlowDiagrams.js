import React, { useState, useEffect, useReducer } from "react";
import PropTypes from "prop-types";
import { FlowChartWithState } from "@mrblenny/react-flow-chart";
import { sp } from "@pnp/sp";
import { config } from "./../../pages/environment.js";
import styled from 'styled-components'
import { isNotNull, CheckNull, CheckNullSetZero, getQueryParams, FindTitleById, formatActiveText, formatActiveLabel, formatTypeObjField, returnArray, returnObject } from './../wfShareCmpts/wfShareFunction.js';

FlowDiagrams.propTypes = {};

function FlowDiagrams(props) {
  sp.setup({ pageContext: { web: { absoluteUrl: config.url.API_URL } } });
  const [mystate, setState] = useState({
    offset: {
      x: 0,
      y: 0,
    },
    nodes: {},
    links: {},
    selected: {},
    hovered: {},
  });
  let param = getQueryParams(window.location.search);
  const itemId = param["ItemId"];
  //const [positionY, setPosition] = useState(100);

  const getWfStep = async (wfObj) => {
    let positionY = 100;

    let arrStepWF = [];
    const strSelect = `ID,Title,Code,indexStep,ClassifyStep,StepWFType,TypeofApprover,ApproveCode,RoleCode,ObjStepWFId,StepNextDefault,ObjStepCondition,IsEditApprover,ObjEmailCfg,SLA,ObjFieldStep,GroupApprover,btnAction,ObjBackStep,UserApprover/Title,UserApprover/Id`;
    await sp.web.lists
      .getByTitle("WFStepTable")
      .items.select(strSelect)
      .expand("UserApprover")
      .filter("WFTableId eq " + itemId)
      .orderBy("indexStep", true)
      .get()
      .then((listWFStep) => {
        console.log('listWFStep.length :>> ', listWFStep.length);
        listWFStep.forEach((itemDetail) => {
          console.log("itemDetail ", itemDetail);
          let newNode = {};
          //newNode.id = itemDetail.Code;
          newNode.id = itemDetail.Title;
          newNode.TypeofApprover = itemDetail.TypeofApprover;
          newNode.ClassifyStep = itemDetail.ClassifyStep;
          newNode.Code = itemDetail.Code;          
          
          if (itemDetail.ClassifyStep === "Start") {
            newNode.type = "output-only";
            newNode.position = {
              x: 300,
              y: positionY,
            };
            // default flow port
            newNode.ports = {
              defaultOutPort: {
                id: "defaultOutPort",
                type: "output",
              },
            };

            // create link
            let StepNextDefault = "";
            if (
              itemDetail.StepNextDefault !== undefined &&
              itemDetail.StepNextDefault !== null &&
              itemDetail.StepNextDefault !== ""
            ) {
              StepNextDefault = JSON.parse(itemDetail.StepNextDefault);
              let newLink = {};
              newLink.id = StepNextDefault.StepNextDefaultId;
              newLink.from = { nodeId: newNode.id, portId: "defaultOutPort" };
              mystate.links[newLink.id] = newLink;
            }
            // check condition here to open port
          } else if (itemDetail.ClassifyStep === "Step") {
            newNode.type = "input-output";
            newNode.position = {
              x: 300,
              y: positionY,
            };
            // default flow port
            newNode.ports = {
              defaultInPort: {
                id: "defaultInPort",
                type: "input",
              },
              defaultOutPort: {
                id: "defaultOutPort",
                type: "output",
              },
            };

            // add to link
            //toExistLink = mystate.links[itemDetail.indexStep];
            mystate.links[itemDetail.indexStep].to = {
              nodeId: newNode.id,
              portId: "defaultInPort",
            };

            // create from link
            let StepNextDefault = "";
            if (
              itemDetail.StepNextDefault !== undefined &&
              itemDetail.StepNextDefault !== null &&
              itemDetail.StepNextDefault !== ""
            ) {
              StepNextDefault = JSON.parse(itemDetail.StepNextDefault);
              if (StepNextDefault.StepNextDefaultId !== "" && listWFStep.length !== Object.keys(mystate.nodes).length +1) 
              {
                //Object.keys(mystate.nodes).find(nextNode) StepNextDefault.StepNextDefaultTitle
                let newLink = {};
                newLink.id = StepNextDefault.StepNextDefaultId;
                newLink.from = { nodeId: newNode.id, portId: "defaultOutPort" };
                mystate.links[newLink.id] = newLink;
              }
            }
          }

          // hard code
          positionY = positionY + 200;
          // add to flow chart data
          mystate.nodes[newNode.id] = newNode;
        });
        arrStepWF = listWFStep;
      })
      .catch((error) => {
        console.log(error);
      });
    
    
    // create link for condition
    arrStepWF.forEach(element => {
      let conds = JSON.parse(element.ObjStepCondition);
      if (conds.IsActive)  {
        // from node 
        mystate.nodes[element.Title].ports["portTo" + element.indexStep] = {
          id: "portTo" + element.indexStep,
          type: "right", properties: {
            linkColor: '#FFD300',
          }
        }

        // to node
        mystate.nodes[conds.StepNextCondition.StepNextConditionTitle].ports["portFrom" + element.indexStep] = {
          id: "portFrom" + element.indexStep,
          type: "right"
        }
        
        let newLink = {};
        newLink.id = "conds" + element.indexStep;
        newLink.from = { nodeId: element.Title, portId: "portTo" + element.indexStep };
        newLink.to = {
          nodeId: conds.StepNextCondition.StepNextConditionTitle,
          portId: "portFrom" + element.indexStep,
        };
        newLink.linkColor= '#FFCC00';
        mystate.links[newLink.id] = newLink;
      }
    });

    console.log('mystate :>> ', mystate);

    return arrStepWF;
  };

  useEffect(() => {
    getWfStep();
    return () => {};
  }, []);

  return <FlowChartWithState 
    config={{ smartRouting: true }} 
    initialValue={mystate} 
    Components={{NodeInner: NodeInnerCustom,}} 
  />;
}

export default FlowDiagrams;
const NodeInnerCustom = ({ node, config }) => {
  
  return (
    <Outer>
      <p style={titleP}>{node.id}</p>
      <p>{node.TypeofApprover}</p>
    </Outer>
  )
}

const titleP = {
  fontWeight: "bold",
  textTransform: "uppercase"
}

const Outer = styled.div`
  padding: 30px;
`

const Input = styled.input`
  padding: 10px;
  border: 1px solid cornflowerblue;
  width: 100%;
`