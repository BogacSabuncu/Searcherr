

$(document).ready(function () {
    //console.log( "ready!" );



    // Initialize Firebase
    const config = {
        apiKey: "AIzaSyDPTi1BfLqpqxdT1RvD-kLylgoq_JDhWlU",
        authDomain: "team-red-212d0.firebaseapp.com",
        databaseURL: "https://team-red-212d0.firebaseio.com",
        projectId: "team-red-212d0",
        storageBucket: "team-red-212d0.appspot.com",
        messagingSenderId: "1040465529140"
    };

    firebase.initializeApp(config);

    const firebaseApp = firebase.auth();
    const firebaseData = firebase.database();


    function signIn(email, password) {
        //console.log(`email: ${email} password: ${password}`);
        const signInPromise = firebaseApp.signInWithEmailAndPassword(email, password).catch(error => {
            signInError();
        });
        signInPromise.then(function () {
            const user = firebaseApp.currentUser
            console.log(user.email)
            if (user) {

                userDirectory = user.email.split("@")[0];

                localStorage.setItem("currentUser", userDirectory);

                firebaseData.ref(`${userDirectory}`).set({
                    userData: {
                        username: user.email,
                        savedJobRefs: []
                    }
                });

                window.location.href = "index.html";

            } else {
                // No user is signed in.
            }
        });
    };
    function signUp(email, password) {
        //console.log(`email: ${email} password: ${password}`);
        const signUpPromise = firebaseApp.createUserWithEmailAndPassword(email, password).catch(error => {
            $(".bad-stuff").text(error.message);
            //console.log(error);
        });
        signUpPromise.then(function () {
            const user = firebaseApp.currentUser
            console.log(user)
            if (user) {

                userDirectory = user.email.split("@")[0];

                localStorage.setItem("currentUser", userDirectory);

                firebaseData.ref(`${userDirectory}`).set({
                    userData: {
                        username: user.email,
                        savedJobRefs: []
                    }
                });

                window.location.href = "index.html";

                console.log(user.email)
            } else {
                // No user is signed in.
            }
        });
    }

    function signInError() {
        $(".bad-stuff").text("Your username or password are incorrect.")
    }

    $(".submit-login").on("click", function (e) {
        e.preventDefault();

        $(".bad-stuff").text("");

        const userName = $("#email").val().trim()
        const password = $("#password").val().trim()

        try {

            if (password === $("#password-confirm").val().trim()) {
                console.log("signUpSetup has run")
                signUp(userName, password);
            } else {
                $(".bad-stuff").text("Your passwords do not match.")
            }

        } catch (err) {
            //console.log(err);
            signIn(userName, password);
            //signUpSetup();
        }




    })

    let isSignUp = false;

    function signUpSetup() {

        console.log("signUpSetup has run")
        //e.preventDefault();


        //const userName = $("#email").val().trim()
        //const password = $("#password").val().trim()
        console.log(isSignUp)

        const newUser = renderConfirmPassword(isSignUp)

        console.log(newUser)

        if (!newUser.status) {
            isSignUp = true;
            console.log(isSignUp)
            $(".pw").append(newUser.confirmArea);
            $(".submit-sign-up").remove();
        }
    }

    $(".submit-sign-up").on("click", signUpSetup)

    function renderConfirmPassword(hasRun) {

        return {
            confirmArea: `
            <div class="input-group input-group-lg">
                        <div class="input-group-prepend">
                            <span class="input-group-text" id="inputGroup-sizing-lg">Confirm Password</span>
                        </div>
                        <input id="password-confirm" type="password" class="form-control" aria-label="Sizing example input"
                            aria-describedby="inputGroup-sizing-lg" />
                    </div>
            
            `,
            status: hasRun
        }
    }


});