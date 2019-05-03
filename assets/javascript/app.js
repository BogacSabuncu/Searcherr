function normalizePrivateJob(originalJob) {
    const job = {};
    job.location = {};

    job.title = originalJob.title;
    job.salaryMin = originalJob.salary_min;
    job.salaryMax = originalJob.salary_max;
    job.url = originalJob.redirect_url;
    job.company = originalJob.company.display_name;
    job.description = originalJob.description;
    job.location.country = originalJob.location.area[0];
    job.location.city = originalJob.location.area[1];
    job.location.lat = originalJob.latitude;
    job.location.long = originalJob.longitude;

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

function govApiCall() {
    const USAJobs = [];
    const BASEURL_USAJOBS = 'https://data.usajobs.gov/api/Search?';
   return  $.ajax({
        headers: {
            'Authorization-Key': 'uwlmWWZmxLud+37QNF/llnaucTdMV4ldss6pQ8zjEg8='
        },
        url: BASEURL_USAJOBS,
        data: { PositionTitle: "full stack developer", location: "Atlanta", Radius: 75 },
        method: "GET"
    })
    
}


$(document).ready(function () {
    
    //privateApiCall();
   const jobResults =  govApiCall();
   const jobSearchPromise = [privateApiCall(), govApiCall()];
   Promise.all(jobSearchPromise).then(function(jobResults){
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
        $("#main").on("click", ".yesBtn", function(){
            privateCounter++;
            //condition to get results from privateJobResults array or govJobResults
            $("#main").html(jobDisplay(privateJobResults[privateCounter]));
            
        })
        $("#main").on("click", ".noBtn", function(){
            privateCounter++;
            $("#main").html(jobDisplay(privateJobResults[privateCounter]));
        })


   }).catch(function(err){
       console.log(err);
   })
   
   
   
})








