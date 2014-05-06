//
// For use in working with the native sqlite database
// https://wiki.appcelerator.org/display/guides/Working+with+a+SQLite+Database
//

var Data = {};

(function() {

  var self = Data;

  //
  // Data.createTable
  // ----------------
  // Example:
  // 
  // Data.createTable("my_database", "sample_data", {
  //   name: "TEXT",
  //   title: "TEXT"
  // }, callback);
  //
  
  self.createTable = function(database, table, params, callback){
    var result = false;
    var db = Ti.Database.open(database);

    // Check if the table exists
    var table_exists = db.execute('SELECT name FROM sqlite_master WHERE type="table" AND name="'+table+'"');

    if(!table_exists.isValidRow()) {
      table_exists.close();

      var str = [];
      for(var p in params) {
        str.push(p+" "+params[p].toUpperCase());
      }
      var table_string = str.join(", ");

      db.execute('CREATE TABLE IF NOT EXISTS '+table+'(id INTEGER PRIMARY KEY AUTOINCREMENT, '+table_string+');');

      Ti.API.trace("Data: Created table '"+table+"' from the database '"+database+"'.");

      if(callback){
        callback();
      };

    } else {
      // The table already exists!
      table_exists.close();

      Ti.API.trace("Data: Table '"+table+"' already exists in the '"+database+"' database.");

      if(callback){
        callback();
      };
    }
    
    db.close();

    return;
  };

  //
  // Data.dropTable
  // ----------------
  // Example:
  // 
  // Data.dropTable("my_database", "sample_data");
  //

  self.dropTable = function(database, table, callback){
    var db = Ti.Database.open(database);

    db.execute('DROP TABLE IF EXISTS '+table);
    db.close();

    Ti.API.info("Data: Dropped table '"+table+"' from the database '"+database+"'.");

    if(callback){
      callback();
    };

  };

  //
  // Data.addToTable
  // ----------------
  // Example:
  // 
  // Data.addToTable("my_database", "sample_data", {
  //   name: "TEXT",
  //   title: "TEXT"
  // }, callback);
  //

  self.addToTable = function(database, table, item, callback){
    var result = false;

    // Check to see if table exists
    var db = Titanium.Database.open(database);

    var table_exists = db.execute('SELECT name FROM sqlite_master WHERE type="table" AND name="'+table+'"');
    if(!table_exists.isValidRow()) {
      table_exists.close();

      Ti.API.info("Data: Can't add records to the table '"+table+"' because it does not exist in the database '"+database+"'.")
      Ti.API.info("Data: Please create the table first using Data.createTable('"+database+"', '"+table+"', your_params).");
    } else {
      table_exists.close();

      // Table found let's add it
      var fields = [];
      for(var f in item) {
        fields.push(f);
      };

      var values = [];
      for(var v in item) {
        if (typeof item[v] === 'string') {
            values.push('"'+item[v]+'"');
        } else {
          values.push(item[v]);
        };
      };

      // Get the count before
      var initial = db.execute('SELECT id FROM '+table);
      var initial_count = initial.rowCount
      initial.close();

      var sql = 'INSERT OR IGNORE INTO '+table+' ('+fields.join(", ")+') VALUES ('+values.join(", ")+')';

      db.execute(sql);

      // Get the count after
      var after = db.execute('SELECT id FROM '+table);
      var after_count = after.rowCount
      after.close();

      var added = false;

      if(after_count > initial_count){
        added = true;
      };

      if(callback){
        callback({added: added})
      }
    };
    
    db.close();

    return;
  };
  
  //
  // Data.updateRecord
  // ----------------
  // Example:
  // 
  // Data.updateRecord("my_database", "sample_data", {
  //   name: "TEXT",
  //   title: "TEXT"
  // }, {
  //   id: 12345
  // });
  //
  
  self.updateRecord = function(database, table, params, requirements){
    var result = false;

    // Check to see if table exists
    var db = Titanium.Database.open(database);

    var table_exists = db.execute('SELECT name FROM sqlite_master WHERE type="table" AND name="'+table+'"');
    if(!table_exists.isValidRow()) {
      table_exists.close();

      Ti.API.info("Data: Can't update records on the table '"+table+"' because it does not exist in the database '"+database+"'.")
      Ti.API.info("Data: Please create the table first using Data.createTable('"+database+"', '"+table+"', your_params).");
    
      if(callback){
        callback();
      };

    } else {
      table_exists.close();

    // Adding params into the query
    if(params && params != {}){
        var param_string = " SET ";
        var param_array = [];

        for(var p in params) {
          if(typeof params[p] === 'string') {
            // Using split join technique to move single quote to two of them
            // We need two quotes in order to store it in mongo like this
            param_array.push(p.toString()+' = "'+params[p]+'"'); 
          } else {
            param_array.push(p.toString()+" = "+params[p]);
          };
        };

        param_string += param_array.join(", ")
      };
      
      // Adding requirements into the query
      if(requirements && requirements != {}){
        var requirement_string = " WHERE ";

        for(var r in requirements) {
          if(typeof requirements[r] === 'string') {
            requirement_string += r.toString()+" = '"+requirements[r]+"'";
          } else {
            requirement_string += r.toString()+" = "+requirements[r];
          };
        };
      };

      var sql = 'UPDATE '+table+param_string+requirement_string;
            
      db.execute(sql);

      result = true;
    };
    
    db.close();

    return result;
  };


  //
  // Data.getData()
  // ----------------
  // Example:
  // 
  // Data.getData("my_database", "sample_data", ["id"], {
  //   where: [{
  //     name: "example"
  //   }]
  // });
  //

  self.getData = function(database, table, requested_params, requirements){
    var result = []; // Initialize the result array

    // Check to see if table exists
    var db = Titanium.Database.open(database);

    var table_exists = db.execute('SELECT name FROM sqlite_master WHERE type="table" AND name="'+table+'"');
    if(!table_exists.isValidRow()) {
      table_exists.close();
      Ti.API.info("Data: Can't get data because the table '"+table+"' does not exist in the database '"+database+"'.");
      Ti.API.info("Data: Please create the table first using Data.createTable('"+database+"', '"+table+"', your_params).");
    } else {
      //table found
      
      var params = (requested_params) ? requested_params.join(", ") : "*"; // Get the params into an array


      if(requirements && requirements != {}){
        var required_params = "";

        for(var r in requirements) {
          if(r.toString() == 'where') {
            required_params += "WHERE ";

            for(var p in requirements[r]) {
              if(typeof requirements[r][p] === 'string') {
                required_params += p.toString()+" = '"+requirements[r][p]+"'";
              } else {
                required_params += p.toString()+" = "+requirements[r][p];
              };
            };
          } else {
            values.push(item[v]);
          };
        };
      };

      if(required_params){
        var db_result = db.execute('SELECT '+params+' FROM '+table+" "+required_params);
      } else {
        var db_result = db.execute('SELECT '+params+' FROM '+table);
      };

      while (db_result.isValidRow())
      {
        var item = {};

        for(var i=0; i<requested_params.length; i++){
          item[requested_params[i]] = db_result.fieldByName(requested_params[i]);
        };

        result.push(item); // Add this to the result object

        db_result.next();
      }

      db_result.close();
    };

    table_exists.close();
    db.close();

    return result;
  };
 
})();
