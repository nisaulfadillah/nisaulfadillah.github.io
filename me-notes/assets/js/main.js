const body = document.body;
const addDeleteBtn = document.querySelector('#addDeleteBtn');

// add note page UI
const addNotePage = document.querySelector('#addNotePage');
const closeAddNoteBtn = document.querySelector('#closeAddNoteBtn');
const addNoteForm = document.querySelector('#addNoteForm');
const successIcon = document.querySelector('#successIcon');

// note input
const noteTitle = document.querySelector('#noteTitle');
const noteText = document.querySelector('#noteText');

// note UI
const note = document.querySelector('#note');
const closeNoteBtn = document.querySelector('#closeNoteBtn');
let noteItems;

// database
let db;

// delete mode
let id;
let timer = 0;
let deleteModeStatus = false;
let noteSelected = [];

// control the overflow of body element
function bodyOverflow() {
  if (!body.classList.contains('overflow-hidden')) {
    body.classList.add('overflow-hidden');
  } else {
    body.classList.remove('overflow-hidden');
  }
}

/********************
 * DISPLAY ADD NOTE *
 ********************/

function displayAddNote() {
  if (!deleteModeStatus) {
    addNotePage.classList.remove('hidden');
    addDeleteBtn.classList.add('hidden');

    // resize add note
    addNotePage.classList.add('md:w-3/4');
    addNotePage.classList.add('md:h-3/4');
    addNotePage.classList.add('lg:w-1/2');
    addNotePage.classList.remove('md:w-28');
    addNotePage.classList.remove('md:h-28');
    addNotePage.classList.remove('lg:w-32');
    addNotePage.classList.remove('lg:h-32');
    addNotePage.classList.remove('lg:w-36');
    addNotePage.classList.remove('lg:h-36');
    addNotePage.classList.remove('md:rounded-full');

    // set body overflow to hidden
    bodyOverflow();

    // show add note form & close add note button
    // remove success icon
    addNoteForm.classList.remove('hidden');
    closeAddNoteBtn.classList.remove('hidden');
    successIcon.classList.add('hidden');
  } else {
    deleteNote();
  }
}

addDeleteBtn.onclick = displayAddNote;

// close add note page
function closeAddNote() {
  addNotePage.classList.add('hidden');
  addDeleteBtn.classList.remove('hidden');

  // remove overflow hidden from body
  bodyOverflow();
}

closeAddNoteBtn.onclick = closeAddNote;

/***************************
 * DATABASE INITIALIZATION *
 ***************************/

function dbInit() {
  const request = indexedDB.open('notes_db', 1);

  request.onerror = () => {
    console.log('Database failed to open')
  };

  request.onupgradeneeded = e => {
    const db = e.target.result;
    const objectStore = db.createObjectStore('notes_os', { keyPath: 'id', autoIncrement: true });

    objectStore.createIndex('noteTitle', 'noteTitle', {unique: false});
    objectStore.createIndex('noteText', 'noteText', {unique: false});
    objectStore.createIndex('noteDate', 'noteDate', {unique: false});
  };

  request.onsuccess = () => {    
    db = request.result;
    displayNoteList();
  };
}

dbInit();

/************
 * ADD NOTE *
 ************/

function addNote(e) {
  e.preventDefault();
  
  // get current date
  const date = new Date();
  let noteDate = date.toDateString().split(' ');
  noteDate = `${noteDate[1]} ${noteDate[2]}, ${noteDate[3]}`;

  // collect the required data
  const newItem = {
    noteTitle: noteTitle.value,
    noteText: noteText.value,
    noteDate: noteDate 
  };

  // store data to database
  const transaction = db.transaction(['notes_os'], 'readwrite');
  const objectStore = transaction.objectStore('notes_os');
  objectStore.add(newItem);

  transaction.oncomplete = () => {
    // resize add note
    addNotePage.classList.remove('md:w-3/4');
    addNotePage.classList.remove('md:h-3/4');
    addNotePage.classList.remove('lg:w-1/2');
    addNotePage.classList.add('md:w-28');
    addNotePage.classList.add('md:h-28');
    addNotePage.classList.add('lg:w-32');
    addNotePage.classList.add('lg:h-32');
    addNotePage.classList.add('lg:w-36');
    addNotePage.classList.add('lg:h-36');
    addNotePage.classList.add('md:rounded-full');

    // hide add note form & add note close button
    // show success icon
    addNoteForm.classList.add('hidden');
    closeAddNoteBtn.classList.add('hidden');
    successIcon.classList.remove('hidden');

    // empty add note from for next session
    noteTitle.value = '';
    noteText.value = '';

    // update note list
    displayNoteList();

    // close add note page after 1s
    const ONE_SECOND = 1000;
    setTimeout(closeAddNote, ONE_SECOND);
  };

  transaction.onerror = () => {
    console.log('Transaction not opened due to error');
  };
}

addNoteForm.onsubmit = addNote;

/*********************
 * DISPLAY NOTE LIST *
 *********************/

