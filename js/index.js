
const image = document.getElementById('image'); 
const canvas = document.getElementById('canvas');
const dropContainer = document.getElementById('container');
const warning = document.getElementById('warning');
const fileInput = document.getElementById('fileUploader');
var uploaded_image_width = image.width
var uploaded_image_height = image.height

// const URL = "http://localhost:5000/api/"
// const URL = "http://192.168.163.132:5000/api/"




function GetUrlPara()
　　{
  var protocol = window.location.protocol.toString();
  // var host =  window.location.host.toString();
  var host =  document.domain.toString();
        var port = window.location.port.toString();
  // var url = protocol + '//' + host + "/predict";
  var url = 'http://localhost:5000/predict'
  console.log(url);
  return url;
　　}


const URL = GetUrlPara()
// alert(URL);


function preventDefaults(e) {
  e.preventDefault()
  e.stopPropagation()
};


function windowResized() {
  let windowW = window.innerWidth;
  if (windowW < 480 && windowW >= 200) {
    dropContainer.style.display = 'block';
  } else if (windowW < 200) {
    dropContainer.style.display = 'none';
  } else {
    dropContainer.style.display = 'block';
  }
}

['dragenter', 'dragover'].forEach(eventName => {
  dropContainer.addEventListener(eventName, e => dropContainer.classList.add('highlight'), false)
});

['dragleave', 'drop'].forEach(eventName => {
  dropContainer.addEventListener(eventName, e => dropContainer.classList.remove('highlight'), false)
});

['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
  dropContainer.addEventListener(eventName, preventDefaults, false)
});

dropContainer.addEventListener('drop', gotImage, false)

// send image to server, then receive the result, draw it to canvas.
function communicate(img_base64_url) {
  $.ajax({
    url: URL,
    type: "POST",
    contentType: "application/json",
    data: JSON.stringify({"image": img_base64_url}),
    dataType: "json"
  }).done(function(response_data) {
      console.log(response_data);
      drawResult(response_data.predictions);
  });
}

// handle image files uploaded by user, send it to server, then draw the result.
function parseFiles(files) {
  const file = files[0];
  const imageType = /image.*/;
  if (file.type.match(imageType)) {
    warning.innerHTML = '';
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onloadend = () => {
      var img = new Image;
      img.src = reader.result;
      img.onload = function() {
        uploaded_image_width = img.width
        uploaded_image_height = img.height
        console.log('uploaded image height and width');
        console.log(img.width);
        console.log(img.height);
      }
      image.src = reader.result;

      

      // send the img to server
      communicate(reader.result);

    }
  } else {
    setup();
    warning.innerHTML = 'Please drop an image file.';
  }

}

// call back function of drag files.
function gotImage(e) {
  const dt = e.dataTransfer;
  const files = dt.files;
  if (files.length > 1) {
    console.error('upload only one file');
  }
  parseFiles(files);
}

// callback function of input files.
function handleFiles() {
  parseFiles(fileInput.files);
}

// callback fuction of button.
function clickUploader() {
  fileInput.click();
}

// draw results on image.
function drawResult(results) {
    canvas.width = image.width;
    canvas.height = image.height;
    console.log('Image dimensions');
    console.log(image.width);
    console.log(image.height);
    ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
    console.log('Canvas dimensions');
    console.log(canvas.width);
    console.log(canvas.height);
    
    
    for (i = 0; i < results['class_names'].length; i++) {
      
      bbox = results['rois'][i];
      class_name = results['class_names'][i];
      score = results['scores'][i];

      
      ctx.beginPath();
      ctx.lineWidth="4";

      ctx.strokeStyle="red";
      ctx.fillStyle="red";
      
      x = (bbox[0]/uploaded_image_width)*canvas.width
      y = (bbox[1]/uploaded_image_height)*canvas.height
      width = ((bbox[2] - bbox[0])/uploaded_image_width)*canvas.width
      height = ((bbox[3] - bbox[1])/uploaded_image_height)*canvas.height
      ctx.rect(x, y, width, height);
      ctx.stroke();
      ctx.fillStyle = "yellow";
      
      ctx.font="20px Arial";
      
      let content = class_name + " " + parseFloat(score).toFixed(2);
      // ctx.fillText(content, bbox[0], bbox[1] < 20 ? bbox[1] + 30 : bbox[1]-5);
      ctx.fillText(content, x, y < 20 ? y + 30 : y-5);
  }
}
