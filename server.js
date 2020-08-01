// DEPENDENCIES
var express = require("express");
var path = require("path");
var fs = require("fs");

// EXPRESS CONFIGURATION
var app = express();
var PORT = process.env.PORT || 9999;

app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());

// ROUTES
// >> API ROUTES
app.get("/api/notes", function(req, res){
    let notesJSON = fs.readFileSync("db/db.json") ||[];
    if(notesJSON){
      res.json(JSON.parse(notesJSON));
    }
});

// Saves New Note
app.post("/api/notes", function(req, res){
  //Retrieves the last id from the id.json file
    // let retrieveMasterID = JSON.parse(fs.readFileSync("db/db.json")) || 0;
//    console.log('retrieve')
//     console.log(retrieveMasterID)
  //Retrieves the stored notes array from the db.json file
    let updatedNotesArray = JSON.parse(fs.readFileSync("db/db.json")) || [];
  //Gets the new note information from the request body on the /notes page
    let note = req.body;
    const lastIndex = updatedNotesArray.length -1
  //Uses the retrieved master id to create a unique id for the new note
    note.id = updatedNotesArray[lastIndex].id + 1;
  //Updates the masterID object with the new note's ID
    // masterID = {"masterID": note.id};
  //Adds the new note to the saved notes array
    updatedNotesArray.push(note);
  //Saves the new notes array to the db.json file (overwrites old file)
    fs.writeFileSync("db/db.json", JSON.stringify(updatedNotesArray));
  //Saves the updated masterID to the id.json file (overwrites old file)
    // fs.writeFileSync("db/db.json", JSON.stringify(masterID));
  //console.log success

  res.json({success:true, data: updatedNotesArray, status:200})
    // res.send("Success! Your new note has been saved to the db.json file and the master id has been updated.");
});


//Saves Edited Note
app.post("/api/notes/:id", function(req, res){
  //Retrieves the updated note information
  let editedNote = req.body;
  editedNote.id = parseInt(req.params.id);
  //Retrieves the saved notes array from the db.json file
  let notesArray = JSON.parse(fs.readFileSync("db/db.json")) ||[];
  //Loops through the notes array to find the note whose ID matches the edited note ID
  for(let i = 0; i < notesArray.length; i++){
    if(parseInt(notesArray[i].id) == editedNote.id){
      //Splices the edited note in place of the old note in the notes array
      notesArray.splice(i, 1, editedNote);
      //Saves the updated notes array to the db.json file (overwrites old file)
      fs.writeFileSync("db/db.json", JSON.stringify(notesArray));
    }
  }
  //console.log success
  console.log("Successful edit! The db.json file has been updated.");
  res.json(JSON.parse(fs.readFileSync("db/db.json")));
});

  app.delete("/api/notes/:id", function(req, res){
    //Retrieves the selected note ID from the request parameters placeholder ":/id"
    let selectedID = req.params.id;
    //Retrieves the saved notes array from the db.json file
    let notesArray = JSON.parse(fs.readFileSync("db/db.json")) ||[];
    //Loops through the notes array to find the note whose ID matches the selected ID
    for(let i = 0; i < notesArray.length; i++){
      if(parseInt(notesArray[i].id) == selectedID){
        //Splices the selected note out of the saved notes array
        notesArray.splice(i, 1);
        //Saves the new notes array (minus the deleted note) to the db.json file (overwrites old file)
        fs.writeFileSync("db/db.json", JSON.stringify(notesArray));
      }
    }
    //console.log success
    console.log("Successful deletion! The db.json file has been updated.");
    res.json(JSON.parse(fs.readFileSync("db/db.json")));
  });

// >> HTML ROUTES
app.get("/notes", function(req, res) {
  res.sendFile(path.join(__dirname, "/public/notes.html"));
});

// If no matching route is found default to home
app.get("*", function(req, res) {
  res.sendFile(path.join(__dirname, "/public/index.html"));
});

// LISTENER to start the server
app.listen(PORT, function() {
  console.log("App listening on PORT: " + PORT);
});