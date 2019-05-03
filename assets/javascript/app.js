function normalizePrivateJob(originalJob) {
    const job = {};
    job.location = {};

    //gets all the necesarry information out of the API call and assigns it to the object
    job.title = originalJob.title; //Job Title
    job.salaryMin = originalJob.salary_min; //minimum salary
    job.salaryMax = originalJob.salary_max; //maximum salary
    job.url = originalJob.redirect_url; //Url for the Job
    job.company = originalJob.company.display_name; //company name
    job.description = originalJob.description; //job description
    job.location.country = originalJob.location.area[0]; //country
    job.location.city = originalJob.location.area[1]; //city
    job.location.lat = originalJob.latitude; //coordinates
    job.location.long = originalJob.longitude; //coordinates

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
    const USAJobs = [];
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
        // console.log(jobResults);

        //normalizes the objects and maps them into an array
        const privateJobResults = jobResults[0].results.map(function (privateJob) {
            return normalizePrivateJob(privateJob);
        });

        //normalizes the objects and maps them into an array
        const govJobResults = jobResults[1].SearchResult.SearchResultItems.map(function (govJob) {
            return normalizeUSAJob(govJob.MatchedObjectDescriptor);
        });


        // console.log(privateJobResults);
        // console.log("----------------------------------------");
        // console.log(govJobResults);

        //concats two arrays into one    
        const allJobs = privateJobResults.concat(govJobResults);

        //display the first screen
        $("#main").html(jobDisplay(allJobs[0]));

        
        return allJobs;//returns the array as the argument of the next function 
    }).catch(function (err) {
        console.log(err);
    });
}



$(document).ready(function () {

    let pageCount = 1;//page of the API call

    //runs the getJobs function to get the arrays 
    getJobs(pageCount).then(function (allJobs) {

        //display results in the DOM
        let allJobCounter = 1;

        $("#main").on("click", ".yesBtn", function () {
            if (allJobCounter < allJobs.length) {
                allJobCounter++;
                //condition to get results from allJobs array or govJobResults
                $("#main").html(jobDisplay(allJobs[allJobCounter]));
            }
            else {
                pageCount++;
                allJobs = getJobs(pageCount);
            }

        })
        $("#main").on("click", ".noBtn", function () {
            if (allJobCounter < allJobs.length) {
                allJobCounter++;
                $("#main").html(jobDisplay(allJobs[allJobCounter]));
            }
            else {
                pageCount++;
                allJobs = getJobs(pageCount);
            }
        })

    });
})










