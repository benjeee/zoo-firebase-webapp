// Initialize Firebase
var config = {
  apiKey: "secret",
  authDomain: "secret",
  databaseURL: "secret",
  storageBucket: "secret",
  messagingSenderId: "secret"
};
firebase.initializeApp(config);

firebase.auth().signInAnonymously().catch(function(error) {
  // Handle Errors here.
  var errorCode = error.code;
  var errorMessage = error.message;
});
firebase.auth().onAuthStateChanged(function(user) {
  if (user) {
    // User is signed in.
    var isAnonymous = user.isAnonymous;
    var uid = user.uid;
  } else {
    // User is signed out.
  }
});

var database = firebase.database();
var storage = firebase.storage();

var exhibitsRef = database.ref().child("Exhibits/");
var newsRef = database.ref().child("News/");
var storageRef = storage.ref();
var newsStorageRef = storageRef.child('News');

//exhibitName, animalName, genus, habitat, description, status, img, fname
function addAnimal(exhibitName, animalName, sn, habitat, description, status, img, fname){

	var now = moment().format();
	var imgRef = storageRef.child(''+fname);
	imgRef.put(img).then(function(snapshot) {
		database.ref('Exhibits/' + exhibitName + '/' + animalName).set({
			sn: sn,
			habitat: habitat,
			description: description,
			status: status,
			image: fname,
			added: now
	 	});
	});
	var countRef = database.ref('Stats/');
	countRef.once('value').then(function(snapshot){
	  var total = parseInt(snapshot.val().Total) + 1;
	  countRef.set({
	    Total: total
	  });
	});
	alert(animalName + ' has been successfully added to exhibit ' + exhibitName);
}

function submitAnimal(){
	var exhibitName = $('select[id = "aaSelect"]').find(":selected").text();
	var animalName = $('input[id = "animalName"]').val();
	var img = $('input[id = "imgInp"]').prop('files')[0];
	var sn = $('input[id = "animalSN"]').val();
	var habitat = $('input[id = "animalHabitat"]').val();
	var description = $('input[id = "animalDescription"]').val();
	var status = $('input[id = "animalStatus"]').val();

	if(animalName == ''){
		alert('Please enter a name for the new animal');
		return;
	}
	if(sn == ''){
		alert('Please enter the scientific name for the new animal');
		return;
	}
	if(habitat == ''){
		alert('Please enter a habitat for the new animal');
		return;
	}
	if(description == ''){
		alert('Please enter description/adaptation blurb for the new animal');
		return;
	}
	if(status == ''){
		alert('Please enter a status for the new animal');
		return;
	}
	if(!img){
		alert('Please choose an image for this animal');
		return;
	}
	if(exhibitName == 'Select an Exhibit'){
		alert('Please select an exhibit');
		return;
	}
	if(exhibitName == ''){
		alert('Please select an exhibit');
		return;
	}
	if(exhibitName == 'New Exhibit'){
		exhibitName = $('input[id = "newExhibitName"]').val();
		if(exhibitName == ''){
			alert('Please enter a name for the new exhibit');
			return;
		}
	}

	var fname = '';
	var fullPath = $('#imgInp').val();
	if (fullPath) {
	    var startIndex = (fullPath.indexOf('\\') >= 0 ? fullPath.lastIndexOf('\\') : fullPath.lastIndexOf('/'));
	    var filename = fullPath.substring(startIndex);
	    if (filename.indexOf('\\') === 0 || filename.indexOf('/') === 0) {
	        filename = filename.substring(1);
	    }
	    fname = filename;
	}

	addAnimal(exhibitName, animalName, sn, habitat, description, status, img, fname);
	clearAnimalPage();
}

function clearAnimalPage(){
	$('input[id = "animalName"]').val('');
	$('input[id = "animalInfo"]').val('');
	$('select[id = "aaSelect"]').val('Select an Exhibit');
	$('#animalImage').attr('src', null);
	$("#imgInp").replaceWith($("#imgInp").val('').clone(true));
	$('input[id="newExhibitName"]').val('');
	$('form[id="newExhibitName"]').hide();
}

