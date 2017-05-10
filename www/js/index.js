/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

var app;
// var app = {
//     // Application Constructor
//     initialize: function() {
//         this.bindEvents();
//     },
//     // Bind Event Listeners
//     //
//     // Bind any events that are required on startup. Common events are:
//     // 'load', 'deviceready', 'offline', and 'online'.
//     bindEvents: function() {
//         document.addEventListener('deviceready', this.onDeviceReady, false);
//     },
//     // deviceready Event Handler
//     //
//     // The scope of 'this' is the event. In order to call the 'receivedEvent'
//     // function, we must explicitly call 'app.receivedEvent(...);'
//     onDeviceReady: function() {
//         app.receivedEvent('deviceready');
//     },
//     // Update DOM on a Received Event
//     receivedEvent: function(id) {
//         var parentElement = document.getElementById(id);
//         var listeningElement = parentElement.querySelector('.listening');
//         var receivedElement = parentElement.querySelector('.received');

//         listeningElement.setAttribute('style', 'display:none;');
//         receivedElement.setAttribute('style', 'display:block;');

//         console.log('Received Event: ' + id);
//     }
// };


//App logic 
//Varibales for accessing link
var applicationID = "a55fcc61";
var applicationKey ="e1fe044602608dfbb1d56d9d575222a5";
var searchKey = "beef", diet = "", health = "";
var frm = 0, to=50;

var url = "https://api.edamam.com/search?q="+searchKey+ "&app_id=" + applicationID +  "&app_key=" +applicationKey 
+ "&from="+ frm + "&to=" + to + "&diet=" + diet + "&health=" + health;

//Variables for saving
var results = [];
var page_id;

//Varibles for calaris calcularion
var serving = 4;
var dailyVal = 2030;
var calories;

//For Showing
var showFrom=0, showTo=10;

//Storage
var storage = window.localStorage;

//for controlling
var showData = false;

// On ready
$(document).ready(function() {
    //On seach button
    $(document).on("click", '#search_button', function() {
        getData();
        showData= true;
    });

    $(window).scroll(function() {
       if($(window).scrollTop() + $(window).height() == $(document).height() && showData === true) {
           getMoreData();
       }
    });

    //On food box clicked
    $(document).on("click", '.object', function() {
        updateFoodPage($(this).attr('id'));
        showData= false;
    });

    //Update Calories
    $("#servings-input" ).change(function() {
      serving = Number($(this).val());
      updateCalories();
    });

    // Update Favorite Page
    $(document).on("click", '#favorites-link', function() {
        updateFavoritePage();
        showData= false;
    });

    // Save entered text to localStorage and print the list
    $('.star').click(function() {
        
        $(this).addClass("star-active");

        if (localStorage.getItem(results[page_id].recipe.label) != null) 
            return;

        storage.setItem(results[page_id].recipe.label, JSON.stringify(results[page_id]));

        for (var i = 0; i < storage.length; i++){
            var todoItem = storage.getItem(storage.key(i));
            var item = JSON.parse(todoItem);
            console.log(item);
        }
    });

    // Clear localStorage and list
    $('#clear').click(function() {
        storage.clear();
    });
});


//Get Url
function getUrl(){

    searchKey = $('#search-key').val();
    if (searchKey === "")
        return null;

    url = "https://api.edamam.com/search?q="+searchKey+ "&app_id=" + applicationID +  "&app_key=" +applicationKey 
+ "&from="+ frm + "&to=" + to;
    
    getCheckBoxVals();

    return url;
}

//Get and update homepage
function getData(){
    $('.result-list').html('');

    $.getJSON( getUrl(), function(data) {
        results = data.hits;
        for (var i = showTo - 1; showTo >= showFrom; i--) { 
            $('.result-list').append(getNewFoodBox(results[i].recipe.image, results[i].recipe.label, i));
        }
    });   
}

//Show more
function getMoreData(){
    showTo += 10; showFrom += 10;
    for (var i = showTo - 1; showTo >= showFrom; i--) { 
        $('.result-list').append(getNewFoodBox(results[i].recipe.image, results[i].recipe.label, i));
    }
}

