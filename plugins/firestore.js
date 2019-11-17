import firebase from 'firebase/app'
import 'firebase/firestore'

if (!firebase.apps.length) {
  const firebaseConfig = {
    apiKey: 'AIzaSyDRgFWjOkmpkZmeCLdBG1aODldWBIt0ZVU',
    authDomain: 'news-feed-ce6c9.firebaseapp.com',
    databaseURL: 'https://news-feed-ce6c9.firebaseio.com',
    projectId: 'news-feed-ce6c9',
    storageBucket: 'news-feed-ce6c9.appspot.com',
    messagingSenderId: '769070067867',
    appId: '1:769070067867:web:192d2ccf213aac744cd63e',
    measurementId: 'G-ES6EV419BK'
  }

  firebase.initializeApp(firebaseConfig)
}

const db = firebase.firestore()
export default db