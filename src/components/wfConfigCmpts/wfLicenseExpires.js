import React, { Fragment } from "react";
import {
  Row,
  Col,
  Card,
  CardBody,
  CardTitle,
  Container,
  CardHeader,
} from "reactstrap";

const WFLicenseExpires = () => {
  return (
    <Fragment>
      <div className="page-content mt-0 pt-0">
        <Container fluid={true}>
          <Row>
            <Col lg={12} sm={12}>
              <Card>
                <CardHeader className="bg-info">
                  <h5 className="my-0 text-white">Từ chối truy cập</h5>
                </CardHeader>

                <CardBody>
                  <div className="row mt-3 mb-3">
                    <Col lg="12">
                      <CardTitle className="text-info mb-3">
                        <p className="text-danger">
                          Rất tiếc phần mềm của bạn đã hết hạn sử dụng! <br />
                          Vui lòng liên hệ với bộ phận cung cấp dịch vụ đề biết
                          thêm chi tiết!
                        </p>
                      </CardTitle>
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
};
export default WFLicenseExpires;