function readURL(input) {
    if (input.files && input.files[0]) {
        var reader = new FileReader();
        reader.onload = function (e) {
            $('#animalImage').attr('src', e.target.result);
        }
        reader.readAsDataURL(input.files[0]);
    }
}
function newsReadURL(input){
	if (input.files && input.files[0]) {
        var reader = new FileReader();
        reader.onload = function (e) {
            $('#newsImage').attr('src', e.target.result);
        }
        reader.readAsDataURL(input.files[0]);
    }
}

function deleteAnimal(){
	var exhibitName = $('select[id = "daSelect"]').find(":selected").text();
	if(exhibitName == ''){
		alert('Something went wrong, refresh and select an exhibit');
		return;
	}
	if(animalToDelete == ''){
		alert('Something went wrong, refresh and select an animal');
		return;
	}
	var deleteRef = database.ref('Exhibits/' + exhibitName + '/' + animalToDelete + '/');
	deleteRef.once('value').then(function(snapshot){
  		deleteRef.remove();
  		alert(animalToDelete + ' has been removed from the database');
  		clearDeletePage(exhibitName);
	});
  var countRef = database.ref('Stats/');
  countRef.once('value').then(function(snapshot){
    var total = parseInt(snapshot.val().Total) - 1;
    countRef.set({
      Total: total
    });
  });
}

function clearDeletePage(exhibitName){
	$('select[id = "daSelect"]').val('Select an Exhibit');
	$('select[id = "'+exhibitName+'"]').hide();
}

function deleteNewsItem(){
	var name = $('select[id = "dnSelect"]').find(":selected").text();
	if(name == '' || name == 'Select a News Item'){
		clearDeleteNewsPage();
		alert('Please Select a news Item');
		return;
	}
	var deleteNewsRef = database.ref('News/' + name + '/');
	deleteNewsRef.once('value').then(function(snapshot){
		var imgPath = snapshot.val().image;
		var imgRef = storageRef.child(''+imgPath);
		imgRef.delete().then(function() {
			deleteNewsRef.remove();
			alert(name + ' has been removed from the database');
			clearDeleteNewsPage();
		}).catch(function(error){
			deleteNewsRef.remove();
			alert(name + ' has been removed from the database');
			clearDeleteNewsPage();
		});

	});
}
function clearDeleteNewsPage(){
	$('select[id = "dnSelect"]').val('Select a News Item');
	$('#deleteNewsItem').hide();
}


function submitNews(){
	var name = $('input[id = "newsName"]').val();
	var img = $('input[id = "newsImgInp"]').prop('files')[0];
	var info = $('textarea[id = "newsInfo"]').val();
	var date = $('input[id = "newsDate"]').val();
	
	if(name == ''){
		alert('Please input a name for this news item');
		return;
	}
	if(info == ''){
		alert('Please input info for this news item');
		return;
	}
	addNewsItem(name, info, img, date);
	
}

function addNewsItem(name, info, img, date){

  	var now = moment().format();
  	if (date == '') {
  		if(!img){
			database.ref('News/' + name).set({
			    info: info,
	       		added: now
		 	});
		 	alert(name + ' has been successfully added to the News section');
		}else{
			var fname = '';
			var fullPath = $('#newsImgInp').val();
			if (fullPath) {
			    var startIndex = (fullPath.indexOf('\\') >= 0 ? fullPath.lastIndexOf('\\') : fullPath.lastIndexOf('/'));
			    var filename = fullPath.substring(startIndex);
			    if (filename.indexOf('\\') === 0 || filename.indexOf('/') === 0) {
			        filename = filename.substring(1);
			    }
			    fname = filename;
			}
			var imgRef = storageRef.child('News/'+fname);
			imgRef.put(img).then(function(snapshot) {
				database.ref('News/' + name).set({
				    info: info,
				    image: 'News/' + fname,
	         		added: now
			 	});
			});
			alert(name + ' has been successfully added to the News section');
		}
  	} else if (!img) {
		database.ref('News/' + name).set({
		    info: info,
		    date: date,
       		added: now
	 	});
	 	alert(name + ' has been successfully added to the News section');
	}
	else{
		var fname = '';
		var fullPath = $('#newsImgInp').val();
		if (fullPath) {
		    var startIndex = (fullPath.indexOf('\\') >= 0 ? fullPath.lastIndexOf('\\') : fullPath.lastIndexOf('/'));
		    var filename = fullPath.substring(startIndex);
		    if (filename.indexOf('\\') === 0 || filename.indexOf('/') === 0) {
		        filename = filename.substring(1);
		    }
		    fname = filename;
		}
		var imgRef = storageRef.child('News/'+fname);
		imgRef.put(img).then(function(snapshot) {
			database.ref('News/' + name).set({
			    info: info,
			    image: 'News/' + fname,
			    date: date,
         		added: now
		 	});
		});
		alert(name + ' has been successfully added to the News section');
	}
	clearNewsPage();
}

