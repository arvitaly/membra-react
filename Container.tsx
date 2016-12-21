import React = require("react");
import { IQuery, IQueryResult, IRelayClient } from "relay-common";
export interface IProps {
    queries: { [index: string]: { query: IQuery, vars?: any } };
    component: React.ComponentClass<any>;
    client: IRelayClient;
    [index: string]: any;
}
interface IState {
    bindings: Bindings;
}
type Bindings = { [index: string]: any };
export default class Container extends React.Component<IProps, IState> {
    protected queries: { [index: string]: IQueryResult } = {};
    protected isUnmounted = false;
    public componentWillMount() {
        let bindings: Bindings = {};
        Object.keys(this.props).map((propName) => {
            switch (propName) {
                case "client":
                case "component":
                case "queries":
                    break;
                default:
                    bindings[propName] = this.props[propName];
            }
        });
        Object.keys(this.props.queries).map((queryName) => {
            this.addQuery(queryName);
        });
        this.setState({
            bindings,
        });
    }
    public componentWillUnmount() {
        this.isUnmounted = true;
        Object.keys(this.props.queries).map((queryName) => {
            this.removeQuery(queryName);
        });
    }
    public render() {
        return React.createElement(this.props.component, this.state.bindings);
    }
    protected addQuery(queryName: string, vars?: any) {
        this.props.client.live(
            this.props.queries[queryName].query,
            this.props.queries[queryName].vars).then((qResult) => {
                if (this.isUnmounted) {
                    return;
                }
                this.queries[queryName] = qResult;
                this.queries[queryName].onemitter.on((data: any) => {
                    if (this.isUnmounted) {
                        return;
                    }
                    this.setState((state) => {
                        state.bindings[queryName] = data;
                        return state;
                    });
                });
            }).catch((e) => {
                console.error(e);
                setTimeout(() => {
                    if (this.isUnmounted) {
                        return;
                    }
                    this.addQuery(queryName, vars);
                }, 1000);
            });
    }
    protected removeQuery(queryName: string) {
        if (this.queries[queryName]) {
            this.queries[queryName].remove();
        }
    }
}
