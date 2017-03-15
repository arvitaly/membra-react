"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments)).next());
    });
};
const React = require("react");
const graphql_relay_1 = require("graphql-relay");
const react_test_renderer_1 = require("react-test-renderer");
const relay_common_1 = require("relay-common");
const schema_1 = require("./../__fixtures__/schema");
const Container_1 = require("./../Container");
class A extends React.Component {
    render() {
        return React.createElement("div", null,
            this.props.viewer ? this.props.viewer.model1.edges[0].node.field1 : "",
            " ",
            this.props.a2);
    }
}
describe("Container tests", () => {
    it("simple", () => __awaiter(this, void 0, void 0, function* () {
        let sid = "";
        const id1 = graphql_relay_1.toGlobalId("Model1", "16");
        const resolver = {
            fetch: (query, vars, subscriptionId) => {
                sid = subscriptionId;
                if (vars.t1 !== "x") {
                    return Promise.reject("Invalid vars");
                }
                return Promise.resolve({
                    viewer: {
                        model1: {
                            edges: [{
                                    node: {
                                        id: id1,
                                        field1: "ViewerModel1Edge0NodeField1Value",
                                        model2: {
                                            field2: "test2",
                                        },
                                    },
                                }],
                        },
                    },
                });
            },
            unsubscribe: () => { return Promise.resolve(); },
        };
        const parser = new relay_common_1.QueryParser(schema_1.default);
        const queryA1 = parser.parse `query Q1{
                viewer{
                    model1{
                        edges{
                            node{
                                field1
                                model2{
                                    field2
                                }
                            }
                        }
                    }
                }
            }`;
        const relay = new relay_common_1.Relay(resolver);
        const renderer = react_test_renderer_1.create(React.createElement(Container_1.default, { client: relay, query: queryA1, vars: { t1: "x" }, component: A, a2: "Hi, I am A2" }));
        yield new Promise((resolve) => setTimeout(resolve, 100));
        expect(renderer.toJSON()).toMatchSnapshot();
        relay.updateNode(sid, id1, {
            field1: "ViewerModel1Edge0NodeField1Value2",
        });
        yield new Promise((resolve) => setTimeout(resolve, 100));
        expect(renderer.toJSON()).toMatchSnapshot();
    }));
});
