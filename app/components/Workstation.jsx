import React, { Component } from "react";
import ReactTooltip from "react-tooltip";
import { observer } from "mobx-react";

import Workbook from "./Workbook";
import SideMenu from "./SideMenu";
import QueryHistory from "./QueryHistory";
import QueryResults from "./QueryResults";
import ButtonRow from "./ButtonRow";
// import FirestoreIcon from '../assets/images/firestore_icon.png';
// import RealtimeIcon from '../assets/images/realtime_icon.png';

@observer
export default class Workstation extends Component {
  state = {
    savedQueries: null,
    savedQueriesIsOpen: true,
    modal: null,
    resultsOpen: true
  };

  componentDidMount() {
    if (!this.props.store.databases[0]) {
      this.props.store.modal = "newDB";
    }
  }

  execute = () => {
    this.props.store.focus = true; //refocus after execute
    let selectedText = this.props.store.selectedText;
    let query = this.props.store.query;
    if (selectedText && query.includes(selectedText)) {
      query = selectedText;
    }
    this.props.executeQuery(query);
  };

  saveQuery = () => {
    this.props.store.modal = "saveQuery";
  };

  deleteQuery = query => {
    this.props.store.deleteQuery;
  };

  toggleSavedQueries = () => {
    this.setState({ savedQueriesIsOpen: !this.state.savedQueriesIsOpen });
  };

  setWorkstationState = (key, val) => {
    this.setState({ [key]: val });
  };

  render() {
    const store = this.props.store;
    const query = store.query; //updates children
    if (!store.databases[0]) {
      return <span />;
    }
    let payloadSize;
    if (store.results && !store.results.error) {
      if (store.results.payload === Object(store.results.payload)) {
        payloadSize = Object.keys(store.results.payload).length;
      } else if (store.results.payload === null) {
        payloadSize = 0;
      } else {
        //primitive payload
        payloadSize = 1;
      }
    }

    const props = {
      store,
      payloadSize,
      execute: this.execute,
      resultsOpen: this.state.resultsOpen,
      setWorkstationState: this.setWorkstationState
    };

    return (
      <div className="Workstation">
        <SideMenu
          savedQueries={this.props.savedQueries}
          deleteQuery={this.deleteQuery}
          savedQueriesIsOpen={this.state.savedQueriesIsOpen}
          toggleSavedQueries={this.toggleSavedQueries}
          {...props}
        />
        <div className="workArea col-md-12">
          <div className="workstation-header">
            <div className="workstation-dbTitle">
              {store.currentDatabase.title}{" "}
            </div>
            <div className="dropdown">
              <a
                className="nav-link dropdown-toggle"
                id="navbarDropdownMenuLink"
                data-toggle="dropdown"
                aria-haspopup="true"
                aria-expanded="false"
              >
                {store.firestoreEnabled
                  ? "Cloud Firestore"
                  : "Realtime Database"}
              </a>
              {/* <img src={RealtimeIcon}/> */}
              <div className="dropdown-menu">
                {<a className="dropdown-item">Realtime Database</a>}
                {<a className="dropdown-item">Cloud Firestore</a>}
              </div>
            </div>
          </div>
          {/*{store.rootKeys &&
          <div>Root Keys: <ObjectTree value={store.rootKeys} 
          level={0} noValue={true} /><br /></div>}*/}
          <Workbook {...props} height="100%" />
          <ButtonRow
            {...props}
            executingQuery={store.executingQuery}
            saveQuery={this.saveQuery}
            commit={this.props.commit}
            cancelCommit={this.props.cancelCommit}
          />
          <br />
          <div
            className={
              this.state.resultsOpen
                ? "workstation-underWorkbook"
                : "workstation-underWorkbook resultsCollapsed"
            }
          >
            {store.results &&
              store.results.error && (
                <h4 className="queryError">
                  {store.results.error.message || store.results.error}
                  <br/>
                  {store.results.error.stack}
                  
                </h4>
              )}
            {store.results &&
              payloadSize !== undefined && <QueryResults {...props} />}
            {store.queryHistoryIsOpen && (
              <QueryHistory history={store.getQueryHistory()} {...props} />
            )}
          </div>
        </div>
      </div>
    );
  }
}
