const RENDER_EVENT = 'render-book';
const books = [];
const STORAGE_KEY = 'BOOKSHELF_APPS';

function isStorageExist() /* boolean */ {
    if (typeof (Storage) === undefined) {
        alert('Browser kamu tidak mendukung local storage');
        return false;
    }
    return true;
}
function generateId() {
    return +new Date();
}

function generateBookObject(id, title, author, year, isComplete) {
    return {
        id, title, author, year, isComplete,
    }
}

function findBook(bookID) {
    for (const bookItem of books) {
        if (bookItem.id === bookID) {
            return bookItem;
        }
    }
    return null;
}

function findBookIndex(bookID) {
    for (const index in books) {
        if (books[index].id === bookID) {
            return index;
        }
    }
    return -1;
}

function makeBook(bookObject) {
    const { id, title, author, year, isComplete } = bookObject;

    const textTitle = document.createElement('h3');
    textTitle.innerText = title;

    const textAuthor = document.createElement('p');
    textAuthor.innerText = 'Penulis: ' + author;

    const textYear = document.createElement('p');
    textYear.innerText = 'Tahun: ' + year;

    const container = document.createElement('article');
    container.classList.add('book_item');
    container.append(textTitle, textAuthor, textYear);
    container.setAttribute('id', `book-${id}`);

    const action = document.createElement('div');
    action.classList.add('action');

    const selesaiButton = document.createElement('button');
    selesaiButton.classList.add('green');
    if (isComplete) {
        selesaiButton.innerText = 'Belum selesai dibaca';
        selesaiButton.addEventListener('click', function () {
            removeBookFromCompleted(id);
        })
    } else {
        selesaiButton.innerText = 'Selesai dibaca';
        selesaiButton.addEventListener('click', function () {
            addBookToCompleted(id);
        })
    }

    const hapusButton = document.createElement('button');
    hapusButton.classList.add('red');
    hapusButton.innerText = 'Hapus Buku';
    hapusButton.addEventListener('click', function () {
        removeBook(id);
    })

    action.append(selesaiButton, hapusButton);
    container.append(action);

    return container;
}

function addBook() {
    const textTitle = document.getElementById('inputBookTitle').value;
    const textAuthor = document.getElementById('inputBookAuthor').value;
    const textYear = document.getElementById('inputBookYear').value;
    const inputIsComplete = document.getElementById('inputBookIsComplete').checked;


    const generatedID = generateId();
    const bookObject = generateBookObject(generatedID, textTitle, textAuthor, textYear, inputIsComplete);
    books.push(bookObject);
    document.dispatchEvent(new Event(RENDER_EVENT));
    saveData();
}

function addBookToCompleted(bookID) {
    const bookTarget = findBook(bookID);
    if (bookTarget == null) return;
    bookTarget.isComplete = true;
    document.dispatchEvent(new Event(RENDER_EVENT));
    saveData();
}

function removeBookFromCompleted(bookID) {
    const bookTarget = findBook(bookID);
    if (bookTarget == null) return;
    bookTarget.isComplete = false;
    document.dispatchEvent(new Event(RENDER_EVENT));
    saveData();
}

function removeBook(bookID) {
    const confirmation = confirm('Yakin mau menghapus buku '+findBook(bookID)['title']+'?');
    if(confirmation){
        const bookTarget = findBookIndex(bookID);
        if (bookTarget === -1) return;
    
        books.splice(bookTarget, 1);
        document.dispatchEvent(new Event(RENDER_EVENT));
        saveData();
    }
    
}

function saveData() {
    if (isStorageExist()) {
        const parsed = JSON.stringify(books);
        localStorage.setItem(STORAGE_KEY, parsed);
    }
}

function loadDataFromStorage() {
    const serializedData = localStorage.getItem(STORAGE_KEY);
    let data = JSON.parse(serializedData);

    if (data !== null) {
        for (const book of data) {
            books.push(book);
        }
    }

    document.dispatchEvent(new Event(RENDER_EVENT));
}

document.addEventListener('DOMContentLoaded', function () {
    const submitForm = document.getElementById('inputBook');
    submitForm.addEventListener('submit', function (event) {
        event.preventDefault();
        addBook();
        document.getElementById('inputBookTitle').value = '';
        document.getElementById('inputBookAuthor').value = '';
        document.getElementById('inputBookYear').value = '';
        document.getElementById('inputBookIsComplete').checked = false;
        
    });
    if (isStorageExist()) {
        loadDataFromStorage();
    }
    const submitText = document.getElementById('submitText');
    const checkbox = document.querySelector('input[id=inputBookIsComplete]');
    checkbox.addEventListener('change', function () {
        if (this.checked) {
            submitText.innerText = 'Selesai Dibaca';
        } else {
            submitText.innerText = 'Belum Selesai Dibaca';
        }
    });
    const searchField = document.querySelector('input[id=searchBookTitle]');
    searchField.addEventListener('input', function () {
        document.searchBook = this.value;
        document.dispatchEvent(new Event(RENDER_EVENT));
    })
    searchField.addEventListener('focus', function(){
        document.getElementsByClassName('input_section')[0].style.display = 'none';
    })
    searchField.addEventListener('focusout', function(){
        document.getElementsByClassName('input_section')[0].style.display = 'flex';
        document.getElementById('incompleteBookShelf').style.display = 'flex';
        document.getElementById('completeBookShelf').style.display = 'flex';
    })
})

document.addEventListener(RENDER_EVENT, function (e) {
    const uncompletedBooksList = document.getElementById('incompleteBookshelfList');
    const completedBooksList = document.getElementById('completeBookshelfList');

    searchedText = e.currentTarget.searchBook;

    uncompletedBooksList.innerHTML = '';
    completedBooksList.innerHTML = '';
    for (const bookItem of books) {
        var bookElement = '';
        if (searchedText === '' || searchedText == undefined) {
            bookElement = makeBook(bookItem);
            document.getElementById('incompleteBookShelf').style.display = 'flex';
            document.getElementById('completeBookShelf').style.display = 'flex';
        } else {
            if (bookItem['title'].toLowerCase().startsWith(searchedText)) {
                bookElement = makeBook(bookItem);
            }
        }
        if (bookItem.isComplete) {
            completedBooksList.append(bookElement);
        } else {
            uncompletedBooksList.append(bookElement);
        }
    }
    if(uncompletedBooksList.innerHTML === ''){
        document.getElementById('incompleteBookShelf').style.display = 'none';
    }

    if(completedBooksList.innerHTML === ''){
        document.getElementById('completeBookShelf').style.display = 'none';
    }

});