function clearNewsPage(){
	$('input[id = "newsName"]').val('');
	$('input[id = "newsDate"]').val('');
	$('textarea[id = "newsInfo"]').val('');
	$('#newsImage').attr('src', null);
	$("#newsImgInp").replaceWith($("#newsImgInp").val('').clone(true));
}


function getQR(){
	var exhibitName = $('select[id = "qrSelect"]').find(":selected").text();
	var qrString = "https://api.qrserver.com/v1/create-qr-code/?data="+exhibitName+"&amp;size=750x750";
	$('#qrImage').attr('src', qrString);
}



function setupExhibitsAndAnimals(){
	exhibitsRef.once('value').then(function(snapshot){
		var myMap = new Map();
		snapshot.forEach(function(exhibitSnapshot){
			exhibitSnapshot.forEach(function(animalSnapshot){
				var animal = {
					name:animalSnapshot.key,
					info:animalSnapshot.val().Information,
					img:animalSnapshot.val().Image,
				};
				if(myMap.get(exhibitSnapshot.key) == undefined) myMap.set(exhibitSnapshot.key, [animal]);
				else myMap.get(exhibitSnapshot.key).push(animal);
			});
		});
		populateExhibitDropdown(myMap);
		populateAnimalDropdowns(myMap);
	});
}
function populateExhibitDropdown(myMap){
	for (var key of myMap.keys()) {
		$('select[id = "aaSelect"]').append('<option value="'+key+'">'+key+'</option>');
		$('select[id = "daSelect"]').append('<option value="'+key+'"">'+key+'</option>');
		$('select[id = "qrSelect"]').append('<option value="'+key+'"">'+key+'</option>');
	}
	$('select[id = "aaSelect"]').append('<option value="new">New Exhibit</option>');
}
function populateAnimalDropdowns(myMap){
	for (var [key, value] of myMap) {
  		$('div[id="daConditional"]').append(
  			'<select hidden id="'+key+'" onchange = "daButtonReveal(' + key + ')"><option value="" disabled selected>Select an Animal</option></select>'
  		);
  		for(var animal of value){
  			$('select[id="'+key+'"]').append('<option value="'+animal.name+'">'+animal.name+'</option>');
  		}
	}
}


function setupNewsItems(){
	newsRef.once('value').then(function(snapshot){
		news = [];
		snapshot.forEach(function(newsSnapshot){
			var newsItem = {
				name: newsSnapshot.key,
				image: newsSnapshot.val().Image,
				info: newsSnapshot.val().Information
			};
			news.push(newsItem);
		});
		populateNewsDropdowns(news);
	});
}
function populateNewsDropdowns(news){
	news.forEach(function(newsItem){
		$('select[id = "dnSelect"]').append('<option value="'+newsItem.name+'">'+newsItem.name+'</option>');
	});
}


function daReveal(){
	$('select[id = "'+ prevReveal + '"]').hide();
	var exhibitName = $('select[id = "daSelect"]').find(":selected").text();
	$('select[id = "'+ exhibitName + '"]').show();
	prevReveal = exhibitName;
}
function daButtonReveal(key){
	$('#deleteAnimal').show();
	animalToDelete = key.value;
}

function aaReveal(){
	var exhibitName = $('select[id = "aaSelect"]').find(":selected").text();
	if(exhibitName === 'New Exhibit'){
		$('form[id="newExhibitName"]').show();
		neSelected = true;
	} else if(neSelected){
		$('form[id="newExhibitName"]').hide();
		neSelected = false;
	}
}

function dnReveal(){
	$('#deleteNewsItem').show();
}

setupExhibitsAndAnimals();
setupNewsItems();
var prevReveal = "";
var neSelected = false;
var animalToDelete = '';
