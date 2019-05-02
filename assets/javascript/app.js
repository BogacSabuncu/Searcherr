
let appId = "0cbadb14"; //app id for adzuna
let key = "64d8e2d23b6325105d8459f517395077";//key for adzuna
let jobTitle = "javascript developer";//job search title
let jobLocation = "london";//job Location

const queryParams = $.param({
    "app_id": appId,
    "app_key": key,
    "results_per_page": 1,
    "content-type": "application/json",
    "what": jobTitle,
    "where": jobLocation
});

let apiURL = `https://api.adzuna.com/v1/api/jobs/gb/search/1?${queryParams}`;

console.log(apiURL);

function getPrivateJob(originalJob){
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


$.ajax({
    url: apiURL,
    method: "GET"    
}).then(function(response){
    console.log(response);
    const jobObj = getPrivateJob(response.results[0]);

    console.log(jobObj);
}).catch(function(err){
    console.log(err);
});
