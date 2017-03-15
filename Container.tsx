import React = require("react");
import { IQuery, IQueryResult, IRelayClient } from "relay-common";
type renderFn = (data: any) => JSX.Element | null;
export interface IProps {
    query: IQuery;
    vars?: any;
    renderFetched: renderFn;
    client: IRelayClient;
    [index: string]: any;
}
interface IState {
    bindings: Bindings;
}
type Bindings = { [index: string]: any };
export default class Container extends React.Component<IProps, IState> {
    protected query: IQueryResult;
    protected isUnmounted = false;
    public componentWillMount() {
        let bindings: Bindings = {};
        Object.keys(this.props).map((propName) => {
            switch (propName) {
                case "client":
                case "component":
                case "query":
                case "vars":
                    break;
                default:
                    bindings[propName] = this.props[propName];
            }
        });
        this.addQuery();
        this.setState({
            bindings,
        });
    }
    public componentWillUnmount() {
        this.isUnmounted = true;
        this.removeQuery();
    }
    public render() {
        return this.props.renderFetched(this.state.bindings);
    }
    protected addQuery() {
        this.props.client.live(
            this.props.query,
            this.props.vars).then((qResult) => {
                if (this.isUnmounted) {
                    return;
                }
                this.query = qResult;
                this.query.onemitter.on((data: any) => {
                    if (this.isUnmounted) {
                        return;
                    }
                    this.setState((state) => {
                        Object.keys(data).map((k) => {
                            state.bindings[k] = data[k];
                        });
                        return state;
                    });
                });
            }).catch((e) => {
                console.error(e);
                setTimeout(() => {
                    if (this.isUnmounted) {
                        return;
                    }
                    this.addQuery();
                }, 1000);
            });
    }
    protected removeQuery() {
        if (this.query) {
            this.query.remove();
        }
    }
}
