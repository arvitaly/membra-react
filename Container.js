"use strict";
const React = require("react");
class Container extends React.Component {
    constructor() {
        super(...arguments);
        this.isUnmounted = false;
    }
    componentWillMount() {
        let bindings = {};
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
    componentWillUnmount() {
        this.isUnmounted = true;
        this.removeQuery();
    }
    render() {
        return this.props.renderFetched(this.state.bindings);
    }
    addQuery() {
        this.props.client.live(this.props.query, this.props.vars).then((qResult) => {
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
                this.addQuery();
            }, 1000);
        });
    }
    removeQuery() {
        if (this.query) {
            this.query.remove();
        }
    }
}
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = Container;
