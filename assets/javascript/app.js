function initFirebase() {

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

    const storedRefs = [firebaseData.ref(userDirectory)];

    var userDirectory = localStorage.getItem("currentUser");


    //Checks if you are logged in on your machine
    if (userDirectory) {

        firebaseData.ref(userDirectory).once("value").then(function (snapshot) {
            if (snapshot.val().userData.username) {
                $("#login-link").text(`${snapshot.val().userData.username}`);
                $("#sign-up-link").text(``);
                //console.log("display user object" + snapshot.val());
                //console.log(snapshot.val());
            }

        }).catch(function () {
            window.location.href = "login.html";
        })
    } else {
        window.location.href = "login.html";
    }
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


function privateApiCall(pageCount, title, location) {
    let appId = "0cbadb14"; //app id for adzuna
    let key = "64d8e2d23b6325105d8459f517395077";//key for adzuna
    let jobTitle = title;//Gonna be user input later
    let jobLocation = location;//Gonna be user Input later

    //parameters for the ajax URL
    const queryParams = $.param({
        "app_id": appId,
        "app_key": key,
        "results_per_page": 5,
        "content-type": "application/json",
        "what": jobTitle,
        "where": jobLocation
    });

    //ajax call
    let apiURL = `https://api.adzuna.com/v1/api/jobs/gb/search/${pageCount}?${queryParams}`;
    return $.ajax({
        url: apiURL,
        method: "GET"
    })

}


function normalizeUSAJob(usaJob) {
    let job = Object.create(null);
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


function govApiCall(pageCount, title, location) {
    //const USAJobs = [];
    const BASEURL_USAJOBS = 'https://data.usajobs.gov/api/Search?';
    const data = {
        PositionTitle: title,
        LocationName: location,
        Radius: 75,
        PositionSchedule: 1,  //part-time, full-time, temp
        ResultsPerPage: 5,
        Page: pageCount,
        Fields: "full"
    }
    return $.ajax({
        headers: {
            'Authorization-Key': 'uwlmWWZmxLud+37QNF/llnaucTdMV4ldss6pQ8zjEg8='
        },
        url: BASEURL_USAJOBS,
        data: data,
        method: "GET"
    })
}

function getJobs(pageCount, title, location) {

    const jobSearchPromise = [privateApiCall(pageCount, title, location), govApiCall(pageCount, title, location)]; //gets the promises and puts them into an array

    //waits all the promises to resolve and returns a promise out the function
    return Promise.all(jobSearchPromise).then(function (jobResults) {
        console.log(jobResults);

        //normalizes the objects and maps them into an array
        const privateJobResults = jobResults[0].results.map(function (privateJob) {
            return normalizePrivateJob(privateJob);
        });

        //normalizes the objects and maps them into an array
        const govJobResults = jobResults[1].SearchResult.SearchResultItems.map(function (govJob) {
            return normalizeUSAJob(govJob.MatchedObjectDescriptor);
        });


        console.log(privateJobResults);
        console.log("----------------------------------------");
        console.log(govJobResults);

        //concats two arrays into one
        const allJobs = privateJobResults.concat(govJobResults);

        console.log(pageCount);

        return allJobs;//returns the array as the argument of the next function

    }).catch(function (err) {
        console.log(err);
    });
}


function jobDisplay(job) {
    return (`
        <div class="cardJob animated fadeInRight faster">
            <div class="card">
                <div class="card-header">
                    <h3 class="card-title">${job.title}</h3>
                </div>
                <div class="card-body">
     
                    <h4>location: ${job.location.country} ${job.location.city}</h4>
                    <h4>Company: ${job.company}</h4>
                    <h4>Salaray [${job.salaryMin} - ${job.salaryMax}]</h4>
     
                    <a href=${job.url} class="card-link"> Click here to apply </a><br/>
     
                    <button class="btn btn-primary hideShowJobBtn" data-target="#jobModal">Job Description</button>
                </div>
                <div class="card-footer">
                    <button class="yesBtn btn btn-lg btn-primary">Yes</button>
                    <button class="noBtn btn btn-lg btn-danger">No</button>
                </div>
            </div>
     
        </div>
        <div class="hideShowJobDiv" style="display: none;">
            <p> ${job.description}</p>
         </div>
        `);

}

function executeGetJobs(title, location) {
    /*comment from samuel. This code is working well but you to check when any result return [] array!. it is throw an error */

    let pageCount = 1;//page of the API call

    //runs the getJobs function to get the arrays 
    getJobs(pageCount, title, location).then(function (allJobs) {
        //display results in the DOM
        let allJobCounter = 0;
        //display the first screen
        $("#main").html(jobDisplay(allJobs[allJobCounter]));

        $("#main").on("click", ".hideShowJobBtn", function () {
            $(".modal-body").html(allJobs[allJobCounter].description);
            $("#jobModal").modal("toggle", { keyboard: true });
        })

        $("#main").on("click", ".yesBtn", function () {
            if (allJobCounter === allJobs.length) {

                pageCount++;

                getJobs(pageCount, title, location).then(function (nextJobs) {
                    allJobCounter = 0;

                    allJobs = nextJobs;


                    $("#main").html(jobDisplay(allJobs[allJobCounter]));
                    allJobCounter++;

                });

            } else {

                $("#main").html(jobDisplay(allJobs[allJobCounter]));

                allJobCounter++;

                let uniqueKey;

                do {
                    uniqueKey = Math.floor(Math.random() * 100000000000)
                    //console.log(uniqueKey)
                    //console.log(storedRefs.includes(uniqueKey))
                } while (storedRefs.includes(uniqueKey))

                storedRefs.push(uniqueKey);

                firebaseData.ref(`${userDirectory}/${uniqueKey}`).set(allJobs[allJobCounter]);

                firebaseData.ref(`${userDirectory}/userData`).set({
                    username: userDirectory,
                    stored: storedRefs
                })
            }

        })
        $("#main").on("click", ".noBtn", function () {
            if (allJobCounter === allJobs.length) {
                pageCount++;
                getJobs(pageCount, title, location).then(function (nextJobs) {
                    allJobCounter = 0;

                    allJobs = nextJobs;

                    $("#main").html(jobDisplay(allJobs[allJobCounter]));
                    allJobCounter++;
                });
            }
            else {
                $("#main").html(jobDisplay(allJobs[allJobCounter]));
                allJobCounter++;
            }

        });
    }).catch(function (err) {
        $("#main").html("<h1>Something went wrong!!!</h1>");
    })
}


function loadData() {
    $("#main").html(`<div class="LoadingData">
        <img src="https://media.giphy.com/media/kodQslB005JIc/giphy-downsized.gif" alt="data Loading">
    </div>`);
}


$(document).ready(function () {

    initFirebase();


    $("#jobSubmit").click(function (event) {
        event.preventDefault();
        const jobTitle = $("#jobtitle").val().trim();
        console.log(jobTitle);
        const location = $("#location").val().trim();
        console.log(location);
        const field = $("#field").val();
        console.log(field);
        const dateposted = $("#dateposted").val();
        console.log(dateposted);
        const salary = $("#salary").val();
        console.log(salary);
        const numberofresults = $("#numberofresults").val();
        console.log(numberofresults);
        if (!jobTitle || !location) {
            console.log("enter text seearch");
        } else {
            loadData(); // display loading gif imagine while waiting for data to be laod.
            executeGetJobs(jobTitle, location);
        }


    });


});

