let $noteTitle = $("#note-title");
let $noteEditTitle = $("#edit-title"); //
let $noteText = $("#note-textarea");
let $noteEditText = $("#edit-text");
let $saveNoteBtn = $(".save-note");
let $newNoteBtn = $(".new-note");
let $noteList = $(".list-container .list-group");

// activeNote is used to keep track of the note in the textarea
let activeNote = {};

// A function for getting all notes from the db
const getNotes = function () {
  return $.ajax({
    url: "/api/notes",
    method: "GET"
  });
};

// A function for saving a note to the db
const saveNote = function (note) {
  return $.ajax({
    url: "/api/notes",
    data: note,
    method: "POST"
  });
};

// A function for editing a note from the db
const editNote = function (newNote) {
  return $.ajax({
    url: "/api/notes/" + newNote.id,
    data: newNote,
    method: "POST"
  });
};

// A function for deleting a note from the db
const deleteNote = function (id) {
  return $.ajax({
    url: "/api/notes/" + id,
    method: "DELETE"
  });
};

// If there is an activeNote, display it, otherwise render empty inputs
const renderActiveNote = function () {
  $saveNoteBtn.hide();
  //If the edit note is selected, the note area is rebuilt.
  rebuildNoteArea();

  if (activeNote.id) {
    $noteTitle.attr("readonly", true);
    $noteText.attr("readonly", true);
    $noteTitle.val(activeNote.title);
    $noteText.val(activeNote.text);
  } else {
    $noteTitle.attr("readonly", false);
    $noteText.attr("readonly", false);
    $noteTitle.val("");
    $noteText.val("");
  }
};

//Function for displaying the selected note and allowing it to be edited
const saveEditNote = function (note) {
  activeNote = note;
  let originalNote = note;
  originalNote.id = parseInt(note.id);
  $("#note-area").empty();
  $noteList.on("click", ".list-group-item", handleNoteView);
  let newTitle = $("<input>").attr({ class: "note-title", maxlength: "28", type: "text", id:"edit-title" }).val(note.title).appendTo("#note-area");
  let newText = $("<textarea>").attr({ class: "note-textarea", id:"edit-text"}).val(note.text).appendTo("#note-area");
  const updateButton = $("<button>").attr({ type: "button", class: "btn btn-success", id: "update-note-button" }).css({ float: "left", clear: "both" }).text("Update Note").appendTo("#note-area");
  updateButton.click(function () {
    let newNote = {
      title: newTitle.val(),
      text: newText.val(),
      id: originalNote.id
    };    
    processEditNote(newNote);
  });
};

//Function for rebuilding the note area after note edit
var rebuildNoteArea = function(){
  $("#note-area").empty();
  $("<input>").attr({ class: "note-title", maxlength: "28", placeholder:"Note Title", type: "text", id: "note-title"}).appendTo("#note-area");
  $("<textarea>").attr({ class: "note-textarea", placeholder:"Note Text", id: "note-textarea"}).appendTo("#note-area");
  $noteTitle = $("#note-title");
  $noteText = $("#note-textarea");
  $noteTitle.on("keyup", handleRenderSaveBtn);
  $noteText.on("keyup", handleRenderSaveBtn);
};

//Function for processing and saving the edited note after
//the Update Note button has been clicked
var processEditNote = function(newNote){
    activeNote = newNote;
    editNote(newNote).then(function(data){;
    rebuildNoteArea();
    getAndRenderNotes();
    renderActiveNote(activeNote);
  });
};

// Get the note data from the inputs, save it to the db and update the view
var handleNoteSave = function () {
  var newNote = {
    title: $noteTitle.val(),
    text: $noteText.val()
  };

  saveNote(newNote).then(function (data) {
    console.log(data)
    getAndRenderNotes();
    renderActiveNote();
  });
};

// When the edit note icon is clicked,  
// the edit note functions are set in motion
var handleNoteEdit = function (event) {
  event.stopPropagation();

  var note = $(this)
    .parent(".list-group-item")
    .data();

    saveEditNote(note);
};

// Delete the clicked note
var handleNoteDelete = function (event) {
  // prevents the click listener for the list from being called when the button inside of it is clicked
  event.stopPropagation();

  var note = $(this)
    .parent(".list-group-item")
    .data();

    if (activeNote.id === note.id) {
    activeNote = {};
  };

  deleteNote(note.id).then(function () {
    getAndRenderNotes();
    renderActiveNote();
  });
};

// Sets the activeNote and displays it
var handleNoteView = function () {
  activeNote = $(this).data();
  renderActiveNote();
};

// Sets the activeNote to and empty object and allows the user to enter a new note
var handleNewNoteView = function () {
  activeNote = {};
  renderActiveNote();
};

// If a note's title or text are empty, hide the save button
// Or else show it
var handleRenderSaveBtn = function () {
  if (!$noteTitle.val().trim() || !$noteText.val().trim()) {
    $saveNoteBtn.hide();
  } else {
    $saveNoteBtn.show();
  }
};

// Render's the list of note titles
var renderNoteList = function (notes) {
  $noteList.empty();

  var noteListItems = [];

  for (var i = 0; i < notes.length; i++) {
    var note = notes[i];

    var $li = $("<li class='list-group-item'>").data(note);
    var $span = $("<span>").attr({id:"note-span"}).text(note.title);
    var $delBtn = $(
      "<i class='fas fa-trash-alt float-right text-danger delete-note'>"
    );
    var $editBtn = $(
      "<i class='far fa-edit float-right text-success edit-note' style='padding-right: 10px'>"
    );

    $li.append($span, $delBtn, $editBtn);
    noteListItems.push($li);

    $noteTitle = $("#note-title");
    $noteText = $("#note-textarea");
    $saveNoteBtn = $(".save-note");
    $newNoteBtn = $(".new-note");
    $noteList = $(".list-container .list-group");
  }

  $noteList.append(noteListItems);
};

// Gets notes from the db and renders them to the sidebar
var getAndRenderNotes = function () {
  getNotes().then(function (data) {
    renderNoteList(data);
  });
};

$saveNoteBtn.on("click", handleNoteSave);
$noteList.on("click", ".list-group-item", handleNoteView);
$newNoteBtn.on("click", handleNewNoteView);
$noteList.on("click", ".delete-note", handleNoteDelete);
$noteList.on("click", ".edit-note", handleNoteEdit);
$noteTitle.on("keyup", handleRenderSaveBtn);
$noteText.on("keyup", handleRenderSaveBtn);

// Gets and renders the initial list of notes
getAndRenderNotes();