function displayNoteList() {
  const noteList = document.querySelector('#noteList');

  // clear note list to avoid duplication
  noteList.innerHTML = '';

  // open transaction
  const transaction = db.transaction('notes_os');
  const objectStore = transaction.objectStore('notes_os');

  objectStore.openCursor().onsuccess = e => {
    const cursor = e.target.result;

    // display note list
    if (cursor) {
      const article = document.createElement('article');

      // limit noteTitle
      let noteTitle = cursor.value.noteTitle;
      if (noteTitle.length >= 34) {
        noteTitle = noteTitle.slice(0, 33);
        noteTitle += '...';
      }

      article.id = 'noteItem';
      article.setAttribute('class', 'bg-gray-200 p-4 rounded hover:bg-gray-200 cursor-pointer relative select-none lg:select-auto');
      article.setAttribute('note-id', cursor.value.id);
      article.innerHTML = `
        <h2 class="text-xl font-bold leading-tight mb-1">${noteTitle}</h2>
        <div>${cursor.value.noteDate}</div>`;

      // layer for delete mode
      const layer = document.createElement('div');
      layer.setAttribute('class', 'absolute top-0 left-0 h-full w-full');
      article.appendChild(layer);

      noteList.appendChild(article);
      cursor.continue();
    }

    // add event listener to note list item
    noteItems = document.querySelectorAll('#noteItem');
    for (const noteItem of noteItems) {
      noteItem.onclick = displayNote;
    }

    // delete mode
    for (const item of noteItems) {
      item.onmousedown = item.ontouchstart = noteItemStart;
      item.onmouseup = item.ontouchend = item.ontouchmove = noteItemEnd;
    }
  }
}

/****************
 * DISPLAY NOTE *
 ****************/

function displayNote(e) {
  if (!deleteModeStatus) {
    // set overflow hidden to body
    bodyOverflow();

    // double scrollbar fix
    body.classList.remove('md:overflow-y-scroll');

    // request note data by note id
    const noteId = Number(e.currentTarget.getAttribute('note-id'));
    const transaction = db.transaction('notes_os');
    const objectStore = transaction.objectStore('notes_os');
    const request = objectStore.get(noteId);

    request.onsuccess = () => {
      const noteInner = document.querySelector('#noteInner');

      noteInner.innerHTML = `
        <h1 class="font-bold text-xl lg:text-2xl mb-1">${request.result.noteTitle}</h1>
        <div class="mb-4">${request.result.noteDate}</div>
        <div class="whitespace-pre-wrap">${request.result.noteText}</div>`;

      // display note
      // note should'nt be displayed if add note page appear
      if (addNotePage.classList.contains('hidden')) {
        note.classList.remove('hidden');
      }
    };
  }
}

/**************
 * CLOSE NOTE *
 **************/

function closeNote() {
  note.classList.add('hidden');

  // remove overflow hidden from body
  bodyOverflow();

  // remove double scrollbar fix
  body.classList.add('md:overflow-y-scroll');
}

closeNoteBtn.onclick = closeNote;

/***************
 * DELETE MODE *
 ***************/
// invoke when user left click mouse
// or touch the screen (mobile)
function noteItemStart(e) {
  const ONE_HUNDRED_MILLISECONDS = 100;
  id = setInterval(() => {
    timer++

    // after 1s holding
    if (timer === 5) {
      deleteModeStatus = true;
      deleteMode(e);
      noteItemEnd();
    }
  }, ONE_HUNDRED_MILLISECONDS);
}

// invoke when user finish left click mouse,
// lift finger off the screen, or 
// slide finger across the screen
function noteItemEnd() {
  clearInterval(id);
  timer = 0;
}

function deleteMode(e) {
  addDeleteBtn.innerHTML = '<i class="fa-solid fa-trash text-2xl"></i>';

  // initially select note
  e.target.parentNode.classList.add('bg-red-300');
  e.target.parentNode.classList.remove('hover:bg-gray-200');
  noteSelected.push(`no-${e.target.parentNode.getAttribute('note-id')}-te`);
  
  // select or deselect note
  for (const item of noteItems) {
    item.addEventListener('mousedown', selectDeselectNote);
  }
}

function selectDeselectNote(e) {
  const noteItem = e.target.parentNode;

  // the prefix sufix used to make sure every note id is pushed successfuly
  const noteId = `no-${noteItem.getAttribute('note-id')}-te`;
  const noteSelectedString = noteSelected.toString();

  if (!noteItem.classList.contains('bg-red-300')) {
    noteItem.classList.add('bg-red-300');
    noteItem.classList.remove('hover:bg-gray-200');

    // push note id to noteSelected but also avoid note id duplication
    if (!noteSelectedString.includes(noteId)) {
      noteSelected.push(noteId);
    }
  } else {
    noteItem.classList.remove('bg-red-300');
    noteItem.classList.add('hover:bg-gray-200');

    // remove note id
    const index = noteSelected.indexOf(noteId);
    noteSelected.splice(index, 1);

    // disable delete mode if there's no note selected
    if (noteSelected.length === 0) {
      addDeleteBtn.innerHTML = '<i class="fa-solid fa-plus text-3xl"></i>';

      // remove select deselect event listener
      for (const item of noteItems) {
        item.removeEventListener('mousedown', selectDeselectNote);
      }

      // make sure deleteModeStatus stil true 
      // when displayNote() invoked
      // to avaid note opened
      const THREE_HUNDRED_MILLISECONDS = 300;
      setTimeout(() => deleteModeStatus = false, THREE_HUNDRED_MILLISECONDS);
    }
  }
}

// delete note based on selected note
function deleteNote() {
  let transaction = db.transaction(['notes_os'], 'readwrite'); 
  let objectStore = transaction.objectStore('notes_os'); 
  
  for (let noteId of noteSelected) {
    // remove prefix and sufix
    // convert note id to number data type
    noteId = noteId.replace('no-', '');
    noteId = noteId.replace('-te', '');
    noteId = Number(noteId);
    
    objectStore.delete(noteId);
  }

  addDeleteBtn.innerHTML = '<i class="fa-solid fa-plus text-3xl"></i>';
  deleteModeStatus = false;
  displayNoteList();
}

/****************
 * OFFLINE MODE *
 ****************/

// register service worker
if ('serviceWorker' in navigator) {
  navigator.serviceWorker
           .register('assets/js/sw.js')
           .then(() => console.log('Service worker registered'));
}