"use strict";
const React = require("react");
class Container extends React.Component {
    constructor() {
        super(...arguments);
        this.queries = {};
        this.isUnmounted = false;
    }
    componentWillMount() {
        let bindings = {};
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
    componentWillUnmount() {
        this.isUnmounted = true;
        Object.keys(this.props.queries).map((queryName) => {
            this.removeQuery(queryName);
        });
    }
    render() {
        return React.createElement(this.props.component, this.state.bindings);
    }
    addQuery(queryName) {
        this.props.client.live(this.props.queries[queryName]).then((qResult) => {
            if (this.isUnmounted) {
                return;
            }
            this.queries[queryName] = qResult;
            this.queries[queryName].onemitter.on((data) => {
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
                this.addQuery(queryName);
            }, 1000);
        });
    }
    removeQuery(queryName) {
        if (this.queries[queryName]) {
            this.queries[queryName].remove();
        }
    }
}
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = Container;
