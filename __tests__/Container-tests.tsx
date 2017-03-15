import React = require("react");
import { toGlobalId } from "graphql-relay";
import { create } from "react-test-renderer";
import { QueryParser, Relay } from "relay-common";
import schema from "./../__fixtures__/schema";
import Container from "./../Container";
class A extends React.Component<any, any> {
    public render() {
        return <div>{this.props.viewer ? this.props.viewer.model1.edges[0].node.field1 : ""} {this.props.a2}</div>;
    }
}
describe("Container tests", () => {
    it("simple", async () => {
        let sid = "";
        const id1 = toGlobalId("Model1", "16");
        const resolver = {
            fetch: (query: string, vars?: any, subscriptionId?: any) => {
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
        const parser = new QueryParser(schema);
        const queryA1 = parser.parse`query Q1{
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
        const relay = new Relay(resolver);
        const container = <Container
            client={relay}
            query={queryA1}
            vars={{ t1: "x" }}
            renderFetched={(data: any) => {
                return <A {...data} />;
            }}
            a2="Hi, I am A2"
        />;
        const renderer = create(container);
        await new Promise((resolve) => setTimeout(resolve, 100));
        expect(renderer.toJSON()).toMatchSnapshot();
        relay.updateNode(sid, id1, {
            field1: "ViewerModel1Edge0NodeField1Value2",
        });
        await new Promise((resolve) => setTimeout(resolve, 100));
        expect(renderer.toJSON()).toMatchSnapshot();
    });
});
