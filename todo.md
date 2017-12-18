# Development - To Do

## Bugs
* hangs when deleting many records (this is bc of .on)

## Features
### General
* allow users to reference firestore/realtime from the other db, 
    example, from firestore db: insert into users (select * from realtime.users);
* delete a firestation db
* error messages on bad query syntax   
* build commits into history, allow user to revert back to previous data
* collapse sidebar

### Firestore
* display embedded collections when they exist within a document
* embedded docs should have an expand btn, that fetches data when clicked

### Keymap
* give shortcuts preview (ctrl+enter --> execute query, etc)
* allow users to add shortcuts to paste saved queries

### Workbook
* implement autocompletion, workbook should learn about common collections/props and use them as suggestions

### Query Translator
* javascript first, then ios or android

## Later
* implement ctrl-f : window.find like chrome