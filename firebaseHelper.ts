import * as firebase from "firebase/app";
import * as firebaseui from "firebaseui";

export class FirebaseHelper {

    public static firebaseApp: firebase.app.App;
    public static firestore: firebase.firestore.Firestore;

    /**
     * Initializes firebase and returns the app instance.
     */
    public static initFirebase() {
        var config = {
            apiKey: "AIzaSyCn9zmoQxWsBxTct9AZ_wr6vptKyEj-PYE",
            authDomain: "pg-serve.firebaseapp.com",
            databaseURL: "https://pg-serve.firebaseio.com",
            projectId: "pg-serve",
            storageBucket: "",
            messagingSenderId: "939803597024"
          };
        FirebaseHelper.firebaseApp = firebase.initializeApp(config);
    }
    
    /**
     * Displays the firebaseui login container.
     */
    public static signInWithFirebaseUi() {
        var uiConfig = {
            signInSuccessUrl: '#/authenticated',
            signInFlow: 'redirect',
            signInOptions: [
                firebase.auth.GoogleAuthProvider.PROVIDER_ID,
                firebase.auth.EmailAuthProvider.PROVIDER_ID,
                //firebase.auth.FacebookAuthProvider.PROVIDER_ID
            ],
            tosUrl: '#/about',   // Terms of service url.            
            privacyPolicyUrl: '#/privacy' // Privacy policy url.
        };
        var ui = firebaseui.auth.AuthUI.getInstance();
        if (!ui) {
            ui = new firebaseui.auth.AuthUI(firebase.auth());
        }
        ui.start('#firebaseui-auth-container', uiConfig); // The start method will wait until the DOM is loaded.
    }

    public static signInWithGoogleProvider() {
        var provider = new firebase.auth.GoogleAuthProvider();
        provider.addScope('profile');
        provider.addScope('email');
        firebase.auth().signInWithRedirect(provider);
    }

    /**
     * Signs out the current user.
     */
    public static async signOut() {
        await firebase.auth().signOut();
    }
}