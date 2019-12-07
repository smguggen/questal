import React, { Component } from "react";

const Components = {};
Components.App = class extends Component {
    constructor(props) {
        super(props);
    }
    render() {
        return (<div id="app">{this.props.children}</div>)
    }
}

Components.Module = class extends Component {
    constructor(props) {
        super(props);
        this.state = {
            src: '/' + this.props.src
        }
    }
    render() {
        return (<script type="module" src={this.state.src}></script>)
    }
}

Components.Button = class extends Component {
    constructor(props) {
        super(props);
    }
    render() {
        return (<button id={this.props.id} type="button" onClick={this.props.clickEvent}>{this.props.children}</button>)
    }
}

Components.TableRow = class extends Component {
    constructor(props) {
        super(props);
    }
    render() {
        return (<tr><td>{this.props.id}</td><td>{this.props.name}</td></tr>)
    }
}

Components.Table = class extends Component {
    constructor(props) {
        super(props);
    }

    render() {
        const rows = this.props.rows.map(row => (<Components.TableRow key={row.id} id={row.id} name={row.name} />));
        return (<table id={this.props.id}><tbody>{rows}</tbody></table>)
    }
}

export default Components;
