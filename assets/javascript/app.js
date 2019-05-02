$(document).ready(function(){
    

    // let jobObj = {
    //     jobTitle: " ",
    //     jobCompany: " ",
    //     joblocation = {
    //         country = "",
    //         city = "",
    //         lat = 0,
    //         long = 0
    //     },
    //     jobUrl = "",
    //     jobSalaryMin = "",
    //     jobSalaryMax = "",
    //     jobDescription = " "
    //  }
     function jobDisplay(job){
        return (`
        <div>
            <h2>${job.title}</h2>
            <h2>${job.company}</h2>
            <h4>${job.location.country} ${job.location.city}</h4>
            <h4>${job.company}</h4>
            <h4>${job.salaryMin}</h4>
            <h4>${job.salaryMax}</h4>
            <h4>${job.salaryMax}</h4>

            <p>${job.description}</p>
            <p>${job.qualification}</p>

        </div>
        <button >Yes</button>
        <button>No</button>
        `);
    }
    function  normalizeJob(usajob){
        let jobNorm = {};
            jobNorm.title = usajob.PositionTitle;
            jobNorm.company = usajob.OrganizationName;
            jobNorm.location = {
                city: usajob.PositionLocation[0].LocationName,
                country: usajob.PositionLocation[0].CountryCode,
                lat: usajob.PositionLocation[0].Longitude,
                long: usajob.PositionLocation[0].Latitude,

            }
            
            jobNorm.url = usajob.PositionURI; 
            jobNorm.salaryMin = usajob.PositionRemuneration[0].MinimumRange;
            jobNorm.salaryMax  = usajob.PositionRemuneration[0].MaximumRange;
            jobNorm.description = usajob.UserArea.Details.JobSummary;
            jobNorm.qualification = usajob.QualificationSummary;
            jobNorm.startDate = usajob.PublicationStartDate;
            jobNorm.closeDate = usajob.ApplicationCloseDate;
        return jobNorm;
        
    }
    const USAJobs = [];
    const BASEURL_USAJOBS= 'https://data.usajobs.gov/api/Search?';
    $.ajax({
        headers:{
            'Authorization-Key': 'uwlmWWZmxLud+37QNF/llnaucTdMV4ldss6pQ8zjEg8='
        },
        url:BASEURL_USAJOBS,
        data:{PositionTitle:"full stack developer", Page:0,ResultsPerPage:50, location:"Atlanta", Radius:75},
        method: "GET"
    }).then(function(jobs){
        console.log(jobs);
        const resultList = jobs.SearchResult.SearchResultItems.map(function(result){
            return normalizeJob(result.MatchedObjectDescriptor);
        });
        console.log(JSON.stringify(resultList));
    }).catch(function(err){
        console.log(error);
    })
})