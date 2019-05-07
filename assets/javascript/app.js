
let firebaseAuth;
let firebaseData;

let userDirectory;

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
    firebaseAuth = firebase.auth()
    firebaseData = firebase.database();

    userDirectory = localStorage.getItem("currentUser");



    //Checks if you are logged in on your machine
    if (userDirectory) {

        firebaseData.ref(userDirectory).once("value").then(function (snapshot) {
            if (snapshot.val().userData.username) {

                $("#sign-up-link").text(`Switch Account`);
                $("#login-link").text(`${snapshot.val().userData.username}`);

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
    console.log(originalJob);
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
    let apiURL = `https://api.adzuna.com/v1/api/jobs/us/search/${pageCount}?${queryParams}`;
    return $.ajax({
        url: apiURL,
        method: "GET"
    })

}

// function jobDisplay(job) {
//     return (`
//     <div class="row">
//         <div class="col-12">
//             <div class="cardJob animated fadeInRight faster">
//                 <div class="card">
//                     <div class="card-header">
//                         <h3 class="card-title">${job.title}</h3>
//                     </div>
//                     <div class="card-body animated fadeInLeft faster">
                    
//                         <h4>location: ${job.location.country} ${job.location.city}</h4>
//                         <h4>Company: ${job.company}</h4>
//                         <h4>Salaray [${job.salaryMin} - ${job.salaryMax}]</h4>
                        
//                         <a href=${job.url} class="card-link"> Click here to apply </a><br/>
                        
//                         <button class="btn btn-primary hideShowJobBtn" data-target="#jobModal">Job Description</button>
//                     </div>
//                     <div class="card-footer">
//                         <button class="yesBtn btn btn-lg btn-primary">Yes</button>
//                         <button class="noBtn btn btn-lg btn-danger">No</button>
//                     </div>
//                 </div>
//             </div>
//         </div>
        
//     </div>
   
    
//     `);

// }


function normalizeUSAJob(usaJob) {
    console.log(originalJob);
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
        console.log("allJobs")
        console.log(allJobs)

        return allJobs;//returns the array as the argument of the next function

    }).catch(function (err) {
        console.log(err);
    });
}


function jobDisplay(job) {
    if (job) {
        return (`
        <div class="cardJob animated fadeInRight faster">
            <div class="card text-center">
                <div class="card-header">
                    <h3 class="card-title h3">${job.title}</h3>
                </div>
                <div class="card-body">
                    <div class="row">
                        <div class="col-12 col-sm-6">
                            <div class="alert alert-success">
                               <strong>Location: </strong> ${job.location.city}, ${job.location.country}
                            </div>
                            <div class="alert alert-success">
                               <strong>Company: </strong> ${job.company}
                            </div>
                            
                        </div>
                        <div class="col-12 col-sm-6">
                            <div class="alert alert-success">
                               <strong>Salary: </strong> [${job.salaryMin} - ${job.salaryMax}]
                            </div>
                            <div class="alert alert-success">
                               <a href=${job.url} class="card-link"> Click here to apply </a><br/>
                            </div>
                              
                        </div>
                        
                    </div>
                    <div class="row">
                        <div class='col-12'>
                        <p class=" hideShowJobBtn" data-target="#jobModal">Job Description <i class="fas fa-angle-double-right"></i></p>
                        </div>
                        
                    </div>
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
    } else {
        return `
        <div class="cardJob animated fadeInRight faster">
        <div class="card">
            <div class="card-header">
                <h3 class="card-title">Oops!</h3>
            </div>
            <div class="card-body">
 
                  <h4>We've run out of available jobs.</h4>
                  <h3>Please search again.</h3>

              </div>
              <div class="card-footer">
                    <button class="yesBtn btn btn-lg btn-primary">Yes</button>
                    <button class="noBtn btn btn-lg btn-danger">No</button>
                </div>
            </div>
 
         </div>
        `
    }

}

function executeGetJobs(title, location) {
    /*comment from samuel. This code is working well but you to check when any result return [] array!. it is throw an error */

    let pageCount = 1;//page of the API call
    let map = initMap(location);
    //runs the getJobs function to get the arrays 
    getJobs(pageCount, title, location).then(function (allJobs) {
        //display results in the DOM
        let allJobCounter = 0;
        
        //display the first screen
        $("#main").html(jobDisplay(allJobs[allJobCounter]));
        
        //console.log(allJobs[allJobCounter]);
        if(allJobs.length !== 0){
            setmarker(map, allJobs[allJobCounter]);
        }
        
        $("#main").on("click", ".hideShowJobBtn", function () {
            $(".modal-body").html(allJobs[allJobCounter].description || "No description");
            $("#jobModal").modal("toggle", { keyboard: true });
        })

        $("#main").on("click", ".yesBtn", function () {
            if (allJobCounter === allJobs.length) {

                pageCount++;

                getJobs(pageCount, title, location).then(function (nextJobs) {
                    allJobCounter = 0;

                    allJobs = nextJobs;




                    $("#main").html(jobDisplay(allJobs[allJobCounter]));
                    setmarker(map, allJobs[allJobCounter]);
                    allJobCounter++;

                });

            } else {

                $("#main").html(jobDisplay(allJobs[allJobCounter]));
                setmarker(map, allJobs[allJobCounter]);
                allJobCounter++;

                let storedRefs;

                firebaseData.ref(`${userDirectory}/userData`).once("value").then(function (snapshot) {
                    storedRefs = snapshot.val().stored ? snapshot.val().stored : [];

                    console.log(storedRefs)
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
                });
            }

        })
        $("#main").on("click", ".noBtn", function () {
            if (allJobCounter === allJobs.length) {
                pageCount++;
                getJobs(pageCount, title, location).then(function (nextJobs) {
                    allJobCounter = 0;

                    allJobs = nextJobs;

                    console.log("allJiobs")
                    console.log(allJobs)

                    $("#main").html(jobDisplay(allJobs[allJobCounter]));
                    setmarker(map, allJobs[allJobCounter]);
                    allJobCounter++;
                });
            }
            else {
                $("#main").html(jobDisplay(allJobs[allJobCounter]));
                setmarker(map, allJobs[allJobCounter]);
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

function initMap(location) {
    let mapProp= {
        center: new google.maps.LatLng(33.748997,-84.387985),
        zoom:10,
        MapTypeId: google.maps.MapTypeId.SATELLITE 
    };
    let map = new google.maps.Map(document.getElementById("displayMap"),mapProp);
    
//     let geocoder = new google.maps.Geocoder(); 
//     let map="";
//     geocoder.geocode({
//         address:location 
//     }, function(results, status) {
//         if(status == google.maps.GeocoderStatus.OK) {
//             let latLong = results[0].geometry.location
//             let mapProp= {
//                 center: new google.maps.LatLng(latLong.lat(),latLong.lng()),
//                 zoom:10,
//                 MapTypeId: google.maps.MapTypeId.TERRAIN
//             };
//              map = new google.maps.Map(document.getElementById("displayMap"),mapProp);
        
//         }
//         else {  //location is not found
//         console.log('status error: ' + status);
//         let mapProp= {
//             center: new google.maps.LatLng(51.508742,-0.120850),
//             zoom:10,
//             MapTypeId: google.maps.MapTypeId.TERRAIN
//         };
//         let map = new google.maps.Map(document.getElementById("displayMap"),mapProp);
//         }
//   });
    return map;
}

function setmarker(map, job){

     let marker = new google.maps.Marker({
        position: {lat: parseFloat(job.location.lat), lng: parseFloat(job.location.long)},
        map: map,
        title: job.title,
        clickable: true,
        animation: google.maps.Animation.DROP
      });
      
      map.setCenter(marker.getPosition());
      map.setZoom(15);
      google.maps.event.addListener(marker, 'click', function(event) {
        var infowindow = new google.maps.InfoWindow({
            content: `
            <div class="markerInfo">
            <h3>${job.title}</h3>
            <a href=${job.url}>${job.url}</a>
          </div> `
          });
          infowindow.open(map,this);
      });
     
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
        }else{
            loadData(); // display loading gif imagine while waiting for data to be laod. 
            executeGetJobs(jobTitle, location);
        } 


    });


});

