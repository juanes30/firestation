import React, { Component } from "react";
import PropTypes from "prop-types";
import { observer } from "mobx-react";

import store from "../stores/Store";
import Workbook from "./Workbook";
import SideMenu from "./SideMenu";
import QueryHistory from "./QueryHistory";
import QueryResults from "./QueryResults";
import ButtonRow from "./ButtonRow";

class Workstation extends Component {
  state = {
    savedQueriesIsOpen: true,
    modal: null,
    resultsOpen: true
  };

  componentDidMount() {
    if (!store.databases[0]) store.modal.set("newDB");
  }

  execute = () => {
    store.focus.set(true); //refocus after execute
    const selectedText = store.selectedText.get();
    let query = store.query.get();
    if (selectedText && query.includes(selectedText)) {
      query = selectedText;
    }
    this.props.executeQuery(query);
  };

  saveQuery = () => {
    store.modal.set("saveQuery");
  };

  toggleSavedQueries = () => {
    this.setState({ savedQueriesIsOpen: !this.state.savedQueriesIsOpen });
  };

  setWorkstationState = (key, val) => {
    this.setState({ [key]: val });
  };

  render() {
    // eslint-disable-next-line
    const query = store.query.get(); //updates children
    // eslint-disable-next-line
    const update = store.forceUpdate.get(); // hack

    const results = store.results;

    if (!store.databases[0]) {
      return <span />;
    }
    let payloadSize;
    if (results && !results.error && results.statementType) {
      if (results.payload === Object(results.payload)) {
        payloadSize = Object.keys(results.payload).length;
      } else if (results.payload === null) {
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
                {store.firestoreEnabled.get()
                  ? "Cloud Firestore"
                  : "Realtime Database"}
              </a>
              {/* <img src={RealtimeIcon}/> */}
              <div className="dropdown-menu">
                <a
                  className="dropdown-item"
                  onClick={() => store.toggleFirestore(false)}
                >
                  Realtime Database
                </a>
                <a
                  className="dropdown-item"
                  onClick={() => store.toggleFirestore(true)}
                >
                  Cloud Firestore
                </a>
              </div>
            </div>
          </div>
          {/*{store.rootKeys &&
          <div>Root Keys: <ObjectTree value={store.rootKeys} 
          level={0} noValue={true} /><br /></div>}*/}
          <Workbook {...props} height="100%" />
          <ButtonRow
            {...props}
            executingQuery={store.executingQuery.get()}
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
            {results && results.error && (
              <h4 className="queryError">
                {results.error.message || results.error}
                <br />
                {results.error.stack}
              </h4>
            )}
            {results && payloadSize !== undefined && (
              <QueryResults {...props} />
            )}
            {store.queryHistoryIsOpen.get() && (
              <QueryHistory history={store.getQueryHistory()} {...props} />
            )}
          </div>
        </div>
      </div>
    );
  }
}

Workstation.propTypes = {
  executeQuery: PropTypes.func,
  commit: PropTypes.func,
  cancelCommit: PropTypes.func,
  savedQueries: PropTypes.object
};

export default observer(Workstation);
