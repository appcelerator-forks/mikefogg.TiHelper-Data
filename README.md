TiHelper-Data
=============

An Appcelerator Titanium helper module that helps store and view data in a more manageable way.

Long story short, I kept wishing I had a better way of storing, retrieving and updating data in the sqlite database without having tons of opening and closing it all around my app.

This is the WIP result of how I wanted it to work. I love the idea of having the actual data implementation separated out into managed functions like this as it allows you to change it over time and as long as it takes in and spits out data in the same format, you're app shouldn't require major changes!

<h2>Setup</h2>

Simply include this somewhere in your app.js (or where it will be available to your entire app):

<pre><code>
Ti.include('helpers/tidata.js'); // Assuming you have it in /Resources/helpers/tidata.js
</code></pre>

<h2>Usage</h2>

There are a few available methods (and more to come as I need them or anyone else does :) ) that you can use:


<h3>Data.createTable(database_name, table_name, fields, callback)</h3>
Creates a new table as specified in the correct database and fires the callback after. If the table already exists it will do nothing, then fire the callback.

<pre><code>
Data.createTable("my_database", "sample_data", {
  id:
  name: "TEXT",
  title: "TEXT"
}, function(){
  alert("Function complete!");
});
</code></pre>
* Note here that the "id" field is created automatically and will autoincrement


<h3>Data.dropTable(database_name, table_name, callback)</h3>
Drops the table from the database (if it exists) and fires the callback

<pre><code>
Data.dropTable("my_database", "sample_data", function(){
  alert("Function complete!");
});
</code></pre>


<h3>Data.addToTable(database_name, table_name, item, callback)</h3>
Adds the new record to the database IF IT DOESN'T ALREADY EXIST. If it does exist, it will do nothing. This function returns a boolean whether or not the item was added;

<pre><code>
Data.addToTable("my_database", "sample_data", {
  name: "TEXT",
  title: "TEXT"
}, function(e){
  // e.added is a boolean stating whether this item was added or not
  alert("Item has been added: "+e.added);
});
</code></pre>


<h3>Data.updateRecord(database_name, table_name, item, requirements)</h3>
Updates the record that matches the requirements (most likely an id);

<pre><code>
Data.updateRecord("my_database", "sample_data", {
  name: "TEXT",
  title: "TEXT"
}, {
  id: 12345
});
</code></pre>


<h3>Data.getData(database_name, table_name, requested_params, requirements)</h3>
Returns the data from the table in an array of objects including the fields you ask for only that meet the requirements you pass in.

<pre><code>
Data.getData("my_database", "sample_data", ["id", "name", "title"], {
  where: [{
    name: "example"
  }]
});
</code></pre>

<h2>Known Issues and Future Improvements</h2>

1. The updateTable method should fire a callback and work similar to the addToTable function (return {updated: true}).
2. There are more use cases that I would love to build in I just can't think of them quite yet.
3. I'd like to do a lot more with getData with more than just "where" statements.
4. getData and updateRecord should be modified to handle requirements the same way (I think).

<h2>Please let me know if you'd like any additions or something isn't working!</h2>

<h2>License</h3>
Do whatever you want, however you want, whenever you want. And if you find a problem on your way, let me know so I can fix it for my own apps too :)

