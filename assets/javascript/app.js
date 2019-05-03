
$(document).ready(function () {

    //Given to you by the firebase console
    //Identifies your specific app to the DB
    var config = {
        apiKey: "AIzaSyDPTi1BfLqpqxdT1RvD-kLylgoq_JDhWlU",
        authDomain: "team-red-212d0.firebaseapp.com",
        databaseURL: "https://team-red-212d0.firebaseio.com",
        projectId: "team-red-212d0",
        storageBucket: "team-red-212d0.appspot.com",
        messagingSenderId: "1040465529140"
    };

    //Allows firebase access 
    firebase.initializeApp(config);

    //Initializes services we use
    const firebaseAuth = firebase.auth()
    const firebaseData = firebase.database();

    const storedRefs = [];

    var userDirectory = localStorage.getItem("currentUser");

    //Checks if you are logged in on your machine
    if (userDirectory) {

        //gets the data stored on the path with a value equal to your email before the @ symbol.
        firebaseData.ref(userDirectory).once("value").then(function (snapshot) {

            //console.log("display user object" + snapshot.val());
            //console.log(snapshot.val());

            if (snapshot.val().userData.username) {
                $(".login-link").text(`Welcome ${snapshot.val().userData.username}`);
            }

        }).catch (function () {
            window.location.href = "login.html";
        })
    } else {
        window.location.href = "login.html";
    }


    function normalizePrivateJob(originalJob) {
        const job = Object.create(null);
        job.location = Object.create(null);

        job.title = originalJob.title || "N/A";
        job.salaryMin = originalJob.salary_min || "N/A";
        job.salaryMax = originalJob.salary_max || "N/A";
        job.url = originalJob.redirect_url || "N/A";
        job.company = originalJob.company.display_name || "N/A";
        job.description = originalJob.description || "N/A";
        job.location.country = originalJob.location.area[0] || "N/A";
        job.location.city = originalJob.location.area[1] || "N/A";
        job.location.lat = originalJob.latitude || "N/A";
        job.location.long = originalJob.longitude || "N/A";

        return job;
    }

    function privateApiCall() {
        let appId = "0cbadb14"; //app id for adzuna
        let key = "64d8e2d23b6325105d8459f517395077";//key for adzuna
        let jobTitle = "javascript developer";//job search title
        let jobLocation = "london";//job Location

        const queryParams = $.param({
            "app_id": appId,
            "app_key": key,
            "results_per_page": 50,
            "content-type": "application/json",
            "what": jobTitle,
            "where": jobLocation
        });

        let apiURL = `https://api.adzuna.com/v1/api/jobs/gb/search/1?${queryParams}`;
        return $.ajax({
            url: apiURL,
            method: "GET"
        })

    }

    function jobDisplay(job) {
        return (`
    <div>
        <h2>Title: ${job.title}</h2>
        <h2> Company: ${job.company}</h2>
        <h4>location: ${job.location.country} ${job.location.city}</h4>
        <h4>Company: ${job.company}</h4>
        <h4>Salaray Min: ${job.salaryMin}</h4>
        <h4>Salaray Min:${job.salaryMax}</h4>
        <a href=${job.url}> Click here to apply </a>
        <h5>Description:</h5>
        <p style="font-size:1em"> ${job.description}</p>

    </div>
    <button class="yesBtn">Yes</button>
    <button class="noBtn">No</button>
    `);
    }

    function normalizeUSAJob(usaJob) {
        let job = {};
        job.title = usaJob.PositionTitle || "N/A";
        job.company = usaJob.OrganizationName || "N/A";
        job.location = {
            city: usaJob.PositionLocation[0].LocationName || "N/A",
            country: usaJob.PositionLocation[0].CountryCode || "N/A",
            lat: usaJob.PositionLocation[0].Longitude || "N/A",
            long: usaJob.PositionLocation[0].Latitude || "N/A",

        }
        job.url = usaJob.PositionURI || "N/A";
        job.salaryMin = usaJob.PositionRemuneration[0].MinimumRange || "N/A";
        job.salaryMax = usaJob.PositionRemuneration[0].MaximumRange || "N/A";
        job.description = usaJob.UserArea.Details.JobSummary || "N/A";
        // job.qualification = usaJob.QualificationSummary;
        // job.startDate = usaJob.PublicationStartDate;
        // job.closeDate = usaJob.ApplicationCloseDate;
        return job;

    }

    function govApiCall() {
        const USAJobs = [];
        const BASEURL_USAJOBS = 'https://data.usajobs.gov/api/Search?';
        return $.ajax({
            headers: {
                'Authorization-Key': 'uwlmWWZmxLud+37QNF/llnaucTdMV4ldss6pQ8zjEg8='
            },
            url: BASEURL_USAJOBS,
            data: { PositionTitle: "full stack developer", location: "Atlanta", Radius: 75 },
            method: "GET"
        })

    }


    //privateApiCall();
    const jobResults = govApiCall();
    const jobSearchPromise = [privateApiCall(), govApiCall()];
    Promise.all(jobSearchPromise).then(function (jobResults) {
        console.log(jobResults);
        const privateJobResults = jobResults[0].results.map(function (privateJob) {
            return normalizePrivateJob(privateJob);
        });

        const govJobResults = jobResults[1].SearchResult.SearchResultItems.map(function (govJob) {
            return normalizeUSAJob(govJob.MatchedObjectDescriptor);
        });
        console.log(privateJobResults);
        console.log("----------------------------------------");
        console.log(govJobResults);

        //display results in the DOM
        let privateCounter = 0;
        let govCounter = 0;
        $("#main").html(jobDisplay(privateJobResults[0]));
        $("#main").on("click", ".yesBtn", function () {
            privateCounter++;

            let uniqueKey;

            do {
                uniqueKey = Math.floor(Math.random() * 100000000000)
                //console.log(uniqueKey)
                //console.log(storedRefs.includes(uniqueKey))
            } while (storedRefs.includes(uniqueKey))

            storedRefs.push(uniqueKey);

            firebaseData.ref(`${userDirectory}/${uniqueKey}`).set(privateJobResults[privateCounter]);

            firebaseData.ref(`${userDirectory}/userData`).set({
                username: userDirectory,
                stored: storedRefs
            })

            //condition to get results from privateJobResults array or govJobResults
            $("#main").html(jobDisplay(privateJobResults[privateCounter]))

        })
        $("#main").on("click", ".noBtn", function () {
            privateCounter++;
            $("#main").html(jobDisplay(privateJobResults[privateCounter]));
        })


    }).catch(function (err) {
        console.log(err);
    })



})




