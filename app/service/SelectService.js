import admin from "firebase-admin";
import StringHelper from "../helpers/StringHelper";

export default class SelectService {
  static getDataForSelect(
    db,
    collection,
    selectedFields,
    wheres,
    orderBys,
    callback
  ) {
    debugger;

    console.log(
      "getData (collection, selectedFields, wheres):",
      collection,
      selectedFields,
      wheres
    );
    var ref = db.ref(collection);
    let results = {
      queryType: "SELECT_STATEMENT",
      path: collection,
      orderBys: orderBys,
      firebaseListener: ref
    };
    if (!wheres) {
      //unfiltered query, grab whole collection
      this.grabCollectionAndFilterLocally(
        db,
        collection,
        selectedFields,
        results => {
          callback(results);
        }
      );
    } else {
      let mainWhere = wheres[0];
      if (mainWhere.error && mainWhere.error === "NO_EQUALITY_STATEMENTS") {
        //no filterable wheres, grab all & filter on client
        ref.on("value", snapshot => {
          results.payload = this.filterWheresAndNonSelectedFields(
            snapshot.val(),
            wheres,
            selectedFields
          );
          return callback(results);
        });
      } else {
        ref
          .orderByChild(mainWhere.field)
          .equalTo(mainWhere.value)
          .on("value", snapshot => {
            results.payload = this.filterWheresAndNonSelectedFields(
              snapshot.val(),
              wheres,
              selectedFields
            );
            console.log("select results: ", results);

            return callback(results);
          });
      }
    }
  }

  static grabCollectionAndFilterLocally(
    db,
    collection,
    selectedFields,
    callback
  ) {
    if (db.firestoreEnabled) {
      let results = db.collection(collection).get().onSnapshot(snap => {
        debugger;
        console.log(snap);
      });
    } else {
      ref.on("value", snapshot => {
        results.payload = snapshot.val();
        if (selectedFields) {
          results.payload = this.removeNonSelectedFieldsFromResults(
            results.payload,
            selectedFields
          );
        }
        return callback(results);
      });
    }
  }

  static filterWheresAndNonSelectedFields(results, wheres, selectedFields) {
    if (wheres.length > 1) {
      results = this.filterResultsByWhereStatements(results, wheres.slice(1));
    }
    if (selectedFields) {
      results = this.removeNonSelectedFieldsFromResults(
        results,
        selectedFields
      );
    }
    return results;
  }

  static removeNonSelectedFieldsFromResults(results, selectedFields) {
    if (!results || !selectedFields) {
      return results;
    }
    Object.keys(results).forEach(function(objKey, index) {
      if (typeof results[objKey] !== "object") {
        if (!selectedFields[objKey]) {
          delete results[objKey];
        }
      } else {
        Object.keys(results[objKey]).forEach(function(propKey, index) {
          if (!selectedFields[propKey]) {
            delete results[objKey][propKey];
          }
        });
      }
    });
    return Object.keys(results).length === 1
      ? results[Object.keys(results)[0]]
      : results;
  }

  static filterResultsByWhereStatements(results, whereStatements) {
    if (!results) {
      return null;
    }
    let returnedResults = {};
    let nonMatch = {};
    for (let i = 0; i < whereStatements.length; i++) {
      let indexOffset = 1;
      let where = whereStatements[i];
      const that = this;
      Object.keys(results).forEach(function(key, index) {
        let thisResult = results[key][where.field];
        if (!that.conditionIsTrue(thisResult, where.value, where.comparator)) {
          nonMatch[key] = results[key];
        }
      });
    }
    if (nonMatch) {
      Object.keys(results).forEach(function(key, index) {
        if (!nonMatch[key]) {
          returnedResults[key] = results[key];
        }
      });
      return returnedResults;
    } else {
      return results;
    }
  }

  static conditionIsTrue(val1, val2, comparator) {
    switch (comparator) {
      case "=":
        return this.determineEquals(val1, val2);
      case "!=":
        return !this.determineEquals(val1, val2);
      case "<=":
      case "<":
      case ">=":
      case ">":
        return this.determineGreaterOrLess(val1, val2, comparator);
      case "like":
        return StringHelper.determineStringIsLike(val1, val2);
      case "!like":
        return !StringHelper.determineStringIsLike(val1, val2);
      default:
        throw "Unrecognized comparator: " + comparator;
    }
  }

  static determineEquals(val1, val2) {
    val1 = typeof val1 == "undefined" || val1 == "null" ? null : val1;
    val2 = typeof val2 == "undefined" || val2 == "null" ? null : val2;
    return val1 === val2;
  }

  static determineGreaterOrLess(val1, val2, comparator) {
    let isNum = false;
    if (isNaN(val1) || isNaN(val2)) {
      if (isValidDate(val1) && isValidDate(val2)) {
        return executeDateComparison(val1, val2, comparator);
      }
    } else {
      isNum = true;
    }
    switch (comparator) {
      case "<=":
        return isNum ? val1 <= val2 : val1.length <= val2.length;
      case ">=":
        return isNum ? val1 >= val2 : val1.length >= val2.length;
      case ">":
        return isNum ? val1 > val2 : val1.length < val2.length;
      case "<":
        return isNum ? val1 < val2 : val1.length < val2.length;
    }
  }
}
