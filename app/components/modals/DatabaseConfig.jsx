import React from "react";
import FirebaseService from "../../service/FirebaseService";
import { inject, observer } from "mobx-react";

const DatabaseConfig = ({
  store,
  handleFile,
  closeModal,
  firestoreEnabled
}) => {
  const currentDatabase = store.currentDatabase;
  const save = () => {
    let database = store.currentDatabase;
    let title = document.getElementById("db-title-input").value;
    let firestoreToggle = document.getElementById("firestore-toggle-input")
      .checked;
    title = title ? title : store.currentDatabase.title;
    database.title = title;
    if (!store.newDb || !store.newDb.data) {
      store.modal = null;
      database.firestoreEnabled = firestoreToggle;
      store.updateDatabase(database);
      store.firestoreEnabled = firestoreToggle;
      return;
    }

    let path = store.newDb.path;
    path = path.substring(path.lastIndexOf("/") + 1);
    database.serviceKey = serviceKey;
    database.url = "https://" + serviceKey.project_id + ".firebaseio.com";
    database.path = path;
    let errMsg = FirebaseService.databaseConfigInitializes(database)
      ? null
      : "Something went wrong with your DB config file. It should look something like: myDatabaseName-firebase-adminsdk-4ieef-1521f1bc13.json";
    if (errMsg) {
      alert(errMsg);
    } else {
      store.updateDatabase(database);
      store.modal = null;
    }
  };

  const clearNewDb = () => {
    store.newDb = { data: null };
  };

  const toggleFirestore = () => {
    store.firestoreEnabled = !store.firestoreEnabled;
  };

  return (
    <div className="DatabaseConfig">
      <div className="col-md-auto">
        <h2>DB: {currentDatabase.title}</h2> <br />
        <div className="nameEdit">
          <h4>Name:</h4>
          <input
            type="text"
            id="db-title-input"
            defaultValue={currentDatabase.title}
          />{" "}
          <br />
          <br />
        </div>
        <div className="serviceAcctEdit">
          <button onClick={handleFile} className="bt white">
            <i className="fa fa-file-text-o" /> New Key
          </button>
          {store.newDb && store.newDb.path
            ? <div>
                New Service Account:{" "}
                <span className="detailText">
                  <br />
                  {store.newDb.path}
                </span>
              </div>
            : <div>
                Current Service Account:{" "}
                <span className="detailText">
                  <br />
                  {currentDatabase.path}
                </span>
              </div>}
        </div>
        <div className="firestore-toggle">
          <label className="switch">
            <input
              type="checkbox"
              id="firestore-toggle-input"
              defaultChecked={firestoreEnabled}
            />
            <span className="slider" />
          </label>
          <span> Cloud Firestore</span>
        </div>{" "}
        <br />
        <button className="bt blue" onClick={save}>
          Save
        </button>
        <button className="bt red" onClick={closeModal}>
          Cancel
        </button>
        <span className="switch-container" />
      </div>
    </div>
  );
};

export default DatabaseConfig;
