

$(document).ready(function () {
    //console.log( "ready!" );



    // Initialize Firebase
    var config = {
        apiKey: "AIzaSyDPTi1BfLqpqxdT1RvD-kLylgoq_JDhWlU",
        authDomain: "team-red-212d0.firebaseapp.com",
        databaseURL: "https://team-red-212d0.firebaseio.com",
        projectId: "team-red-212d0",
        storageBucket: "team-red-212d0.appspot.com",
        messagingSenderId: "1040465529140"
    };

    firebase.initializeApp(config);

    const firebaseApp = firebase.auth()


    function signIn(email, password) {
        console.log(`email: ${email} password: ${password}`);
        firebaseApp.signInWithEmailAndPassword(email, password).catch(error => {
            signInError();
        });
    }
    function signUp(email, password) {
        console.log(`email: ${email} password: ${password}`);
        firebaseApp.createUserWithEmailAndPassword(email, password).catch(error => {
            signIn(email, password);
        });
    }


    $(".submit-login").on("click", function (e) {
        e.preventDefault();

        const userName = $("#email").val().trim()
        const password = $("#password").val().trim()

        try

        signIn(userName, password);


    })

    let isSignUp = false;

    $(".submit-sign-up").on("click", function (e) {
        e.preventDefault();


        //const userName = $("#email").val().trim()
        //const password = $("#password").val().trim()

        const newUser = renderConfirmPassword(isSignUp)
        if (newUser.status) {
            isSignUp = true;
            $(".pw").append(newUser.confirmArea);
        }
        /*
        if (password === $("#password-confirm").val().trim() && isSignUp) {
            signUp(userName, password);
        } else {
            $(".submit-area").append(`<p style="color: red;">¸Your passwords do not match.</p>`)
        }
        */
    })

    function renderConfirmPassword (hasRun) {

        return {
            confirmArea:`<div class="input-group input-group-lg"><div class="input-group-prepend"><span class="input-group-text" id="inputGroup-sizing-lg">Confirm Password</span></div><input type="text" id="password-confrim" aria-label="Sizing example input" aria-describedby="inputGroup-sizing-lg" value="" /></div>`,
            status: hasRun
        }
    }
});