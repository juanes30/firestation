import admin from "firebase-admin";
import StringHelper from "../../app/helpers/StringHelper";
import FirebaseService from "./FirebaseService";

export default class UpdateService {
  static updateFields(savedDatabase, path, object, fields) {
    if (!fields || !object) {
      return;
    }

    console.log("insertData: ",object);
    console.log("path:",path);
    console.log("fields:",fields);
    console.log("\n\n")

    const app = FirebaseService.startFirebaseApp(savedDatabase);
    const db = savedDatabase.firestoreEnabled ? app.firestore() : app.database();
    return savedDatabase.firestoreEnabled
      ? this.updateFirestoreFields(db, path, object, fields)
      : this.updateRealtimeFields(db, path, object, fields);
  }

  static updateRealtimeFields(db, path, object, fields) {
    db.ref(path).once(
      "value",
      snapshot => {
        let updateObject = this.getUpdateObject(object, fields, snapshot.val());
        return db.ref(path).set(updateObject);
      },
      errorObject => {
        console.log("UPDATE ERROR: " + errorObject.code);
      }
    );
  }

  static updateFirestoreFields(db, path, object, fields) {
    let [col, doc] = path.split(/\/(.+)/); // splits only on first '/' char
    console.log("path:", path);
    console.log("col:", col);
    console.log("doc:", doc);

    console.log("new data:", object);

    return db
      .collection(col)
      .doc(doc)
      .set(object)
      .then(() => {
        console.log(`doc @ path ${path} successfully updated`);
      })
      .catch(error => {
        console.error(`error updating doc @ ${path} :`, error);
      });
  }

  static getUpdateObject(object, fields, newObject) {
    let updateObject = newObject || {};
    fields.forEach(field => {
      let val = object[field];
      if (typeof val === "undefined") {
        return console.error(`Cannot set firebase key ${field} to undefined`);
      }
      if (field.includes("/")) {
        let keyValSplit = field.split("/");
        updateObject[keyValSplit[0]] = results[keyValSplit[0]] || {};
        updateObject[keyValSplit[0]][keyValSplit[1]] = object[field];
      } else {
        updateObject[field] = object[field];
      }
    });
    return updateObject;
  }

  static deleteObject(savedDatabase, path) {
    const app = FirebaseService.startFirebaseApp(savedDatabase);
    const db = savedDatabase.firestoreEnabled ? app.firestore() : app.database();
    savedDatabase.firestoreEnabled
      ? this.deleteFirestoreData(db, path)
      : db.ref(path).remove();
  }

  static deleteFirestoreData(db, path) {
    let [collection, doc] = path.split(/\/(.+)/); //splits on first "/"
    doc.includes("/")
      ? this.deleteFirestoreField(db, collection, doc)
      : this.deleteFirestoreDoc(db, collection, doc);
  }

  static deleteFirestoreDoc(db, collection, doc) {
    console.log(`delete, col: ${collection}\ndoc: ${doc}`);
    db
      .collection(collection)
      .doc(doc)
      .delete()
      .then(function() {
        console.log("Document successfully deleted!");
      })
      .catch(function(error) {
        console.error("Error removing document: ", error);
      });
  }

  static deleteFirestoreField(db, collection, docAndField) {
    let [doc, field] = docAndField.split(/\/(.+)/);
    console.log(`deleting field, ${field} from col:${collection}, doc: ${doc}`);
    db
      .collection(collection)
      .doc(doc)
      .update({
        [field]: admin.firestore.FieldValue.delete()
      });
  }

  static pushObject(savedDatabase, path, object) {
    const app = FirebaseService.startFirebaseApp(savedDatabase);
    const db = savedDatabase.firestoreEnabled ? app.firestore() : app.database();
    savedDatabase.firestoreEnabled
      ? this.createFirestoreDocument(db, path, object)
      : db.ref(path).push(object);
  }

  static createFirestoreDocument(db, path, data) {
    let [collection, docId] = path.split(/\/(.+)/);
    docId
      ? this.setFirestoreDocWithExplicitId(db, collection, docId, data)
      : this.pushFirestoreDocToGeneratedId(db, collection, data);
  }

  static setFirestoreDocWithExplicitId(db, collection, docId, data) {
    console.log(
      `setting doc ${docId} in collection ${collection}, data:`,
      data
    );
    db
      .collection(collection)
      .doc(docId)
      .set(data);
  }

  static pushFirestoreDocToGeneratedId(db, collection, data) {
    collection = collection.replace(/\/+$/, ""); //remove trailing "/"
    console.log(`pushing to collection ${collection}, data:`, data);
    db
      .collection(collection)
      .add(data)
      .then(docRef => {
        console.log("Document written with ID: ", docRef.id);
      })
      .catch(error => {
        console.error("Error adding document: ", error);
      });
  }

  static set(db, path, data) {
    if (db.api && db.api.Firestore) {
      let [collection, docId] = path.split(/\/(.+)/);
      docId.includes("/")
        ? this.setFirestoreProp(db, path, data)
        : this.setFirestoreDocWithExplicitId(db, collection, docId, data);
    } else {
      db.ref(path).set(data);
    }
  }

  static setObjectProperty(db, path, value) {
    value = StringHelper.getParsedValue(value);
    if (db.api && db.api.Firestore) {
      this.setFirestoreProp(db, path, value);
    } else {
      db.ref(path).set(value);
    }
  }

  static setFirestoreProp(db, path, value) {
    path = StringHelper.replaceAll(path, "/", ".");
    let [collection, docAndfield] = path.split(/\.(.+)/);
    let [docId, field] = docAndfield.split(/\.(.+)/);
    console.log(`setting document prop ${field} @ ${collection}/${docId}`);
    db
      .collection(collection)
      .doc(docId)
      .update({
        [field]: value
      });
  }
}
