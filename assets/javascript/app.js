$(document).ready(function(){
    const BASEURL_USAJOBS= 'https://data.usajobs.gov/api/Search?';
    $.ajax({
        headers:{
            'Authorization-Key': 'uwlmWWZmxLud+37QNF/llnaucTdMV4ldss6pQ8zjEg8='
        },
        url:BASEURL_USAJOBS,
        data:{PositionTitle:"full stack developer", Page:0,ResultsPerPage:50, location:"Atlanta", Radius:75},
        method: "GET"
    }).then(function(jobs){
        const resultList = jobs.SearchResult.SearchResultItems.map(function(result){
            console.log("--------------------------------");
            console.log(JSON.stringify(result));
            console.log("--------------------------------");
        })
        console.log(resultList);
    }).catch(function(err){
        console.log(error);
    })
})