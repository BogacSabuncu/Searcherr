function normalizePrivateJob(originalJob) {
    const job = {};
    job.location = {};

    //gets all the necesarry information out of the API call and assigns it to the object
    job.title = originalJob.title || "N/A"; //Job Title
    job.salaryMin = originalJob.salary_min || "N/A"; //minimum salary
    job.salaryMax = originalJob.salary_max || "N/A"; //maximum salary
    job.url = originalJob.redirect_url || "N/A"; //Url for the Job
    job.company = originalJob.company.display_name || "N/A"; //company name
    job.description = originalJob.description || "N/A"; //job description
    job.location.country = originalJob.location.area[0] || "N/A"; //country
    job.location.city = originalJob.location.area[1] || "N/A"; //city
    job.location.lat = originalJob.latitude || "N/A"; //coordinates
    job.location.long = originalJob.longitude || "N/A"; //coordinates

    return job;
}

function privateApiCall(pageCount) {
    let appId = "0cbadb14"; //app id for adzuna
    let key = "64d8e2d23b6325105d8459f517395077";//key for adzuna
    let jobTitle = "javascript developer";//Gonna be user input later
    let jobLocation = "london";//Gonna be user Input later

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

function jobDisplay(job) {
    return (`
    <div class="cardJob">
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


function normalizeUSAJob(usaJob) {
    let job = {};
    job.title = usaJob.PositionTitle;
    job.company = usaJob.OrganizationName;
    job.location = {
        city: usaJob.PositionLocation[0].LocationName,
        country: usaJob.PositionLocation[0].CountryCode,
        lat: usaJob.PositionLocation[0].Longitude,
        long: usaJob.PositionLocation[0].Latitude,

    }

    job.url = usaJob.PositionURI;
    job.salaryMin = usaJob.PositionRemuneration[0].MinimumRange;
    job.salaryMax = usaJob.PositionRemuneration[0].MaximumRange;
    job.description = usaJob.UserArea.Details.JobSummary;

    return job;

}

function govApiCall(pageCount) {
    //const USAJobs = [];
    const BASEURL_USAJOBS = 'https://data.usajobs.gov/api/Search?';
    return $.ajax({
        headers: {
            'Authorization-Key': 'uwlmWWZmxLud+37QNF/llnaucTdMV4ldss6pQ8zjEg8='
        },
        url: BASEURL_USAJOBS,
        data: { PositionTitle: "full stack developer", location: "Atlanta", Radius: 75, ResultsPerPage: 5, Page: pageCount },
        method: "GET"
    })

}



function getJobs(pageCount) {

    const jobSearchPromise = [privateApiCall(pageCount), govApiCall(pageCount)]; //gets the promises and puts them into an array

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



$(document).ready(function () {

    $("#jobSubmit").click(function(event){
        event.preventDefault();
        const jobTitle = $("#jobtitle").val();
    console.log(jobTitle);
        const location = $("#location").val();
    console.log(location);
        const field = $("#field").val();
    console.log(field);
        const dateposted = $("#dateposted").val();
    console.log(dateposted);
        const salary = $("#salary").val();
    console.log(salary);
        const numberofresults = $("#numberofresults").val();
    console.log(numberofresults);

    });

    let pageCount = 1;//page of the API call

    //runs the getJobs function to get the arrays 
    getJobs(pageCount).then(function (allJobs) {

        //display results in the DOM
        let allJobCounter = 0;
        //display the first screen
        $("#main").html(jobDisplay(allJobs[allJobCounter]));

        $("#main").on("click", ".hideShowJobBtn", function () {
            $(".modal-body").html(allJobs[allJobCounter].description);
            $("#jobModal").modal("toggle");
        })

        $("#main").on("click", ".yesBtn", function () {
            if (allJobCounter === allJobs.length) {
                pageCount++;
                getJobs(pageCount).then(function (allJobs) {
                    allJobCounter = 0;


                    $("#main").html(jobDisplay(allJobs[allJobCounter]));
                    allJobCounter++;
                });
            }
            else {
                $("#main").html(jobDisplay(allJobs[allJobCounter]));
                allJobCounter++;
            }

        })
        $("#main").on("click", ".noBtn", function () {
            if (allJobCounter === allJobs.length) {
                pageCount++;
                getJobs(pageCount).then(function (allJobs) {
                    allJobCounter = 0;


                    $("#main").html(jobDisplay(allJobs[allJobCounter]));
                    allJobCounter++;
                });
            }
            else {
                $("#main").html(jobDisplay(allJobs[allJobCounter]));
                allJobCounter++;
            }

        });
    })
})