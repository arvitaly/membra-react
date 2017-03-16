"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const React = require("react");
;
class Container extends React.Component {
    constructor() {
        super(...arguments);
        this.isUnmounted = false;
    }
    componentWillMount() {
        const bindings = {};
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
    componentWillReceiveProps(nextProps) {
        this.removeQuery();
        this.addQuery(nextProps.vars);
    }
    componentWillUnmount() {
        this.isUnmounted = true;
        this.removeQuery();
    }
    render() {
        return this.props.renderFetched(this.state.bindings);
    }
    addQuery(vars) {
        this.props.client.live(this.props.query, vars).then((qResult) => {
            if (this.isUnmounted) {
                return;
            }
            this.query = qResult;
            this.query.onemitter.on((data) => {
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
    removeQuery() {
        if (this.query) {
            this.query.remove();
        }
    }
}
exports.default = Container;