//Update food page
function updateFoodPage(pageID){
    page_id = pageID;
    $('.star').removeClass("star-active");

    $(".main-img img").attr('src', results[pageID].recipe.image);
    $("#food-label").text(results[pageID].recipe.label);

    //Check if it is in favorites
    for (var i = 0; i < storage.length; i++){
        var todoItem = storage.getItem(storage.key(i));
        var item = JSON.parse(todoItem);
        if (item.recipe.label == results[pageID].recipe.label)
            $('.star').addClass("star-active");
    }

    //Add ingredient
    results[pageID].recipe.ingredientLines.forEach(function(val){
        $(".ingredients-content").append(val + '<br>');
    });

    //Add number of ingredients
    $(".num-ingredients").text(results[pageID].recipe.ingredientLines.length);

    //Update calories
    calories = Number(results[pageID].recipe.calories);
    
}


//Update calories
function updateCalories(){
    $("#cal_serv").text(Number(calories/serving).toFixed(2));
    $("#daily_val").text(Number(calories/serving * 100/dailyVal).toFixed(2) + '%');
}

//Update Favorite Page
function updateFavoritePage(){
    $('.favorites-list').html('');
    results= [];
    for (var i = 0; i < storage.length; i++){
        var todoItem = storage.getItem(storage.key(i));
        var item = JSON.parse(todoItem);
        results.push(item);
        $('.favorites-list').append(getNewFoodBox(item.recipe.image, item.recipe.label, i));
    }
}

//Box template
function getNewFoodBox(imgURl, title, pageID){
    return '<div class="inner-box"><div class="object food-box" id="'+ pageID + '"><a href="#foodpage" ><span class="image"><img src="'+ imgURl + '"></span></a><span>' +title +'</span></div></div>';
}

//Get Checkbox 
function getCheckBoxVals(){
    //Check diet boxes
    if ($('#balanced').is(':checked'))
        url += "&diet=" + "balanced";
    if ($('#high-protein').is(':checked'))
        url += "&diet=" + "high-protein";
    if ($('#low-fat').is(':checked'))
        url += "&diet=" + "low-fat";
    if ($('#low-carb').is(':checked'))
        url += "&diet=" + "low-carb";
    //Check health boxes
    if ($('#alcohol-free').is(':checked'))
        url += "&health=" + "alcohol-free";
    if ($('#peanut-free').is(':checked'))
        url += "&health=" + "peanut-free";
    if ($('#tree-nut-free').is(':checked'))
        url += "&health=" + "tree-nut-free";
}




// Plugin
document.addEventListener("deviceready", onDeviceReady, false);

function onDeviceReady() {
    var element = document.getElementById('deviceProperties');
    element.innerHTML = 'Device Model: '    + device.model    + '<br />' +
                        'Device Cordova: '  + device.cordova  + '<br />' +
                        'Device Platform: ' + device.platform + '<br />' +
                        'Device UUID: '     + device.uuid     + '<br />' +
                        'Device Version: '  + device.version  + '<br />';
}

//Scale the app
// $(document).on("pagecreate", function() {
//             $(document).on("pagecontainershow", function(){
//                 $(".ui-content").height(getRealContentHeight());
//             })

//             $(window).on("resize orientationchange", function(){
//                 $(".ui-content").height(getRealContentHeight());
//             })
            
//             function getRealContentHeight() {
//                 var activePage = $.mobile.pageContainer.pagecontainer("getActivePage"),
//                 screen = $.mobile.getScreenHeight(),
//                 header = $(".ui-header").hasClass("ui-header-fixed") ? $(".ui-header").outerHeight() - 1 : $(".ui-header").outerHeight(),
//                 footer = $(".ui-footer").hasClass("ui-footer-fixed") ? $(".ui-footer").outerHeight() - 1 : $(".ui-footer").outerHeight(),
//                 contentMargins = $(".ui-content", activePage).outerHeight() - $(".ui-content", activePage).height();
//                 var contentHeight = screen - header - footer - contentMargins;    
                
//                 return contentHeight;
//             }
//         });