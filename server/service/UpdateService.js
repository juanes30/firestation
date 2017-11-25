import admin from "firebase-admin";

export default class UpdateService {
  static updateFields(db, path, object, fields) {
    if (!fields || !object) {
      return;
    }
    const isFirestore = db.api && db.api.Firestore;
    return isFirestore
      ? this.updateFirestoreFields(...arguments)
      : this.updateRealtimeFields(...arguments);
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

  static deleteObject(db, path) {
    db.api && db.api.Firestore
      ? this.deleteFirestoreData(db, path)
      : db.ref(path).remove();
  }

  static deleteFirestoreData(db, path) {
    let [collection, doc] = path.split(/\/(.+)/); //splits on first "/"
    console.log("delete, col: " + collection + "\n doc: " + doc);
    doc.includes("/")
      ? this.deleteFirestoreField(db, collection, doc)
      : this.deleteFirestoreDoc(db, collection, doc);
  }

  static deleteFirestoreDoc(db, collection, doc) {
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
    console.log(`deleting field ${field} from doc: ${doc}`);
    db
      .collection(collection)
      .doc(doc)
      .update({
        [field]: admin.firestore.FieldValue.delete()
      });
  }

  static pushObject(db, path, object) {
    db.ref(path).push(object);
  }

  static set(db, path, object) {
    db.ref(path).set(object);
  }
}
