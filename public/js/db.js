// Offline Data 
db.enablePersistence()
    .catch(err => {
        if (err.code === 'failed-precondition ') {
            // Probably multiple tabs open at once
            console.log('Persistance Failed');
        } else if  (err.code === 'unimplemented') {
            // lack of browser support
            console.log('Persistence is not available')
        }
    });

// Real-time listener 
// This listen for something that happened on the firestore db
// or the indexDb of the chrome when offline
db.collection('recipes').onSnapshot(snapshot => {
    // there is something that happens on a database, send a snapshot of the database or collection
    // and send it back
    snapshot.docChanges().forEach(change => {
        // console.log(change, change.doc.data(), change.doc.id);
        console.log('change', change);
        if (change.type === 'added') {
            renderRecipe(change.doc.data(), change.doc.id);
        }
        if (change.type === 'removed') {
            removeRecipe(change.doc.id);
        }
    })
})

// add new recipe
const form = document.querySelector('.add-recipe');
form.addEventListener('submit', evt => {
    evt.preventDefault();
    const recipe = {
        title: form.title.value,
        ingredients: form.ingredients.value
    }

    db.collection('recipes').add(recipe)
        .catch(err => {
            console.log(err);
        })

    // form.reset();
    form.title.value = '';
    form.ingredients.value = '';
})

// delete a recipe
const recipeContainer = document.querySelector('.recipes');
recipeContainer.addEventListener('click', (evt) => {
    console.log('evt', evt);

    if (evt.target.tagName === 'I') {
        const id = evt.target.getAttribute('data-id');
        db.collection('recipes').doc(id).delete();
    }
})