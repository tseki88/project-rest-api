const app = {};


//API Urls
const teleBaseUrl = "https://api.teleport.org/api";
const teleGetCityUrl = "https://api.teleport.org/api/locations";


//User Location (The Place to compare to);
app.getUserLocation = () => {
    navigator.geolocation.getCurrentPosition(function(position) {
        $.ajax({
            "url": `${teleGetCityUrl}/${position.coords.latitude},${position.coords.longitude}`,
            "method": "GET",
            "dataType": "json",
        }).then(function(teleUserLocation) {
            const currentCity = teleUserLocation._embedded["location:nearest-cities"][0]._links["location:nearest-city"].name;
            $(`#current-city option:contains("${currentCity}")`).prop("selected", true);            
        });
    });
};


app.teleData = () => {
    const teleJsonData = $.ajax({
        "url": `${teleBaseUrl}/urban_areas`,
        "method": "GET",
        "dataType": "json",
    });
    return teleJsonData;
};

//Generic Access to JSON
app.cityHref = (href) => {
    return $.ajax({
        "url": href,
        "method": "GET",
        "dataType": "json",
    });
};

// array based on aq API list of city
let cityList = [];
const cityCurrentSelect = $("#current-city");
const cityCurrentSelectValue = "#current-city"
const cityOptionSelect = $("#comparison-city");
const cityOptionSelectValue = "#comparison-city";
let currentCityHref = "";
let compareCityHref = "";


//generates country array source:tele
app.comparisonOptions = () => {
    const cityData = app.teleData();
    $.when(cityData).done(function(x) {
        cityList = x._links["ua:item"];
        // appends each supported city as select(dropdown) option
        cityList.forEach((e) => {
            cityOptionSelect.append(`<option value="${e.href}">${e.name}</option>`);
            cityCurrentSelect.append(`<option value="${e.href}">${e.name}</option>`);
        });        
    });
};


app.accessCityHref = (cityId) => {
    hrefAccess = $(`${cityId} :selected`).val();
    return hrefAccess;
}

// On click: clears previously loaded dada, generates and appends new
$("button").click(() => {
    $(".city-details").empty();
    $(".city-photo").empty();
    $(".scores").empty();
    $(".scores").append(`
        <ul class="currentScore"></ul>
        <ul class="scoreCategory"></ul>
        <ul class="comparisonScore"></ul>
    `);
    $(".location-divide").css("background-color", "whitesmoke");
    currentCityHref = app.accessCityHref(cityCurrentSelectValue);
    compareCityHref = app.accessCityHref(cityOptionSelectValue);
    app.getCityPhoto();
    app.getCityData();
});


//Adds <h2> to city details and appends City Image
app.getCityPhoto = () => {
    app.cityHref(currentCityHref).then(function(x) {
        let cityName = x.full_name;
        $(".current-display .city-details").append(`
            <h2>${cityName}</h2>
        `)

        let imageHref = currentCityHref + "images";

        app.cityHref(imageHref).then(function(x) {
            let imageLink = x.photos[0].image.mobile;
            $(".current-display .city-photo").html(`
                <img src=${imageLink} alt="${cityName}">`
            );
        });
    });

    app.cityHref(compareCityHref).then(function(x) {
        let cityName = x.full_name;
        $(".comparison-display .city-details").append(`
            <h2>${cityName}</h2>
        `)

        let imageHref = compareCityHref + "images";
    
        app.cityHref(imageHref).then(function(x) {
            let imageLink = x.photos[0].image.mobile;
            $(".comparison-display .city-photo").html(`
                <img src=${imageLink} alt="${cityName}">`
            );
        });
    });
}

//Get city scores from teleport API
app.getCityData = () => {
    app.cityHref(currentCityHref).then(function(x) {
        let scoreHref = currentCityHref + "scores";

        app.cityHref(scoreHref).then(function(x) {
            $(".current-display .city-details").append(x.summary);
        
            let overallScore = x.teleport_city_score.toFixed(2);
            $(".currentScore").append(`<li>${overallScore}</li>`);

            x.categories.forEach((e) => {
                let roundNumber = e.score_out_of_10.toFixed(2);
                $(".currentScore").append(`<li>${roundNumber}</li>`);
            })
        });
    });

    app.cityHref(compareCityHref).then(function(x) {
        let scoreHref = compareCityHref + "scores";

        app.cityHref(scoreHref).then(function(x) {
            $(".comparison-display .city-details").append(x.summary);

            $(".scoreCategory").append(`<li>Overall Score</li>`);
            let overallScore = x.teleport_city_score.toFixed(2);
            $(".comparisonScore").append(`<li>${overallScore}</li>`);

            x.categories.forEach((e) => {
                $(".scoreCategory").append(`<li>${e.name}</li>`);
                let roundNumber = e.score_out_of_10.toFixed(2);
                $(".comparisonScore").append(`<li>${roundNumber}</li>`);
            });

        });
    });
};

app.init = () => {
    app.getUserLocation();
    app.comparisonOptions();
};


$(function() {
    app.init();
});