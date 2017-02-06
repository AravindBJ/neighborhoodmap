//Reload page on click of button
var reload = function() {
    window.location.reload();
};
//Navigation Bar ---http://www.internetkultur.at/simple-hamburger-drop-down-menu-with-css-and-jquery/
jQuery(function($) {
    $('.menu-btn').click(function() {
        $('.responsive-menu').toggleClass('expand')
    });
});

var map;
var marker;
var windowInfo;
var markers = [];
//details of places to be marked..
var myplaces = [{
        title: "Chennai",
        location: {
            lat: 13.0878400,
            lng: 80.2784700
        },
        img: 'img/chennai-city-aerial-view.jpg',
    },
    {
        title: 'Shore Temple',
        location: {
            lat: 12.6209100,
            lng: 80.1933100
        },
        img: 'img/Mahaballipuram-Shore-Temple.jpg',
    },
    {
        title: 'Kanchipuram',
        location: {
            lat: 12.8351500,
            lng: 79.7000600
        },
        img: 'img/Kanchipuram-Kailasanathar-temple.jpg',
    },
    {
        title: 'Rameswaram',
        location: {
            lat: 9.2885000,
            lng: 79.3127100
        },
        img: 'img/rameshwaram.jpg',
    },
    {
        title: 'Thanjavur',
        location: {
            lat: 10.7852300,
            lng: 79.1390900
        },
        img: 'img/Thanjavur-Brihadeeshwara-Temple.jpg',
    },
    {
        title: 'Yelagiri',
        location: {
            lat: 12.552,
            lng: 78.612
        },
        img: 'img/Yelagiri.jpg',
    },
    {
        title: 'Kanyakumari',
        location: {
            lat: 8.084915,
            lng: 77.541796
        },
        img: 'img/Gozer_Kanyakumari.jpg',
    },
    {
        title: 'Ooty',
        location: {
            lat: 11.410000,
            lng: 76.699997
        },
        img: 'img/Ooty.jpg',
    },
    {
        title: 'Kodaikanal',
        location: {
            lat: 10.2392500,
            lng: 77.4893200
        },
        img: 'img/Kodaikanal.jpg',
    },
    {
        title: 'Valparai',
        location: {
            lat: 10.32691,
            lng: 76.95116
        },
        img: 'img/Valparai.jpg',
    },
    {
        title: 'Hogenakkal Falls',
        location: {
            lat: 12.117,
            lng: 77.776
        },
        img: 'img/Hogenakkal.jpg',
    },
    {
        title: 'Madurai',
        location: {
            lat: 9.939093,
            lng: 78.121719
        },
        img: 'img/Madurai-Meenakshi-Temple.jpg',
    }
];

function initMap() {
    map = new google.maps.Map(document.getElementById('map'), {
        center: {
            lat: 10.6918014, //point of focus
            lng: 78.2767913
        },
        zoom: 10, //zoom level
        // mapTypeId:google.maps.MapTypeId.SATELLITE,
    });
    windowInfo = new google.maps.InfoWindow();
    getmymarkers();
}

//Initiating the markers and calling the infowindow to open on them and also includes fixing the boundary.
function getmymarkers() {
    var bounds = new google.maps.LatLngBounds();
    // The following group uses the myplaces array to create an array of markers on initialize.
    for (var k = 0; k < myplaces.length; k++) {
        // Get the position from the myplaces array.
        var position = myplaces[k].location;
        var title = myplaces[k].title;
        var img = myplaces[k].img;
        // Creates a marker per location, and put into markers array.
        marker = new google.maps.Marker({
            map: map,
            position: position,
            title: title,
            animation: google.maps.Animation.DROP,
            img: img,
        });
        // Push the marker to our array of markers.
        markers.push(marker);
        // Create an onclick event to open an infowindow at each marker.
        marker.addListener('click', function() {
            populateInfoWindow(this, windowInfo);
            toggleBouncer(this);
        });
        bounds.extend(markers[k].position);
        myplaces[k].marker = marker;
    }
    // Extend the boundaries of the map for each marker
    map.fitBounds(bounds);
}

//populate infowindow when the marker is clicked and only open on the clicked marker
function populateInfoWindow(marker, infowindow) {

    // load wikipedia data //https://www.mediawiki.org/wiki/API:Main_page
    var wikiUrl = 'http://en.wikipedia.org/w/api.php?action=opensearch&search=' + marker.title + '&format=json&callback=wikiCallback';

    //ajax request for wikipedia article links
    $.ajax({
        url: wikiUrl,
        dataType: "jsonp",
        //jsonp:"callback",
    }).done(function(response) {
        var wikiStr = response[0];
        var url = 'http://en.wikipedia.org/wiki/' + wikiStr;
        //See if the infowindow is not opened already on this marker.
        if (infowindow.marker != marker) {
            infowindow.setContent('<div>' + marker.title + '</div><br>' + '<img src="' + marker.img + '" alt="Image of ' + marker.title + '"><br><br><div>Wikipedia link </div><br>' + '<div><a href="' + url + '">' + url + '</a></div>');
            infowindow.marker = marker;
            infowindow.open(map, marker);
            infowindow.addListener('closeclick', function() {
                infowindow.marker = null; //clear marker property on closing infowindow
            });
        }; //Moved the entire setContent part to the success callback of the Wikipedia API request as per instruction of coach from discussion forums
    }).fail(function(jqXHR, textStatus) {
        alert("Failed to get wikipedia resources.Please check the network connection!");
    });
};

function toggleBouncer(marker) {
    marker.setAnimation(google.maps.Animation.BOUNCE); //applying bounce animation when marker is clicked toopen infowindow
    setTimeout(function() {
        marker.setAnimation(google.maps.Animation.null); //stopping bounce animation on closing infowindow
    }, 1300); //stop bounce animation after 1.3s
};

//Knockout binding using Knockout
var PageViewModel = function() {
    var self = this;
    self.navi = ko.observable('');
    self.myplaces = ko.observableArray(myplaces);
    self.title = ko.observable('');
    this.setMarker = function() {
        populateInfoWindow(this.marker, windowInfo);
    }; //populating infowindow on the correct marker
    self.query = ko.observable('');
    self.search = ko.computed(function() {
        return mysearchList = ko.utils.arrayFilter(self.myplaces(), function(k) {
            if (k.title.toLowerCase().indexOf(self.query().toLowerCase()) >= 0) {
                if (k.marker) {
                    k.marker.setVisible(true);
                }
                return true;
            } else {
                k.marker.setVisible(false);
            }
        });
    });
};

ko.applyBindings(new PageViewModel());
// If Google Map alerts its failure to load,alert message gets displayed
var Alert = function() {
    alert('Failed to load!!Network error');
};
