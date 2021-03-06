import React = require("react");
import { IMembraClient, IQuery, IQueryResult } from "membra";
type renderFn<T> = (data: T) => JSX.Element | null;
export interface IProps<T> {
    query: IQuery<T>;
    vars?: any;
    renderFetched: renderFn<T>;
    client: IMembraClient;
    [index: string]: any;
}
interface IState {
    bindings: IBindings;
}
interface IBindings { [index: string]: any; };
export default class Container extends React.Component<IProps<any>, IState> {
    protected query: IQueryResult<any>;
    protected isUnmounted = false;
    public componentWillMount() {
        const bindings: IBindings = {};
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
        this.addQuery(this.props.vars);
        this.setState({
            bindings,
        });
    }
    public componentWillReceiveProps(nextProps: IProps<any>) {
        let isChanged = false;
        if (nextProps.vars === this.props.vars) {
            return;
        }
        if (!this.props.vars && nextProps.vars || this.props.vars && !nextProps.vars) {
            isChanged = true;
        } else {
            Object.keys(nextProps.vars).map((varName) => {
                if (this.props.vars[varName] !== nextProps.vars[varName]) {
                    isChanged = true;
                }
            });
        }
        if (isChanged) {
            this.removeQuery();
            this.addQuery(nextProps.vars);
        }
    }
    public componentWillUnmount() {
        this.isUnmounted = true;
        this.removeQuery();
    }
    public render() {
        return this.props.renderFetched(this.state.bindings);
    }
    protected addQuery(vars: any) {
        this.props.client.live(
            this.props.query,
            vars).then((qResult) => {
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
                    this.addQuery(this.props.vars);
                }, 1000);
            });
    }
    protected removeQuery() {
        if (this.query) {
            this.query.remove();
        }
    }
}
